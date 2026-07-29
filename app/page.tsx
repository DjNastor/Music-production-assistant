"use client";

import Image from "next/image";
import {
  Activity,
  AudioLines,
  ArrowUpRight,
  Mail,
  BookOpenText,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Clock3,
  Command,
  Disc3,
  Download,
  Redo2,
  RotateCcw,
  FileAudio,
  FolderKanban,
  Gauge,
  Headphones,
  Home,
  Keyboard,
  Library,
  Menu,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Send,
  Settings2,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  Upload,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type IconType = typeof Home;
type Message = { id: number; role: "assistant" | "user"; text: string };
type QueueTask = {
  id: number;
  title: string;
  detail: string;
  time: string;
  status: "processing" | "complete" | "waiting";
};
type ProjectContext = {
  title: string;
  parent: string;
  genre: string;
  bpm: string;
  musicalKey: string;
  duration: string;
  analysisAvailable: boolean;
};

const primaryNav: { label: string; icon: IconType }[] = [
  { label: "Home", icon: Home },
  { label: "Studio", icon: SlidersHorizontal },
  { label: "Projects", icon: FolderKanban },
  { label: "Library", icon: Library },
];

const creationNav: { label: string; icon: IconType }[] = [
  { label: "AI Assistant", icon: Bot },
  { label: "Lyrics", icon: BookOpenText },
  { label: "Prompts", icon: WandSparkles },
  { label: "Reference", icon: Headphones },
  { label: "Mastering", icon: CircleGauge },
];

const projectContexts: ProjectContext[] = [
  { title: "Find A Way", parent: "Digital Retro", genre: "Afro House", bpm: "120", musicalKey: "A minor", duration: "05:20", analysisAvailable: true },
  { title: "Faces", parent: "Latest single · 19 Jun 2026", genre: "Catalog context", bpm: "—", musicalKey: "—", duration: "—", analysisAvailable: false },
  { title: "Digital Retro", parent: "2026 album", genre: "Album context", bpm: "—", musicalKey: "—", duration: "—", analysisAvailable: false },
  { title: "TAHOE", parent: "Catalog project", genre: "Studio context", bpm: "—", musicalKey: "—", duration: "—", analysisAvailable: false },
];

const releases = [
  { title: "Faces", artist: "DJ Nastor", date: "19 JUN 2026", cat: "TPM 026", art: "art-faces", tracks: ["Faces (Original Mix)", "Faces (Dub Mix)"], project: "Faces", status: "OUT NOW" },
  { title: "Find A Way", artist: "DJ Nastor", date: "07 MAY 2026", cat: "TPM 025", art: "art-retro", tracks: ["Find A Way (Extended Mix)", "Find A Way (Dub Version)"], project: "Find A Way", status: "FEATURED" },
  { title: "Digital Retro", artist: "DJ Nastor", date: "22 FEB 2026", cat: "TPM 024", art: "art-tahoe", tracks: ["Digital Retro", "After The Rain", "Memory Lane"], project: "Digital Retro", status: "ALBUM" },
];

const roster = [
  { name: "DJ Nastor", role: "Founder · Producer", note: "Afro House / Organic House" },
  { name: "Tahoe Studios", role: "Production house", note: "Sound design · Engineering" },
  { name: "Phushi Plan Music", role: "Publishing partner", note: "Independent electronic music" },
];

const labelNews = [
  { date: "24 JUN 2026", title: "Faces enters the summer rotation", copy: "A percussion-led cut for long nights and open-air systems." },
  { date: "12 JUN 2026", title: "Inside the Tahoe room", copy: "Notes on space, swing, and building movement without overfilling the mix." },
  { date: "07 MAY 2026", title: "Find A Way — now playing", copy: "The featured single from the Digital Retro sessions is live across platforms." },
];



const quickActions = [
  { title: "Map the reference", copy: "Compare structure, weight and energy", icon: Radio },
  { title: "Reduce the break", copy: "Create space before the peak", icon: AudioLines },
  { title: "Draft a vocal cue", copy: "Write to the track’s open pocket", icon: Mic2 },
  { title: "Prepare club master", copy: "Check translation and dynamics", icon: Gauge },
];

const launchTemplates = [
  { name: "Afro House", meta: "120 BPM · A MIN", cue: "Build an Afro House foundation with patient low end, organic percussion, and a clear eight-bar question-and-answer phrase." },
  { name: "Amapiano", meta: "112 BPM · F# MIN", cue: "Sketch an Amapiano groove with a restrained log drum, open piano space, and a lift into bar seven." },
  { name: "Hip-Hop", meta: "92 BPM · D MIN", cue: "Start a Hip-Hop pocket with swung drums, one memorable sample gesture, and space for a vocal lead." },
];

const sections = [
  { name: "Intro", start: 0, end: 12, color: "var(--oxide-light)" },
  { name: "Foundation", start: 12, end: 34, color: "var(--copper)" },
  { name: "Vocal", start: 34, end: 51, color: "var(--amber)" },
  { name: "Break", start: 51, end: 66, color: "var(--bone-dim)" },
  { name: "Peak", start: 66, end: 89, color: "var(--signal)" },
  { name: "Outro", start: 89, end: 100, color: "var(--oxide-light)" },
];

const waveform = Array.from({ length: 96 }, (_, index) => {
  const swing = 24 + Math.sin(index * 0.48) * 13 + Math.sin(index * 0.16) * 12;
  const structure = index > 62 && index < 86 ? 26 : index > 46 && index < 61 ? -8 : index < 12 ? -5 : 7;
  return Math.max(12, Math.min(92, Math.round(swing + structure + ((index * 11) % 19))));
});

const navContext: Record<string, { eyebrow: string; title: string; copy: string }> = {
  Home: { eyebrow: "Make the first move", title: "Your next track starts with direction.", copy: "Choose a groove, shape eight useful bars, and carry the same production intent from the first pattern to the final master." },
  Studio: { eyebrow: "Active session · Tahoe Studios", title: "Listen like an engineer.", copy: "Shape the energy curve first. Mix decisions become easier when every section has a clear job." },
  Projects: { eyebrow: "Catalog desk", title: "One artist. Several rooms.", copy: "Move between DJ Nastor, Tahoe Studios, Phushi Plan Music, and Lukulu Recordings without losing the session thread." },
  Library: { eyebrow: "Source library", title: "Keep the palette intentional.", copy: "References, stems, notes, and production context stay close to the active record." },
  "AI Assistant": { eyebrow: "Copilot channel", title: "Ask the session a better question.", copy: "The local demo follows the selected project, arrangement section, and attached context." },
  Lyrics: { eyebrow: "Writing channel", title: "Leave room for the line.", copy: "Build concise vocal ideas around the groove instead of filling every open bar." },
  Prompts: { eyebrow: "Direction deck", title: "Describe movement, not genre tags.", copy: "Turn tension, texture, and club intention into production-ready prompts." },
  Reference: { eyebrow: "Reference monitor", title: "Compare with purpose.", copy: "Focus on structure, low-end behavior, and perceived energy—not imitation." },
  Mastering: { eyebrow: "Delivery chain", title: "Prepare the record to travel.", copy: "Review dynamics, translation, and export intent before the mix leaves the room." },
};

const assistantReplies = [
  "The peak already has enough density. I’d remove one percussion answer in the final four bars of the break, then let the vocal cue carry the transition.",
  "At 120 BPM, the groove benefits from patience. Keep the low-end pattern stable and create movement with the upper percussion before changing the bass phrase.",
  "The phase picture is stable. Widen the texture above the midrange, but leave the kick, bass, and main vocal anchor on the centre rail.",
];

const initialQueue: QueueTask[] = [
  { id: 1, title: "Find A Way reference map", detail: "Structure and tonal balance · local analysis", time: "01:18", status: "processing" },
  { id: 2, title: "Digital Retro stems", detail: "Grouped production files", time: "18:42", status: "complete" },
  { id: 3, title: "Club master preview", detail: "WAV 24-bit · local mock", time: "Queued", status: "waiting" },
];

function NastorMark() {
  return (
    <span className="nastor-mark" aria-hidden="true">
      {[8, 16, 25, 13, 30, 20, 10].map((height, index) => <span key={index} style={{ height }} />)}
    </span>
  );
}

function Sidebar({ active, onChange, onShortcut, onProfile, mobile = false, onClose }: { active: string; onChange: (label: string) => void; onShortcut: () => void; onProfile: () => void; mobile?: boolean; onClose?: () => void }) {
  const renderItem = ({ label, icon: Icon }: { label: string; icon: IconType }) => (
    <button className={`nav-item ${active === label ? "active" : ""}`} onClick={() => { onChange(label); onClose?.(); }} aria-current={active === label ? "page" : undefined} key={label}>
      <Icon size={17} strokeWidth={1.7} />
      <span>{label}</span>
      {label === "AI Assistant" && <span className="nav-signal" />}
    </button>
  );

  return (
    <aside className={`sidebar ${mobile ? "sidebar-mobile" : ""}`} aria-label="Studio navigation">
      <div className="brand-row">
        <NastorMark />
        <span className="brand-word">NASTOR</span>
        {mobile && <button className="icon-button close-drawer" aria-label="Close navigation" onClick={onClose}><X size={19} /></button>}
      </div>
      <div className="rail-status"><span><i /> Room online</span><small>TAHOE · ZA</small></div>
      <nav className="nav-block" aria-label="Primary">{primaryNav.map(renderItem)}</nav>
      <div className="nav-divider" />
      <p className="nav-label">Production</p>
      <nav className="nav-block" aria-label="Production tools">{creationNav.map(renderItem)}</nav>
      <div className="sidebar-spacer" />
      <button className="shortcut-note" onClick={onShortcut}><Keyboard size={16} /><span>Shortcuts</span><kbd>?</kbd></button>
      <button className="profile-button" aria-label="Open profile settings" onClick={onProfile}>
        <Image className="avatar" src="/brand/dj-nastor-avatar.jpg" width={40} height={40} alt="Illustrated portrait of DJ Nastor" />
        <span className="profile-copy"><strong>DJ Nastor</strong><small>Producer · engineer</small></span>
        <Settings2 size={16} />
      </button>
    </aside>
  );
}

function Briefing({ context, activeNav }: { context: { eyebrow: string; title: string; copy: string }; activeNav: string }) {
  return (
    <section className="briefing" aria-labelledby="briefing-title">
      <div className="briefing-copy">
        <span className="section-kicker">{context.eyebrow}</span>
        <h1 id="briefing-title">{context.title}</h1>
        <p>{context.copy}</p>
        <div className="ecosystem-tape" aria-label="Creative ecosystem"><span>DJ NASTOR</span><span>TAHOE STUDIOS</span><span>PHUSHI PLAN MUSIC</span><span>LUKULU RECORDINGS</span></div>
      </div>
      <div className="briefing-portrait">
        <Image src="/brand/dj-nastor-studio.jpg" fill priority sizes="(max-width: 760px) 100vw, 380px" alt="DJ Nastor wearing headphones in the studio" />
        <span className="portrait-caption"><i /> {activeNav === "Home" ? "ACTIVE ROOM" : activeNav.toUpperCase()}</span>
      </div>
    </section>
  );
}

function LaunchRail({ onLaunch, onOpenStudio }: { onLaunch: (cue: string, name: string) => void; onOpenStudio: () => void }) {
  const steps = [1,0,0,0,1,0,1,0,1,0,0,1,1,0,1,0];
  return <section className="launch-rail" aria-labelledby="launch-title">
    <div className="launch-copy"><span className="launch-badge"><i /> Browser sketch · local prototype</span><h2 id="launch-title">Start with the next <em>eight bars.</em></h2><p>Choose a direction and Nastor turns it into a focused production brief. Build the idea in your DAW, then return for arrangement, mix, and delivery guidance.</p><div className="launch-actions">{launchTemplates.map((item) => <button key={item.name} onClick={() => onLaunch(item.cue, item.name)}><span>{item.name}</span><small>{item.meta}</small><ChevronRight size={15} /></button>)}</div></div>
    <div className="launch-machine" aria-label="Eight-bar groove preview"><header><span>NASTOR / LAUNCH RAIL</span><button onClick={onOpenStudio}>Open studio <ArrowUpRight size={13} /></button></header><div className="rail-readout"><strong>8 BAR IDEA</strong><span>120.00</span><span>A MIN</span><span>4 / 4</span></div><div className="step-grid" aria-hidden="true">{steps.map((active,index) => <i key={index} className={`${active ? "active" : ""} ${index % 4 === 0 ? "bar" : ""}`} />)}</div><div className="signal-lanes" aria-hidden="true"><div><span>KICK</span><b style={{width:"86%"}} /></div><div><span>PERC</span><b style={{width:"68%"}} /></div><div><span>VOICE</span><b style={{width:"43%"}} /></div></div><footer><span><i /> READY FOR DIRECTION</span><small>Reason 14 · DAW-neutral guidance</small></footer></div>
  </section>;
}

function PatternDesk({ onAsk }: { onAsk: (prompt: string) => void }) {
  const channelNames = ["Foundation kick", "Shaker pocket", "Log drum", "Vocal air"];
  const devices = ["Kong", "Dr. Octo Rex", "Mimic", "Grain"];
  const defaultSteps = [
    [3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0],
    [0,0,2,0,0,1,0,2,0,0,2,0,0,1,0,2],
    [0,0,0,0,0,0,3,0,0,0,0,2,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1],
  ];
  const presetLibrary = {
    "Afro house": defaultSteps,
    "Amapiano log": [[3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0],[0,1,0,2,0,1,0,2,0,1,0,2,0,1,0,2],[0,0,0,0,0,0,3,0,0,2,0,0,0,0,3,0],[0,0,0,1,0,0,0,0,0,0,2,0,0,0,0,1]],
    "Hip-hop swing": [[3,0,0,0,0,0,2,0,3,0,0,0,0,0,2,0],[0,0,1,0,0,2,0,0,0,0,1,0,0,2,0,0],[0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0]],
  } satisfies Record<string, number[][]>;
  type PatternState = { steps: number[][]; bpm: number; swing: number; muted: boolean[]; solo: number | null; activePreset: string };
  const normalizeStep = (value: number) => value > 2 ? 3 : value > 1 ? 2 : value > 0 ? 1 : 0;
  const normalizeGrid = (value: number[][]) => value.map((row) => row.map(normalizeStep));
  const cloneSteps = (value: number[][]) => value.map((row) => [...row]);
  const [steps, setSteps] = useState(defaultSteps);
  const [selected, setSelected] = useState(1);
  const [deskPlaying, setDeskPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [browserTab, setBrowserTab] = useState("Sounds");
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(38);
  const [muted, setMuted] = useState([false, false, false, false]);
  const [solo, setSolo] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState("Afro house");
  const [history, setHistory] = useState<PatternState[]>([]);
  const [future, setFuture] = useState<PatternState[]>([]);
  const importRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const snapshot = (): PatternState => ({ steps: cloneSteps(steps), bpm, swing, muted: [...muted], solo, activePreset });
  const restore = (state: PatternState) => { setSteps(normalizeGrid(state.steps)); setBpm(state.bpm); setSwing(state.swing); setMuted([...state.muted]); setSolo(state.solo); setActivePreset(state.activePreset || "Custom"); };
  const checkpoint = () => { setHistory((items) => [...items.slice(-24), snapshot()]); setFuture([]); };
  const undo = () => { const previous = history.at(-1); if (!previous) return; setFuture((items) => [snapshot(), ...items].slice(0, 25)); restore(previous); setHistory((items) => items.slice(0, -1)); };
  const redo = () => { const next = future[0]; if (!next) return; setHistory((items) => [...items.slice(-24), snapshot()]); restore(next); setFuture((items) => items.slice(1)); };
  const changeSteps = (producer: (current: number[][]) => number[][], preset = "Custom") => { checkpoint(); setSteps((current) => normalizeGrid(producer(cloneSteps(current)))); setActivePreset(preset); };
  const toggleStep = (channel: number, step: number) => changeSteps((current) => current.map((row, rowIndex) => rowIndex === channel ? row.map((value, stepIndex) => stepIndex === step ? (value + 1) % 4 : value) : row));
  const toggleMute = (channel: number) => { checkpoint(); setMuted((items) => items.map((value, index) => index === channel ? !value : value)); };
  const toggleSolo = (channel: number) => { checkpoint(); setSolo((value) => value === channel ? null : channel); };
  const updateBpm = (value: number) => setBpm(Math.max(70, Math.min(150, value)));
  const applyPreset = (name: keyof typeof presetLibrary) => changeSteps(() => cloneSteps(presetLibrary[name]), name);
  const clearChannel = () => changeSteps((current) => current.map((row, index) => index === selected ? row.map(() => 0) : row));
  const duplicateChannel = () => changeSteps((current) => current.map((row, index) => index === selected ? [...current[(selected + 3) % 4]] : row));
  const humanize = () => changeSteps((current) => current.map((row, channel) => row.map((value, index) => value && index % 4 !== 0 && (channel + index) % 5 === 0 ? Math.max(1, value - 1) : value)));
  const createVariation = () => changeSteps((current) => current.map((row, channel) => row.map((value, index) => {
    if (channel === 0) return [0,4,8,12].includes(index) ? Math.max(value, 3) : 0;
    if (channel === 1 && [3,7,11,15].includes(index)) return value ? Math.max(1, value - 1) : 1;
    if (channel === 2 && [6,10,14].includes(index)) return index === 10 ? 2 : value;
    if (channel === 3 && index === 13) return value ? 0 : 1;
    return value;
  })));

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("nastor-pattern-v3") ?? window.localStorage.getItem("nastor-pattern-v2");
        if (!saved) return;
        const data = JSON.parse(saved) as Partial<PatternState>;
        if (Array.isArray(data.steps) && data.steps.length === 4 && data.steps.every((row) => Array.isArray(row) && row.length === 16)) setSteps(normalizeGrid(data.steps));
        if (typeof data.bpm === "number") updateBpm(data.bpm);
        if (typeof data.swing === "number") setSwing(Math.max(0, Math.min(70, data.swing)));
        if (Array.isArray(data.muted) && data.muted.length === 4) setMuted(data.muted.map(Boolean));
        if (data.solo === null || (typeof data.solo === "number" && data.solo >= 0 && data.solo < 4)) setSolo(data.solo);
        if (typeof data.activePreset === "string") setActivePreset(data.activePreset);
      } catch { window.localStorage.removeItem("nastor-pattern-v3"); }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("nastor-pattern-v3", JSON.stringify({ steps, bpm, swing, muted, solo, activePreset }));
  }, [steps, bpm, swing, muted, solo, activePreset]);

  useEffect(() => {
    if (!deskPlaying) return;
    const AudioContextClass = window.AudioContext;
    const context = audioRef.current ?? new AudioContextClass();
    audioRef.current = context;
    void context.resume();
    let step = 0;
    let timer = 0;
    const output = context.createGain(); output.gain.value = 0.34; output.connect(context.destination);
    const tone = (channel: number, time: number, velocity: number) => {
      if (muted[channel] || (solo !== null && solo !== channel)) return;
      const level = [0, .45, .72, 1][velocity] ?? 1;
      if (channel === 0) {
        const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.setValueAtTime(145, time); oscillator.frequency.exponentialRampToValueAtTime(48, time + .11); gain.gain.setValueAtTime(.9 * level, time); gain.gain.exponentialRampToValueAtTime(.001, time + .2); oscillator.connect(gain).connect(output); oscillator.start(time); oscillator.stop(time + .21);
      } else if (channel === 1) {
        const buffer = context.createBuffer(1, Math.floor(context.sampleRate * .055), context.sampleRate); const data = buffer.getChannelData(0); for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1; const source = context.createBufferSource(); const filter = context.createBiquadFilter(); const gain = context.createGain(); source.buffer = buffer; filter.type = "highpass"; filter.frequency.value = 5200; gain.gain.setValueAtTime(.16 * level, time); gain.gain.exponentialRampToValueAtTime(.001, time + .055); source.connect(filter).connect(gain).connect(output); source.start(time);
      } else {
        const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = channel === 2 ? "triangle" : "sine"; oscillator.frequency.value = channel === 2 ? (step % 4 === 2 ? 65.41 : 55) : 440; gain.gain.setValueAtTime((channel === 2 ? .32 : .08) * level, time); gain.gain.exponentialRampToValueAtTime(.001, time + (channel === 2 ? .18 : .35)); oscillator.connect(gain).connect(output); oscillator.start(time); oscillator.stop(time + .36);
      }
    };
    const tick = () => {
      setCurrentStep(step);
      steps.forEach((row, channel) => { if (row[step]) tone(channel, context.currentTime, row[step]); });
      const base = 60000 / bpm / 4; const delay = step % 2 === 0 ? base * (1 + swing / 200) : base * (1 - swing / 200);
      step = (step + 1) % 16; timer = window.setTimeout(tick, delay);
    };
    tick();
    return () => { window.clearTimeout(timer); output.disconnect(); };
  }, [deskPlaying, bpm, swing, steps, muted, solo]);

  const analysis = useMemo(() => {
    const hits = steps.map((row) => row.filter(Boolean).length);
    const total = hits.reduce((sum, value) => sum + value, 0);
    const accents = steps.flat().filter((value) => value === 3).length;
    const ghostNotes = steps.flat().filter((value) => value === 1).length;
    const offbeats = steps.flatMap((row) => row.filter((value, index) => value && index % 4 !== 0)).length;
    const anchorHits = [0,4,8,12].filter((index) => steps[0][index]).length;
    const collisions = Array.from({ length: 16 }, (_, index) => steps.filter((row) => row[index]).length).filter((value) => value >= 3).length;
    const density = Math.round(total / 64 * 100);
    const syncopation = total ? Math.round(offbeats / total * 100) : 0;
    const dynamics = total ? Math.round((accents + ghostNotes) / total * 100) : 0;
    const space = Math.max(0, 100 - density - collisions * 5);
    const score = Math.max(0, Math.min(100, Math.round(anchorHits * 12 + Math.min(syncopation, 35) + space * .24 + dynamics * .14)));
    const advice = anchorHits < 4 ? "Restore the four anchor beats before adding more movement." : collisions > 2 ? "Several moments stack three or more voices. Use Clear or lower velocities at the busiest step." : ghostNotes < 3 ? "Add two ghost notes to the shaker or vocal-air lane for a more human loop." : hits[2] < 2 ? "The low melodic answer is too rare to establish a phrase. Add one response after beat three." : "The pattern has useful accents and negative space. Try Variation to create a B phrase.";
    return { hits, density, syncopation, dynamics, space: Math.round(space), score, advice };
  }, [steps]);

  const exportPattern = () => { const blob = new Blob([JSON.stringify({ version: 3, name: "Nastor Pattern 01", ...snapshot() }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "nastor-pattern-01.json"; link.click(); URL.revokeObjectURL(url); };
  const importPattern = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)) as PatternState; if (!Array.isArray(data.steps) || data.steps.length !== 4 || !data.steps.every((row) => Array.isArray(row) && row.length === 16)) throw new Error("Invalid pattern"); checkpoint(); restore({ steps: normalizeGrid(data.steps), bpm: Math.max(70, Math.min(150, Number(data.bpm) || 120)), swing: Math.max(0, Math.min(70, Number(data.swing) || 0)), muted: Array.isArray(data.muted) && data.muted.length === 4 ? data.muted.map(Boolean) : [false,false,false,false], solo: typeof data.solo === "number" ? data.solo : null, activePreset: data.activePreset || "Imported" }); } catch { onAsk("The imported pattern file was invalid. Explain the expected Nastor pattern format."); } }; reader.readAsText(file); event.target.value = ""; };
  const reset = () => { checkpoint(); setSteps(cloneSteps(defaultSteps)); setBpm(120); setSwing(38); setMuted([false,false,false,false]); setSolo(null); setActivePreset("Afro house"); };
  const stepLabel = (value: number) => value === 3 ? "accent" : value === 2 ? "normal hit" : value === 1 ? "ghost hit" : "empty";

  return <section className="pattern-desk" aria-labelledby="pattern-desk-title">
    <header className="desk-top"><div><span className="section-kicker">Pattern desk · studio workflow tools</span><h2 id="pattern-desk-title">Build the pocket before the playlist.</h2></div><div className="desk-tools"><button onClick={undo} disabled={!history.length} aria-label="Undo pattern edit"><Undo2 size={14} /></button><button onClick={redo} disabled={!future.length} aria-label="Redo pattern edit"><Redo2 size={14} /></button><button onClick={() => importRef.current?.click()} aria-label="Import pattern"><Upload size={14} /></button><button onClick={exportPattern} aria-label="Export pattern"><Download size={14} /></button><input ref={importRef} className="sr-only" type="file" accept="application/json,.json" onChange={importPattern} /><div className="desk-transport"><button aria-label={deskPlaying ? "Pause pattern" : "Play pattern"} onClick={() => setDeskPlaying((value) => { if (value) setCurrentStep(-1); return !value; })}>{deskPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><label><span>BPM</span><input aria-label="Pattern tempo" type="number" min="70" max="150" value={bpm} onChange={(event) => updateBpm(Number(event.target.value))} /></label><small>{activePreset.toUpperCase()}</small></div></div></header>
    <div className="intelligence-bar"><div><span>Groove score</span><strong>{analysis.score}</strong></div><div><span>Density</span><strong>{analysis.density}%</strong></div><div><span>Syncopation</span><strong>{analysis.syncopation}%</strong></div><div><span>Dynamics</span><strong>{analysis.dynamics}%</strong></div><p><Sparkles size={13} /> {analysis.advice}</p></div>
    <div className="pattern-toolbelt" aria-label="Pattern tools"><div className="preset-buttons">{(Object.keys(presetLibrary) as Array<keyof typeof presetLibrary>).map((name) => <button className={activePreset === name ? "active" : ""} key={name} onClick={() => applyPreset(name)}>{name}</button>)}</div><div className="edit-buttons"><button onClick={createVariation}><WandSparkles size={12} /> Variation</button><button onClick={humanize}><SlidersHorizontal size={12} /> Humanize</button><button onClick={duplicateChannel}>Copy prev → selected</button><button onClick={clearChannel}>Clear selected</button></div></div>
    <div className="desk-body">
      <aside className="sound-browser" aria-label="Sound browser"><div className="browser-search"><Search size={13} /><span>Find a starting sound</span></div><div className="browser-tabs">{["Sounds","Devices","Lessons"].map((tab) => <button className={browserTab === tab ? "active" : ""} key={tab} onClick={() => setBrowserTab(tab)}>{tab}</button>)}</div><div className="browser-list">{browserTab === "Sounds" && ["Cape Town drums","Organic percussion","Log drum studies","Vocal textures"].map((item,index) => <button key={item} onClick={() => setSelected(index)}><span className={`browser-dot tone-${index}`} /><span>{item}<small>{index + 8} sources</small></span><Plus size={12} /></button>)}{browserTab === "Devices" && ["Kong drum designer","Dr. Octo Rex","Mimic sampler","Grain texture"].map((item,index) => <button key={item} onClick={() => setSelected(index)}><span className="browser-dot device" /><span>{item}<small>Browser instrument</small></span><Plus size={12} /></button>)}{browserTab === "Lessons" && ["Design the pocket","Use call and response","Open the break","Prepare the drop"].map((item) => <button key={item} onClick={() => onAsk(`Teach me how to ${item.toLowerCase()} using this pattern. Current groove score: ${analysis.score}.`)}><span className="browser-dot lesson" /><span>{item}<small>Guided move</small></span><ChevronRight size={12} /></button>)}</div><div className="swing-control"><label htmlFor="pattern-swing">Swing <strong>{swing}%</strong></label><input id="pattern-swing" type="range" min="0" max="70" value={swing} onChange={(event) => setSwing(Number(event.target.value))} /></div></aside>
      <div className="channel-rack"><div className="rack-ruler"><span>CHANNEL · click steps to cycle ghost / hit / accent</span>{[1,2,3,4].map((bar) => <b key={bar}>0{bar}</b>)}</div>{channelNames.map((name,channel) => <div className={`channel-row ${selected === channel ? "selected" : ""} ${muted[channel] ? "muted" : ""}`} key={name}><button className="channel-name" onClick={() => setSelected(channel)}><i style={{background:["#f2a65a","#70bbce","#c79af1","#8fd3a9"][channel]}} /><span>{name}<small>{devices[channel]} · {analysis.hits[channel]} hits</small></span></button><div className="channel-controls"><button className={muted[channel] ? "active" : ""} onClick={() => toggleMute(channel)} aria-label={`Mute ${name}`} aria-pressed={muted[channel]}>M</button><button className={solo === channel ? "active" : ""} onClick={() => toggleSolo(channel)} aria-label={`Solo ${name}`} aria-pressed={solo === channel}>S</button></div><div className="rack-steps">{steps[channel].map((value,step) => <button key={step} aria-label={`${name} step ${step + 1}: ${stepLabel(value)}`} aria-pressed={Boolean(value)} className={`${value ? "active" : ""} velocity-${value} ${step % 4 === 0 ? "beat" : ""} ${currentStep === step ? "playing" : ""}`} onClick={() => toggleStep(channel,step)}><span /></button>)}</div></div>)}<div className="rack-footer"><button onClick={reset}><RotateCcw size={11} /> Reset</button><span>GHOST / HIT / ACCENT · AUTOSAVED</span><button onClick={() => onAsk(`Analyze this pattern: preset ${activePreset}, score ${analysis.score}, density ${analysis.density}%, syncopation ${analysis.syncopation}%, dynamics ${analysis.dynamics}%, space ${analysis.space}%. Focus on ${channelNames[selected]} with ${analysis.hits[selected]} hits. Give one specific studio edit and explain why.`)}>Ask Copilot <Sparkles size={12} /></button></div></div>
      <aside className="coach-strip"><span className="section-kicker">Studio tools</span><strong>{channelNames[selected]}</strong><p>{analysis.advice}</p><div className="coach-meter"><i style={{height:`${Math.max(18, analysis.density)}%`}} /><i style={{height:`${Math.max(18, analysis.syncopation)}%`}} /><i style={{height:`${Math.max(18, analysis.dynamics)}%`}} /><i style={{height:`${Math.max(18, analysis.score)}%`}} /></div><dl><div><dt>Role</dt><dd>{["Anchor","Motion","Answer","Texture"][selected]}</dd></div><div><dt>Density</dt><dd>{analysis.hits[selected]}/16</dd></div><div><dt>Preset</dt><dd>{activePreset}</dd></div></dl><button onClick={() => onAsk(`Create a focused browser-studio exercise to improve ${channelNames[selected]}. The pattern preset is ${activePreset} and scores ${analysis.score}/100.`)}>Open guided exercise <ArrowUpRight size={13} /></button></aside>
    </div>
  </section>;
}

