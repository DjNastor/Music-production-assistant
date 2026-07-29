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

type PatternSlot = 0 | 1;
const normalizePatternStep = (value: number) => value > 0 ? Math.max(.35, Math.min(1, Number(value))) : 0;
const clonePatternSteps = (value: number[][]) => value.map((row) => row.map(normalizePatternStep));
const createPatternVariation = (source: number[][]) => source.map((row, channel) => row.map((value, step) => {
  if (channel === 0) return [0,4,8,12].includes(step) ? Math.max(value, .92) : 0;
  if (channel === 1 && [3,7,10,15].includes(step)) return value ? 0 : .72;
  if (channel === 2 && [6,11,14].includes(step)) return value ? Math.max(.55, value - .18) : .78;
  if (channel === 3 && [5,9,13,15].includes(step)) return value ? 0 : .48;
  return value;
}));

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
  { title: "Finish MP3 idea", copy: "Upload rough bounce → full production plan", icon: FileAudio },
  { title: "Remix a song", copy: "Upload full track → respectful remix plan", icon: Radio },
  { title: "Open FLP session", copy: "Upload FLP zip → session audit", icon: FolderKanban },
  { title: "Build version pack", copy: "Export full, DJ, radio and stemz", icon: AudioLines },
];

const productionIntelligence = [
  { title: "Idea to finished record", status: "MP3 / WAV intake", copy: "Analyze a phone note, loop, beat bounce, or demo; detect tempo/key/section intent; suggest missing drums, bass, chords, vocals, transitions, and mix fixes." },
  { title: "Remix assistant", status: "Respect original", copy: "Map the source song, keep the strongest hook, rebuild rhythm and arrangement in Nastor's lane, then propose club, radio, dub, instrumental, and alternate energy versions." },
  { title: "FLP / DAW project brain", status: "FL Studio first", copy: "Accept FLP or zipped sessions, inventory tracks/plugins/samples, flag missing files, read arrangement markers, and return a producer task list before touching the mix." },
  { title: "Version generator", status: "Release pack", copy: "Plan full mix, extended DJ mix, radio edit, dub, instrumental, acapella, clean, short social cut, loop pack, and stemz with loudness/export targets." },
  { title: "Stemz intelligence", status: "Grouped delivery", copy: "Separate or organize drums, bass, music, vocals, FX, and master references; name files cleanly for remixers, labels, DJs, and engineers." },
  { title: "Next-level producer", status: "Creative decisions", copy: "Tell Nastor what to add, remove, automate, humanize, arrange, re-record, sidechain, widen, mute, or export next — not just describe the song." },
];

const deliveryVersions = [
  { name: "Full version", target: "Streaming / label master", length: "4:30–6:30", note: "Complete intro, theme, break, peak and outro." },
  { name: "DJ extended", target: "Club mixing", length: "5:30–8:00", note: "Longer intro/outro, cleaner phrase starts, beat-friendly transitions." },
  { name: "Radio edit", target: "Radio / playlist", length: "2:45–3:30", note: "Fast hook entry, shorter break, strong ending." },
  { name: "Dub / instrumental", target: "DJs / sync", length: "Track dependent", note: "Less vocal, more groove, usable for sets and licensing." },
  { name: "Stemz", target: "Remix / mix engineer", length: "Matched to master", note: "Drums, bass, music, vocal, FX and reference master." },
];


const userFlowInputs = [
  { type: "MP3 idea", accepts: "MP3 / WAV / voice note", output: "Finished production plan", prompt: "Upload a rough bounce and ask: finish this into a full Nastor record." },
  { type: "Full song", accepts: "Master / demo / reference", output: "Remix map + stemz", prompt: "Upload a full track and ask: create respectful remix versions." },
  { type: "FLP project", accepts: ".flp / zipped project / samples", output: "Session audit", prompt: "Upload the FLP zip and ask: find missing parts and next production moves." },
  { type: "Stems", accepts: "Drums / bass / music / vocal / FX", output: "Mix and version pack", prompt: "Upload stems and ask: build full, DJ, radio and dub versions." },
];

const userFlowSteps = [
  { step: "01", title: "Drop the source", detail: "Choose MP3 idea, full song, FLP zip, stems or remix reference. The assistant creates a project session and keeps the original safe." },
  { step: "02", title: "Analyze the music", detail: "Detect tempo, key, sections, energy, groove, loudness, hook moments, missing files, plugin risks and stem groups." },
  { step: "03", title: "Choose the mission", detail: "Finish idea, remix song, continue production, audit FLP, clean mix, separate stemz, or build a release pack." },
  { step: "04", title: "Get producer decisions", detail: "Receive exact next moves: add bass, remove percussion, extend intro, shorten break, automate FX, rework hook, fix low-end or export stems." },
  { step: "05", title: "Generate versions", detail: "Create full version, DJ extended, radio edit, dub, instrumental, acapella/clean if available, social cut and grouped stemz." },
  { step: "06", title: "Deliver release pack", detail: "Download masters, previews, stemz, remix notes, FLP handoff notes, metadata and a version manifest for labels/DJs." },
];

const userFlowOutputs = ["Production brief", "Arrangement map", "Remix plan", "FLP audit", "Mix notes", "Stemz zip", "DJ extended", "Radio edit", "Master checklist"];


const backendModules = [
  { name: "Upload + asset vault", role: "Accept MP3/WAV/ZIP/FLP/stems, store originals, create previews, track ownership and project versions.", stack: "S3/R2 storage · signed URLs · Postgres" },
  { name: "Audio analysis worker", role: "Detect BPM, key, sections, loudness, phase, transients, groove density, hooks and mix risks.", stack: "Python DSP · librosa/Essentia · queue jobs" },
  { name: "Stem separation", role: "Split full songs into vocal, drums, bass, music and FX groups for remixing and stemz packs.", stack: "Demucs/MDX style service · GPU worker" },
  { name: "FLP project reader", role: "Inventory FL Studio projects, zipped samples, plugins, mixer routing, playlist structure and missing files.", stack: "FLP parser · ZIP scanner · plugin manifest" },
  { name: "Production brain API", role: "Turn analysis into decisions: what to add, remove, arrange, humanize, mix, master and export next.", stack: "LLM orchestration · Nastor DNA profile · prompt tools" },
  { name: "Render + export farm", role: "Generate full, DJ, radio, dub, instrumental, preview MP3 and grouped stemz delivery packages.", stack: "DAW/render workers · FFmpeg · loudness targets" },
];

