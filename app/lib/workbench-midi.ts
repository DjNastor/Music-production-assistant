export type WorkbenchNote = {
  pitch: number;
  start: number; // Sixteenth-note grid position
  length: number; // Sixteenth notes
  velocity: number; // MIDI velocity, 1–127
};

const write32 = (value: number): number[] => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
const write16 = (value: number): number[] => [(value >>> 8) & 255, value & 255];

function variableLength(value: number): number[] {
  let remaining = Math.max(0, Math.round(value));
  const bytes = [remaining & 127];
  while ((remaining >>= 7) > 0) bytes.unshift((remaining & 127) | 128);
  return bytes;
}

/** A genuine, single-track Standard MIDI File. 480 PPQ; 120 ticks per sixteenth. */
export function encodeMidi(notes: WorkbenchNote[], bpm: number): Uint8Array {
  const microsecondsPerBeat = Math.round(60000000 / Math.max(30, Math.min(300, bpm)));
  const events: Array<{ tick: number; order: number; bytes: number[] }> = [
    { tick: 0, order: 0, bytes: [255, 81, 3, (microsecondsPerBeat >> 16) & 255, (microsecondsPerBeat >> 8) & 255, microsecondsPerBeat & 255] },
  ];
  for (const note of notes) {
    const pitch = Math.max(0, Math.min(127, Math.round(note.pitch)));
    const velocity = Math.max(1, Math.min(127, Math.round(note.velocity)));
    const start = Math.max(0, Math.round(note.start * 120));
    const end = start + Math.max(1, Math.round(note.length * 120));
    events.push({ tick: start, order: 2, bytes: [0x90, pitch, velocity] });
    events.push({ tick: end, order: 1, bytes: [0x80, pitch, 0] });
  }
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const track: number[] = [];
  let cursor = 0;
  for (const event of events) {
    track.push(...variableLength(event.tick - cursor), ...event.bytes);
    cursor = event.tick;
  }
  track.push(0, 255, 47, 0);
  return Uint8Array.from([
    77, 84, 104, 100, ...write32(6), ...write16(0), ...write16(1), ...write16(480),
    77, 84, 114, 107, ...write32(track.length), ...track,
  ]);
}

/** Read common type-0/type-1 MIDI note events into a quantized four-bar workbench sketch. */
export function decodeMidi(buffer: ArrayBuffer): { notes: WorkbenchNote[]; bpm: number | null } {
  const view = new DataView(buffer);
  if (view.byteLength < 14 || view.getUint32(0) !== 0x4d546864) throw new Error("Not a Standard MIDI File");
  const headerSize = view.getUint32(4);
  const format = view.getUint16(8);
  const trackCount = view.getUint16(10);
  const ppq = view.getUint16(12);
  if (format > 1 || (ppq & 0x8000) || !ppq || trackCount > 64) throw new Error("Unsupported MIDI format or clock");
  const notes: WorkbenchNote[] = [];
  let bpm: number | null = null;
  let position = 8 + headerSize;
  const gridTick = ppq / 4;
  for (let track = 0; track < trackCount; track++) {
    if (position + 8 > view.byteLength || view.getUint32(position) !== 0x4d54726b) throw new Error("Missing MIDI track");
    const end = position + 8 + view.getUint32(position + 4);
    if (end > view.byteLength) throw new Error("Truncated MIDI track");
    position += 8;
    let tick = 0;
    let status = 0;
    const active = new Map<string, { tick: number; velocity: number }>();
    const readVar = () => {
      let value = 0;
      for (let i = 0; i < 4; i++) {
        if (position >= end) throw new Error("Invalid MIDI delta");
        const byte = view.getUint8(position++);
        value = (value << 7) | (byte & 127);
        if (!(byte & 128)) return value;
      }
      throw new Error("Invalid MIDI delta encoding");
    };
    const finish = (channel: number, pitch: number) => {
      const key = channel + ":" + pitch;
      const start = active.get(key);
      if (!start) return;
      active.delete(key);
      const step = Math.max(0, Math.round(start.tick / gridTick));
      const length = Math.max(1, Math.round((tick - start.tick) / gridTick));
      if (step < 64 && pitch >= 36 && pitch <= 95) {
        notes.push({ pitch, start: step, length: Math.min(length, 64 - step), velocity: start.velocity });
      }
    };
    while (position < end) {
      tick += readVar();
      if (position >= end) break;
      let event = view.getUint8(position++);
      let firstData: number | null = null;
      if (event < 0x80) {
        if (!status) throw new Error("Invalid running status");
        firstData = event;
        event = status;
      } else if (event < 0xf0) {
        status = event;
      } else {
        status = 0;
      }
      if (event === 0xff) {
        if (position >= end) throw new Error("Invalid MIDI metadata");
        const type = view.getUint8(position++);
        const size = readVar();
        if (position + size > end) throw new Error("Invalid MIDI metadata length");
        if (type === 0x51 && size === 3 && bpm === null) {
          const micros = (view.getUint8(position) << 16) | (view.getUint8(position + 1) << 8) | view.getUint8(position + 2);
          if (micros > 0) bpm = Math.round(60000000 / micros);
        }
        position += size;
        if (type === 0x2f) break;
        continue;
      }
      if (event === 0xf0 || event === 0xf7) {
        const size = readVar();
        if (position + size > end) throw new Error("Invalid MIDI SysEx length");
        position += size;
        continue;
      }
      const command = event & 0xf0;
      const channel = event & 0x0f;
      const data1 = firstData ?? view.getUint8(position++);
      const data2 = command === 0xc0 || command === 0xd0 ? 0 : view.getUint8(position++);
      if (position > end) throw new Error("Invalid MIDI event");
      if (command === 0x90 && data2 > 0) {
        active.set(channel + ":" + data1, { tick, velocity: data2 });
      } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
        finish(channel, data1);
      }
    }
    position = end;
  }
  return { notes: notes.slice(0, 2000), bpm };
}
