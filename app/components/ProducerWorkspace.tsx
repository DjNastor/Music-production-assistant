"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AudioLines, Bot, Check, ChevronLeft, ChevronRight,
  ClipboardList, Copy, Download, FileAudio, FileMusic, Folder,
  FolderOpen, Headphones, Layers3, ListMusic, Menu, MessageSquare,
  Music2, Pause, Play, Plus, Search,
  SlidersHorizontal, Sparkles, Trash2, Upload, Users, X,
} from "lucide-react";
import ComposerWorkbench from "./ComposerWorkbench";
import styles from "./ProducerWorkspace.module.css";

type Lane = "Drums" | "Bass" | "Chords" | "Lead" | "Vocals" | "FX";
type Clip = { id: string; lane: Lane; start: number; length: number; name: string };
type LaneState = { volume: number; muted: boolean; solo: boolean };
type Task = { id: string; message: string; done: boolean; clipId?: string };
type WorkspaceState = {
  bpm: number; root: string; mode: string; clips: Clip[]; lanes: Record<Lane, LaneState>;
  tasks: Task[]; notes: string; sessionName: string; inviteDrafts: { id: string; email: string; role: string }[];
};
type Asset = { id: string; name: string; type: string; size: number; url?: string };
type Panel = "channel" | "piano" | "mixer";
type RightPanel = "copilot" | "collab";
type TopMode = "studio" | "assets" | "collab";

const LANES: { name: Lane; color: string; icon: string }[] = [
  { name: "Drums", color: "#c08bff", icon: "◉" },
  { name: "Bass", color: "#f9b664", icon: "▥" },
  { name: "Chords", color: "#f08ba3", icon: "▤" },
  { name: "Lead", color: "#66d9e6", icon: "♬" },
  { name: "Vocals", color: "#7fb5ff", icon: "♩" },
  { name: "FX", color: "#7cdfb3", icon: "✧" },
];
const DEFAULT_CLIPS: Clip[] = [
  { id: "d1", lane: "Drums", start: 1, length: 8, name: "Intro percussion" },
  { id: "d2", lane: "Drums", start: 9, length: 16, name: "Groove A" },
  { id: "d3", lane: "Drums", start: 25, length: 8, name: "Drop variation" },
  { id: "b1", lane: "Bass", start: 9, length: 16, name: "Low-end pocket" },
  { id: "b2", lane: "Bass", start: 25, length: 8, name: "Bass response" },
  { id: "c1", lane: "Chords", start: 9, length: 16, name: "Warm chords" },
  { id: "l1", lane: "Lead", start: 17, length: 8, name: "Hook sketch" },
  { id: "v1", lane: "Vocals", start: 17, length: 8, name: "Vocal idea" },
  { id: "f1", lane: "FX", start: 8, length: 1, name: "Rise" },
  { id: "f2", lane: "FX", start: 24, length: 1, name: "Impact" },
];
const DEFAULT_STATE: WorkspaceState = {
  bpm: 120, root: "A", mode: "minor", clips: DEFAULT_CLIPS,
  lanes: Object.fromEntries(LANES.map((lane) => [lane.name, { volume: 75, muted: false, solo: false }])) as Record<Lane, LaneState>,
  tasks: [{ id: "initial-1", message: "Review the breakdown and create a stronger lead into the drop", done: false }],
  notes: "", sessionName: "Find A Way", inviteDrafts: [],
};
const KEY_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const STORAGE_KEY = "nastor-production-room-v1";
const SECTIONS = ["Intro", "Groove", "Breakdown", "Drop"];
const STEPS = Array.from({ length: 16 }, (_, index) => index);
const BARS = Array.from({ length: 32 }, (_, index) => index + 1);
const DRUMS = ["Kick", "Clap", "Shaker", "Percussion", "Log drum"];
const DRUM_DEFAULTS = [
  [0, 4, 8, 12], [4, 12], [2, 6, 10, 14], [3, 7, 11, 15], [6, 14],
];
const CHANNEL_COLORS = ["#c08bff", "#e8a3b8", "#91d2b3", "#7ac4e2", "#efb572"];
const initialDrums = DRUM_DEFAULTS.map((hits) => STEPS.map((index) => hits.includes(index)));
const seededCollaboratorRoles = ["Co-producer", "Mix engineer", "Vocalist", "Mastering engineer", "Reviewer"];

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<WorkspaceState>;
  return typeof o.bpm === "number" && o.bpm >= 50 && o.bpm <= 220 &&
    typeof o.sessionName === "string" && Array.isArray(o.clips) &&
    o.clips.every((c) => c && typeof c.name === "string" && LANES.some((lane) => lane.name === c.lane) &&
      Number.isInteger(c.start) && Number.isInteger(c.length) && c.start >= 1 && c.length >= 1 && c.start + c.length <= 33) &&
    !!o.lanes && Array.isArray(o.tasks) && Array.isArray(o.inviteDrafts) && typeof o.notes === "string";
}
function formatBytes(bytes: number) {
  return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + " MB" : Math.round(bytes / 1024) + " KB";
}
function sayPrompt(task: string, session: WorkspaceState, selected?: Clip) {
  const info = `Track: ${session.sessionName}; ${session.bpm} BPM; ${session.root} ${session.mode}; section: ${selected ? selected.name + " in bars " + selected.start + "–" + (selected.start + selected.length - 1) : "full arrangement"}.`;
  const safety = " Ask for permission before modifying clips or scripts, preserve the original FLP, and verify the result.";
  const options: Record<string, string> = {
    "Arrangement review": "Inspect the Playlist. Suggest an Afro House intro, groove, breakdown, lift and peak with specific bar-count changes and transition ideas.",
    "Improve the groove": "Inspect the current kick, shakers, bass and percussion. Suggest targeted fixes to timing, swing, velocity and breathing room.",
    "Check mix balance": "Inspect the Mixer, routing, gains, phase and master headroom. Suggest a non-destructive cleanup and prioritize low-end issues.",
    "Generate chords": "Suggest four-bar chord voicings and a bass response in the specified key, then explain how to enter them in the Piano roll.",
    "Organize session": "Audit Playlist tracks, patterns, sample paths, missing plugins and mixer inserts. Propose names, colors and a safe cleanup plan.",
    "Producer handoff": "Create a handoff checklist with project tempo, key, required stems, export specs, notes, pending questions and version history.",
  };
  return info + " " + (options[task] ?? task) + safety;
}