function PhaseScope({ playing, progress }: { playing: boolean; progress: number }) {
  return (
    <section className="phase-panel panel-shell" aria-labelledby="phase-title">
      <header className="hardware-heading">
        <div><span className="section-kicker">Live analysis · local</span><h2 id="phase-title">Phase / motion</h2></div>
        <span className={`analysis-status ${playing ? "live" : ""}`}><i /> {playing ? "Tracing" : "Held"}</span>
      </header>
      <div className="scope-wrap">
        <div className={`phase-scope ${playing ? "spinning" : ""}`} style={{ "--scope-progress": `${progress * 3.6}deg` } as CSSProperties} aria-label="Circular phase scope showing groove score 87 and stable stereo correlation">
          <span className="scope-ticks" />
          <span className="scope-track" />
          <span className="scope-signal" />
          <span className="scope-arm" />
          <span className="scope-core"><strong>87</strong><small>GROOVE</small><i>LOCKED</i></span>
        </div>
      </div>
      <dl className="scope-metrics">
        <div><dt>Phase</dt><dd>+0.82</dd></div>
        <div><dt>Headroom</dt><dd>−6.2 <small>dB</small></dd></div>
        <div><dt>Dynamics</dt><dd>10.8 <small>LU</small></dd></div>
      </dl>
    </section>
  );
}

