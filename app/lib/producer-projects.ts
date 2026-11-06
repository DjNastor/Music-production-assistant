/**
 * Browser-local session library for Nastor AI Studio.
 * Explicitly NOT cloud sync or multi-user collaboration.
 */
export const CURRENT_SESSION_KEY = "nastor-production-room-v1";
export const PROJECT_LIBRARY_KEY = "nastor-project-library-v1";
export type ProducerLane = "Drums" | "Bass" | "Chords" | "Lead" | "Vocals" | "FX";
export type SessionClip = { id: string; lane: ProducerLane; start: number; length: number; name: string };
export type SessionState = {
  sessionId?: string;
  bpm: number;
  root: string;
  mode: string;
  clips: SessionClip[];
  lanes: Record<ProducerLane, { volume: number; muted: boolean; solo: boolean }>;
  tasks: { id: string; message: string; done: boolean; clipId?: string }[];
  notes: string;
  sessionName: string;
  inviteDrafts: { id: string; email: string; role: string }[];
};
export type ProjectRecord = {
  id: string;
  title: string;
  updatedAt: string;
  bpm: number;
  key: string;
  clipCount: number;
  snapshot: SessionState;
};
const CHANNELS: ProducerLane[] = ["Drums","Bass","Chords","Lead","Vocals","FX"];
const MAX_PROJECTS = 30;

export function isSession(value: unknown): value is SessionState {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<SessionState>;
  return typeof s.sessionName === "string" && s.sessionName.length <= 90 &&
    typeof s.bpm === "number" && s.bpm >= 50 && s.bpm <= 220 &&
    typeof s.root === "string" && typeof s.mode === "string" &&
    Array.isArray(s.clips) && s.clips.length <= 1000 &&
    s.clips.every((clip) => clip && typeof clip.name === "string" &&
      CHANNELS.includes(clip.lane) && Number.isInteger(clip.start) && clip.start >= 1 && clip.start <= 32 &&
      Number.isInteger(clip.length) && clip.length >= 1 && clip.start + clip.length <= 33) &&
    !!s.lanes && CHANNELS.every((lane) => {
      const config = s.lanes?.[lane];
      return config && Number.isFinite(config.volume) && config.volume >= 0 && config.volume <= 100 &&
        typeof config.muted === "boolean" && typeof config.solo === "boolean";
    }) &&
    Array.isArray(s.tasks) && Array.isArray(s.inviteDrafts) && typeof s.notes === "string";
}
function uniqueId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID() : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}
export function getCurrentSession(): SessionState | null {
  try {
    const raw = storage()?.getItem(CURRENT_SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSession(parsed) ? parsed : null;
  } catch { return null; }
}
export function listProjects(): ProjectRecord[] {
  try {
    const raw = storage()?.getItem(PROJECT_LIBRARY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is ProjectRecord =>
      value && typeof value === "object" && typeof value.id === "string" &&
      typeof value.title === "string" && typeof value.updatedAt === "string" &&
      isSession(value.snapshot)).slice(0, MAX_PROJECTS);
  } catch { return []; }
}
export function rememberProject(session: SessionState): boolean {
  if (!isSession(session)) return false;
  const target = storage();
  if (!target) return false;
  const id = session.sessionId || "original-session";
  const snapshot = { ...session, sessionId: id };
  const entry: ProjectRecord = {
    id, title: snapshot.sessionName.trim() || "Untitled record",
    updatedAt: new Date().toISOString(), bpm: snapshot.bpm,
    key: snapshot.root + " " + snapshot.mode,
    clipCount: snapshot.clips.length, snapshot,
  };
  try {
    const others = listProjects().filter((project) => project.id !== id);
    target.setItem(PROJECT_LIBRARY_KEY, JSON.stringify([entry, ...others].slice(0, MAX_PROJECTS)));
    target.setItem(CURRENT_SESSION_KEY, JSON.stringify(snapshot));
    return true;
  } catch { return false; }
}
export function activateProject(project: ProjectRecord): boolean {
  if (!isSession(project.snapshot)) return false;
  return rememberProject(project.snapshot);
}
export function makeBlankSession(name: string): SessionState {
  const lanes = Object.fromEntries(CHANNELS.map((lane) =>
    [lane, { volume: 75, muted: false, solo: false }])) as SessionState["lanes"];
  return {
    sessionId: uniqueId(), sessionName: name.trim().slice(0, 90) || "Untitled record",
    bpm: 120, root: "A", mode: "minor",
    clips: [], lanes, tasks: [], notes: "", inviteDrafts: [],
  };
}
export function removeProject(projectId: string): void {
  try {
    const target = storage();
    const current = getCurrentSession();
    if (!target || current?.sessionId === projectId) return;
    target.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(listProjects().filter((p) => p.id !== projectId)));
  } catch { /* Retain saved data if storage is unavailable */ }
}