export default function ProducerWorkspace() {
  const [session, setSession] = useState<WorkspaceState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>("d2");
  const [panel, setPanel] = useState<Panel>("channel");
  const [rightPanel, setRightPanel] = useState<RightPanel>("copilot");
  const [mode, setMode] = useState<TopMode>("studio");
  const [mobileBrowser, setMobileBrowser] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [status, setStatus] = useState("This is a local production planning session. Your original files are never changed.");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Co-producer");
  const [taskText, setTaskText] = useState("");
  const [promptTask, setPromptTask] = useState("Arrangement review");
  const [assetQuery, setAssetQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const liveAssetsRef = useRef<Asset[]>([]);
  const [activeAsset, setActiveAsset] = useState<string | null>(null);
  const [pattern, setPattern] = useState<boolean[][]>(initialDrums);
  const [drumPlaying, setDrumPlaying] = useState(false);
  const [drumStep, setDrumStep] = useState(-1);
  const [arrangePlaying, setArrangePlaying] = useState(false);
  const [barPlayhead, setBarPlayhead] = useState(1);
  const [mixerInspect, setMixerInspect] = useState<Lane>("Drums");
  const filePicker = useRef<HTMLInputElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const transportTimer = useRef<number | null>(null);
  const drumTimer = useRef<number | null>(null);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as unknown;
          if (isWorkspaceState(parsed)) setSession(parsed);
        }
      } catch { /* Unusable local data is ignored, rather than crashing the studio. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session, hydrated]);

  useEffect(() => {
    if (!arrangePlaying) return;
    transportTimer.current = window.setInterval(() => {
      setBarPlayhead((bar) => bar >= 32 ? 1 : bar + 1);
    }, (60000 / session.bpm) * 4);
    return () => {
      if (transportTimer.current !== null) window.clearInterval(transportTimer.current);
      transportTimer.current = null;
    };
  }, [arrangePlaying, session.bpm]);
  useEffect(() => {
    if (!drumPlaying) return;
    let count = 0;
    const context = audioRef.current ?? new AudioContext();
    audioRef.current = context;
    void context.resume();
    function tick() {
      setDrumStep(count);
      const when = context.currentTime;
      pattern.forEach((row, channel) => {
        if (!row[count]) return;
        const osc = context.createOscillator();
        const gain = context.createGain();
        const freqs = [105, 230, 480, 320, 68];
        osc.type = channel === 0 || channel === 4 ? "sine" : channel === 2 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freqs[channel], when);
        if (channel === 0 || channel === 4) osc.frequency.exponentialRampToValueAtTime(freqs[channel] / 2, when + .11);
        gain.gain.setValueAtTime(channel === 2 ? .013 : .07, when);
        gain.gain.exponentialRampToValueAtTime(.0001, when + (channel === 4 ? .24 : .12));
        osc.connect(gain).connect(context.destination);
        osc.start(when);
        osc.stop(when + .28);
      });
      count = (count + 1) % 16;
    }
    tick();
    drumTimer.current = window.setInterval(tick, 60000 / session.bpm / 4);
    return () => {
      if (drumTimer.current !== null) window.clearInterval(drumTimer.current);
      drumTimer.current = null;
    };
  }, [drumPlaying, pattern, session.bpm]);
  useEffect(() => { liveAssetsRef.current = assets; }, [assets]);
  useEffect(() => () => {
    if (audioRef.current) void audioRef.current.close();
    for (const asset of liveAssetsRef.current) if (asset.url) URL.revokeObjectURL(asset.url);
  }, []); // File URLs are also released by the remove-asset action.

  function updateSession(change: Partial<WorkspaceState>) {
    setSession((current) => ({ ...current, ...change }));
  }
  function chooseProject(title: string) {
    updateSession({ sessionName: title.trim().slice(0, 90) || "Untitled session" });
  }
  const selectedClip = session.clips.find((clip) => clip.id === selectedClipId);
  const summary = useMemo(() => {
    const used = new Set<number>();
    for (const clip of session.clips) for (let bar = clip.start; bar < clip.start + clip.length; bar++) used.add(bar);
    const tasksOpen = session.tasks.filter((task) => !task.done).length;
    return { covered: used.size, openTasks: tasksOpen, clips: session.clips.length };
  }, [session.clips, session.tasks]);
  const availableAssets = assets.filter((asset) => asset.name.toLowerCase().includes(assetQuery.toLowerCase()));
  const currentAsset = assets.find((asset) => asset.id === activeAsset);
  const prompt = sayPrompt(promptTask, session, selectedClip);

  function addClip(lane: Lane, at?: number) {
    const laneClips = session.clips.filter((clip) => clip.lane === lane);
    const lastEnd = laneClips.reduce((max, clip) => Math.max(max, clip.start + clip.length), 1);
    const start = at ?? Math.min(32, lastEnd);
    const length = Math.min(8, 33 - start);
    const clip: Clip = { id: uid(), lane, start, length, name: lane + " idea" };
    updateSession({ clips: [...session.clips, clip] });
    setSelectedClipId(clip.id);
    setStatus("Added " + clip.name + " at bar " + start + ". This is an editable arrangement marker, not rendered audio.");
  }
  function editClip(action: "delete" | "left" | "right" | "duplicate" | "rename") {
    if (!selectedClip) return;
    if (action === "delete") {
      updateSession({ clips: session.clips.filter((clip) => clip.id !== selectedClip.id) });
      setSelectedClipId(null);
      return;
    }
    if (action === "duplicate") {
      const start = selectedClip.start + selectedClip.length;
      if (start > 32) { setStatus("No remaining bars after this clip. Move it before duplicating."); return; }
      const copy = { ...selectedClip, id: uid(), start, length: Math.min(selectedClip.length, 33 - start), name: selectedClip.name + " B" };
      updateSession({ clips: [...session.clips, copy] }); setSelectedClipId(copy.id); return;
    }
    if (action === "rename") {
      const name = window.prompt("Clip name", selectedClip.name);
      if (!name?.trim()) return;
      updateSession({ clips: session.clips.map((clip) => clip.id === selectedClip.id ? { ...clip, name: name.trim().slice(0, 70) } : clip) });
      return;
    }
    const newStart = Math.max(1, Math.min(33 - selectedClip.length, selectedClip.start + (action === "left" ? -4 : 4)));
    updateSession({ clips: session.clips.map((clip) => clip.id === selectedClip.id ? { ...clip, start: newStart } : clip) });
  }
  function updateLane(lane: Lane, change: Partial<LaneState>) {
    setSession((current) => ({ ...current, lanes: { ...current.lanes, [lane]: { ...current.lanes[lane], ...change } } }));
  }
  function addTask(text: string, clipId?: string) {
    if (!text.trim()) return;
    updateSession({ tasks: [...session.tasks, { id: uid(), message: text.trim().slice(0, 250), done: false, clipId }] });
    setTaskText("");
    setStatus("A production task was added to this local session.");
  }
  function saveInviteDraft() {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Enter a valid email address to prepare the collaborator invite.");
      return;
    }
    if (session.inviteDrafts.some((invite) => invite.email === email)) {
      setStatus("That email already has a local invitation draft.");
      return;
    }
    updateSession({ inviteDrafts: [...session.inviteDrafts, { id: uid(), email, role: inviteRole }] });
    setInviteEmail("");
    setStatus("Invitation draft added locally. No invitation has been sent.");
  }
  function inviteMessage(email: string, role: string) {
    return `Hello, I'd like to collaborate with you on "${session.sessionName}" as ${role}. The working session is ${session.bpm} BPM in ${session.root} ${session.mode}. Please reply if you're available. We can then agree on an authorized file-sharing method and project responsibilities. Regards, Nasto.`;
  }
  async function copyText(value: string, done: string) {
    try { await navigator.clipboard.writeText(value); setStatus(done); }
    catch { setStatus("Clipboard permission denied. Select the text shown in the prompt box and copy it manually."); }
  }
  function exportHandoff() {
    const content = {
      product: "Nastor AI Studio", schemaVersion: 1,
      exportedAt: new Date().toISOString(), status: "Local planning data; not an FLP or audio render",
      project: session, pattern, assetManifest: assets.map(({ name, size, type }) => ({ name, size, type })),
      caveats: ["Audio assets are not embedded", "Invites are drafts only", "Mixer faders are planning data, not DSP processing"],
    };
    downloadText("nastor-" + session.sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-handoff.json", JSON.stringify(content, null, 2));
    setStatus("Downloaded a local production handoff manifest. Audio files are not included.");
  }
  async function importAssets(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 20);
    event.target.value = "";
    const valid = files.filter((file) => file.size <= 150_000_000);
    const incoming = valid.map((file) => ({
      id: uid(), name: file.name, size: file.size, type: file.type || "unknown",
      url: file.type.startsWith("audio/") ? URL.createObjectURL(file) : undefined,
    }));
    setAssets((current) => [...current, ...incoming].slice(-50));
    setStatus(incoming.length + " local file(s) selected. They remain in this browser session; nothing was uploaded to a server.");
    if (incoming.length) { setMode("assets"); setActiveAsset(incoming[0].id); }
  }
  function removeAsset(id: string) {
    const asset = assets.find((item) => item.id === id);
    if (asset?.url) URL.revokeObjectURL(asset.url);
    setAssets((current) => current.filter((item) => item.id !== id));
    if (activeAsset === id) setActiveAsset(null);
  }
  function switchMode(next: TopMode) {
    setMode(next);
    if (next === "collab") setRightPanel("collab");
  }
  const studioPane = (
    <div className={styles.centerArea}>
      <section className={styles.focusBar} aria-label="Start producing">
        <div className={styles.focusIntro}>
          <span className={styles.eyebrow}>YOUR CREATIVE WORKSPACE</span>
          <h1>Make your next record.</h1>
          <p>Choose where to begin. The advanced tools are here when you need them.</p>
        </div>
        <div className={styles.focusActions}>
          <button className={styles.focusPrimary} onClick={() => setPanel("channel")} aria-pressed={panel === "channel"}><Layers3 size={17}/> Build a beat</button>
          <button onClick={() => setPanel("piano")} aria-pressed={panel === "piano"}><Music2 size={17}/> Write chords</button>
          <button onClick={() => switchMode("collab")}><Users size={17}/> Work together</button>
        </div>
      </section>
      <section className={styles.playlistPanel} aria-label="Producer Playlist">
        <div className={styles.panelHeading}>
          <div><span className={styles.eyebrow}>ARRANGE YOUR TRACK</span><h2>Playlist <span className={styles.subTitle}>· 32 bars</span></h2></div>
          <div className={styles.inlineActions}>
            <span className={styles.mutedTag}>{summary.clips} clips</span>
            <button title="Export session manifest" onClick={exportHandoff}><Download size={15} /> Save brief</button>
          </div>
        </div>
        <div className={styles.timelineScroll}>
          <div className={styles.timelineGrid}>
            <div className={styles.ruler}><span className={styles.rulerStart}>TRACKS</span>{BARS.map((bar) => <span className={bar % 8 === 1 ? styles.barMajor : ""} key={bar}>{bar % 4 === 1 ? bar : "·"}</span>)}</div>
            <div className={styles.markers}>
              <div className={styles.markerHeading}>Sections</div>
              {SECTIONS.map((name, i) => <button key={name} className={styles.section} style={{ gridColumn: `${i * 8 + 2} / span 8` }} onClick={() => { setBarPlayhead(i * 8 + 1); setStatus("Selected " + name + " at bar " + (i * 8 + 1)); }}>{name}</button>)}
            </div>
            {LANES.map(({ name, color, icon }) => (
              <div className={styles.trackRow} key={name}>
                <div className={styles.trackLabel}><span style={{ color }}>{icon}</span><strong>{name}</strong>
                  <button title={session.lanes[name].muted ? "Unmute lane" : "Mute lane"} aria-label={session.lanes[name].muted ? "Unmute " + name : "Mute " + name}
                    onClick={() => updateLane(name, { muted: !session.lanes[name].muted })} className={session.lanes[name].muted ? styles.mutedBtn : ""}>M</button>
                  <button title={"Add " + name + " clip"} aria-label={"Add " + name + " clip"} onClick={() => addClip(name)}><Plus size={13} /></button>
                </div>
                <div className={styles.trackCells}>
                  {BARS.map((bar) => <button type="button" key={bar} className={bar % 8 === 1 ? styles.trackDivision : styles.emptyBar}
                    title={`Add ${name} idea at bar ${bar}`} onClick={() => addClip(name, bar)} aria-label={`Add ${name} clip at bar ${bar}`} />)}
                  {session.clips.filter((clip) => clip.lane === name).map((clip) => (
                    <button key={clip.id} className={selectedClipId === clip.id ? styles.selectedClip : styles.clip}
                      style={{ gridColumn: `${clip.start} / span ${clip.length}`, backgroundColor: color + "35", borderColor: color }}
                      onClick={() => setSelectedClipId(clip.id)} title={clip.name + " — bar " + clip.start}
                      aria-label={"Select " + clip.name + " bar " + clip.start}><span>{clip.name}</span></button>
                  ))}
                  {barPlayhead > 0 && <i className={styles.playhead} style={{ gridColumn: String(barPlayhead), pointerEvents: "none" }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.clipToolbar}>
          {selectedClip ? <><span>Selected <strong>{selectedClip.name}</strong> · bar {selectedClip.start}–{selectedClip.start + selectedClip.length - 1}</span>
            <button onClick={() => editClip("rename")}>Rename</button><button onClick={() => editClip("left")} aria-label="Move clip left four bars"><ChevronLeft size={15} /> 4 bars</button>
            <button onClick={() => editClip("right")} aria-label="Move clip right four bars">4 bars <ChevronRight size={15}/></button>
            <button onClick={() => editClip("duplicate")}>Duplicate</button>
            <button onClick={() => editClip("delete")} aria-label="Delete selected clip"><Trash2 size={15}/></button></>
            : <span>Select a clip to edit, or tap an empty cell to add an idea.</span>}
        </div>
      </section>

      <section className={styles.workPanel} aria-label="Production workbench tools">
        <div className={styles.editorTabs} role="tablist" aria-label="Production editor">
          <button role="tab" aria-selected={panel === "channel"} className={panel === "channel" ? styles.activeEditorTab : ""} onClick={() => setPanel("channel")}><Layers3 size={15}/> Beat maker</button>
          <button role="tab" aria-selected={panel === "piano"} className={panel === "piano" ? styles.activeEditorTab : ""} onClick={() => setPanel("piano")}><Music2 size={15}/> Piano roll</button>
          <button role="tab" aria-selected={panel === "mixer"} className={panel === "mixer" ? styles.activeEditorTab : ""} onClick={() => setPanel("mixer")}><SlidersHorizontal size={15}/> Mix plan</button>
        </div>
        {panel === "channel" && <div className={styles.editorBody}>
          <div className={styles.editorIntro}><strong>Pattern 01 · Afro House sketch</strong><span>Synthesized preview, not a rendered WAV or sample player</span></div>
          <div className={styles.drumToolbar}><button onClick={() => setDrumPlaying((p) => !p)}>{drumPlaying ? <Pause size={15}/> : <Play size={15}/>} {drumPlaying ? "Stop pattern" : "Preview pattern"}</button>
            <button onClick={() => setPattern(initialDrums)}>Reset</button><button onClick={() => {setPattern((p) => p.map((row, i) => row.map((v, step) => i === 0 ? step % 4 === 0 : v || (i > 1 && (step + i) % 7 === 0)))); setStatus("Generated a simple additional pattern variation.");}}><Sparkles size={15}/> Variation</button>
            <span>1 bar / 16 steps</span>
          </div>
          <div className={styles.drumGrid}>
            {DRUMS.map((name, channel) => <div key={name} className={styles.drumRow}>
              <strong>{name}</strong>
              {STEPS.map((step) => <button key={step} aria-label={name + " step " + (step + 1)} aria-pressed={pattern[channel][step]}
                className={[styles.drumStep, pattern[channel][step] ? styles.drumOn : "", drumStep === step ? styles.drumCurrent : ""].join(" ")}
                style={{ ["--hit-color" as string]: CHANNEL_COLORS[channel] }}
                onClick={() => setPattern((p) => p.map((row, idx) => idx !== channel ? row : row.map((value, index) => index === step ? !value : value)))}/>)}
            </div>)}
          </div>
          <div className={styles.editorHint}>Tap steps to program a groove. This original prototype uses browser synthesis; user-uploaded sample playback is a future milestone.</div>
        </div>}
        {panel === "piano" && <div className={styles.pianoWrapper}><ComposerWorkbench key={session.sessionName} projectName={session.sessionName} onAsk={(text) => { void copyText(text, "Handoff instructions copied for FL Studio"); setStatus("Gopher handoff generated. Copy and paste into FL Studio's Gopher panel."); }} /></div>}
        {panel === "mixer" && <div className={styles.editorBody}>
          <div className={styles.editorIntro}><strong>Mixer planning console</strong><span>Faders are saved as project planning metadata — no live DSP connection</span></div>
          <div className={styles.mixerGrid}>
            {LANES.map(({ name, color }) => <div key={name} className={mixerInspect === name ? styles.selectedMixer : styles.mixerStrip}>
              <button className={styles.stripName} onClick={() => setMixerInspect(name)} style={{ color }}>{name}</button>
              <div className={styles.meter} aria-label={name + " level plan"}><span style={{height: session.lanes[name].muted ? "0%" : session.lanes[name].volume + "%", background: color}}/></div>
              <input aria-label={name + " planned level"} type="range" min="0" max="100" value={session.lanes[name].volume}
                onChange={(e) => updateLane(name, { volume: Number(e.target.value) })} />
              <span>{session.lanes[name].volume}%</span>
              <div className={styles.mixerButtons}>
                <button aria-pressed={session.lanes[name].solo} onClick={() => updateLane(name, { solo: !session.lanes[name].solo })}>S</button>
                <button aria-pressed={session.lanes[name].muted} onClick={() => updateLane(name, { muted: !session.lanes[name].muted })}>M</button>
              </div>
            </div>)}
          </div>
          <p className={styles.editorHint}>Selected: {mixerInspect}. Import stems and connect a processing engine before these controls can modify real audio.</p>
        </div>}
      </section>
    </div>
  );

  return <main className={styles.shell}>
    <header className={styles.topBar}>
      <div className={styles.brand}><Image src="/brand/nastor-waveform-mark.svg" alt="" width={34} height={34} /><div><strong>NASTOR <span>AI STUDIO</span></strong><small>Production room · Preview</small></div></div>
      <nav className={styles.mainNav} aria-label="Main workspace">
        <button className={mode === "studio" ? styles.activeNav : ""} onClick={() => switchMode("studio")}>Make music</button>
        <button className={mode === "assets" ? styles.activeNav : ""} onClick={() => switchMode("assets")}>My sounds</button>
        <button className={mode === "collab" ? styles.activeNav : ""} onClick={() => switchMode("collab")}>Collaborate</button>
      </nav>
      <div className={styles.headerActions}>
        <span className={styles.saveIndicator}><Check size={13}/> Saved here</span>
        <button aria-pressed={mobileBrowser} aria-label={mobileBrowser ? "Hide project browser" : "Show project browser"} title="Browse sounds and projects" onClick={() => setMobileBrowser(value => !value)}><FolderOpen size={16}/> Browser</button>
        <button aria-pressed={showRight} aria-label={showRight ? "Hide studio assistant" : "Show studio assistant"} onClick={() => {setRightPanel("copilot");setShowRight(value => !value);}}><Sparkles size={16}/> Assistant</button>
        <button className={styles.exportCTA} onClick={exportHandoff}><Download size={16}/> Export brief</button>
      </div>
    </header>

    <div className={styles.transport}>
      <button className={styles.mobileMenu} aria-label={mobileBrowser ? "Close browser" : "Open browser"} onClick={() => setMobileBrowser(!mobileBrowser)}><Menu size={19}/></button>
      <label className={styles.projectTitle}>PROJECT <input aria-label="Project name" value={session.sessionName} onChange={(event) => chooseProject(event.target.value)} maxLength={90}/></label>
      <div className={styles.transportControls}>
        <button title="Return to bar one" aria-label="Go to start" onClick={() => {setBarPlayhead(1);setArrangePlaying(false);}}><ChevronLeft size={16}/></button>
        <button className={styles.transportPlay} onClick={() => setArrangePlaying(!arrangePlaying)}>{arrangePlaying ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}{arrangePlaying ? "Pause" : "Scan bars"}</button>
        <span className={styles.barCounter}>BAR {String(barPlayhead).padStart(2,"0")} / 32</span>
      </div>
      <label>BPM <input aria-label="Session tempo" type="number" min="50" max="220" value={session.bpm} onChange={e=>updateSession({bpm:Math.max(50,Math.min(220,Number(e.target.value)||120))})}/></label>
      <label>KEY <select aria-label="Session key" value={session.root} onChange={e=>updateSession({root:e.target.value})}>{KEY_NAMES.map(key=><option key={key}>{key}</option>)}</select></label>
      <label>MODE <select aria-label="Session scale mode" value={session.mode} onChange={e=>updateSession({mode:e.target.value})}><option value="minor">minor</option><option value="major">major</option><option value="dorian">dorian</option></select></label>
      <span className={styles.transportWarning}>Arrangement preview moves the playhead; actual music plays in editor tools.</span>
    </div>

    <div className={[styles.mainGrid, !mobileBrowser ? styles.noBrowser : "", !showRight ? styles.noAssistant : ""].filter(Boolean).join(" ")}>
      <aside className={[styles.browser, mobileBrowser?styles.mobileBrowser:""].join(" ")} aria-label="Project and sound browser">
        <div className={styles.browserTitle}><strong><Folder size={16}/> PROJECT BROWSER</strong><button aria-label="Close browser" onClick={() => setMobileBrowser(false)}><X size={16}/></button></div>
        <button className={styles.browserItem} onClick={()=>switchMode("studio")}><ListMusic size={16}/> Arrangement <span>{summary.clips}</span></button>
        <button className={styles.browserItem} onClick={()=>{switchMode("studio");setPanel("channel")}}><Layers3 size={16}/> Beat maker</button>
        <button className={styles.browserItem} onClick={()=>{switchMode("studio");setPanel("piano")}}><FileMusic size={16}/> Chords & MIDI</button>
        <button className={styles.browserItem} onClick={()=>switchMode("assets")}><AudioLines size={16}/> My sounds <span>{assets.length}</span></button>
        <button className={styles.browserItem} onClick={()=>switchMode("collab")}><Users size={16}/> Collaborators <span>{session.inviteDrafts.length}</span></button>
        <div className={styles.browserDivider}/>
        <strong className={styles.browserGroup}>SESSION CONTROL</strong>
        <button className={styles.browserItem} onClick={()=>{setRightPanel("copilot");setShowRight(true)}}><Bot size={16}/> AI assistant</button>
        <button className={styles.browserItem} onClick={()=>{setRightPanel("collab");setShowRight(true)}}><MessageSquare size={16}/> Team tasks <span>{summary.openTasks}</span></button>
        <button className={styles.browserItem} onClick={()=>filePicker.current?.click()}><Upload size={16}/> Add reference</button>
        <div className={styles.browserFoot}><span>SESSION / PROTOTYPE</span><p>Playlist arrangement is an editable plan. File sharing, real analysis and FL Studio remote control require connected services.</p><a href="/legacy">See original layout</a></div>
      </aside>

      {mode === "studio" ? studioPane : mode === "assets" ? <section className={styles.fullPanel}>
        <div className={styles.panelHeading}><div><span className={styles.eyebrow}>ASSET VAULT · LOCAL PREVIEW</span><h2>Sounds, stems and references</h2></div>
          <button onClick={()=>filePicker.current?.click()}><Upload size={15}/> Add files</button></div>
        <p className={styles.helpText}>Choose your own WAV, MP3, MIDI, FLP or ZIP files. This view holds them only while the browser tab stays open. They are not uploaded, backed up or processed by an AI service.</p>
        <div className={styles.assetSearch}><Search size={17}/><input value={assetQuery} onChange={e=>setAssetQuery(e.target.value)} placeholder="Search selected files" aria-label="Search selected files"/></div>
        <div className={styles.assetList}>{availableAssets.length ? availableAssets.map(asset => <button key={asset.id} className={activeAsset === asset.id ? styles.assetActive : styles.assetItem} onClick={()=>setActiveAsset(asset.id)}>
          <FileAudio size={18}/><span><strong>{asset.name}</strong><small>{formatBytes(asset.size)} · {asset.type || "File"}</small></span>
          <span onClick={e=>{e.stopPropagation();removeAsset(asset.id)}} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();removeAsset(asset.id)}}} aria-label={"Remove "+asset.name}><Trash2 size={15}/></span>
        </button>) : <div className={styles.emptyState}><FolderOpen size={36}/><strong>No sound files selected yet</strong><p>Add a local audio reference, loop, sample pack or MIDI file to start collecting a session-specific library.</p></div>}</div>
        {currentAsset && <div className={styles.assetPreview}><strong>{currentAsset.name}</strong>
          {currentAsset.url ? <audio controls src={currentAsset.url}/> : <p>Metadata only; this file type cannot preview as audio in the browser.</p>}
          <p>Reference listening only. BPM, chord/key detection and mastering comparison have not been connected.</p></div>}
      </section> : <section className={styles.fullPanel}>
        <div className={styles.panelHeading}><div><span className={styles.eyebrow}>PRODUCER ROOM</span><h2>Collaboration & handoffs</h2></div><button onClick={exportHandoff}><Download size={15}/> Export brief</button></div>
        <p className={styles.helpText}>Coordinate co-producers, vocalists and mixing engineers in a shared production plan. Current invites and tasks are saved locally; secure invitations and cloud collaboration will follow.</p>
        <div className={styles.collabContent}>
          <section className={styles.collabCard}><h3><Users size={17}/> Invite a collaborator</h3>
            <form onSubmit={e=>{e.preventDefault();saveInviteDraft()}}><label>Email address<input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="producer@example.com" required/></label>
              <label>Project role<select value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>{seededCollaboratorRoles.map(r=><option key={r}>{r}</option>)}</select></label>
              <button type="submit"><Plus size={16}/> Create invite draft</button></form>
            <div className={styles.inviteList}>{session.inviteDrafts.map(invite=><div className={styles.invite} key={invite.id}><span><strong>{invite.email}</strong><small>{invite.role} · Draft, not sent</small></span>
              <button onClick={()=>copyText(inviteMessage(invite.email,invite.role),"Invitation text copied. Send it through your own approved channel.")}><Copy size={14}/> Copy</button>
              <button aria-label={"Remove draft "+invite.email} onClick={()=>updateSession({inviteDrafts:session.inviteDrafts.filter(x=>x.id!==invite.id)})}><X size={14}/></button></div>)}</div>
          </section>
          <section className={styles.collabCard}><h3><ClipboardList size={17}/> Production to-dos</h3>
            <form onSubmit={e=>{e.preventDefault();addTask(taskText,selectedClip?.id)}} className={styles.taskForm}><input value={taskText} onChange={e=>setTaskText(e.target.value)} placeholder="e.g. Replace bassline at bar 17" aria-label="New production task"/><button type="submit"><Plus size={16}/></button></form>
            {session.tasks.map(task=><label key={task.id} className={styles.taskRow}><input type="checkbox" checked={task.done} onChange={e=>updateSession({tasks:session.tasks.map(t=>t.id===task.id?{...t,done:e.target.checked}:t)})}/><span className={task.done ? styles.taskDone : ""}>{task.message}</span><button aria-label="Remove task" onClick={e=>{e.preventDefault();updateSession({tasks:session.tasks.filter(x=>x.id!==task.id)})}}><X size={15}/></button></label>)}
          </section>
          <section className={styles.collabCard}><h3><MessageSquare size={17}/> Session producer notes</h3><textarea rows={7} value={session.notes} onChange={e=>updateSession({notes:e.target.value.slice(0,5000)})} placeholder="Arrangement ideas, mix feedback, vocal direction and pending decisions..." aria-label="Session notes"/><p>Notes are autosaved to this browser, not shared with collaborators.</p></section>
        </div>
      </section>}

      <aside className={[styles.rightRail,showRight?"":styles.rightHidden].join(" ")} aria-label="Production intelligence and collaboration">
        <div className={styles.rightTabs}><button className={rightPanel === "copilot"?styles.rightActive:""} onClick={()=>setRightPanel("copilot")}><Sparkles size={15}/> Copilot</button>
          <button className={rightPanel === "collab"?styles.rightActive:""} onClick={()=>setRightPanel("collab")}><Users size={15}/> Team</button>
          <button className={styles.collapseRight} title="Hide right panel" onClick={()=>setShowRight(false)}><X size={16}/></button></div>
        {rightPanel === "copilot" ? <div className={styles.railBody}>
          <span className={styles.eyebrow}>PRODUCTION INSIGHT · LOCAL RULES</span>
          <h3>Keep the creative momentum.</h3>
          <p className={styles.helpText}>Your session uses {session.bpm} BPM in {session.root} {session.mode}. The arrangement contains {summary.clips} clips across {summary.covered} of 32 bars.</p>
          <div className={styles.insight}><Activity size={16}/><div><strong>Arrangement health</strong><p>{summary.covered < 22 ? "The arrangement has plenty of space. Try bringing the hook back in the final eight bars." : "Most bars contain ideas. Create breathing room before the drop and verify low-end density."}</p></div></div>
          <div className={styles.insight}><Headphones size={16}/><div><strong>Producer move</strong><p>{selectedClip ? "Selected: "+selectedClip.name+". Compare this section with the preceding eight bars, then decide what changes." : "Select a clip in the Playlist to receive section-specific coaching."}</p></div></div>
          <div className={styles.promptBuilder}><label>Choose an assistant mission<select value={promptTask} onChange={e=>setPromptTask(e.target.value)}>
              {["Arrangement review","Improve the groove","Check mix balance","Generate chords","Organize session","Producer handoff"].map(x=><option key={x}>{x}</option>)}
            </select></label><textarea readOnly value={prompt} aria-label="Generated FL Studio Gopher handoff" rows={6}/>
            <button className={styles.primaryButton} onClick={()=>copyText(prompt,"Production prompt copied. Paste it into FL Studio Gopher, or your preferred assistant.")}><Copy size={15}/> Copy Gopher prompt</button>
            <button onClick={()=>addTask(promptTask+" — "+(selectedClip?.name??"whole session"),selectedClip?.id)}><Plus size={15}/> Add as producer task</button></div>
          <p className={styles.railFoot}>This Copilot currently creates deterministic project-specific guidance. Real audio analysis, AI reasoning and remote FL Studio control are separate integrations.</p>
        </div> : <div className={styles.railBody}><span className={styles.eyebrow}>COLLABORATOR DESK</span>
          <h3>Producer handoff</h3><p className={styles.helpText}>Manage clear responsibilities before sharing stems, MIDI or FLP handoff material.</p>
          <div className={styles.statLine}><span>Invitation drafts</span><strong>{session.inviteDrafts.length}</strong></div>
          <div className={styles.statLine}><span>Open tasks</span><strong>{summary.openTasks}</strong></div>
          <div className={styles.statLine}><span>Session notes</span><strong>{session.notes.trim()?"Saved":"Empty"}</strong></div>
          <button className={styles.primaryButton} onClick={()=>switchMode("collab")}><Users size={16}/> Open collaboration desk</button>
          <button onClick={exportHandoff}><Download size={16}/> Download project brief</button>
          <p className={styles.railFoot}>Secure multi-user sessions are not enabled; inviting someone currently creates a draft only.</p>
        </div>}
      </aside>
    </div>

    <input ref={filePicker} type="file" hidden multiple accept="audio/*,.wav,.mp3,.aiff,.flac,.mid,.midi,.flp,.zip,.json" onChange={importAssets} aria-label="Choose production files"/>
    
    <footer className={styles.statusBar}><span><i/> Session ready</span><span>{status}</span><span>{session.bpm} BPM · {session.root} {session.mode} · 4/4</span></footer>
  </main>;
}
