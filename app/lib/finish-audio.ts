/**
 * Device-local reference audio for unfinished project cards.
 * The browser's IndexedDB stores the audio file; it is not uploaded to a server.
 */
const DB_NAME = "nastor-finish-audio-v1";
const STORE = "references";
export const MAX_REFERENCE_BYTES = 30 * 1024 * 1024;
type SavedAudio = { id: string; file: Blob; name: string };
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Audio storage is not supported here.")); return; }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open audio storage."));
  });
}
export async function saveReferenceAudio(id: string, file: File): Promise<void> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["wav", "mp3", "m4a", "ogg"].includes(ext || "") || file.size > MAX_REFERENCE_BYTES || file.size === 0) {
    throw new Error("Choose a WAV, MP3, M4A or OGG recording under 30 MB.");
  }
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ id, file, name: file.name } satisfies SavedAudio);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Couldn't save this file locally."));
      tx.onabort = () => reject(tx.error || new Error("Audio save was interrupted."));
    });
  } finally { db.close(); }
}
export async function getReferenceAudio(id: string): Promise<SavedAudio | undefined> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(id);
      request.onsuccess = () => resolve(request.result as SavedAudio | undefined);
      request.onerror = () => reject(request.error || new Error("Couldn't read the local reference."));
    });
  } finally { db.close(); }
}
export async function deleteReferenceAudio(id: string): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Couldn't delete the local reference."));
    });
  } finally { db.close(); }
}