const backendFlow = [
  "Upload song idea, full song, FLP zip, stems or remix source.",
  "Create immutable asset record and low-resolution preview.",
  "Run audio/FLP analysis workers and store structured metadata.",
  "Build a Nastor production brief with risks, missing parts and next moves.",
  "Create editable tasks: finish, remix, arrange, mix, master or version pack.",
  "Render/export deliverables and save every version with stemz and notes.",
];

const backendMilestones = [
  { phase: "MVP 1", scope: "Upload MP3/WAV, analyze BPM/key/sections/loudness, produce a production plan and version checklist." },
  { phase: "MVP 2", scope: "Add stem separation, remix planning, grouped stemz export naming and DJ/radio edit instructions." },
  { phase: "MVP 3", scope: "Add FLP zip intake, session audit, missing sample report, plugin list and handoff notes." },
  { phase: "MVP 4", scope: "Connect render workers for real audio exports, previews, masters and version packs." },
];

const backendRoadmap = [
  { phase: "01", title: "Ingest", stack: "Upload API · Object storage · Job queue", copy: "Accept MP3, WAV, ZIP, FLP, MIDI and stem folders. Store originals safely, create a session id, then queue analysis jobs instead of blocking the browser." },
  { phase: "02", title: "Audio analysis", stack: "BPM/key · sections · loudness · groove", copy: "Extract tempo, key, downbeats, sections, energy curve, headroom, LUFS, stereo correlation, transients, and likely hook moments from full songs or ideas." },
  { phase: "03", title: "DAW project audit", stack: "FLP parser · ZIP scanner · plugin/sample manifest", copy: "For FL Studio projects, read or request exported project bones, MIDI, stems, plugin list, sample paths and routing notes; flag missing assets and risky plugins." },
  { phase: "04", title: "Production brain", stack: "LLM planner · Nastor DNA · arrangement rules", copy: "Turn analysis into producer decisions: what to add, remove, replay, automate, mix, extend, shorten, mute, stem, or export next." },
  { phase: "05", title: "Generation engines", stack: "Stem separation · remix generation · render workers", copy: "Connect audio engines for stem separation, beat reconstruction, idea continuation, alternate versions, previews and final render jobs." },
  { phase: "06", title: "Delivery", stack: "Version builder · Mastering · Export manifests", copy: "Render full, DJ extended, radio edit, dub, instrumental, clean, social cut and stemz with naming, metadata, loudness targets and downloadable zip packs." },
];

const backendGuards = [
  "Only remix or transform songs Nastor owns, licenses, or has permission to use.",
  "Never overwrite an uploaded FLP; create suggested changes, bounced previews, or a new project package.",
  "Keep original audio, generated versions, stems, logs and prompts tied to a project id.",
  "Separate creative planning from final rendering so every expensive job can be reviewed first.",
];

const implementationTickets = [
  { lane: "API", title: "Create upload sessions", detail: "POST /api/projects + POST /api/assets/sign-upload for MP3, WAV, FLP, ZIP, MIDI and stems." },
  { lane: "API", title: "Start production jobs", detail: "POST /api/jobs/analyze, /api/jobs/stems, /api/jobs/remix-plan, /api/jobs/export-pack." },
  { lane: "DB", title: "Project schema", detail: "projects, assets, analyses, jobs, versions, stems, rights_checks, flp_audits and export_manifests." },
  { lane: "QUEUE", title: "Async worker events", detail: "asset.uploaded → analyze.audio → plan.production → separate.stems → render.versions → notify.ready." },
  { lane: "WORKER", title: "Audio analysis worker", detail: "Extract BPM, key, downbeats, sections, LUFS, stereo, transients, hook candidates and groove density." },
  { lane: "WORKER", title: "FLP audit worker", detail: "Read zipped project contents, sample paths, plugin names, project bones, MIDI exports and missing assets." },
  { lane: "AI", title: "Nastor planner tools", detail: "Ground LLM prompts in analysis JSON, Nastor DNA, user mission, rights status and requested output pack." },
  { lane: "EXPORT", title: "Release pack builder", detail: "Create full, DJ extended, radio edit, dub, instrumental, previews, stemz zip and manifest.json." },
];

const storageLayout = [
  "projects/{projectId}/source/original.ext",
  "projects/{projectId}/preview/waveform.json",
  "projects/{projectId}/analysis/audio.json",
  "projects/{projectId}/flp/audit.json",
  "projects/{projectId}/stems/{group}.wav",
  "projects/{projectId}/exports/{versionName}/master.wav",
  "projects/{projectId}/exports/{versionName}/preview.mp3",
  "projects/{projectId}/exports/manifest.json",
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
  Home: { eyebrow: "Production assistant", title: "Take every Nastor idea to the next level.", copy: "Start from a beat, MP3 idea, full song or FLP session, then guide remixing, finishing, arrangement, mixing, stemz and release-ready versions." },
  Studio: { eyebrow: "Active session · Tahoe Studios", title: "Listen like an engineer.", copy: "Shape the energy curve first. Mix decisions become easier when every section has a clear job." },
  Projects: { eyebrow: "Catalog desk", title: "One artist. Several rooms.", copy: "Move between DJ Nastor, Tahoe Studios, Phushi Plan Music, and Lukulu Recordings without losing the session thread." },
  Library: { eyebrow: "Source library", title: "Keep the palette intentional.", copy: "References, stems, notes, and production context stay close to the active record." },
  "AI Assistant": { eyebrow: "Copilot channel", title: "Ask the session what to do next.", copy: "The assistant should understand MP3 ideas, full songs, remix briefs, FLP projects, stems, versions and delivery targets." },
  Lyrics: { eyebrow: "Writing channel", title: "Leave room for the line.", copy: "Build concise vocal ideas around the groove instead of filling every open bar." },
  Prompts: { eyebrow: "Direction deck", title: "Describe movement, not genre tags.", copy: "Turn tension, texture, and club intention into production-ready prompts." },
  Reference: { eyebrow: "Reference monitor", title: "Compare with purpose.", copy: "Focus on structure, low-end behavior, and perceived energy—not imitation." },
  Mastering: { eyebrow: "Delivery chain", title: "Prepare the record to travel.", copy: "Review dynamics, translation, and export intent before the mix leaves the room." },
};

