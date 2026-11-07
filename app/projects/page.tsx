"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, AudioLines, CalendarDays, CheckCircle2, Circle,
  ClipboardCheck, Download, FileAudio, FolderPlus, ListChecks, PauseCircle,
  Plus, Sparkles, Trash2, Upload,
} from "lucide-react";
import {
  buildFinishingTasks, coachingTips, completion, isFinishProject, listFinishProjects,
  nextTask, newId, PHASE_NAMES, PHASES, removeFinishProject, saveFinishProject,
  type FinishPhase, type FinishProject, type FinishStatus,
} from "../lib/finish-projects";
import {
  deleteReferenceAudio, getReferenceAudio, saveReferenceAudio, MAX_REFERENCE_BYTES,
} from "../lib/finish-audio";
import { activateProject, listProjects, type ProjectRecord } from "../lib/producer-projects";
import styles from "./projects.module.css";

type StatusFilter = "all" | FinishStatus;

const statusLabels: Record<FinishStatus, string> = {
  planned: "Upcoming", "in-progress": "In progress", "on-hold": "On hold", finished: "Finished",
};
const dates = (date: string) => {
  if (!date) return "No deadline";
  const parsed = new Date(date + "T12:00:00");
  return Number.isNaN(parsed.getTime()) ? "Date not set"
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
function exportBrief(project: FinishProject) {
  const output = {
    product: "Nastor AI Studio", exportType: "project-finishing-brief",
    exportedAt: new Date().toISOString(),
    project, note: "Project tracking data only. No WAV, MP3 or other audio file is embedded.",
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nastor-finishing-brief-" + project.id.slice(0, 8) + ".json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ProjectFinisherPage() {
  const [items, setItems] = useState<FinishProject[]>([]);
  const [sessions, setSessions] = useState<ProjectRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [newOpen, setNewOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<FinishProject["kind"]>("Song");
  const [due, setDue] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [linkedId, setLinkedId] = useState("");
  const [phases, setPhases] = useState<FinishPhase[]>(["arrangement", "mixing"]);
  const [customTask, setCustomTask] = useState("");
  const [notice, setNotice] = useState("Track unfinished songs and choose the work needed to finish them.");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioRefresh, setAudioRefresh] = useState(0);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(listFinishProjects());
    setSessions(listProjects());
    setReady(true);
  }, []);
  const selected = useMemo(() => items.find(item => item.id === selectedId) ?? null, [items, selectedId]);
  const shown = useMemo(() => items.filter(item => filter === "all" || item.status === filter), [items, filter]);
  const unfinishedCount = items.filter(item => item.status !== "finished").length;
  const dueCount = items.filter(item => item.dueDate && item.status !== "finished" &&
    item.dueDate <= new Date().toISOString().slice(0, 10)).length;

  useEffect(() => {
    let alive = true;
    let newObjectUrl: string | null = null;
    setAudioUrl(null);
    if (selectedId) {
      getReferenceAudio(selectedId).then(audio => {
        if (alive && audio) {
          newObjectUrl = URL.createObjectURL(audio.file);
          setAudioUrl(newObjectUrl);
        }
      }).catch(() => { if (alive) setAudioUrl(null); });
    }
    return () => {
      alive = false;
      if (newObjectUrl) URL.revokeObjectURL(newObjectUrl);
    };
  }, [selectedId, audioRefresh]);

  function persist(project: FinishProject): boolean {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    if (!saveFinishProject(updated)) {
      setNotice("Changes couldn't be saved. Check browser storage settings or available space.");
      return false;
    }
    setItems(listFinishProjects());
    return true;
  }
  function patch(values: Partial<FinishProject>) {
    if (!selected) return;
    persist({ ...selected, ...values });
  }
  function togglePhase(phase: FinishPhase) {
    setPhases(current => current.includes(phase) ? current.filter(value => value !== phase) : [...current, phase]);
  }
  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = title.trim().slice(0, 100);
    if (!normalized || !phases.length) {
      setNotice("Enter a song title and select at least one remaining production stage.");
      return;
    }
    const now = new Date().toISOString();
    const project: FinishProject = {
      id: newId(), title: normalized, kind, status: "planned", dueDate: due,
      notes: newNotes.slice(0, 4000), linkedSessionId: linkedId || undefined,
      createdAt: now, updatedAt: now, tasks: buildFinishingTasks(phases),
    };
    if (!persist(project)) return;
    setSelectedId(project.id);
    setNewOpen(false);
    setTitle(""); setDue(""); setNewNotes(""); setLinkedId("");
    setPhases(["arrangement", "mixing"]);
    setNotice("Project registered. Your finishing checklist is ready, and progress is saved locally.");
  }
  function toggleTask(id: string) {
    if (!selected) return;
    const tasks = selected.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    const finished = tasks.length > 0 && tasks.every(t => t.done);
    patch({ tasks, status: finished ? "finished" : selected.status === "finished" ? "in-progress" : selected.status });
  }
  function addCustomTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !customTask.trim()) return;
    const lastPendingPhase = nextTask(selected)?.phase ?? "delivery";
    const task = { id: newId(), phase: lastPendingPhase, label: customTask.trim().slice(0, 240), done: false };
    patch({ tasks: [...selected.tasks, task], status: selected.status === "finished" ? "in-progress" : selected.status });
    setCustomTask("");
  }
  async function attachAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!selected || !file) return;
    if (file.size > MAX_REFERENCE_BYTES) {
      setNotice("Choose a reference recording under 30 MB. Full-resolution audio storage is planned.");
      return;
    }
    try {
      await saveReferenceAudio(selected.id, file);
      patch({ audioName: file.name.slice(0, 180) });
      setAudioRefresh(current => current + 1);
      setNotice("Reference audio saved on this device only. It was not uploaded to a cloud service.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Audio could not be saved on this device.");
    }
  }
  async function deleteAudio() {
    if (!selected) return;
    try {
      await deleteReferenceAudio(selected.id);
      patch({ audioName: undefined });
      setAudioRefresh(value => value + 1);
      setNotice("Device-local reference audio removed. The project checklist remains.");
    } catch {
      setNotice("Unable to remove the local reference audio.");
    }
  }
  async function deleteProject() {
    if (!selected || !window.confirm("Remove this local finishing record and its audio reference? This cannot be undone.")) return;
    const id = selected.id;
    if (!removeFinishProject(id)) { setNotice("Couldn't remove the project."); return; }
    try { await deleteReferenceAudio(id); } catch { /* The tracker record is already removed. */ }
    setSelectedId("");
    setItems(listFinishProjects());
    setNotice("Local finishing record removed. Linked studio sessions were not changed.");
  }
  function openLinkedSession() {
    if (!selected?.linkedSessionId) return;
    const session = sessions.find(s => s.id === selected.linkedSessionId);
    if (!session || !activateProject(session)) { setNotice("This linked studio session is no longer available here."); return; }
    window.location.assign("/studio");
  }

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <Link href="/" className={styles.back}><ArrowLeft size={16}/> Nastor AI Studio</Link>
      <span className={styles.identity}><AudioLines size={18}/> PROJECT FINISHER</span>
      <Link href="/studio" className={styles.studioLink}>Open Studio <ArrowRight size={15}/></Link>
    </header>

    <div className={styles.shell}>
      <section className={styles.intro}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={14}/> TURN YOUR UNFINISHED SONGS INTO RELEASES</span>
          <h1>Finish what you <em>started.</em></h1>
          <p>Register a track even if it isn't inside Nastor AI Studio. Tell us what is left - arrangement, mixing, mastering or delivery - and work through a clear finishing plan.</p>
          <div className={styles.counters}>
            <span><strong>{items.length}</strong> tracked projects</span>
            <span><strong>{unfinishedCount}</strong> unfinished</span>
            <span><strong>{dueCount}</strong> due or overdue</span>
          </div>
          <small><Circle size={12}/> Private beta: project details and audio references stay on this device; reminders and cloud sync are not connected.</small>
        </div>
        <button className={styles.primaryButton} onClick={() => setNewOpen(open => !open)}><FolderPlus size={18}/> {newOpen ? "Close form" : "Add unfinished song"}</button>
      </section>

      {newOpen && <section className={styles.newPanel} aria-label="Register an unfinished music project">
        <div className={styles.sectionHeader}><div><span className={styles.eyebrow}>NEW / UPCOMING</span><h2>Tell the studio what you're working on</h2></div></div>
        <form onSubmit={addProject} className={styles.newForm}>
          <label>Project or song title<input value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} placeholder="e.g. New Afro House single"/></label>
          <div className={styles.formColumns}>
            <label>Project type<select value={kind} onChange={e => setKind(e.target.value as FinishProject["kind"])}>{["Song","Remix","Beat","DJ mix","Other"].map(v => <option key={v}>{v}</option>)}</select></label>
            <label>Target completion date <span>(optional)</span><input type="date" value={due} onChange={e => setDue(e.target.value)}/></label>
          </div>
          <fieldset className={styles.phases}><legend>What still needs to be done?</legend>
            <div>{PHASES.map(phase => <label key={phase} className={phases.includes(phase) ? styles.phaseSelected : ""}>
              <input type="checkbox" checked={phases.includes(phase)} onChange={() => togglePhase(phase)}/>{PHASE_NAMES[phase]}
            </label>)}</div>
            <small>Example: select Arrangement and Mixing to create a practical task checklist for those stages.</small>
          </fieldset>
          <label>What should the assistant know?<textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} maxLength={4000} rows={3} placeholder="The beat and vocals are done. Needs a stronger build, final arrangement, vocal balance and mix." /></label>
          <label>Link to an existing studio session <span>(optional)</span><select value={linkedId} onChange={e => setLinkedId(e.target.value)}><option value="">No session linked</option>{sessions.map(session => <option key={session.id} value={session.id}>{session.title}</option>)}</select></label>
          <div className={styles.formFooter}><button className={styles.primaryButton} type="submit"><Plus size={16}/> Register project and build plan</button><button type="button" onClick={() => setNewOpen(false)}>Cancel</button></div>
        </form>
      </section>}

      <div className={styles.workspace}>
        <section className={styles.listPanel}>
          <div className={styles.sectionHeader}><div><span className={styles.eyebrow}>MY PRODUCTION PIPELINE</span><h2>Upcoming & unfinished</h2></div></div>
          <div className={styles.filters} role="group" aria-label="Filter music projects">
            {(["all","planned","in-progress","on-hold","finished"] as StatusFilter[]).map(item =>
              <button key={item} className={filter === item ? styles.activeFilter : ""} onClick={() => setFilter(item)}>{item === "all" ? "All" : statusLabels[item]}</button>
            )}
          </div>
          <div className={styles.records}>
            {ready && shown.length ? shown.map(project => {
              const percent = completion(project);
              return <button key={project.id} className={selectedId === project.id ? styles.selectedCard : styles.recordCard} onClick={() => setSelectedId(project.id)}>
                <span className={styles.recordTop}><span className={styles.recordKind}>{project.kind}</span><span className={styles.recordStatus} data-status={project.status}>{statusLabels[project.status]}</span></span>
                <strong>{project.title}</strong>
                <span className={styles.nextStep}>{nextTask(project)?.label ?? "Checklist complete - ready for review"}</span>
                <span className={styles.progressTrack}><span style={{ width: percent + "%" }}/></span>
                <span className={styles.progressMeta}><span><CalendarDays size={12}/> {dates(project.dueDate)}</span><strong>{percent}%</strong></span>
              </button>;
            }) : <div className={styles.empty}><ListChecks size={30}/><strong>{ready ? "No projects in this view" : "Loading projects..."}</strong><p>Start by registering a song and selecting the production stages still to complete.</p></div>}
          </div>
        </section>

        <section className={styles.detailPanel} aria-label="Finishing assistant">
          {selected ? <>
            <div className={styles.detailHeading}>
              <div><span className={styles.eyebrow}>YOUR FINISHING SESSION</span><h2>{selected.title}</h2><small>{selected.kind} - updated {new Date(selected.updatedAt).toLocaleDateString()}</small></div>
              <button onClick={() => exportBrief(selected)} title="Save finishing record as JSON" className={styles.iconButton}><Download size={18}/></button>
            </div>
            <div className={styles.detailFields}>
              <label>Progress status<select value={selected.status} onChange={e => patch({ status: e.target.value as FinishStatus })}>{(Object.keys(statusLabels) as FinishStatus[]).map(key => <option key={key} value={key}>{statusLabels[key]}</option>)}</select></label>
              <label>Target date<input type="date" value={selected.dueDate} onChange={e => patch({ dueDate: e.target.value })}/></label>
            </div>

            <section className={styles.progressSection}>
              <div className={styles.progressHeader}><h3>Finishing checklist</h3><span>{selected.tasks.filter(t => t.done).length}/{selected.tasks.length} steps - {completion(selected)}%</span></div>
              <div className={styles.largeProgress}><span style={{ width: completion(selected) + "%" }}/></div>
              <p>Progress reflects completed checklist steps, not automatic assessment of audio quality.</p>
              <div className={styles.tasks}>
                {selected.tasks.map(task => <label key={task.id} className={task.done ? styles.doneTask : styles.todoTask}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <span>{task.done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}</span>
                  <span><small>{PHASE_NAMES[task.phase]}</small>{task.label}</span>
                </label>)}
              </div>
              <form onSubmit={addCustomTask} className={styles.addTask}>
                <input value={customTask} onChange={e => setCustomTask(e.target.value)} maxLength={240} placeholder="Add your own finishing step..." aria-label="Add custom finishing step"/>
                <button type="submit" disabled={!customTask.trim()}><Plus size={15}/> Add</button>
              </form>
            </section>

            <section className={styles.coach}>
              <span className={styles.eyebrow}><Sparkles size={14}/> FINISHING ASSISTANT</span>
              <h3>{nextTask(selected) ? "Suggested focus for your next session" : "Checklist review"}</h3>
              <div className={styles.focus}><ClipboardCheck size={20}/><strong>{nextTask(selected)?.label ?? "Review the final deliverables and sign off."}</strong></div>
              <ul>{coachingTips(selected).map(tip => <li key={tip}>{tip}</li>)}</ul>
              <small>These recommendations are structured production guidance based on your selected stages, not AI analysis of uploaded audio.</small>
            </section>

            <section className={styles.audioSection}>
              <div className={styles.sectionHeader}><div><span className={styles.eyebrow}>OPTIONAL REFERENCE AUDIO</span><h3>Listen to your work in progress</h3></div></div>
              <input type="file" ref={uploadRef} hidden accept=".wav,.mp3,.m4a,.ogg,audio/*" onChange={attachAudio} aria-label="Attach local audio reference"/>
              <div className={styles.audioRow}>
                <button onClick={() => uploadRef.current?.click()}><Upload size={17}/> {selected.audioName ? "Replace reference" : "Add reference recording"}</button>
                {selected.audioName && <button onClick={() => void deleteAudio()}><Trash2 size={15}/> Remove</button>}
              </div>
              {selected.audioName && <p><FileAudio size={15}/>{selected.audioName}</p>}
              {audioUrl && <audio controls preload="none" src={audioUrl} aria-label="Project reference audio"/>}
              <small>WAV, MP3, M4A or OGG, maximum 30 MB. This stores a playable copy in this browser's IndexedDB, not in cloud storage or Fadr.</small>
            </section>
            <section className={styles.notesSection}>
              <h3>Project notes</h3>
              <textarea key={selected.id} defaultValue={selected.notes} onBlur={e => {
                if (e.target.value !== selected.notes) patch({ notes: e.target.value.slice(0, 4000) });
              }} maxLength={4000} rows={4} placeholder="What needs attention on the next production session?"/>
              <small>Notes save when you leave the field.</small>
            </section>
            <div className={styles.detailFooter}>
              {selected.linkedSessionId && <button className={styles.primaryButton} onClick={openLinkedSession}><AudioLines size={16}/> Open linked studio session</button>}
              <button onClick={() => patch({ status: "finished" })}><CheckCircle2 size={16}/> Mark finished</button>
              <button onClick={() => void deleteProject()} className={styles.danger}><Trash2 size={16}/> Remove record</button>
            </div>
          </> : <div className={styles.placeholder}><PauseCircle size={42}/><h2>Choose a song to finish</h2><p>Select an unfinished project on the left, or register an upcoming one. The app will show its current status, remaining tasks and a suggested next production focus.</p><button className={styles.primaryButton} onClick={() => setNewOpen(true)}><Plus size={16}/> Add unfinished song</button></div>}
        </section>
      </div>
    </div>
    <div className={styles.toast} role="status">{notice}</div>
  </main>;
}
