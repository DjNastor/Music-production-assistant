"use client";

import Image from "next/image";
import {
  Activity,
  AudioLines,
  ArrowUpRight,
  Mail,
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



const releases = [
  { title: "Faces", artist: "DJ Nastor", date: "19 JUN 2026", cat: "TPM 026", art: "art-faces", project: "Faces", tracks: ["Faces (Original Mix)", "Faces (Dub Mix)"], status: "OUT NOW" },
  { title: "Find A Way", artist: "DJ Nastor", date: "07 MAY 2026", cat: "TPM 025", art: "art-retro", project: "Find A Way", tracks: ["Find A Way (Extended Mix)", "Find A Way (Dub Version)"], status: "FEATURED" },
  { title: "Digital Retro", artist: "DJ Nastor", date: "22 FEB 2026", cat: "TPM 024", art: "art-tahoe", project: "Digital Retro", tracks: ["Digital Retro", "After The Rain", "Memory Lane"], status: "ALBUM" },
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
  Home: { eyebrow: "Digital Retro · control room", title: "The record is in motion.", copy: "Find A Way is open at the arrangement desk. Hold the Afro House pulse, clear the break, and make the final arrival earn its weight." },
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
            <section className="label-intro" aria-labelledby="label-intro-title">
              <div><span className="section-kicker">TAHOE PLAN MUSIC · INDEPENDENT ELECTRONIC LABEL</span><h2 id="label-intro-title">Rhythm with a point of view.</h2><p>Afro House, organic textures, and records made for movement. Explore the latest releases, meet the room behind the sound, and listen in full context.</p></div>
              <div className="label-intro-meta"><span><i /> Based in Cape Town</span><span>EST. 2024</span><span>120 BPM / OPEN AIR</span></div>
            </section>
            <section className="release-section section-block" aria-labelledby="releases-title"><div className="section-heading release-heading"><div><span className="section-kicker">CATALOGUE · 2026</span><h2 id="releases-title">Latest releases</h2></div><button className="text-button" onClick={() => navigateTo("Projects")}>View full catalog <ArrowUpRight size={15} /></button></div><div className="release-grid">{releases.map((release, index) => <article className={`release-card ${index === 1 ? "featured" : ""}`} key={release.title}><div className={`release-cover ${release.art}`}><span className="release-index">0{index + 1}</span><span className="cover-groove" /><span className="cover-label">TAHOE<br />PLAN</span><button className="cover-play" aria-label={`Preview ${release.title}`} onClick={() => { selectProject(release.project); setPlaying(true); }}><Play size={16} fill="currentColor" /></button></div><div className="release-card-body"><div className="release-card-top"><span>{release.status}</span><small>{release.cat}</small></div><h3>{release.title}</h3><p className="release-artist">{release.artist}</p><div className="release-meta"><span>{release.date}</span><span>{release.tracks.length} TRACKS</span></div><ol className="track-snippet">{release.tracks.map((track, trackIndex) => <li key={track}><span>0{trackIndex + 1}</span>{track}</li>)}</ol><div className="release-actions"><button onClick={() => { selectProject(release.project); setPlaying(true); }}><Play size={13} fill="currentColor" /> Preview</button><a href={`https://www.google.com/search?q=${encodeURIComponent(`${release.artist} ${release.title}`)}`} target="_blank" rel="noreferrer">Buy / stream <ArrowUpRight size={13} /></a></div></div></article>)}</div></section>
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

      <section className="label-modules" aria-label="Label information"><div className="roster-module panel-shell"><div className="module-heading"><div><span className="section-kicker">THE HOUSE</span><h2>Artists & roster</h2></div><Music2 size={20} /></div>{roster.map((artist, index) => <button className="roster-row" key={artist.name} onClick={() => setToast(`${artist.name} profile selected`)}><span className="roster-number">0{index + 1}</span><span><strong>{artist.name}</strong><small>{artist.role} · {artist.note}</small></span><ArrowUpRight size={15} /></button>)}</div><div className="news-module panel-shell"><div className="module-heading"><div><span className="section-kicker">NOTES FROM THE ROOM</span><h2>News</h2></div><Radio size={20} /></div>{labelNews.map((item) => <button className="news-row" key={item.title} onClick={() => setToast(`${item.title} selected`)}><span>{item.date}</span><strong>{item.title}</strong><small>{item.copy}</small></button>)}</div><form className="demo-module panel-shell" onSubmit={submitDemo}><div className="module-heading"><div><span className="section-kicker">DEMO DROP</span><h2>Send the next record.</h2></div><Mail size={20} /></div><p>We listen for considered records with movement, space, and a strong point of view. Private links only, please.</p><label htmlFor="demo-email">Your email</label><input id="demo-email" type="email" placeholder="you@label.com" value={demoEmail} onChange={(event) => setDemoEmail(event.target.value)} /><label htmlFor="demo-link">Private listening link</label><input id="demo-link" type="url" placeholder="https://soundcloud.com/..." value={demoLink} onChange={(event) => setDemoLink(event.target.value)} /><button className="demo-submit" type="submit">Submit demo <ArrowUpRight size={15} /></button><small className="form-note">No attachments · One link per submission · We reply within 30 days</small></form></section>

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