const assistantReplies = [
  "Nastor DNA read: keep the four kick anchors steady, then make the shaker and log-drum answer each other. If this came from an MP3 idea, map sections, choose the strongest 8 bars, then build intro, break, peak and outro around that pocket.",
  "For a remix, protect the hook first. Then rebuild drums, bass and arrangement in Nastor's lane: 120 BPM Afro/organic pulse, controlled ghost notes, strong negative space, and a DJ-friendly extended intro/outro.",
  "For an FLP/project upload, the assistant should inventory channels, plugins, samples, routing and arrangement markers; then return missing files, mix risks, stem groups, and the next five production decisions.",
  "Version pack plan: full master, DJ extended, radio edit, dub/instrumental, acapella if vocals exist, clean edit if needed, short social cut, and grouped stemz for drums, bass, music, vocals and FX.",
  "The style-fit move is restraint. Leave the bass phrase short, widen only the air/texture layer, and keep kick, bass, and lead vocal information on the centre rail with roughly -6 dB headroom.",
];

const initialQueue: QueueTask[] = [
  { id: 1, title: "Find A Way reference map", detail: "Structure and tonal balance · local analysis", time: "01:18", status: "processing" },
  { id: 2, title: "Digital Retro stemz", detail: "Drums, bass, music, vocal, FX groups", time: "18:42", status: "complete" },
  { id: 3, title: "MP3 idea finisher", detail: "Arrangement, missing parts and mix decisions", time: "Ready", status: "waiting" },
  { id: 4, title: "Version pack preview", detail: "Full, DJ, radio, dub and instrumental", time: "Queued", status: "waiting" },
];

const nastorStyleProfile = {
  reference: "Uploaded Nastor beat",
  url: "https://cdn.acedata.cloud/uploads/fbbbc31d-1fbd-4c07-b761-73d26ae7f7a1",
  genre: "Afro House",
  tempo: { target: 120, min: 118, max: 122 },
  keyCenter: "minor",
  feel: ["organic", "hypnotic", "open-air", "warm", "restrained", "club-ready"],
  rules: [
    "Keep the four-on-the-floor kick stable before adding decoration.",
    "Use organic shaker, rim, log-drum, and vocal-air answers for movement.",
    "Let ghost notes and velocity movement create pocket without overcrowding.",
    "Make one useful change every 8 or 16 bars instead of forcing a big drop.",
    "Preserve negative space and leave the kick, bass, and lead vocal in the centre.",
  ],
  avoid: ["EDM supersaw drops", "busy fills", "too many chord changes", "basslines that fight the kick"],
};

type GrooveAnalysis = {
  hits: number[];
  density: number;
  syncopation: number;
  space: number;
  score: number;
  advice: string;
  averageVelocity: number;
  ghostNotes: number;
  barBalance: number[];
};

