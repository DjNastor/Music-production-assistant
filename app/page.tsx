"use client";

import {
  Activity,
  AudioLines,
  BookOpenText,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Clock3,
  Command,
  Download,
  FileAudio,
  FolderKanban,
  Gauge,
  Headphones,
  Home,
  Keyboard,
  Library,
  ListMusic,
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
  SquareArrowOutUpRight,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type IconType = typeof Home;
type Message = { id: number; role: "assistant" | "user"; text: string };

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

const projects = [
  { title: "Midnight in Joburg", genre: "Afro House", meta: "122 BPM · F♯m", progress: 74, art: "art-joburg", state: "Mix ready" },
  { title: "Orange Skyline", genre: "Amapiano", meta: "113 BPM · Gm", progress: 48, art: "art-orange", state: "Writing" },
  { title: "Tembisa Afterdark", genre: "3-Step", meta: "118 BPM · Bm", progress: 31, art: "art-violet", state: "Arrangement" },
];

const quickActions = [
  { title: "Analyze reference", copy: "Map energy, groove and tonal balance", icon: Radio, accent: "cyan" },
  { title: "Generate lyrics", copy: "Find a hook that fits the pocket", icon: Mic2, accent: "coral" },
  { title: "Build arrangement", copy: "Shape the next four minutes", icon: ListMusic, accent: "violet" },
  { title: "Start from prompt", copy: "Turn a mood into a first session", icon: Sparkles, accent: "acid" },
];

const sections = [
  { name: "Intro", start: 0, end: 13, color: "var(--cyan)" },
  { name: "Groove", start: 13, end: 37, color: "var(--acid)" },
  { name: "Break", start: 37, end: 53, color: "var(--violet)" },
  { name: "Drop", start: 53, end: 86, color: "var(--amber)" },
  { name: "Outro", start: 86, end: 100, color: "var(--coral)" },
];

const waveform = Array.from({ length: 88 }, (_, i) => {
  const curve = 23 + Math.sin(i * 0.42) * 13 + Math.sin(i * 0.13) * 16;
  const lift = i > 42 && i < 76 ? 22 : i < 12 ? -5 : 7;
  return Math.max(12, Math.min(88, Math.round(curve + lift + ((i * 7) % 15))));
});

const navContext: Record<string, { eyebrow: string; title: string; copy: string }> = {
  Home: { eyebrow: "Studio briefing", title: "Good evening, Nastor.", copy: "Midnight in Joburg is carrying momentum. The low end is clean, the drop has space, and your next move is arrangement." },
  Studio: { eyebrow: "Active session", title: "The room is listening.", copy: "Work the arrangement, tighten the transition and protect the groove before you enter the mix." },
  Projects: { eyebrow: "Project archive", title: "Three ideas in motion.", copy: "Pick up your strongest sessions, compare momentum and decide what deserves the room tonight." },
  Library: { eyebrow: "Sound library", title: "Your palette, organized.", copy: "Browse saved references, samples and production notes without leaving the creative flow." },
  "AI Assistant": { eyebrow: "Copilot workspace", title: "Ask the session anything.", copy: "Nastor Copilot is tuned to your active project, production stage and musical language." },
  Lyrics: { eyebrow: "Writing room", title: "Find the line that lands.", copy: "Build concise vocal ideas around the groove, the emotional brief and the space in your arrangement." },
  Prompts: { eyebrow: "Idea engine", title: "Direct the first spark.", copy: "Translate mood, texture and movement into a production-ready creative brief." },
  Reference: { eyebrow: "Reference lab", title: "Listen with intention.", copy: "Compare energy, structure and tonal balance against the records guiding this session." },
  Mastering: { eyebrow: "Final polish", title: "Prepare the record to travel.", copy: "Review loudness, dynamics and translation before the final export leaves the studio." },
};

const assistantReplies = [
  "I’d keep the log drum sparse for eight more bars, then answer the vocal chop with a lower, rounder hit. That preserves tension without making the drop feel empty.",
  "The groove is strongest when the shaker sits slightly behind the kick. Try pulling its velocity down 8% in the break, then restore it two bars before the drop.",
  "For a wider chorus without losing mono weight, leave the bass centered and spread only the upper percussion and vocal texture above 250 Hz.",
];

function NastorMark() {
  return (
    <span className="nastor-mark" aria-hidden="true">
      {[8, 16, 25, 13, 30, 20, 10].map((height, index) => (
        <span key={index} style={{ height }} />
      ))}
    </span>
  );
}

function Sidebar({ active, onChange, mobile = false, onClose }: { active: string; onChange: (label: string) => void; mobile?: boolean; onClose?: () => void }) {
  const renderItem = ({ label, icon: Icon }: { label: string; icon: IconType }) => (
    <button
      className={`nav-item ${active === label ? "active" : ""}`}
      onClick={() => { onChange(label); onClose?.(); }}
      aria-current={active === label ? "page" : undefined}
      key={label}
    >
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
      {label === "AI Assistant" && <span className="nav-signal" />}
    </button>
  );

  return (
    <aside className={`sidebar ${mobile ? "sidebar-mobile" : ""}`} aria-label="Studio navigation">
      <div className="brand-row">
        <NastorMark />
        <span className="brand-word">NASTOR</span>
        {mobile && <button className="icon-button close-drawer" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>}
      </div>
      <nav className="nav-block" aria-label="Primary">{primaryNav.map(renderItem)}</nav>
      <div className="nav-divider" />
      <p className="nav-label">Create</p>
      <nav className="nav-block" aria-label="Creation tools">{creationNav.map(renderItem)}</nav>
      <div className="sidebar-spacer" />
      <div className="shortcut-note"><Keyboard size={15} /><span>Shortcuts</span><kbd>?</kbd></div>
      <button className="profile-button" aria-label="Open profile settings">
        <span className="avatar">NM</span>
        <span className="profile-copy"><strong>Nastor M.</strong><small>Studio plan</small></span>
        <Settings2 size={16} />
      </button>
    </aside>
  );
}

function Arrangement({ playing, progress, onPlay, selected, onSelect }: { playing: boolean; progress: number; onPlay: () => void; selected: string; onSelect: (name: string) => void }) {
  return (
    <section className="arrangement panel-shell" aria-labelledby="arrangement-title">
      <div className="section-heading arrangement-heading">
        <div>
          <div className="eyebrow-row"><AudioLines size={13} /><span>Arrangement energy</span></div>
          <h2 id="arrangement-title">Midnight in Joburg</h2>
        </div>
        <div className="track-metrics" aria-label="Track details">
          <span><b>122</b> BPM</span><span><b>F♯m</b> KEY</span><span><b>04:12</b> LENGTH</span>
        </div>
      </div>
      <div className="transport-row">
        <button className="play-button" onClick={onPlay} aria-label={playing ? "Pause preview" : "Play preview"}>
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <span className="timecode">{String(Math.floor((progress * 252 / 100) / 60)).padStart(2, "0")}:{String(Math.floor((progress * 252 / 100) % 60)).padStart(2, "0")}.0</span>
        <div className="timeline-ruler" aria-hidden="true"><span>0:00</span><span>1:00</span><span>2:00</span><span>3:00</span><span>4:12</span></div>
        <button className="icon-button subtle" aria-label="More track options"><MoreHorizontal size={18} /></button>
      </div>
      <div className="waveform-shell">
        <div className="section-strips">
          {sections.map((section) => (
            <button
              key={section.name}
              onClick={() => onSelect(section.name)}
              className={selected === section.name ? "selected" : ""}
              style={{ width: `${section.end - section.start}%`, "--section-color": section.color } as React.CSSProperties}
            >
              <span>{section.name}</span>
            </button>
          ))}
        </div>
        <div className="waveform" aria-label={`Song energy waveform. ${selected} selected.`}>
          {waveform.map((height, index) => (
            <span key={index} style={{ "--bar-height": `${height}%`, "--bar-index": index } as React.CSSProperties} />
          ))}
          <div className="energy-contour" aria-hidden="true" />
          <div className="playhead" style={{ left: `${progress}%` }}><span /></div>
        </div>
      </div>
      <div className="arrangement-footer">
        <span className="live-label"><i /> ENERGY MAP</span>
        <p><strong>{selected}</strong> · {selected === "Drop" ? "Peak energy with 1.8 dB of headroom" : "Section focus ready for production notes"}</p>
        <button onClick={() => onSelect(selected === "Drop" ? "Break" : "Drop")}>Jump to {selected === "Drop" ? "break" : "drop"}<ChevronRight size={14} /></button>
      </div>
    </section>
  );
}

function PulsePanel() {
  return (
    <section className="pulse panel-shell" aria-labelledby="pulse-title">
      <div className="section-heading compact">
        <div><span className="section-kicker">Live analysis</span><h2 id="pulse-title">Project pulse</h2></div>
        <span className="analysis-status"><i /> Updated now</span>
      </div>
      <div className="pulse-layout">
        <div className="groove-orbit">
          <div className="orbit-ring"><span><strong>87</strong><small>GROOVE</small></span></div>
          <p>Locked pocket</p>
        </div>
        <dl className="metric-stack">
          <div><dt>Mix headroom</dt><dd>−6.2 <small>dB</small></dd></div>
          <div><dt>Low-end focus</dt><dd>71 <small>Hz</small></dd></div>
          <div><dt>Dynamic range</dt><dd>10.8 <small>LU</small></dd></div>
        </dl>
      </div>
      <div className="insight-note"><Sparkles size={15} /><p><strong>Copilot hears an opportunity.</strong> The break can lose 12% density to make the drop land harder.</p></div>
    </section>
  );
}

function Copilot({ messages, value, setValue, onSubmit, onSuggestion, mobile, onClose }: { messages: Message[]; value: string; setValue: (v: string) => void; onSubmit: (e: FormEvent) => void; onSuggestion: (text: string) => void; mobile?: boolean; onClose?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);
  return (
    <aside className={`copilot ${mobile ? "copilot-mobile" : ""}`} aria-label="Nastor Copilot">
      <header className="copilot-header">
        <div className="copilot-identity"><span className="copilot-orb"><Sparkles size={16} /></span><div><strong>Nastor Copilot</strong><span><i /> Listening to Midnight in Joburg</span></div></div>
        {mobile ? <button className="icon-button" aria-label="Close Copilot" onClick={onClose}><X size={18} /></button> : <button className="icon-button" aria-label="Copilot options"><MoreHorizontal size={18} /></button>}
      </header>
      <div className="copilot-context"><span>AFRO HOUSE</span><span>ARRANGEMENT</span><span>F♯ MINOR</span></div>
      <div className="message-list" ref={scrollRef} aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role === "assistant" && <span className="message-mark"><NastorMark /></span>}
            <div><span className="message-author">{message.role === "assistant" ? "COPILOT" : "YOU"}</span><p>{message.text}</p></div>
          </div>
        ))}
      </div>
      <div className="suggestion-row" aria-label="Suggested prompts">
        {["Strengthen the drop", "Tighten the low end", "Build the break"].map((text) => <button key={text} onClick={() => onSuggestion(text)}>{text}</button>)}
      </div>
      <form className="composer" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={mobile ? "mobile-copilot-input" : "copilot-input"}>Message Nastor Copilot</label>
        <textarea id={mobile ? "mobile-copilot-input" : "copilot-input"} rows={2} placeholder="Ask about this track…" value={value} onChange={(e) => setValue(e.target.value)} />
        <div><button type="button" className="attach-button" aria-label="Attach project context"><Plus size={17} /></button><span>Project context on</span><button type="submit" className="send-button" disabled={!value.trim()} aria-label="Send message"><Send size={16} /></button></div>
      </form>
      <p className="copilot-disclaimer">Local demo · Suggestions are mocked for Phase 1</p>
    </aside>
  );
}

