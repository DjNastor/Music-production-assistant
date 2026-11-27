"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listProjects, getCurrentSession, type ProjectRecord } from "../lib/producer-projects";
import { listFinishProjects, completion, type FinishProject } from "../lib/finish-projects";

const NOTES_KEY = "nastor-master-workspace-notes-v1";
const tools = [
  { title: "Production Home", href: "/", description: "Create, continue and import saved sessions." },
  { title: "Studio & MIDI", href: "/studio", description: "Arrangement, beats, chords and producer tools." },
  { title: "Audio & Stems", href: "/studio?view=fadr", description: "Fadr tools; provider access and processing are not guaranteed." },
  { title: "Project Finisher", href: "/projects", description: "Track unfinished songs, checklists and progress." },
  { title: "Assets", href: "/studio?view=assets", description: "Audition local reference files." },
  { title: "Collaboration", href: "/studio?view=collab", description: "Local producer handoffs and invitation drafts." },
];

export default function MasterWorkspace() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [finishing, setFinishing] = useState<FinishProject[]>([]);
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Loading local workspace...");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProjects(listProjects());
      setFinishing(listFinishProjects());
      try {
        setNotes(window.localStorage.getItem(NOTES_KEY) || "");
        setNotice("Local workspace loaded. No cloud sync is connected.");
      } catch {
        setNotice("Local storage is unavailable. Export important notes before leaving.");
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function saveNotes() {
    try {
      window.localStorage.setItem(NOTES_KEY, notes);
      setNotice("Workspace notes saved on this device.");
    } catch {
      setNotice("Notes could not be saved. Copy them before leaving.");
    }
  }
  function exportWorkspace() {
    const snapshot = {
      product: "Nastor AI Studio", schemaVersion: 1, exportType: "master-workspace-snapshot",
      exportedAt: new Date().toISOString(), notes,
      currentSession: getCurrentSession(), productions: listProjects(), finishing: listFinishProjects(),
      limitations: "Planning data only. No audio files, credentials, provider jobs or Tasker tasks included. This combined snapshot is for reference; whole-workspace restore is not implemented.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "nastor-workspace-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Snapshot export requested. Verify the download in your browser. Android WebView downloads may require Chrome.");
  }
  return <main className="min-h-screen bg-[#09090b] px-4 py-6 text-zinc-100 sm:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <Link href="/" className="text-sm font-semibold text-amber-300">← Production Home</Link>
        <span className="text-xs text-zinc-400">NASTOR AI STUDIO · LOCAL BETA</span>
      </header>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Unified workspace</p>
        <h1 className="mt-2 text-3xl font-bold">Master Workspace</h1>
        <p className="mt-2 text-sm text-zinc-300">Your production tools, unfinished songs and ongoing decisions in one place. Existing projects remain in their original browser storage.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-950 p-4"><p className="text-xs text-zinc-400">Saved productions</p><strong className="text-2xl">{ready ? projects.length : "—"}</strong></div>
          <div className="rounded-lg bg-zinc-950 p-4"><p className="text-xs text-zinc-400">Unfinished songs</p><strong className="text-2xl">{ready ? finishing.filter(p => p.status !== "finished").length : "—"}</strong></div>
          <div className="rounded-lg bg-zinc-950 p-4"><p className="text-xs text-zinc-400">Cloud sync</p><strong className="text-sm">Not connected</strong></div>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Studio tools">
        {tools.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-amber-400 focus-visible:outline-2 focus-visible:outline-amber-300"><h2 className="font-semibold text-amber-200">{tool.title} →</h2><p className="mt-2 text-sm text-zinc-400">{tool.description}</p></Link>)}
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Workspace memory</h2>
        <p className="mt-1 text-sm text-zinc-400">Save your goals, next actions and production decisions here. This is a local notebook, not an AI memory service. Do not enter passwords or API keys.</p>
        <label htmlFor="workspace-notes" className="mt-4 block text-sm">Production notes</label>
        <textarea id="workspace-notes" value={notes} disabled={!ready} maxLength={12000} onChange={e => setNotes(e.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" placeholder="Current tracks, priorities, ideas and next steps..." />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={!ready} onClick={saveNotes} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50">Save notes</button>
          <button type="button" disabled={!ready} onClick={exportWorkspace} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50">Export workspace snapshot</button>
        </div>
        <p className="mt-3 text-xs text-zinc-400">Snapshot includes local planning records and notes only. It does not include audio or support one-click restore. Use Production Home to export and import individual sessions.</p>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Finishing queue</h2>
        {finishing.length ? <ul className="mt-3 space-y-3">{finishing.slice(0, 10).map(p => <li key={p.id} className="flex justify-between gap-3 border-b border-zinc-800 pb-2"><span>{p.title}</span><span className="text-sm text-amber-300">{completion(p)}% checklist</span></li>)}</ul> : <p className="mt-2 text-sm text-zinc-400">No saved finishing projects on this device.</p>}
        <Link href="/projects" className="mt-3 inline-block text-sm text-amber-300">Open Project Finisher →</Link>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Integration status</h2>
        <p className="mt-2 text-sm text-zinc-300">Tasker: use the native Automation Centre in the Android 0.3 beta when installed and configured. Treblo/Suno: not connected. FL Studio Link: real-device validation required. Image generation and authenticated cloud memory are not implemented here.</p>
      </section>
      <p role="status" className="text-sm text-zinc-400">{notice}</p>
    </div>
  </main>;
}