function scoreNastorFit(analysis: GrooveAnalysis, bpm: number, swing: number) {
  const tempoScore = bpm >= nastorStyleProfile.tempo.min && bpm <= nastorStyleProfile.tempo.max ? 20 : Math.max(0, 20 - Math.abs(bpm - nastorStyleProfile.tempo.target) * 2);
  const anchorScore = Math.min(20, analysis.hits[0] * 5);
  const ghostScore = analysis.ghostNotes >= 3 && analysis.ghostNotes <= 8 ? 15 : Math.max(0, 15 - Math.abs(5 - analysis.ghostNotes) * 3);
  const spaceScore = analysis.space >= 58 && analysis.space <= 82 ? 15 : Math.max(0, 15 - Math.abs(70 - analysis.space) * .45);
  const densityScore = analysis.density >= 24 && analysis.density <= 46 ? 12 : Math.max(0, 12 - Math.abs(35 - analysis.density) * .35);
  const swingScore = swing >= 28 && swing <= 46 ? 10 : Math.max(0, 10 - Math.abs(38 - swing) * .35);
  const callResponseScore = analysis.hits[2] >= 2 && analysis.hits[2] <= 4 ? 8 : Math.max(0, 8 - Math.abs(3 - analysis.hits[2]) * 2);
  const score = Math.round(tempoScore + anchorScore + ghostScore + spaceScore + densityScore + swingScore + callResponseScore);
  const notes = [
    bpm < nastorStyleProfile.tempo.min || bpm > nastorStyleProfile.tempo.max ? "Return the tempo toward 120 BPM." : "Tempo sits in Nastor's Afro House lane.",
    analysis.hits[0] < 4 ? "Restore all four kick anchors before adding extra percussion." : "Kick anchor is stable enough for club movement.",
    analysis.space < 58 ? "Remove one upper-percussion hit to recover negative space." : "The loop leaves enough air for vocal texture and arrangement moves.",
    analysis.ghostNotes < 3 ? "Add two softer ghost hits for human pocket." : "Ghost notes are supporting the pocket without becoming the hook.",
  ];
  return {
    score,
    label: score >= 88 ? "NASTOR_LOCKED" : score >= 74 ? "CLOSE_TO_NASTOR" : score >= 58 ? "NEEDS_MORE_POCKET" : "OFF_STYLE",
    notes,
  };
}

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
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,.72,0,0,.58,0,.86,0,0,.74,0,0,.62,0,.9],
    [0,0,0,0,0,0,.92,0,0,0,0,.82,0,0,.64,0],
    [0,0,0,0,0,0,0,0,0,.5,0,0,0,0,0,.66],
  ];
  const presets = [
    { name: "Afro House starter", bpm: 120, swing: 38, steps: defaultSteps },
    { name: "Amapiano log answer", bpm: 113, swing: 44, steps: [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,.48,0,.62,0,.7,0,.58,0,.54,0,.78,0,.64,0,.82],[0,0,0,.7,0,0,.96,0,0,.62,0,0,.88,0,.72,0],[0,0,0,0,0,.42,0,0,0,0,0,.52,0,0,0,.44]] },
    { name: "Hip-Hop half-time", bpm: 92, swing: 24, steps: [[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,.72,0,0,.54,0,.68,0,0,.74,0,0,.56,0,.82],[0,0,0,0,.86,0,0,0,0,0,0,0,.78,0,0,0],[0,0,0,.48,0,0,0,0,0,0,0,.58,0,0,.42,0]] },
  ];
  type PatternState = { steps: number[][]; bpm: number; swing: number; muted: boolean[]; solo: number | null; patternSlots?: number[][][]; activeSlot?: PatternSlot };
  const [steps, setSteps] = useState(clonePatternSteps(defaultSteps));
  const [selected, setSelected] = useState(1);
  const [deskPlaying, setDeskPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [browserTab, setBrowserTab] = useState("Sounds");
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(38);
  const [muted, setMuted] = useState([false, false, false, false]);
  const [solo, setSolo] = useState<number | null>(null);
  const [history, setHistory] = useState<PatternState[]>([]);
  const [future, setFuture] = useState<PatternState[]>([]);
  const [activePreset, setActivePreset] = useState("Afro House starter");
  const [patternSlots, setPatternSlots] = useState<number[][][]>([clonePatternSteps(defaultSteps), createPatternVariation(defaultSteps)]);
  const [activeSlot, setActiveSlot] = useState<PatternSlot>(0);
  const arrangement = [0, 0, 1, 0, 1, 1, 0, 1] as PatternSlot[];
  const importRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const snapshot = (): PatternState => ({ steps: clonePatternSteps(steps), bpm, swing, muted: [...muted], solo, patternSlots: patternSlots.map(clonePatternSteps), activeSlot });
  const restore = (state: PatternState) => { setSteps(clonePatternSteps(state.steps)); setBpm(state.bpm); setSwing(state.swing); setMuted([...state.muted]); setSolo(state.solo); if (Array.isArray(state.patternSlots) && state.patternSlots.length === 2) setPatternSlots(state.patternSlots.map(clonePatternSteps)); if (state.activeSlot === 0 || state.activeSlot === 1) setActiveSlot(state.activeSlot); };
  const checkpoint = () => { setHistory((items) => [...items.slice(-24), snapshot()]); setFuture([]); };
  const undo = () => { const previous = history.at(-1); if (!previous) return; setFuture((items) => [snapshot(), ...items].slice(0, 25)); restore(previous); setHistory((items) => items.slice(0, -1)); };
  const redo = () => { const next = future[0]; if (!next) return; setHistory((items) => [...items.slice(-24), snapshot()]); restore(next); setFuture((items) => items.slice(1)); };
  const toggleStep = (channel: number, step: number) => { checkpoint(); setSteps((current) => current.map((row, rowIndex) => rowIndex === channel ? row.map((value, stepIndex) => stepIndex === step ? (value === 0 ? .68 : value < .85 ? 1 : 0) : value) : row)); };
  const toggleMute = (channel: number) => { checkpoint(); setMuted((items) => items.map((value, index) => index === channel ? !value : value)); };
  const toggleSolo = (channel: number) => { checkpoint(); setSolo((value) => value === channel ? null : channel); };
  const updateBpm = (value: number) => setBpm(Math.max(70, Math.min(150, value)));
  const applyPreset = (name: string) => { const preset = presets.find((item) => item.name === name); if (!preset) return; checkpoint(); const presetSteps = clonePatternSteps(preset.steps); setActivePreset(preset.name); setActiveSlot(0); setPatternSlots([clonePatternSteps(presetSteps), createPatternVariation(presetSteps)]); setSteps(presetSteps); setBpm(preset.bpm); setSwing(preset.swing); setMuted([false,false,false,false]); setSolo(null); };
  const clearChannel = () => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map(() => 0) : row)); };
  const duplicateChannel = () => { checkpoint(); setSteps((current) => current.map((row, index) => index === (selected + 1) % current.length ? [...current[selected]] : row)); setSelected((selected + 1) % 4); };
  const humanizeChannel = () => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map((value, step) => value ? Math.max(.42, Math.min(1, value + (((step * 37) % 9) - 4) / 50)) : 0) : row)); };
  const switchSlot = (slot: PatternSlot) => { if (slot === activeSlot) return; checkpoint(); const savedSlots = patternSlots.map(clonePatternSteps); savedSlots[activeSlot] = clonePatternSteps(steps); setPatternSlots(savedSlots); setSteps(clonePatternSteps(savedSlots[slot])); setActiveSlot(slot); };
  const captureSlot = () => { checkpoint(); setPatternSlots((slots) => slots.map((slotSteps, index) => index === activeSlot ? clonePatternSteps(steps) : clonePatternSteps(slotSteps))); };
  const generateVariation = () => { checkpoint(); const variation = createPatternVariation(steps); const savedSlots = patternSlots.map(clonePatternSteps); savedSlots[activeSlot] = clonePatternSteps(steps); savedSlots[1] = variation; setPatternSlots(savedSlots); setSteps(variation); setActiveSlot(1); setActivePreset("Generated B variation"); };
  const shiftSelected = (direction: -1 | 1) => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map((_, step) => row[(step - direction + 16) % 16]) : row)); };
  const fillOffbeats = () => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map((value, step) => value || ([2,6,10,14].includes(step) ? .56 : 0)) : row)); };
  const thinSelected = () => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map((value, step) => step % 4 === 0 ? value : (step % 2 === 0 ? 0 : value)) : row)); };
  const setChannelVelocity = (velocity: number) => { checkpoint(); setSteps((current) => current.map((row, index) => index === selected ? row.map((value) => value ? velocity : 0) : row)); };

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("nastor-pattern-v4") ?? window.localStorage.getItem("nastor-pattern-v3") ?? window.localStorage.getItem("nastor-pattern-v2");
        if (!saved) return;
        const data = JSON.parse(saved) as Partial<PatternState>;
        if (Array.isArray(data.steps) && data.steps.length === 4 && data.steps.every((row) => Array.isArray(row) && row.length === 16)) setSteps(clonePatternSteps(data.steps));
        if (typeof data.bpm === "number") updateBpm(data.bpm);
        if (typeof data.swing === "number") setSwing(Math.max(0, Math.min(70, data.swing)));
        if (Array.isArray(data.muted) && data.muted.length === 4) setMuted(data.muted.map(Boolean));
        if (Array.isArray(data.patternSlots) && data.patternSlots.length === 2) setPatternSlots(data.patternSlots.map(clonePatternSteps));
        if (data.activeSlot === 0 || data.activeSlot === 1) setActiveSlot(data.activeSlot);
        if (data.solo === null || (typeof data.solo === "number" && data.solo >= 0 && data.solo < 4)) setSolo(data.solo);
      } catch { window.localStorage.removeItem("nastor-pattern-v4"); }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("nastor-pattern-v4", JSON.stringify({ steps, bpm, swing, muted, solo, patternSlots, activeSlot }));
  }, [steps, bpm, swing, muted, solo, patternSlots, activeSlot]);

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
      const level = Math.max(.35, velocity);
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

  const analysis = useMemo<GrooveAnalysis>(() => {
    const hits = steps.map((row) => row.filter(Boolean).length);
    const total = hits.reduce((sum, value) => sum + value, 0);
    const averageVelocity = total ? Math.round(steps.flat().reduce((sum, value) => sum + value, 0) / total * 100) : 0;
    const offbeats = steps.flatMap((row) => row.filter((value, index) => value && index % 4 !== 0)).length;
    const anchorHits = [0,4,8,12].filter((index) => steps[0][index]).length;
    const collisions = Array.from({ length: 16 }, (_, index) => steps.filter((row) => row[index]).length).filter((value) => value >= 3).length;
    const ghostNotes = steps.flat().filter((value) => value > 0 && value < .7).length;
    const barBalance = [0,1,2,3].map((bar) => steps.flatMap((row) => row.slice(bar * 4, bar * 4 + 4)).filter(Boolean).length);
    const density = Math.round(total / 64 * 100);
    const syncopation = total ? Math.round(offbeats / total * 100) : 0;
    const space = Math.max(0, 100 - density - collisions * 5);
    const score = Math.max(0, Math.min(100, Math.round(anchorHits * 12 + Math.min(syncopation, 35) + space * .24 + Math.min(ghostNotes * 2, 12))));
    const advice = anchorHits < 4 ? "Restore the four anchor beats before adding more movement." : ghostNotes < 3 ? "Add softer ghost notes to make the loop feel less grid-stiff." : collisions > 2 ? "Several moments stack three or more voices. Remove one hit at the busiest step." : hits[1] > 7 ? "The shaker is carrying too many events. Remove one late offbeat to create breath." : hits[2] < 2 ? "The low melodic answer is too rare to establish a phrase. Add one response after beat three." : "The pattern has a stable anchor, useful ghost notes, and negative space. Create a B variation next.";
    return { hits, density, syncopation, space: Math.round(space), score, advice, averageVelocity, ghostNotes, barBalance };
  }, [steps]);

  const nastorFit = useMemo(() => scoreNastorFit(analysis, bpm, swing), [analysis, bpm, swing]);

  const exportPattern = () => { const blob = new Blob([JSON.stringify({ version: 4, name: activePreset, ...snapshot() }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "nastor-pattern-v4.json"; link.click(); URL.revokeObjectURL(url); };
  const importPattern = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)) as PatternState; if (!Array.isArray(data.steps) || data.steps.length !== 4 || !data.steps.every((row) => Array.isArray(row) && row.length === 16)) throw new Error("Invalid pattern"); checkpoint(); restore({ steps: clonePatternSteps(data.steps), bpm: Math.max(70, Math.min(150, Number(data.bpm) || 120)), swing: Math.max(0, Math.min(70, Number(data.swing) || 0)), muted: Array.isArray(data.muted) && data.muted.length === 4 ? data.muted.map(Boolean) : [false,false,false,false], solo: typeof data.solo === "number" ? data.solo : null, patternSlots: Array.isArray(data.patternSlots) && data.patternSlots.length === 2 ? data.patternSlots : undefined, activeSlot: data.activeSlot === 0 || data.activeSlot === 1 ? data.activeSlot : undefined }); setActivePreset("Imported pattern"); } catch { onAsk("The imported pattern file was invalid. Explain the expected Nastor pattern format."); } }; reader.readAsText(file); event.target.value = ""; };
  const reset = () => { checkpoint(); const fresh = clonePatternSteps(defaultSteps); setSteps(fresh); setBpm(120); setSwing(38); setMuted([false,false,false,false]); setSolo(null); setActiveSlot(0); setPatternSlots([clonePatternSteps(fresh), createPatternVariation(fresh)]); setActivePreset("Afro House starter"); };

  return <section className="pattern-desk" aria-labelledby="pattern-desk-title">
    <header className="desk-top"><div><span className="section-kicker">Pattern desk · performance prototype</span><h2 id="pattern-desk-title">Build the pocket before the playlist.</h2></div><div className="desk-tools"><button onClick={undo} disabled={!history.length} aria-label="Undo pattern edit"><Undo2 size={14} /></button><button onClick={redo} disabled={!future.length} aria-label="Redo pattern edit"><Redo2 size={14} /></button><button onClick={() => importRef.current?.click()} aria-label="Import pattern"><Upload size={14} /></button><button onClick={exportPattern} aria-label="Export pattern"><Download size={14} /></button><input ref={importRef} className="sr-only" type="file" accept="application/json,.json" onChange={importPattern} /><div className="desk-transport"><button aria-label={deskPlaying ? "Pause pattern" : "Play pattern"} onClick={() => setDeskPlaying((value) => { if (value) setCurrentStep(-1); return !value; })}>{deskPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><label><span>BPM</span><input aria-label="Pattern tempo" type="number" min="70" max="150" value={bpm} onChange={(event) => updateBpm(Number(event.target.value))} /></label><small>{activePreset.toUpperCase()}</small></div></div></header>
    <div className="intelligence-bar"><div><span>Groove score</span><strong>{analysis.score}</strong></div><div><span>Nastor fit</span><strong>{nastorFit.score}</strong><small>{nastorFit.label}</small></div><div><span>Velocity</span><strong>{analysis.averageVelocity}%</strong></div><div><span>Ghosts</span><strong>{analysis.ghostNotes}</strong></div><div><span>Space</span><strong>{analysis.space}%</strong></div><p><Sparkles size={13} /> {nastorFit.notes[2]} {analysis.advice}</p></div>
    <div className="performance-strip"><div className="slot-switcher"><button className={activeSlot === 0 ? "active" : ""} onClick={() => switchSlot(0)}>Pattern A</button><button className={activeSlot === 1 ? "active" : ""} onClick={() => switchSlot(1)}>Pattern B</button><button onClick={captureSlot}>Capture slot</button></div><div className="arranger-preview" aria-label="Mini arrangement preview">{arrangement.map((slot, index) => <button key={`${slot}-${index}`} onClick={() => switchSlot(slot)} className={activeSlot === slot ? "active" : ""}><span>{index + 1}</span>{slot === 0 ? "A" : "B"}</button>)}</div><div className="bar-balance">{analysis.barBalance.map((count, index) => <span key={index} style={{ "--height": `${Math.max(16, count * 12)}%` } as CSSProperties}>{count}</span>)}</div></div>
    <div className="nastor-dna-panel"><div><span className="section-kicker">Reference DNA · Nastor style active</span><strong>{nastorStyleProfile.reference}</strong><p>{nastorStyleProfile.genre} around {nastorStyleProfile.tempo.target} BPM · {nastorStyleProfile.keyCenter} keys · {nastorStyleProfile.feel.join(" / ")}</p><audio className="reference-player" controls preload="metadata" src={nastorStyleProfile.url}>Your browser does not support audio playback.</audio></div><div className="dna-intel"><ul>{nastorFit.notes.map((note) => <li key={note}>{note}</li>)}</ul><div className="dna-rule-grid"><div><span>Listen for</span>{nastorStyleProfile.rules.slice(0, 4).map((rule) => <em key={rule}>{rule}</em>)}</div><div><span>Avoid</span>{nastorStyleProfile.avoid.map((item) => <em key={item}>{item}</em>)}</div></div></div></div>
    <div className="desk-body">
      <aside className="sound-browser" aria-label="Sound browser"><div className="browser-search"><Search size={13} /><span>Find a starting sound</span></div><div className="browser-tabs">{["Sounds","Devices","Presets","Lessons"].map((tab) => <button className={browserTab === tab ? "active" : ""} key={tab} onClick={() => setBrowserTab(tab)}>{tab}</button>)}</div><div className="browser-list">{browserTab === "Sounds" && ["Cape Town drums","Organic percussion","Log drum studies","Vocal textures"].map((item,index) => <button key={item} onClick={() => setSelected(index)}><span className={`browser-dot tone-${index}`} /><span>{item}<small>{index + 8} sources</small></span><Plus size={12} /></button>)}{browserTab === "Devices" && ["Kong drum designer","Dr. Octo Rex","Mimic sampler","Grain texture"].map((item,index) => <button key={item} onClick={() => setSelected(index)}><span className="browser-dot device" /><span>{item}<small>Browser instrument</small></span><Plus size={12} /></button>)}{browserTab === "Presets" && presets.map((preset) => <button key={preset.name} onClick={() => applyPreset(preset.name)}><span className="browser-dot lesson" /><span>{preset.name}<small>{preset.bpm} BPM · {preset.swing}% swing</small></span><ChevronRight size={12} /></button>)}{browserTab === "Lessons" && ["Design the pocket","Use call and response","Open the break","Prepare the drop"].map((item) => <button key={item} onClick={() => onAsk(`Teach me how to ${item.toLowerCase()} using this pattern. Current groove score: ${analysis.score}, average velocity ${analysis.averageVelocity}%, ghost notes ${analysis.ghostNotes}.`)}><span className="browser-dot lesson" /><span>{item}<small>Guided move</small></span><ChevronRight size={12} /></button>)}</div><div className="swing-control"><label htmlFor="pattern-swing">Swing <strong>{swing}%</strong></label><input id="pattern-swing" type="range" min="0" max="70" value={swing} onChange={(event) => setSwing(Number(event.target.value))} /></div></aside>
      <div className="channel-rack"><div className="rack-ruler"><span>CHANNEL</span>{[1,2,3,4].map((bar) => <b key={bar}>0{bar}</b>)}</div>{channelNames.map((name,channel) => <div className={`channel-row ${selected === channel ? "selected" : ""} ${muted[channel] ? "muted" : ""}`} key={name}><button className="channel-name" onClick={() => setSelected(channel)}><i style={{background:["#f2a65a","#70bbce","#c79af1","#8fd3a9"][channel]}} /><span>{name}<small>{devices[channel]} · {analysis.hits[channel]} hits</small></span></button><div className="channel-controls"><button className={muted[channel] ? "active" : ""} onClick={() => toggleMute(channel)} aria-label={`Mute ${name}`} aria-pressed={muted[channel]}>M</button><button className={solo === channel ? "active" : ""} onClick={() => toggleSolo(channel)} aria-label={`Solo ${name}`} aria-pressed={solo === channel}>S</button></div><div className="rack-steps">{steps[channel].map((active,step) => <button key={step} aria-label={`${active ? "Change" : "Enable"} ${name} step ${step + 1}`} aria-pressed={Boolean(active)} className={`${active ? "active" : ""} ${active && active < .7 ? "ghost" : ""} ${step % 4 === 0 ? "beat" : ""} ${currentStep === step ? "playing" : ""}`} style={{ "--level": active || .14 } as CSSProperties} onClick={() => toggleStep(channel,step)} />)}</div></div>)}<div className="rack-actions"><button onClick={() => shiftSelected(-1)}>Shift left</button><button onClick={() => shiftSelected(1)}>Shift right</button><button onClick={fillOffbeats}>Fill offbeats</button><button onClick={thinSelected}>Thin selected</button><button onClick={clearChannel}>Clear selected</button><button onClick={duplicateChannel}>Duplicate to next</button><button onClick={humanizeChannel}>Humanize velocity</button><button onClick={() => setChannelVelocity(.52)}>Ghost lane</button><button onClick={() => setChannelVelocity(1)}>Accent lane</button><button onClick={generateVariation}>Make B variation</button></div><div className="rack-footer"><button onClick={reset}><RotateCcw size={11} /> Reset</button><span>16 STEPS · A/B SLOTS · AUTOSAVED</span><button onClick={() => onAsk(`Analyze this pattern against the uploaded Nastor beat style: groove score ${analysis.score}, Nastor fit ${nastorFit.score} (${nastorFit.label}), density ${analysis.density}%, syncopation ${analysis.syncopation}%, space ${analysis.space}%, average velocity ${analysis.averageVelocity}%, ghost notes ${analysis.ghostNotes}. Focus on ${channelNames[selected]} with ${analysis.hits[selected]} hits. Give one specific edit, one 8-bar variation move, and one thing to avoid copying too directly.`)}>Ask Copilot <Sparkles size={12} /></button></div></div>
      <aside className="coach-strip"><span className="section-kicker">Studio feature coach</span><strong>{channelNames[selected]}</strong><p>{analysis.advice}</p><div className="coach-meter"><i style={{height:`${Math.max(18, analysis.density)}%`}} /><i style={{height:`${Math.max(18, analysis.averageVelocity)}%`}} /><i style={{height:`${Math.max(18, analysis.space)}%`}} /><i style={{height:`${Math.max(18, analysis.score)}%`}} /></div><dl><div><dt>Role</dt><dd>{["Anchor","Motion","Answer","Texture"][selected]}</dd></div><div><dt>Density</dt><dd>{analysis.hits[selected]}/16</dd></div><div><dt>Preset</dt><dd>{activePreset}</dd></div></dl><button onClick={() => onAsk(`Create a focused browser-studio exercise to improve ${channelNames[selected]} in Nastor's uploaded reference style. The pattern currently scores ${analysis.score}/100, Nastor fit ${nastorFit.score}/100, has ${analysis.ghostNotes} ghost notes, ${analysis.space}% space, and is editing Pattern ${activeSlot === 0 ? "A" : "B"}.`)}>Open guided exercise <ArrowUpRight size={13} /></button></aside>
    </div>
  </section>;
}