function Arrangement({ project, playing, progress, onPlay, selected, onSelect, onOptions, onReturn }: { project: ProjectContext; playing: boolean; progress: number; onPlay: () => void; selected: string; onSelect: (name: string) => void; onOptions: () => void; onReturn: () => void }) {
  const totalSeconds = project.analysisAvailable ? 320 : 0;
  const currentSeconds = progress * totalSeconds / 100;
  const timecode = `${String(Math.floor(currentSeconds / 60)).padStart(2, "0")}:${String(Math.floor(currentSeconds % 60)).padStart(2, "0")}`;
  return (
    <section className="arrangement panel-shell" aria-labelledby="arrangement-title">
      <header className="arrangement-heading">
        <div className="record-title"><span className="section-kicker">Active record · {project.parent}</span><h2 id="arrangement-title">{project.title}</h2><p>{project.genre}</p></div>
        <dl className="track-metrics" aria-label="Track details">
          <div><dt>BPM</dt><dd>{project.bpm}</dd></div><div><dt>Key</dt><dd>{project.musicalKey}</dd></div><div><dt>Length</dt><dd>{project.duration}</dd></div>
        </dl>
      </header>
      <div className="transport-row">
        <button className="play-button" onClick={onPlay} disabled={!project.analysisAvailable} aria-label={playing ? "Pause preview" : "Play preview"}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
        <span className="timecode">{project.analysisAvailable ? timecode : "--:--"}</span>
        <div className="transport-rail" aria-hidden="true"><span className="transport-fill" style={{ width: project.analysisAvailable ? `${progress}%` : "0%" }} /></div>
        <span className="transport-end">{project.duration}</span>
        <button className="icon-button subtle" aria-label="More track options" onClick={onOptions}><MoreHorizontal size={19} /></button>
      </div>
      <div className={`waveform-shell ${project.analysisAvailable ? "" : "unavailable"}`}>
        <div className="section-strips">
          {sections.map((section) => (
            <button key={section.name} disabled={!project.analysisAvailable} onClick={() => onSelect(section.name)} className={selected === section.name ? "selected" : ""} style={{ width: `${section.end - section.start}%`, "--section-color": section.color } as CSSProperties}><span>{section.name}</span></button>
          ))}
        </div>
        <div className="waveform" aria-label={project.analysisAvailable ? `Energy waveform. ${selected} selected.` : "No local analysis loaded for this catalog item."}>
          {waveform.map((height, index) => <span key={index} style={{ "--bar-height": `${height}%`, "--bar-index": index } as CSSProperties} />)}
          <div className="wave-grid" aria-hidden="true" />
          {project.analysisAvailable && <div className="playhead" style={{ left: `${progress}%` }}><span /></div>}
        </div>
        {!project.analysisAvailable && <div className="analysis-empty"><Disc3 size={22} /><strong>Catalog context selected</strong><span>Add session audio to unlock arrangement analysis.</span></div>}
      </div>
      <footer className="arrangement-footer">
        {project.analysisAvailable ? <><span className="live-label"><i /> SECTION 05</span><p><strong>{selected}</strong> · Pull 12% density from the break so the final peak lands with more authority.</p><button onClick={() => onSelect(selected === "Break" ? "Peak" : "Break")}>Jump to {selected === "Break" ? "peak" : "break"}<ChevronRight size={15} /></button></> : <><span className="live-label muted"><i /> ANALYSIS OFF</span><p>Return to the active record to resume the live energy map.</p><button onClick={onReturn}>Open Find A Way<ChevronRight size={15} /></button></>}
      </footer>
    </section>
  );
}

