/**
 * A browser-local finishing register for musical work in progress.
 * This is not cloud sync or an AI mix/mastering service.
 */
export type FinishPhase = "writing" | "recording" | "arrangement" | "mixing" | "mastering" | "delivery";
export type FinishStatus = "planned" | "in-progress" | "on-hold" | "finished";
export type FinishTask = { id: string; phase: FinishPhase; label: string; done: boolean };
export type FinishProject = {
  id: string;
  title: string;
  kind: "Song" | "Remix" | "Beat" | "DJ mix" | "Other";
  status: FinishStatus;
  dueDate: string;
  notes: string;
  linkedSessionId?: string;
  audioName?: string;
  createdAt: string;
  updatedAt: string;
  tasks: FinishTask[];
};
export const FINISH_PROJECTS_KEY = "nastor-finish-projects-v1";
export const PHASE_NAMES: Record<FinishPhase, string> = {
  writing: "Writing", recording: "Recording", arrangement: "Arrangement",
  mixing: "Mixing", mastering: "Mastering", delivery: "Delivery",
};
export const PHASES: FinishPhase[] = [
  "writing", "recording", "arrangement", "mixing", "mastering", "delivery",
];
const LIMIT = 100;
const GUIDE: Record<FinishPhase, string[]> = {
  writing: [
    "Decide on the central musical idea and emotional direction.",
    "Finalize chord changes, lyrics, melodies and the main hook.",
    "Confirm the song key, tempo and reference tracks.",
  ],
  recording: [
    "Record or collect all missing vocal and instrument takes.",
    "Choose the best takes and remove clicks or unwanted noise.",
    "Label tracks and prepare a clean session for arrangement.",
  ],
  arrangement: [
    "Map intro, verse/groove, build, breakdown, drop and outro.",
    "Create transitions, fills and automation to keep momentum.",
    "Listen from start to finish and remove unnecessary repetitions.",
  ],
  mixing: [
    "Organize and gain-stage channels with headroom on the mix bus.",
    "Balance kick and bass, clean competing frequencies and check mono.",
    "Refine levels, EQ, dynamics, ambience and automation against references.",
  ],
  mastering: [
    "Review the final mix and export a clean premaster.",
    "Check tonal balance, dynamics, clipping and playback translation.",
    "Generate final masters in the required delivery formats.",
  ],
  delivery: [
    "Check track title, credits, writers, splits and release metadata.",
    "Export final WAV, MP3, instrumental and stems when required.",
    "Back up the project and confirm delivery or release approval.",
  ],
};
export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
export function buildFinishingTasks(phases: FinishPhase[]): FinishTask[] {
  return PHASES.filter(phase => phases.includes(phase)).flatMap(phase =>
    GUIDE[phase].map(label => ({ id: newId(), phase, label, done: false }))
  );
}
export function completion(project: FinishProject): number {
  if (!project.tasks.length) return project.status === "finished" ? 100 : 0;
  return Math.round(100 * project.tasks.filter(task => task.done).length / project.tasks.length);
}
export function nextTask(project: FinishProject): FinishTask | undefined {
  return project.tasks.find(task => !task.done);
}
export function coachingTips(project: FinishProject): string[] {
  const task = nextTask(project);
  if (!task) return project.status === "finished"
    ? ["Project marked finished. Back up your source files and delivery versions."]
    : ["All checklist items are complete. Review and mark the project finished when ready."];
  return GUIDE[task.phase];
}
export function isFinishProject(value: unknown): value is FinishProject {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<FinishProject>;
  return typeof p.id === "string" && p.id.length <= 120 &&
    typeof p.title === "string" && p.title.length > 0 && p.title.length <= 100 &&
    ["Song", "Remix", "Beat", "DJ mix", "Other"].includes(p.kind || "") &&
    ["planned", "in-progress", "on-hold", "finished"].includes(p.status || "") &&
    typeof p.dueDate === "string" && p.dueDate.length <= 12 &&
    typeof p.notes === "string" && p.notes.length <= 4000 &&
    typeof p.createdAt === "string" && typeof p.updatedAt === "string" &&
    (p.linkedSessionId === undefined || typeof p.linkedSessionId === "string") &&
    (p.audioName === undefined || typeof p.audioName === "string") &&
    Array.isArray(p.tasks) && p.tasks.length <= 100 &&
    p.tasks.every(t => t && typeof t.id === "string" && typeof t.label === "string" &&
      t.label.length <= 240 && typeof t.done === "boolean" &&
      PHASES.includes(t.phase));
}
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}
export function listFinishProjects(): FinishProject[] {
  try {
    const raw = storage()?.getItem(FINISH_PROJECTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isFinishProject).slice(0, LIMIT) : [];
  } catch { return []; }
}
export function saveFinishProject(project: FinishProject): boolean {
  if (!isFinishProject(project)) return false;
  const local = storage();
  if (!local) return false;
  try {
    const others = listFinishProjects().filter(p => p.id !== project.id);
    local.setItem(FINISH_PROJECTS_KEY, JSON.stringify([project, ...others].slice(0, LIMIT)));
    return true;
  } catch { return false; }
}
export function removeFinishProject(id: string): boolean {
  const local = storage();
  if (!local) return false;
  try {
    local.setItem(FINISH_PROJECTS_KEY, JSON.stringify(listFinishProjects().filter(p => p.id !== id)));
    return true;
  } catch { return false; }
}