function UploadReleaseFlow({ onAsk, onExport }: { onAsk: (prompt: string) => void; onExport: () => void }) {
  return (
    <section className="user-flow-panel" aria-labelledby="user-flow-title">
      <header>
        <div>
          <span className="section-kicker">User flow · upload to release</span>
          <h2 id="user-flow-title">One path for every Nastor session.</h2>
          <p>Whether the source is an MP3 idea, FLP project, full song, remix reference or stemz, the assistant should guide the same clear route: ingest, analyze, decide, produce, version and deliver.</p>
        </div>
        <button onClick={() => onAsk("Create the exact user journey for uploading an MP3, FLP, remix source or stems, including screens, states, errors, progress messages, outputs and download actions.")}>Map UX states <ArrowUpRight size={15} /></button>
      </header>
      <div className="flow-input-grid">
        {userFlowInputs.map((input) => <button key={input.type} onClick={() => onAsk(`${input.type} user flow: ${input.prompt} Include upload requirements, analysis steps, production decisions and final exports.`)}><span>{input.accepts}</span><strong>{input.type}</strong><small>{input.output}</small></button>)}
      </div>
      <ol className="flow-steps">
        {userFlowSteps.map((item) => <li key={item.step}><span>{item.step}</span><strong>{item.title}</strong><p>{item.detail}</p></li>)}
      </ol>
      <div className="flow-output-strip">
        <div><span className="section-kicker">Outputs</span><strong>What Nastor gets back</strong></div>
        <div>{userFlowOutputs.map((output) => <em key={output}>{output}</em>)}</div>
        <button onClick={onExport}>Open delivery options <Download size={15} /></button>
      </div>
    </section>
  );
}