export default function StudioPage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(58);
  const [selectedSection, setSelectedSection] = useState("Drop");
  const [activeProject, setActiveProject] = useState(projects[0].title);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreset, setExportPreset] = useState("WAV · 24-bit");
  const [mobileNav, setMobileNav] = useState(false);
  const [mobileCopilot, setMobileCopilot] = useState(false);
  const [toast, setToast] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", text: "The groove is sitting beautifully. I’d open eight bars of breathing room before the drop, then let the log drum answer the vocal chop instead of doubling it." },
    { id: 2, role: "assistant", text: "Your mix has 6.2 dB of headroom, so there’s room to make that arrival feel larger without chasing loudness yet." },
  ]);

  const context = navContext[activeNav] ?? navContext.Home;
  const commandItems = useMemo(() => [...primaryNav, ...creationNav].filter(({ label }) => label.toLowerCase().includes(commandQuery.toLowerCase())), [commandQuery]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setProgress((value) => value >= 100 ? 0 : value + 0.15), 120);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); }
      if (event.key === "Escape") { setCommandOpen(false); setExportOpen(false); setMobileNav(false); setMobileCopilot(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const runQuickAction = (title: string) => {
    const prompts: Record<string, string> = {
      "Analyze reference": "Compare Midnight in Joburg against my Afro House reference",
      "Generate lyrics": "Write a restrained late-night vocal hook",
      "Build arrangement": "Build out the break and final drop",
      "Start from prompt": "Start a new nocturnal Johannesburg session",
    };
    setInput(prompts[title]);
    if (window.matchMedia("(max-width: 1120px)").matches) setMobileCopilot(true);
    setToast(`${title} loaded into Copilot`);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    // Future boundary: POST project context + message to the AI provider here.
    setMessages((current) => [...current, { id: Date.now(), role: "user", text }, { id: Date.now() + 1, role: "assistant", text: assistantReplies[current.length % assistantReplies.length] }]);
    setInput("");
  };

  const chooseCommand = (label: string) => {
    setActiveNav(label);
    setCommandOpen(false);
    setCommandQuery("");
    setToast(`${label} workspace opened`);
  };

  return (
    <main className="app-shell">
      <Sidebar active={activeNav} onChange={setActiveNav} />
      <section className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
            <div className="breadcrumbs"><span>Projects</span><ChevronRight size={13} /><strong>{activeProject}</strong><span className="autosave"><i /> Saved</span></div>
          </div>
          <div className="topbar-actions">
            <button className="command-trigger" onClick={() => setCommandOpen(true)}><Search size={15} /><span>Search or run a command</span><kbd>Ctrl K</kbd></button>
            <button className="icon-button share-button" aria-label="Share project" onClick={() => setToast("Share link copied locally")}><Share2 size={17} /></button>
            <button className="invite-button" onClick={() => setToast("Invite flow is ready for provider connection")}><Plus size={15} /> Invite</button>
            <button className="export-button" onClick={() => setExportOpen(true)}><Download size={15} /> Export<ChevronDown size={14} /></button>
          </div>
        </header>

        <div className="canvas-scroll">
          <div className="canvas-inner">
            <section className="briefing">
              <div><span className="section-kicker">{context.eyebrow}</span><h1>{context.title}</h1><p>{context.copy}</p></div>
              <div className="session-meta"><div><span>SESSION</span><strong>DAY 06</strong></div><div><span>FOCUS</span><strong>{activeNav === "Home" ? "ARRANGEMENT" : activeNav.toUpperCase()}</strong></div></div>
            </section>

            <div className="creative-grid">
              <Arrangement playing={playing} progress={progress} onPlay={() => setPlaying((value) => !value)} selected={selectedSection} onSelect={(name) => { setSelectedSection(name); const target = sections.find((item) => item.name === name); if (target) setProgress((target.start + target.end) / 2); }} />
              <PulsePanel />
            </div>

            <section className="section-block" aria-labelledby="projects-title">
              <div className="section-heading"><div><span className="section-kicker">Continue working</span><h2 id="projects-title">Recent projects</h2></div><button className="text-button" onClick={() => setActiveNav("Projects")}>View all <ChevronRight size={14} /></button></div>
              <div className="project-list">
                {projects.map((project, index) => (
                  <button key={project.title} className={`project-card ${activeProject === project.title ? "selected" : ""}`} onClick={() => { setActiveProject(project.title); setToast(`${project.title} selected`); }}>
                    <span className={`project-art ${project.art}`}><span className="art-index">0{index + 1}</span><AudioLines size={23} /></span>
                    <span className="project-info"><span className="project-state"><i /> {project.state}</span><strong>{project.title}</strong><small>{project.genre} · {project.meta}</small><span className="progress-track"><i style={{ width: `${project.progress}%` }} /></span></span>
                    <span className="project-percent">{project.progress}%</span>
                    <SquareArrowOutUpRight size={16} className="project-open" />
                  </button>
                ))}
              </div>
            </section>

            <section className="section-block" aria-labelledby="quick-title">
              <div className="section-heading"><div><span className="section-kicker">New direction</span><h2 id="quick-title">Quick start</h2></div></div>
              <div className="quick-grid">
                {quickActions.map(({ title, copy, icon: Icon, accent }, index) => (
                  <button key={title} className={`quick-card ${accent}`} onClick={() => runQuickAction(title)}>
                    <span className="quick-number">0{index + 1}</span><span className="quick-icon"><Icon size={19} /></span><strong>{title}</strong><small>{copy}</small><ChevronRight size={16} className="quick-arrow" />
                  </button>
                ))}
              </div>
            </section>

            <section className="queue panel-shell" aria-labelledby="queue-title">
              <div className="section-heading compact"><div><span className="section-kicker">Background tasks</span><h2 id="queue-title">Work queue</h2></div><button className="icon-button" aria-label="Queue options"><MoreHorizontal size={18} /></button></div>
              <div className="queue-row"><span className="queue-icon processing"><Activity size={16} /></span><span><strong>Reference analysis</strong><small>Black Coffee — tonal and structure map</small></span><span className="queue-time">01:18</span><span className="status-tag processing">Processing</span></div>
              <div className="queue-row"><span className="queue-icon complete"><Check size={16} /></span><span><strong>Vocal stems</strong><small>Midnight in Joburg · 3 files</small></span><span className="queue-time">18:42</span><span className="status-tag complete">Ready</span></div>
              <div className="queue-row"><span className="queue-icon waiting"><Clock3 size={16} /></span><span><strong>Club master preview</strong><small>−8 LUFS target · WAV 24-bit</small></span><span className="queue-time">Queued</span><span className="status-tag waiting">Waiting</span></div>
            </section>
          </div>
        </div>
      </section>

      <Copilot messages={messages} value={input} setValue={setInput} onSubmit={sendMessage} onSuggestion={setInput} />
      <button className="mobile-copilot-trigger" aria-label="Open Nastor Copilot" onClick={() => setMobileCopilot(true)}><Sparkles size={18} /><span>Copilot</span><i /></button>

      {mobileNav && <div className="overlay mobile-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setMobileNav(false); }}><Sidebar active={activeNav} onChange={setActiveNav} mobile onClose={() => setMobileNav(false)} /></div>}
      {mobileCopilot && <div className="overlay mobile-overlay copilot-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setMobileCopilot(false); }}><Copilot messages={messages} value={input} setValue={setInput} onSubmit={sendMessage} onSuggestion={setInput} mobile onClose={() => setMobileCopilot(false)} /></div>}

      {commandOpen && (
        <div className="overlay dialog-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setCommandOpen(false); }}>
          <section className="command-dialog" role="dialog" aria-modal="true" aria-labelledby="command-title">
            <h2 id="command-title" className="sr-only">Command palette</h2>
            <div className="command-input"><Search size={18} /><label className="sr-only" htmlFor="command-search">Search commands</label><input id="command-search" autoFocus placeholder="Jump to a tool or run a command…" value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} /><kbd>ESC</kbd></div>
            <div className="command-results"><span className="command-group-label">Studio</span>{commandItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => chooseCommand(label)}><Icon size={17} /><span>{label}</span><small>Open workspace</small><ChevronRight size={14} /></button>)}{!commandItems.length && <p className="empty-command">No matching studio command.</p>}</div>
            <footer><span><Command size={13} />K to open</span><span>↑↓ to navigate</span><span>Enter to select</span></footer>
          </section>
        </div>
      )}

      {exportOpen && (
        <div className="overlay dialog-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setExportOpen(false); }}>
          <section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
            <header><div><span className="section-kicker">Delivery</span><h2 id="export-title">Export project</h2></div><button className="icon-button" aria-label="Close export dialog" onClick={() => setExportOpen(false)}><X size={18} /></button></header>
            <p>Choose a local mock preset for <strong>{activeProject}</strong>.</p>
            <div className="preset-list" role="radiogroup" aria-label="Export preset">
              {[{ name: "WAV · 24-bit", sub: "Full resolution mix", icon: FileAudio }, { name: "MP3 · 320 kbps", sub: "Quick private preview", icon: Music2 }, { name: "Stems · WAV", sub: "8 grouped production stems", icon: AudioLines }].map(({ name, sub, icon: Icon }) => <button key={name} role="radio" aria-checked={exportPreset === name} className={exportPreset === name ? "selected" : ""} onClick={() => setExportPreset(name)}><Icon size={18} /><span><strong>{name}</strong><small>{sub}</small></span><i>{exportPreset === name && <Check size={13} />}</i></button>)}
            </div>
            <div className="export-details"><span><Gauge size={14} /> −8 LUFS target</span><span>44.1 kHz</span><span>Estimated 148 MB</span></div>
            <footer><button className="cancel-button" onClick={() => setExportOpen(false)}>Cancel</button><button className="primary-action" onClick={() => { setExportOpen(false); setToast(`${exportPreset} added to the mock export queue`); }}>Add to queue <ChevronRight size={15} /></button></footer>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><Zap size={15} /><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </main>
  );
}
