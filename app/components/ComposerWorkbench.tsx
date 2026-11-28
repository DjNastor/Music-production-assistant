"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines, Bot, Check, ChevronRight, Copy, Download, FileMusic, FolderOpen,
  Music2, Pause, Play, RotateCcw, Save, SlidersHorizontal, Sparkles, WandSparkles,
} from "lucide-react";
import styles from "./ComposerWorkbench.module.css";
import { decodeMidi, encodeMidi, type WorkbenchNote } from "../lib/workbench-midi";

const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const SCALES = {
  "Natural minor": [0, 2, 3, 5, 7, 8, 10],
  "Major": [0, 2, 4, 5, 7, 9, 11],
  "Dorian": [0, 2, 3, 5, 7, 9, 10],
  "Minor pentatonic": [0, 3, 5, 7, 10],
} as const;
type ScaleName = keyof typeof SCALES;
type PromptTask = "scale" | "quantize" | "organize" | "arrange" | "mix";
const PITCHES = Array.from({ length: 48 }, (_, index) => 83 - index);
const STEPS = Array.from({ length: 64 }, (_, index) => index);
const SESSION_KEY = "nastor-composer-workbench-v1";

function inScale(pitch: number, root: number, scale: readonly number[]) {
  return scale.includes(((pitch - root) % 12 + 12) % 12);
}
function nearestScalePitch(pitch: number, root: number, scale: readonly number[]) {
  if (inScale(pitch, root, scale)) return pitch;
  for (let distance = 1; distance < 7; distance++) {
    if (inScale(pitch - distance, root, scale)) return pitch - distance;
    if (inScale(pitch + distance, root, scale)) return pitch + distance;
  }
  return pitch;
}
function nameOf(pitch: number) {
  return ROOTS[((pitch % 12) + 12) % 12] + String(Math.floor(pitch / 12) - 1);
}
function degreePitch(root: number, scale: readonly number[], degree: number) {
  const index = ((degree % scale.length) + scale.length) % scale.length;
  return 48 + root + scale[index] + 12 * Math.floor(degree / scale.length);
}
function chordProgression(root: number, scale: readonly number[], alternate: boolean): WorkbenchNote[] {
  const minor = scale[2] === 3;
  const harmonicScale = scale.length === 5 ? [0, 2, 3, 5, 7, 8, 10] : scale;
  const degrees = minor
    ? alternate ? [0, 3, 6, 4] : [0, 5, 2, 6]
    : alternate ? [0, 3, 4, 0] : [0, 4, 5, 3];
  return degrees.flatMap((degree, bar) => [0, 2, 4].map((offset, voice) => ({
    pitch: nearestScalePitch(degreePitch(root, harmonicScale, degree + offset), root, scale),
    start: bar * 16,
    length: 15,
    velocity: voice === 0 ? 95 : 81,
  })));
}
function saveDownload(content: BlobPart, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function pianoRollScript(root: number, scaleName: ScaleName) {
  const allowed = SCALES[scaleName].map((interval) => (interval + root) % 12);
  return [
    "# Nastor AI Studio - safe, local scale snapping for FL Studio Piano roll",
    "# Before running, save a new version of the FL Studio project.",
    "import flpianoroll as flp",
    "ALLOWED = " + JSON.stringify(allowed),
    "def createDialog():",
    '    return flp.ScriptDialog("Nastor Scale Snap", "Snap existing notes to the selected scale.")',
    "def apply(form):",
    "    for index in range(flp.score.noteCount):",
    "        note = flp.score.getNote(index)",
    "        if note.number % 12 in ALLOWED:",
    "            continue",
    "        for distance in range(1, 7):",
    "            lower = note.number - distance",
    "            upper = note.number + distance",
    "            if lower >= 0 and lower % 12 in ALLOWED:",
    "                note.number = lower",
    "                break",
    "            if upper <= 131 and upper % 12 in ALLOWED:",
    "                note.number = upper",
    "                break",
    "",
  ].join("\n");
}

export default function ComposerWorkbench({
  projectName,
  onAsk,
}: {
  projectName: string;
  onAsk: (text: string) => void;
}) {
  const [root, setRoot] = useState(0);
  const [scaleName, setScaleName] = useState<ScaleName>("Natural minor");
  const [bpm, setBpm] = useState(120);
  const [notes, setNotes] = useState<WorkbenchNote[]>(() => chordProgression(0, SCALES["Natural minor"], false));
  const [selectedTask, setSelectedTask] = useState<PromptTask>("scale");
  const [section, setSection] = useState("Groove");
  const [noteLength, setNoteLength] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);
  const [notice, setNotice] = useState("Four-bar chord sketch ready. Click the Piano roll to edit notes.");
  const [hydrated, setHydrated] = useState(false);
  const importer = useRef<HTMLInputElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const oscillators = useRef<OscillatorNode[]>([]);
  const timers = useRef<{ interval: number | null; end: number | null }>({ interval: null, end: null });

  const storageKey = SESSION_KEY + ":" + projectName;
  const scale = SCALES[scaleName];
  const keyLabel = ROOTS[root] + " " + scaleName;
  const fitness = useMemo(() => {
    const inside = notes.filter((note) => inScale(note.pitch, root, scale)).length;
    return notes.length ? Math.round((inside / notes.length) * 100) : 0;
  }, [notes, root, scale]);
  const coaching = notes.length === 0
    ? "Start by generating a four-bar chord progression or placing notes."
    : fitness < 100
      ? "Some notes are outside the selected scale. Use Snap to scale, or keep intentional borrowed notes."
      : notes.length > 28
        ? "A busy phrase. Try removing one upper voice during the break to leave room for vocals."
        : "The harmony fits the selected scale. Create a variation, then test the bass against the root notes.";

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as { root?: number; scaleName?: ScaleName; bpm?: number; notes?: WorkbenchNote[] };
          if (typeof parsed.root === "number" && parsed.root >= 0 && parsed.root < 12) setRoot(parsed.root);
          if (parsed.scaleName && Object.prototype.hasOwnProperty.call(SCALES, parsed.scaleName)) setScaleName(parsed.scaleName);
          if (typeof parsed.bpm === "number") setBpm(Math.max(60, Math.min(180, Math.round(parsed.bpm))));
          if (Array.isArray(parsed.notes)) setNotes(parsed.notes.filter(isValidNote).slice(0, 512));
        }
      } catch { setNotice("The previous sketch could not be restored. A starter progression is available."); }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ root, scaleName, bpm, notes }));
  }, [root, scaleName, bpm, notes, hydrated, storageKey]);

  useEffect(() => () => {
    if (timers.current.interval !== null) window.clearInterval(timers.current.interval);
    if (timers.current.end !== null) window.clearTimeout(timers.current.end);
    oscillators.current.forEach((osc) => { try { osc.stop(); } catch {} });
    if (audio.current) void audio.current.close();
  }, []);

  function stopPlayback() {
    if (timers.current.interval !== null) window.clearInterval(timers.current.interval);
    if (timers.current.end !== null) window.clearTimeout(timers.current.end);
    timers.current = { interval: null, end: null };
    oscillators.current.forEach((osc) => { try { osc.stop(); } catch {} });
    oscillators.current = [];
    setPlaying(false);
    setPlayhead(-1);
  }
  function play() {
    if (playing) { stopPlayback(); return; }
    if (!notes.length) { setNotice("Add at least one note before playback."); return; }
    const context = audio.current ?? new window.AudioContext();
    audio.current = context;
    void context.resume();
    const secondsPerStep = 60 / bpm / 4;
    const start = context.currentTime + 0.08;
    for (const note of notes) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440 * 2 ** ((note.pitch - 69) / 12), start + note.start * secondsPerStep);
      const on = start + note.start * secondsPerStep;
      const off = on + Math.max(.06, note.length * secondsPerStep * .92);
      gain.gain.setValueAtTime(.0001, on);
      gain.gain.exponentialRampToValueAtTime(.055 * note.velocity / 127, on + .016);
      gain.gain.setTargetAtTime(.0001, Math.max(on + .02, off - .065), .035);
      osc.connect(gain).connect(context.destination);
      osc.start(on);
      osc.stop(off + .16);
      oscillators.current.push(osc);
    }
    setPlaying(true);
    setPlayhead(0);
    let step = 0;
    timers.current.interval = window.setInterval(() => {
      step = (step + 1) % 64;
      setPlayhead(step);
    }, secondsPerStep * 1000);
    timers.current.end = window.setTimeout(stopPlayback, secondsPerStep * 64 * 1000 + 100);
  }
  function toggleNote(pitch: number, step: number) {
    setNotes((current) => {
      const existing = current.find((note) => note.pitch === pitch && step >= note.start && step < note.start + note.length);
      if (existing) return current.filter((note) => note !== existing);
      return [...current, { pitch, start: step, length: Math.min(noteLength, 64 - step), velocity: 92 }];
    });
  }
  function generate(alternate: boolean) {
    stopPlayback();
    setNotes(chordProgression(root, scale, alternate));
    setNotice(alternate ? "Alternative four-bar progression generated." : "Four-bar harmony generated. Customize the notes before export.");
  }
  function variation() {
    stopPlayback();
    setNotes((current) => {
      if (!current.length) return current;
      return current.map((note, index) => {
        if (index % 3 !== 2) return { ...note };
        const pitch = note.pitch >= 72 ? note.pitch - 12 : note.pitch + 12;
        return { ...note, pitch: Math.max(36, Math.min(83, nearestScalePitch(pitch, root, scale))), velocity: 73 };
      });
    });
    setNotice("A new octave-voicing variation is ready. Compare it with the original.");
  }
  function snapScale() {
    setNotes((current) => current.map((note) => ({ ...note, pitch: nearestScalePitch(note.pitch, root, scale) })));
    setNotice("Notes snapped to the nearest pitch in " + keyLabel + ". Rhythms preserved.");
  }
  function exportMidiFile() {
    const bytes = encodeMidi(notes, bpm);
    saveDownload(Uint8Array.from(bytes).buffer, "nastor-" + ROOTS[root].replace("#", "sharp") + "-" + scaleName.toLowerCase().replace(/\s+/g, "-") + ".mid", "audio/midi");
    setNotice("Standard MIDI file downloaded. Drag it into your FL Studio Piano roll.");
  }
  function exportTemplate() {
    saveDownload(JSON.stringify({ version: 1, projectName, root, scaleName, bpm, notes }, null, 2),
      "nastor-harmony-template.json", "application/json");
    setNotice("Portable JSON template downloaded. Local autosave remains enabled.");
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 3_000_000) { setNotice("Please import a MIDI or template file smaller than 3 MB."); return; }
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const data = JSON.parse(await file.text()) as { notes?: WorkbenchNote[]; root?: number; scaleName?: ScaleName; bpm?: number };
        if (!Array.isArray(data.notes)) throw new Error("Template has no notes");
        const imported = data.notes.filter(isValidNote).slice(0, 512);
        if (!imported.length) throw new Error("Template has no valid notes");
        setNotes(imported);
        if (typeof data.root === "number" && data.root >= 0 && data.root < 12) setRoot(data.root);
        if (data.scaleName && Object.prototype.hasOwnProperty.call(SCALES, data.scaleName)) setScaleName(data.scaleName);
        if (typeof data.bpm === "number") setBpm(Math.max(60, Math.min(180, Math.round(data.bpm))));
        setNotice("Saved harmony template imported.");
      } else {
        const decoded = decodeMidi(await file.arrayBuffer());
        if (!decoded.notes.length) throw new Error("No notes in the first four bars within MIDI pitches C2–B5");
        setNotes(decoded.notes);
        if (decoded.bpm !== null) setBpm(Math.max(60, Math.min(180, decoded.bpm)));
        setNotice("Imported " + decoded.notes.length + " MIDI notes into the four-bar grid. Other bars are not loaded.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? "Import failed: " + error.message : "Unable to import this file");
    }
  }

  const prompt = useMemo(() => {
    const intro = "Project: " + projectName + ". Tempo: " + bpm + " BPM. Working key: " + keyLabel +
      ". Harmony sketch: " + notes.length + " MIDI notes over four bars. Selected section: " + section + ". ";
    const end = " Confirm the current project state before editing. Ask before destructive changes. Do not overwrite originals.";
    const prompts: Record<PromptTask, string> = {
      scale: "In FL Studio, open the Piano roll and inspect the selected notes. I want pitches aligned to " + keyLabel +
        ". If direct scale snapping is unavailable, generate a Piano roll Python script that snaps notes to " +
        ROOTS[root] + " " + scaleName + " while preserving timing, note length and velocity. Explain and ask before running the script.",
      quantize: "Open the Piano roll and quantize the selected notes to the nearest 1/16 grid without changing their pitches. Confirm the resulting groove and preserve note velocities.",
      organize: "Inspect my FL Studio project. Propose clean Playlist and Mixer track names for kick, percussion, bass, chords, lead, vocals and FX. Rename and color only tracks I approve. Flag missing routing or unused channels, but do not delete anything.",
      arrange: "Inspect the Playlist and describe the existing song sections. Suggest a producer-ready Afro House arrangement with intro, groove, break, build, peak and DJ-friendly outro. Give bar counts and specific moves. Do not rearrange clips without asking.",
      mix: "Inspect Mixer routing and plugins. Give a gain-staging and low-end cleanup checklist for the drums, bass, chords, lead and master. Suggest safe changes and explain why before making them.",
    };
    return intro + prompts[selectedTask] + end;
  }, [projectName, bpm, keyLabel, notes.length, section, selectedTask, root, scaleName]);

  function copyPrompt() {
    void navigator.clipboard.writeText(prompt).then(() => setNotice("Gopher prompt copied. Paste it into the Gopher tab in FL Studio."),
      () => setNotice("Clipboard blocked. Select and copy the prompt from the text box."));
  }
  function exportScript() {
    saveDownload(pianoRollScript(root, scaleName), "nastor-snap-" + ROOTS[root].replace("#", "sharp") + ".pyscript", "text/plain");
    setNotice("Piano roll script downloaded. Save a backup of the FLP before running it.");
  }

  return (
    <section className={styles.workbench} aria-label="Nastor producer DAW workbench">
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}><AudioLines size={15} /> NASTOR / PRODUCER WORKBENCH · V1</span>
          <h2>Make ideas. Shape harmony. Finish music.</h2>
          <p>An original DAW-inspired creative workspace. Compose and audition chords, edit a piano roll, export real MIDI, and prepare Gopher instructions for FL Studio.</p>
        </div>
        <span className={styles.local}><span className={styles.statusDot} /> LOCAL SESSION · AUTOSAVED</span>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.transport}>
          <button type="button" className={styles.play} onClick={play} aria-label={playing ? "Stop chord preview" : "Play chord preview"}>
            {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            {playing ? "Stop" : "Play"}
          </button>
          <label>BPM <input type="number" min="60" max="180" value={bpm} onChange={(event) => setBpm(Math.max(60, Math.min(180, Number(event.target.value) || 120)))} /></label>
          <label>Root <select value={root} onChange={(event) => setRoot(Number(event.target.value))}>{ROOTS.map((name, index) => <option value={index} key={name}>{name}</option>)}</select></label>
          <label>Scale <select value={scaleName} onChange={(event) => setScaleName(event.target.value as ScaleName)}>{Object.keys(SCALES).map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
          <label>Note length <select value={noteLength} onChange={(event) => setNoteLength(Number(event.target.value))}><option value={1}>1/16</option><option value={2}>1/8</option><option value={4}>1/4</option><option value={8}>1/2</option><option value={16}>1 bar</option></select></label>
        </div>
        <div className={styles.exportTools}>
          <button type="button" onClick={() => importer.current?.click()}><FolderOpen size={15} /> Import MIDI / template</button>
          <input ref={importer} hidden type="file" accept=".mid,.midi,.json" onChange={importFile} aria-label="Import MIDI or Nastor harmony template" />
          <button type="button" onClick={exportTemplate}><Save size={15} /> Template</button>
          <button type="button" className={styles.primary} onClick={exportMidiFile}><Download size={15} /> Export MIDI</button>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.browser} aria-label="Production tools">
          <div className={styles.panelHeading}><Music2 size={17} /> HARMONY TOOLS</div>
          <div className={styles.toolGroup}>
            <span>Chord starter</span>
            <button type="button" onClick={() => generate(false)}><WandSparkles size={16} /> Generate four bars</button>
            <button type="button" onClick={() => generate(true)}><RotateCcw size={16} /> Alternative chords</button>
            <button type="button" onClick={variation}><Sparkles size={16} /> Change voicing</button>
            <button type="button" onClick={snapScale}><Check size={16} /> Snap to scale</button>
          </div>
          <div className={styles.advice}>
            <span>HARMONY COACH · RULE-BASED</span>
            <strong>{fitness}% in-key</strong>
            <p>{coaching}</p>
          </div>
          <small className={styles.disclaimer}>The coach evaluates MIDI notes locally. It does not yet listen to recorded audio or connect to an AI model.</small>
        </aside>

        <div className={styles.editor}>
          <div className={styles.editorHeading}>
            <div><span className={styles.kicker}>PIANO ROLL · FOUR BARS / 4:4</span><h3>{projectName} <ChevronRight size={17} /> {keyLabel}</h3></div>
            <span>Click: add / remove notes · Scroll horizontally</span>
          </div>
          <div className={styles.arrangement} aria-label="Production arrangement cues">
            {["Intro", "Groove", "Break", "Drop"].map((name, index) => (
              <button type="button" key={name} className={section === name ? styles.sectionActive : ""} onClick={() => setSection(name)}>
                <span>BAR {index + 1}</span><strong>{name}</strong>
              </button>
            ))}
          </div>
          <div className={styles.rollScroll}>
            <div className={styles.grid}>
              <div className={styles.rulerRow}><div className={styles.keyLabel}>PITCH</div>{STEPS.map((step) => <div className={step % 16 === 0 ? styles.barNumber : styles.stepNumber} key={step}>{step % 16 === 0 ? step / 16 + 1 : step % 4 === 0 ? "·" : ""}</div>)}</div>
              {PITCHES.map((pitch) => (
                <div className={styles.gridRow} key={pitch}>
                  <div className={pitch % 12 === 0 ? styles.octaveKey : styles.keyLabel}>{nameOf(pitch)}</div>
                  {STEPS.map((step) => {
                    const held = notes.some((note) => note.pitch === pitch && step >= note.start && step < note.start + note.length);
                    const head = notes.some((note) => note.pitch === pitch && note.start === step);
                    const classes = [styles.cell, step % 16 === 0 ? styles.barLine : "", step % 4 === 0 ? styles.beatLine : "", inScale(pitch, root, scale) ? styles.scaleCell : styles.offScaleCell, held ? styles.note : "", head ? styles.noteHead : "", playhead === step ? styles.playhead : ""].filter(Boolean).join(" ");
                    return <button type="button" key={step} className={classes} onClick={() => toggleNote(pitch, step)} title={nameOf(pitch) + " · bar " + (Math.floor(step / 16) + 1)} aria-label={(held ? "Remove" : "Add") + " note " + nameOf(pitch) + " at sixteenth " + (step + 1)} />;
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.rollFooter}><span><i className={styles.scaleMark} /> In-scale notes</span><span><i className={styles.noteMark} /> MIDI notes</span><span>{notes.length} notes · {keyLabel} · {bpm} BPM</span></div>
        </div>
      </div>

      <div className={styles.promptPanel}>
        <div className={styles.promptTitle}>
          <div><span className={styles.kicker}><Bot size={15} /> FL STUDIO HANDOFF</span><h3>Gopher prompt builder</h3></div>
          <label>Task <select value={selectedTask} onChange={(event) => setSelectedTask(event.target.value as PromptTask)}>
            <option value="scale">Snap notes to key / scale</option><option value="quantize">Quantize rhythm</option><option value="organize">Organize project</option><option value="arrange">Arrange the song</option><option value="mix">Mixer cleanup</option>
          </select></label>
        </div>
        <textarea readOnly value={prompt} aria-label="Generated Gopher instructions" rows={4} />
        <div className={styles.promptActions}>
          <span>Gopher is opened and authorized separately inside FL Studio. No direct DAW control is connected here.</span>
          <div>
            <button type="button" onClick={exportScript}><FileMusic size={15} /> Download scale script</button>
            <button type="button" onClick={copyPrompt}><Copy size={15} /> Copy prompt</button>
            <button type="button" className={styles.primary} onClick={() => onAsk(prompt)}><SlidersHorizontal size={15} /> Send to Copilot</button>
          </div>
        </div>
      </div>
      <p className={styles.notification} role="status">{notice}</p>
    </section>
  );
}
function isValidNote(value: WorkbenchNote) {
  return value && Number.isInteger(value.pitch) && value.pitch >= 0 && value.pitch <= 127 &&
    Number.isInteger(value.start) && value.start >= 0 && value.start < 64 &&
    Number.isFinite(value.length) && value.length > 0 &&
    Number.isFinite(value.velocity) && value.velocity > 0 && value.velocity <= 127;
}