function BackendPlan({ onAsk }: { onAsk: (prompt: string) => void }) {
  return <section className="backend-plan" aria-labelledby="backend-plan-title"><header><div><span className="section-kicker">Real backend plan · build path</span><h2 id="backend-plan-title">Make the assistant actually produce.</h2><p>The prototype needs a backend that can ingest audio and DAW projects, analyze them, queue heavy jobs, run generation engines, and deliver release packs without pretending the browser can do everything alone.</p></div><button onClick={() => onAsk("Turn this backend roadmap into implementation tickets: upload API, storage, queue, analysis workers, FLP audit, stem separation, remix/version generation, mastering/export and permissions.")}>Create build tickets <Command size={15} /></button></header><div className="backend-grid">{backendRoadmap.map((step) => <article key={step.phase}><span>{step.phase}</span><strong>{step.title}</strong><small>{step.stack}</small><p>{step.copy}</p></article>)}</div><div className="backend-guards"><strong>Safety and rights rules</strong><ul>{backendGuards.map((guard) => <li key={guard}>{guard}</li>)}</ul></div></section>;
}


function BuildTickets({ onAsk }: { onAsk: (prompt: string) => void }) {
  return (
    <section className="build-tickets" aria-labelledby="build-tickets-title">
      <header>
        <span className="section-kicker">Implementation tickets · backend sprint</span>
        <h2 id="build-tickets-title">Turn the roadmap into engineering work.</h2>
        <p>These are the first concrete tickets for making uploads, analysis, FLP audits, stemz, remix planning and release-pack exports real.</p>
      </header>
      <div className="ticket-grid">
        {implementationTickets.map((ticket) => <button key={`${ticket.lane}-${ticket.title}`} onClick={() => onAsk(`Write the implementation spec for ${ticket.lane}: ${ticket.title}. Include endpoint/schema/worker steps, errors, status states and tests. Details: ${ticket.detail}`)}><span>{ticket.lane}</span><strong>{ticket.title}</strong><p>{ticket.detail}</p></button>)}
      </div>
      <div className="storage-map">
        <div><span className="section-kicker">Asset layout</span><strong>Every generated file needs a predictable path.</strong></div>
        <code>{storageLayout.join("\n")}</code>
      </div>
    </section>
  );
}

