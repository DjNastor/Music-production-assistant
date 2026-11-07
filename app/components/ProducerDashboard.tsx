"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Check, Clock3, CloudOff, Download, FileAudio, FolderOpen,
  Headphones, Layers3, Music2, Plus, Sparkles, Upload, Users, ClipboardCheck,
} from "lucide-react";
import {
  activateProject, getCurrentSession, isSession, listProjects, makeBlankSession,
  rememberProject, type ProjectRecord, type SessionState,
} from "../lib/producer-projects";
import styles from "./ProducerDashboard.module.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function downloadManifest(data: object, name: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
function shortDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Saved locally";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function navigateToStudio(view?: "assets" | "collab") {
  window.location.assign(view ? "/studio?view=" + view : "/studio");
}

export default function ProducerDashboard() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [current, setCurrent] = useState<SessionState | null>(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [installRequest, setInstallRequest] = useState<InstallPromptEvent | null>(null);
  const [notice, setNotice] = useState("Your songs and collaboration drafts stay on this device unless you export them.");
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrent(getCurrentSession());
      setProjects(listProjects());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallRequest(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);
  async function installApp() {
    if (!installRequest) return;
    try {
      await installRequest.prompt();
      const choice = await installRequest.userChoice;
      setNotice(choice.outcome === "accepted"
        ? "Install accepted. Your device will complete installation."
        : "Installation dismissed. You can install later from your browser menu.");
      setInstallRequest(null);
    } catch {
      setNotice("Installation is unavailable here. Try your browser's Install App menu.");
    }
  }
  function startNew() {
    const next = makeBlankSession(title);
    if (!rememberProject(next)) {
      setNotice("This browser could not save the project. Check that local storage is enabled before starting.");
      return;
    }
    navigateToStudio();
  }
  function openProject(project: ProjectRecord) {
    if (!activateProject(project)) {
      setNotice("Unable to load the project. Check browser storage permissions.");
      return;
    }
    navigateToStudio();
  }
  async function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) { setNotice("Project JSON is too large (maximum 5 MB)."); return; }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const data = parsed && typeof parsed === "object" && "project" in parsed
        ? (parsed as {project: unknown}).project : parsed;
      if (!isSession(data)) throw new Error("This is not a supported Nastor project JSON.");
      const restored = { ...data, sessionId: makeBlankSession(data.sessionName).sessionId };
      if (!rememberProject(restored)) throw new Error("Browser storage is not available.");
      navigateToStudio();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to import project file.");
    }
  }
  function exportProject(project: ProjectRecord) {
    downloadManifest({
      product: "Nastor AI Studio", schemaVersion: 1,
      exportedAt: new Date().toISOString(), project: project.snapshot,
      note: "Browser-local project planning data. No audio assets are embedded.",
    }, "nastor-project-" + project.id.slice(0, 8) + ".json");
    setNotice("Project backup downloaded. It does not include audio, WAV files or samples.");
  }
  return <main className={styles.dashboard}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Nastor AI Studio home">
        <Image src="/brand/nastor-waveform-mark.svg" width={38} height={38} alt="" />
        <span><strong>NASTOR <em>AI STUDIO</em></strong><small>Make music. Together.</small></span>
      </Link>
      <nav aria-label="Studio links">
        <Link className={styles.active} href="/">Home</Link>
        <Link href="/studio">Studio</Link>
        <Link href="/studio?view=assets">Sounds</Link>
        <Link href="/studio?view=collab">Collaboration</Link>
        <Link href="/projects">Project Finisher</Link>
      </nav>
      <Link className={styles.openStudio} href="/studio"><Headphones size={16}/> Open studio <ArrowRight size={14}/></Link>
    </header>

    <div className={styles.content}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}><Sparkles size={14}/> YOUR PRODUCTION HOME</span>
          <h1>Ready to make<br/><em>something great?</em></h1>
          <p>One place to sketch beats, write chords, organize a track and hand your next record to another producer. Start with an idea—open the deeper tools only when you need them.</p>
          <div className={styles.heroActions}>
            <button className={styles.cta} onClick={() => setShowNew((v) => !v)}><Plus size={18}/> New production</button>
            <button onClick={() => navigateToStudio()}><Layers3 size={17}/> {current ? "Continue session" : "Open studio"}</button>
            {installRequest && <button onClick={() => void installApp()}><Download size={17}/> Install app</button>}
          </div>
          <p className={styles.localNote}><CloudOff size={13}/> Local beta — no cloud account or FL Studio sync connected</p>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image src="/brand/dj-nastor-studio.jpg" alt="" fill sizes="(max-width: 750px) 240px, 390px" priority className={styles.heroImage}/>
          <span className={styles.artOverlay}>CREATE / COLLABORATE / FINISH</span>
        </div>
      </section>

      {showNew && <section className={styles.newCard} aria-label="Create a music project">
        <div><span className={styles.eyebrow}>NEW MUSIC SESSION</span><h2>What are you calling this track?</h2></div>
        <form onSubmit={(event) => { event.preventDefault(); startNew(); }}>
          <input autoFocus placeholder="e.g. Midnight in Durban" aria-label="New project title" maxLength={90} value={title} onChange={(event)=>setTitle(event.target.value)} />
          <button type="submit"><Plus size={16}/> Create and open</button>
          <button type="button" onClick={() => setShowNew(false)}>Cancel</button>
        </form>
        <small>Creates an empty local 120 BPM session. No demo clips, no emails sent and no remote files changed.</small>
      </section>}

      <section className={styles.quick} aria-label="Quick actions">
        <div className={styles.sectionTitle}><div><span className={styles.eyebrow}>START HERE</span><h2>What would you like to do?</h2></div></div>
        <div className={styles.actionGrid}>
          <button onClick={() => navigateToStudio()}><span className={styles.actionIcon}><Music2/></span><strong>Make music</strong><small>Beats, chords, piano roll and arrangement</small><ArrowRight size={16}/></button>
          <button onClick={() => navigateToStudio("assets")}><span className={styles.actionIcon}><FileAudio/></span><strong>My sounds</strong><small>Choose and audition your own references</small><ArrowRight size={16}/></button>
          <button onClick={() => navigateToStudio("collab")}><span className={styles.actionIcon}><Users/></span><strong>Collaborate</strong><small>Producer tasks, invite drafts and handoffs</small><ArrowRight size={16}/></button>
          <button onClick={() => window.location.assign("/projects")}><span className={styles.actionIcon}><ClipboardCheck/></span><strong>Finish my songs</strong><small>Track unfinished projects, progress and next steps</small><ArrowRight size={16}/></button>
        </div>
      </section>

      <section className={styles.projects} aria-label="Your local productions">
        <div className={styles.sectionTitle}>
          <div><span className={styles.eyebrow}>LOCAL PROJECTS</span><h2>Your productions <span>{ready && projects.length > 0 ? projects.length + " saved" : ""}</span></h2></div>
          <div className={styles.projectActions}>
            <button onClick={() => importRef.current?.click()}><Upload size={16}/> Import project</button>
            <input type="file" ref={importRef} hidden accept=".json,application/json" onChange={importProject} aria-label="Import Nastor project JSON"/>
          </div>
        </div>
        {ready && projects.length ? <div className={styles.projectGrid}>
          {projects.slice(0, 9).map((project, index) => <article className={styles.projectCard} key={project.id}>
            <div className={styles.projectCover}>
              {index === 0 ? <Image src="/brand/nastor-portrait-art.svg" fill sizes="140px" alt="" /> : <Image src="/brand/nastor-waveform-mark.svg" width={46} height={46} alt="" />}
              <span className={styles.projectNumber}>SESSION {String(index+1).padStart(2,"0")}</span>
            </div>
            <div className={styles.projectDetails}>
              <strong>{project.title || "Untitled record"}</strong>
              <span><Clock3 size={12}/> {shortDate(project.updatedAt)}</span>
              <small>{project.bpm} BPM · {project.key} · {project.clipCount} arrangement ideas</small>
              <div><button onClick={() => openProject(project)}>Open project <ArrowRight size={14}/></button><button aria-label={"Download "+project.title+" backup"} title="Download project backup" onClick={() => exportProject(project)}><Download size={15}/></button></div>
            </div>
          </article>)}
        </div> : <div className={styles.emptyProjects}>
          <FolderOpen size={26}/>
          <div><strong>{ready ? "A blank canvas is waiting" : "Loading your projects..."}</strong><p>Start a production to save its arrangement, MIDI ideas and handoff notes in this browser. You can export a JSON backup anytime.</p></div>
          <button onClick={() => setShowNew(true)}><Plus size={16}/> Create project</button>
        </div>}
      </section>
      <footer className={styles.footer}><span><Check size={15}/> A clear workflow. The advanced DAW is one click away.</span><Link href="/legacy">Previous interface</Link></footer>
    </div>
    <div className={styles.toast} role="status">{notice}</div>
  </main>;
}