function Copilot({ project, messages, value, setValue, onSubmit, onSuggestion, onOptions, onAttach, attachedFile, mobile, onClose }: { project: ProjectContext; messages: Message[]; value: string; setValue: (value: string) => void; onSubmit: (event: FormEvent) => void; onSuggestion: (text: string) => void; onOptions: () => void; onAttach: (event: ChangeEvent<HTMLInputElement>) => void; attachedFile: string; mobile?: boolean; onClose?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);
  const handleComposerKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
  };
  return (
    <aside className={`copilot ${mobile ? "copilot-mobile" : ""}`} aria-label="Nastor Copilot">
      <header className="copilot-header">
        <div className="copilot-identity"><Image src="/brand/dj-nastor-avatar.jpg" width={38} height={38} alt="" /><div><strong>Nastor Copilot</strong><span><i /> Context: {project.title}</span></div></div>
        {mobile ? <button className="icon-button" aria-label="Close Copilot" onClick={onClose}><X size={19} /></button> : <button className="icon-button" aria-label="Copilot options" onClick={onOptions}><MoreHorizontal size={19} /></button>}
      </header>
      <div className="copilot-context"><span>{project.genre.toUpperCase()}</span><span>{project.analysisAvailable ? "ARRANGEMENT" : "CATALOG"}</span><span>{project.musicalKey.toUpperCase()}</span></div>
      <div className="context-strip"><span>LOCAL DEMO</span><p>Replies are mocked from the active project context.</p></div>
      <div className="message-list" ref={scrollRef} aria-live="polite">
        {messages.map((message) => <div key={message.id} className={`message ${message.role}`}>{message.role === "assistant" && <span className="message-mark"><NastorMark /></span>}<div><span className="message-author">{message.role === "assistant" ? "COPILOT" : "YOU"}</span><p>{message.text}</p></div></div>)}
      </div>
      <div className="suggestion-row" aria-label="Suggested prompts">{["Clear the break", "Check low-end", "Plan the outro"].map((text) => <button key={text} onClick={() => onSuggestion(text)}>{text}</button>)}</div>
      <form className="composer" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={mobile ? "mobile-copilot-input" : "copilot-input"}>Message Nastor Copilot</label>
        <textarea id={mobile ? "mobile-copilot-input" : "copilot-input"} rows={3} placeholder={`Ask about ${project.title}…`} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleComposerKeyDown} />
        <input ref={fileRef} className="sr-only" type="file" accept="audio/*,.als,.flp,.logicx,.zip" onChange={onAttach} />
        <div><button type="button" className="attach-button" aria-label="Attach project context" onClick={() => fileRef.current?.click()}><Plus size={18} /></button><span title={attachedFile || undefined}>{attachedFile || "Attach local context"}</span><button type="submit" className="send-button" disabled={!value.trim()} aria-label="Send message"><Send size={17} /></button></div>
      </form>
      <p className="copilot-disclaimer">No files leave this local prototype.</p>
    </aside>
  );
}