function ProductionBrain({ onAsk, onExport }: { onAsk: (prompt: string) => void; onExport: () => void }) {
  return (
    <section className="production-brain" aria-labelledby="production-brain-title">
      <header>
        <div>
          <span className="section-kicker">Production intelligence · roadmap active</span>
          <h2 id="production-brain-title">From rough idea to release pack.</h2>
          <p>Nastor can use this assistant as a producer brain: feed it an MP3 idea, a full song, remix reference, FLP project or stems, then ask for concrete next moves and release-ready versions.</p>
        </div>
        <button onClick={() => onAsk("Build a complete production plan from my next uploaded idea: analyze tempo/key, strongest hook, missing parts, arrangement, remix options, mix problems, stemz and version pack.")}>Plan next upload <Sparkles size={15} /></button>
      </header>
      <div className="brain-grid">
        {productionIntelligence.map((item) => <button key={item.title} onClick={() => onAsk(`${item.title}: ${item.copy} Give Nastor a practical workflow, required inputs, decisions to make, and output versions.`)}><span>{item.status}</span><strong>{item.title}</strong><p>{item.copy}</p><ChevronRight size={15} /></button>)}
      </div>
      <div className="version-strip">
        <div><span className="section-kicker">Version outputs</span><strong>Generate many useful versions, not one bounce.</strong></div>
        <ul>{deliveryVersions.map((version) => <li key={version.name}><strong>{version.name}</strong><span>{version.target}</span><small>{version.length} · {version.note}</small></li>)}</ul>
        <button onClick={onExport}>Open export pack <Download size={15} /></button>
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
      <div className="context-strip"><span>PRODUCTION BRAIN</span><p>Understands idea finishing, remix planning, FLP audits, backend jobs, version packs and stemz workflows.</p></div>
      <div className="message-list" ref={scrollRef} aria-live="polite">
        {messages.map((message) => <div key={message.id} className={`message ${message.role}`}>{message.role === "assistant" && <span className="message-mark"><NastorMark /></span>}<div><span className="message-author">{message.role === "assistant" ? "COPILOT" : "YOU"}</span><p>{message.text}</p></div></div>)}
      </div>
      <div className="suggestion-row" aria-label="Suggested prompts">{["Finish this MP3", "Remix version", "Make stemz", "Radio edit"].map((text) => <button key={text} onClick={() => onSuggestion(text)}>{text}</button>)}</div>
      <form className="composer" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor={mobile ? "mobile-copilot-input" : "copilot-input"}>Message Nastor Copilot</label>
        <textarea id={mobile ? "mobile-copilot-input" : "copilot-input"} rows={3} placeholder={`Ask about ${project.title}…`} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleComposerKeyDown} />
        <input ref={fileRef} className="sr-only" type="file" accept="audio/*,.flp,.fst,.zip,.als,.logicx,.mid,.midi" onChange={onAttach} />
        <div><button type="button" className="attach-button" aria-label="Attach project context" onClick={() => fileRef.current?.click()}><Plus size={18} /></button><span title={attachedFile || undefined}>{attachedFile || "Attach local context"}</span><button type="submit" className="send-button" disabled={!value.trim()} aria-label="Send message"><Send size={17} /></button></div>
      </form>
      <p className="copilot-disclaimer">Prototype UI: real audio rendering, FLP editing, stem separation and remix generation require the backend services mapped below.</p>
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
  const [exportPreset, setExportPreset] = useState("Release pack · Full + DJ + Radio");
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
    { id: 1, role: "assistant", text: "Upload or describe a beat, MP3 idea, full song, FLP project or stems. I will turn it into a production plan: finish, remix, arrange, mix, master, stemz and versions." },
    { id: 2, role: "assistant", text: "For Nastor's lane I will protect the groove and hook first, then build practical outputs: full version, DJ extended, radio edit, dub/instrumental, social cut and grouped stemz." },
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
      "Finish MP3 idea": `Take an MP3 idea for ${activeProject} to the next level: detect tempo/key, choose the strongest 8 bars, write missing parts, arrangement, mix notes and final version outputs.`,
      "Remix a song": "Create a remix workflow: protect the hook, rebuild drums/bass in Nastor style, map sections, choose what to remove, and plan full/DJ/radio/dub versions.",
      "Open FLP session": "Explain how to inspect an FLP project: channels, samples, plugins, routing, markers, missing files, mix issues, stem groups and the next five production decisions.",
      "Build version pack": "Plan exports for full version, DJ extended, radio edit, dub, instrumental, acapella if available, clean edit, social cut and grouped stemz.",
    };
    setInput(prompts[title] ?? title);
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
    setToast(`${file.name} ready for production intelligence`);
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
            <ProductionBrain onAsk={(prompt) => { setInput(prompt); setActiveNav("AI Assistant"); setToast("Production intelligence loaded into Copilot"); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} onExport={() => setExportOpen(true)} />
            <UploadReleaseFlow onAsk={(prompt) => { setInput(prompt); setActiveNav("AI Assistant"); setToast("User flow loaded into Copilot"); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} onExport={() => setExportOpen(true)} />
            <BackendPlan onAsk={(prompt) => { setInput(prompt); setActiveNav("AI Assistant"); setToast("Backend build plan loaded into Copilot"); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} />
            <BuildTickets onAsk={(prompt) => { setInput(prompt); setActiveNav("AI Assistant"); setToast("Implementation ticket loaded into Copilot"); if (window.matchMedia("(max-width: 1160px)").matches) setMobileCopilot(true); }} />
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

      {exportOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExportOpen(false); }}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title"><header><div><span className="section-kicker">Local delivery</span><h2 id="export-title">Export project</h2></div><button className="icon-button" aria-label="Close export dialog" onClick={() => setExportOpen(false)}><X size={19} /></button></header><p>Choose a mock export preset for <strong>{activeProject}</strong>. No audio will be rendered.</p><div className="preset-list" role="radiogroup" aria-label="Export preset">{[{ name: "Release pack · Full + DJ + Radio", sub: "Main master, extended club mix and short edit", icon: Disc3 }, { name: "Stemz · Drums/Bass/Music/Vocal/FX", sub: "Grouped WAV delivery for remix and mix work", icon: AudioLines }, { name: "Remix pack", sub: "Original reference, reconstructed groove, dub and instrumental", icon: Radio }, { name: "MP3 preview set", sub: "Fast private listening versions", icon: Music2 }, { name: "FLP handoff notes", sub: "Session audit, missing files and next decisions", icon: FolderKanban }].map(({ name, sub, icon: Icon }) => <button key={name} role="radio" aria-checked={exportPreset === name} className={exportPreset === name ? "selected" : ""} onClick={() => setExportPreset(name)}><Icon size={19} /><span><strong>{name}</strong><small>{sub}</small></span><i>{exportPreset === name && <Check size={14} />}</i></button>)}</div><div className="export-details"><span><Gauge size={15} /> Local mock</span><span>44.1 kHz</span><span>Prototype workflow</span></div><footer><button className="cancel-button" onClick={() => setExportOpen(false)}>Cancel</button><button className="primary-action" onClick={addExportToQueue}>Add to queue <ChevronRight size={16} /></button></footer></section></div>}

      {inviteOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInviteOpen(false); }}><form className="utility-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-title" onSubmit={inviteCollaborator}><header><div><span className="section-kicker">Local collaboration</span><h2 id="invite-title">Invite to this project</h2></div><button type="button" className="icon-button" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}><X size={19} /></button></header><p>Prepare a local invite for <strong>{activeProject}</strong>. No email will be sent.</p><label htmlFor="invite-email">Email address</label><input id="invite-email" type="email" autoFocus required placeholder="producer@example.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /><footer><button type="button" className="cancel-button" onClick={() => setInviteOpen(false)}>Cancel</button><button type="submit" className="primary-action">Prepare invite <ChevronRight size={16} /></button></footer></form></div>}

      {shortcutsOpen && <div className="overlay dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShortcutsOpen(false); }}><section className="utility-dialog shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title"><header><div><span className="section-kicker">Studio controls</span><h2 id="shortcuts-title">Keyboard shortcuts</h2></div><button className="icon-button" aria-label="Close keyboard shortcuts" onClick={() => setShortcutsOpen(false)}><X size={19} /></button></header><dl><div><dt>Command palette</dt><dd><kbd>Ctrl</kbd><span>+</span><kbd>K</kbd></dd></div><div><dt>Play or pause</dt><dd><kbd>Space</kbd></dd></div><div><dt>Show shortcuts</dt><dd><kbd>?</kbd></dd></div><div><dt>Close dialogs</dt><dd><kbd>Esc</kbd></dd></div><div><dt>Send Copilot message</dt><dd><kbd>Enter</kbd></dd></div><div><dt>New line in Copilot</dt><dd><kbd>Shift</kbd><span>+</span><kbd>Enter</kbd></dd></div></dl></section></div>}

      {toast && <div className="toast" role="status"><Zap size={16} /><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </main>
  );
}