export default function StudioPage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(58);
  const [selectedSection, setSelectedSection] = useState("Peak");
  const [activeProject, setActiveProject] = useState("Find A Way");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreset, setExportPreset] = useState("WAV · 24-bit");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [mobileCopilot, setMobileCopilot] = useState(false);
  const [attachedFile, setAttachedFile] = useState("");
  const [queue, setQueue] = useState<QueueTask[]>(initialQueue);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [toast, setToast] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", text: "Find A Way is holding a stable centre image. The opportunity is structural: let the break breathe before adding anything to the peak." },
    { id: 2, role: "assistant", text: "At 120 BPM in A minor, the low end can stay patient. Use the vocal cue and upper percussion to create forward motion." },
  ]);

  const context = navContext[activeNav] ?? navContext.Home;
  const project = projectContexts.find((item) => item.title === activeProject) ?? projectContexts[0];
  const commandItems = useMemo(() => [...primaryNav, ...creationNav].filter(({ label }) => label.toLowerCase().includes(commandQuery.toLowerCase())), [commandQuery]);
  const visibleQueue = hideCompleted ? queue.filter((task) => task.status !== "complete") : queue;

  useEffect(() => {
    if (!playing || !project.analysisAvailable) return;
    const id = window.setInterval(() => setProgress((value) => value >= 100 ? 0 : value + 0.12), 120);
    return () => window.clearInterval(id);
  }, [playing, project.analysisAvailable]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, [contenteditable='true']") ?? false;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandIndex(0); setCommandOpen(true); }
      if (!isTyping && event.key === "?") { event.preventDefault(); setShortcutsOpen(true); }
      if (!isTyping && event.code === "Space" && !commandOpen && !exportOpen && !inviteOpen && !shortcutsOpen && project.analysisAvailable) { event.preventDefault(); setPlaying((value) => !value); }
      if (event.key === "Escape") { setCommandOpen(false); setExportOpen(false); setInviteOpen(false); setShortcutsOpen(false); setMobileNav(false); setMobileCopilot(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandOpen, exportOpen, inviteOpen, shortcutsOpen, project.analysisAvailable]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const submitDemo = (event: FormEvent) => {
    event.preventDefault();
    if (!demoEmail.trim() || !demoEmail.includes("@") || !demoLink.trim()) {
      setToast("Add a valid email and private listening link");
      return;
    }
    setDemoEmail("");
    setDemoLink("");
    setToast("Demo received — the label team will review it");
  };

  const selectProject = (title: string) => {
    setPlaying(false);
    setActiveProject(title);
    setProgress(title === "Find A Way" ? 58 : 0);
    setSelectedSection(title === "Find A Way" ? "Peak" : "Intro");
    setToast(`${title} context loaded`);
  };

  const runQuickAction = (title: string) => {
    const prompts: Record<string, string> = {
      "Map the reference": `Compare structure and tonal balance for ${activeProject}`,
      "Reduce the break": "Show me what to remove from the break before the peak",
      "Draft a vocal cue": "Draft a restrained vocal cue that leaves room for the groove",
      "Prepare club master": "Review dynamics and club translation before export",
    };
    setInput(prompts[title]);
    if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true);
    setToast(`${title} loaded into Copilot`);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: assistantReplies[current.length % assistantReplies.length] }]);
    setInput("");
  };

  const chooseCommand = (label: string) => { setActiveNav(label); setCommandOpen(false); setCommandQuery(""); setToast(`${label} workspace opened`); };
  const navigateTo = (label: string) => { setActiveNav(label); setToast(`${label} workspace opened`); };

  const shareProject = async () => {
    const url = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(activeProject)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Project link copied to clipboard");
    } catch {
      window.prompt("Copy this project link:", url);
      setToast("Project link ready to copy");
    }
  };

  const inviteCollaborator = (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email || !email.includes("@")) { setToast("Enter a valid collaborator email"); return; }
    setCollaboratorCount((count) => count + 1);
    setInviteEmail("");
    setInviteOpen(false);
    setToast(`Local invite prepared for ${email}`);
  };

  const attachProjectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachedFile(file.name);
    setToast(`${file.name} added to local context`);
    event.target.value = "";
  };

  const addExportToQueue = () => {
    setQueue((tasks) => [{ id: Date.now(), title: `${activeProject} export`, detail: `${exportPreset} · local mock`, time: "Queued", status: "waiting" }, ...tasks]);
    setExportOpen(false);
    setToast(`${exportPreset} added to the queue`);
  };

  const handleCommandKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!commandItems.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setCommandIndex((index) => (index + 1) % commandItems.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setCommandIndex((index) => (index - 1 + commandItems.length) % commandItems.length); }
    if (event.key === "Enter") { event.preventDefault(); chooseCommand(commandItems[commandIndex]?.label ?? commandItems[0].label); }
  };

  const selectSection = (name: string) => {
    setSelectedSection(name);
    const target = sections.find((item) => item.name === name);
    if (target) setProgress((target.start + target.end) / 2);
  };

  return (
    <main className="app-shell">
      <Sidebar active={activeNav} onChange={navigateTo} onShortcut={() => setShortcutsOpen(true)} onProfile={() => setToast("Account connection is not enabled in this local demo")} />
      <section className="workspace">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21} /></button><div className="breadcrumbs"><span>CONTROL ROOM</span><ChevronRight size={14} /><strong>{activeProject}</strong><span className="autosave"><i /> Saved locally</span></div></div>
          <div className="topbar-actions">
            <button className="command-trigger" onClick={() => { setCommandIndex(0); setCommandOpen(true); }}><Search size={16} /><span>Search tools</span><kbd>Ctrl K</kbd></button>
            <button className="icon-button share-button" aria-label="Copy project link" onClick={shareProject}><Share2 size={18} /></button>
            <button className="invite-button" onClick={() => setInviteOpen(true)}><Plus size={16} /> Invite{collaboratorCount ? ` · ${collaboratorCount}` : ""}</button>
            <button className="export-button" onClick={() => setExportOpen(true)}><Download size={16} /> Export<ChevronDown size={15} /></button>
          </div>
        </header>

        <div className="canvas-scroll">
          <div className="canvas-inner">
            <Briefing context={context} activeNav={activeNav} />
            <LaunchRail onLaunch={(cue, name) => { setInput(cue); setActiveNav("AI Assistant"); setToast(`${name} brief loaded into Copilot`); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} onOpenStudio={() => navigateTo("Studio")} />
            <PatternDesk onAsk={(prompt) => { setInput(prompt); setActiveNav("AI Assistant"); setToast("Production question loaded into Copilot"); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} />
            <section className="label-intro" aria-labelledby="label-intro-title">
              <div>
                <span className="section-kicker">TAHOE PLAN MUSIC · INDEPENDENT ELECTRONIC LABEL</span>
                <h2 id="label-intro-title">Rhythm with a point of view.</h2>
                <p>Afro House, organic textures, and records made for movement. Explore the latest releases, meet the room behind the sound, and listen in full context.</p>
              </div>
              <div className="label-intro-meta"><span><i /> Based in Cape Town</span><span>EST. 2024</span><span>120 BPM / OPEN AIR</span></div>
            </section>
            <div className="record-console">
              <Arrangement project={project} playing={playing} progress={progress} onPlay={() => setPlaying((value) => !value)} selected={selectedSection} onSelect={selectSection} onOptions={() => setToast(`${selectedSection} controls selected`)} onReturn={() => selectProject("Find A Way")} />
              <PhaseScope playing={playing} progress={progress} />
            </div>

            <section className="release-section section-block" aria-labelledby="releases-title">
              <div className="section-heading release-heading"><div><span className="section-kicker">CATALOGUE · 2026</span><h2 id="releases-title">Latest releases</h2></div><button className="text-button" onClick={() => navigateTo("Projects")}>View full catalog <ArrowUpRight size={15} /></button></div>
              <div className="release-grid">
                {releases.map((release, index) => <article className={`release-card ${index === 1 ? "featured" : ""}`} key={release.title}>
                  <div className={`release-cover ${release.art}`}><span className="release-index">0{index + 1}</span><span className="cover-groove" /><span className="cover-label">TAHOE<br />PLAN</span><button className="cover-play" aria-label={`Preview ${release.title}`} onClick={() => { selectProject(release.project); setPlaying(true); }}><Play size={16} fill="currentColor" /></button></div>
                  <div className="release-card-body"><div className="release-card-top"><span>{release.status}</span><small>{release.cat}</small></div><h3>{release.title}</h3><p className="release-artist">{release.artist}</p><div className="release-meta"><span>{release.date}</span><span>{release.tracks.length} TRACKS</span></div><ol className="track-snippet">{release.tracks.map((track, trackIndex) => <li key={track}><span>0{trackIndex + 1}</span>{track}</li>)}</ol><div className="release-actions"><button onClick={() => { selectProject(release.project); setPlaying(true); }}><Play size={13} fill="currentColor" /> Preview</button><a href={`https://www.google.com/search?q=${encodeURIComponent(`${release.artist} ${release.title}`)}`} target="_blank" rel="noreferrer">Buy / stream <ArrowUpRight size={13} /></a></div></div>
                </article>)}
              </div>
            </section>

            <div className="lower-console">
              <section className="quick-section section-block" aria-labelledby="quick-title">
                <div className="section-heading compact"><div><span className="section-kicker">Production desk</span><h2 id="quick-title">Quick actions</h2></div></div>
                <div className="quick-grid">{quickActions.map(({ title, copy, icon: Icon }, index) => <button key={title} className="quick-card" onClick={() => runQuickAction(title)}><span className="quick-number">0{index + 1}</span><span className="quick-icon"><Icon size={19} /></span><span><strong>{title}</strong><small>{copy}</small></span><ChevronRight size={17} className="quick-arrow" /></button>)}</div>
              </section>

              <section className="queue panel-shell" aria-labelledby="queue-title">
                <div className="section-heading compact"><div><span className="section-kicker">Local processes</span><h2 id="queue-title">Work queue</h2></div><button className={`filter-button ${hideCompleted ? "active" : ""}`} aria-label={hideCompleted ? "Show completed tasks" : "Hide completed tasks"} aria-pressed={hideCompleted} onClick={() => setHideCompleted((value) => !value)}>{hideCompleted ? "SHOW ALL" : "HIDE READY"}</button></div>
                <div className="queue-list">{visibleQueue.map((task) => { const QueueIcon = task.status === "processing" ? Activity : task.status === "complete" ? Check : Clock3; const label = task.status === "processing" ? "Processing" : task.status === "complete" ? "Ready" : "Waiting"; return <div className="queue-row" key={task.id}><span className={`queue-icon ${task.status}`}><QueueIcon size={16} /></span><span className="queue-copy"><strong>{task.title}</strong><small>{task.detail}</small></span><span className="queue-time">{task.time}</span><span className={`status-tag ${task.status}`}>{label}</span></div>; })}{!visibleQueue.length && <div className="queue-empty"><Check size={20} /><span>No active local tasks.</span></div>}</div>
              </section>
            </div>

            <section className="label-modules" aria-label="Label information">
              <div className="roster-module panel-shell"><div className="module-heading"><div><span className="section-kicker">THE HOUSE</span><h2>Artists & roster</h2></div><Music2 size={20} /></div>{roster.map((artist, index) => <button className="roster-row" key={artist.name} onClick={() => setToast(`${artist.name} profile selected`)}><span className="roster-number">0{index + 1}</span><span><strong>{artist.name}</strong><small>{artist.role} · {artist.note}</small></span><ArrowUpRight size={15} /></button>)}</div>
              <div className="news-module panel-shell"><div className="module-heading"><div><span className="section-kicker">NOTES FROM THE ROOM</span><h2>News</h2></div><Radio size={20} /></div>{labelNews.map((item) => <button className="news-row" key={item.title} onClick={() => setToast(`${item.title} selected`)}><span>{item.date}</span><strong>{item.title}</strong><small>{item.copy}</small></button>)}</div>
              <form className="demo-module panel-shell" onSubmit={submitDemo}><div className="module-heading"><div><span className="section-kicker">DEMO DROP</span><h2>Send the next record.</h2></div><Mail size={20} /></div><p>We listen for considered records with movement, space, and a strong point of view. Private links only, please.</p><label htmlFor="demo-email">Your email</label><input id="demo-email" type="email" placeholder="you@label.com" value={demoEmail} onChange={(event) => setDemoEmail(event.target.value)} /><label htmlFor="demo-link">Private listening link</label><input id="demo-link" type="url" placeholder="https://soundcloud.com/..." value={demoLink} onChange={(event) => setDemoLink(event.target.value)} /><button className="demo-submit" type="submit">Submit demo <ArrowUpRight size={15} /></button><small className="form-note">No attachments · One link per submission · We reply within 30 days</small></form>
            </section>

          </div>
        </div>
      </section>

            <Copilot project={project} messages={messages} value={input} setValue={setInput} onSubmit={sendMessage} onSuggestion={setInput} onOptions={() => setToast("Copilot is using local project and section context")} onAttach={attachProjectFile} attachedFile={attachedFile} />
      <button className="mobile-copilot-trigger" aria-label="Open Nastor Copilot" onClick={() => setMobileCopilot(true)}><Sparkles size={18} /><span>Copilot</span><i /></button>

      {mobileNav && <div className="overlay mobile-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileNav(false); }}><Sidebar active={activeNav} onChange={navigateTo} onShortcut={() => { setMobileNav(false); setShortcutsOpen(true); }} onProfile={() => setToast("Account connection is not enabled in this local demo")} mobile onClose={() => setMobileNav(false)} /></div>}
      {mobileCopilot && <div className="overlay mobile-overlay copilot-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileCopilot(false); }}><Copilot project={project} messages={messages} value={input} setValue={setInput} onSubmit={sendMessage} onSuggestion={setInput} onOptions={() => setToast("Copilot is using local project and section context")} onAttach={attachProjectFile} attachedFile={attachedFile} mobile onClose={() => setMobileCopilot(false)} /></div>}

      {commandOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}><section className="command-dialog" role="dialog" aria-modal="true" aria-labelledby="command-title"><h2 id="command-title" className="sr-only">Command palette</h2><div className="command-input"><Search size={19} /><label className="sr-only" htmlFor="command-search">Search commands</label><input id="command-search" autoFocus placeholder="Jump to a studio tool…" value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandIndex(0); }} onKeyDown={handleCommandKeyDown} aria-activedescendant={commandItems[commandIndex] ? `command-${commandItems[commandIndex].label.replaceAll(" ", "-")}` : undefined} /><kbd>ESC</kbd></div><div className="command-results"><span className="command-group-label">Studio tools</span>{commandItems.map(({ label, icon: Icon }, index) => <button id={`command-${label.replaceAll(" ", "-")}`} key={label} className={commandIndex === index ? "active" : ""} onMouseEnter={() => setCommandIndex(index)} onClick={() => chooseCommand(label)}><Icon size={18} /><span>{label}</span><small>Open workspace</small><ChevronRight size={15} /></button>)}{!commandItems.length && <p className="empty-command">No matching studio command.</p>}</div><footer><span><Command size={14} />K to open</span><span>↑↓ to navigate</span><span>Enter to select</span></footer></section></div>}

      {exportOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExportOpen(false); }}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title"><header><div><span className="section-kicker">Local delivery</span><h2 id="export-title">Export project</h2></div><button className="icon-button" aria-label="Close export dialog" onClick={() => setExportOpen(false)}><X size={19} /></button></header><p>Choose a mock export preset for <strong>{activeProject}</strong>. No audio will be rendered.</p><div className="preset-list" role="radiogroup" aria-label="Export preset">{[{ name: "WAV · 24-bit", sub: "Full-resolution mix", icon: FileAudio }, { name: "MP3 · 320 kbps", sub: "Private listening preview", icon: Music2 }, { name: "Stems · WAV", sub: "Grouped production stems", icon: AudioLines }].map(({ name, sub, icon: Icon }) => <button key={name} role="radio" aria-checked={exportPreset === name} className={exportPreset === name ? "selected" : ""} onClick={() => setExportPreset(name)}><Icon size={19} /><span><strong>{name}</strong><small>{sub}</small></span><i>{exportPreset === name && <Check size={14} />}</i></button>)}</div><div className="export-details"><span><Gauge size={15} /> Local mock</span><span>44.1 kHz</span><span>No backend connected</span></div><footer><button className="cancel-button" onClick={() => setExportOpen(false)}>Cancel</button><button className="primary-action" onClick={addExportToQueue}>Add to queue <ChevronRight size={16} /></button></footer></section></div>}

      {inviteOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInviteOpen(false); }}><form className="utility-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-title" onSubmit={inviteCollaborator}><header><div><span className="section-kicker">Local collaboration</span><h2 id="invite-title">Invite to this project</h2></div><button type="button" className="icon-button" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}><X size={19} /></button></header><p>Prepare a local invite for <strong>{activeProject}</strong>. No email will be sent.</p><label htmlFor="invite-email">Email address</label><input id="invite-email" type="email" autoFocus required placeholder="producer@example.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /><footer><button type="button" className="cancel-button" onClick={() => setInviteOpen(false)}>Cancel</button><button type="submit" className="primary-action">Prepare invite <ChevronRight size={16} /></button></footer></form></div>}

      {shortcutsOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShortcutsOpen(false); }}><section className="utility-dialog shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title"><header><div><span className="section-kicker">Studio controls</span><h2 id="shortcuts-title">Keyboard shortcuts</h2></div><button className="icon-button" aria-label="Close keyboard shortcuts" onClick={() => setShortcutsOpen(false)}><X size={19} /></button></header><dl><div><dt>Command palette</dt><dd><kbd>Ctrl</kbd><span>+</span><kbd>K</kbd></dd></div><div><dt>Play or pause</dt><dd><kbd>Space</kbd></dd></div><div><dt>Show shortcuts</dt><dd><kbd>?</kbd></dd></div><div><dt>Close dialogs</dt><dd><kbd>Esc</kbd></dd></div><div><dt>Send Copilot message</dt><dd><kbd>Enter</kbd></dd></div><div><dt>New line in Copilot</dt><dd><kbd>Shift</kbd><span>+</span><kbd>Enter</kbd></dd></div></dl></section></div>}

      {toast && <div className="toast" role="status"><Zap size={16} /><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </main>
  );
}
