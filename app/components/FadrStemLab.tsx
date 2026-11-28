"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, CheckCircle2, Download, KeyRound, LoaderCircle, Music2, ShieldCheck, Sparkles, Upload } from "lucide-react";
import styles from "./FadrStemLab.module.css";

type JsonRecord = Record<string, unknown>;
type TrackOutput = { id: string; name: string; stemType: string | null; kind: "stem" | "midi" };
type Stage = "idle" | "uploading" | "processing" | "complete";
const MAX_SIZE = 100_000_000;

function record(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function string(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
async function requestFadr(access: string, action: string, fields: JsonRecord = {}): Promise<JsonRecord> {
  const response = await fetch("/api/fadr", {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/json", "x-studio-access": access },
    body: JSON.stringify({ action, ...fields }),
  });
  const data: unknown = await response.json();
  if (!record(data)) throw new Error("The stem service returned an unexpected response.");
  if (!response.ok) throw new Error(string(data.error) ? data.error : "Fadr request failed.");
  return data;
}

export default function FadrStemLab() {
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [access, setAccess] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [taskId, setTaskId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [tracks, setTracks] = useState<TrackOutput[]>([]);
  const [trackKey, setTrackKey] = useState<string | null>(null);
  const [tempo, setTempo] = useState<number | null>(null);
  const [message, setMessage] = useState("Choose your own MP3 or WAV to begin.");
  const [downloading, setDownloading] = useState("");
  const polling = useRef(false);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/fadr", { cache: "no-store" }).then(r => r.json()).then((value: unknown) => {
      if (active && record(value)) setConfigured(value.configured === true);
    }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const refresh = useCallback(async (id: string, sourceId: string) => {
    if (polling.current) return;
    polling.current = true;
    try {
      const task = await requestFadr(access, "task", { taskId: id });
      const n = task.progress;
      if (typeof n === "number") setProgress(Math.max(0, Math.min(100, Math.round(n))));
      if (string(task.message)) setMessage(task.message);
      if (task.complete === true) {
        const output = await requestFadr(access, "asset-status", { assetId: sourceId });
        const stemIds = Array.isArray(output.stems) ? output.stems.filter(string).slice(0, 20) : [];
        const midiIds = Array.isArray(output.midi) ? output.midi.filter(string).slice(0, 20) : [];
        const all: TrackOutput[] = await Promise.all([
          ...stemIds.map(async (asset: string): Promise<TrackOutput> => {
            const info = await requestFadr(access, "file-info", { assetId: asset });
            return { id: asset, name: string(info.name) ? info.name : "Separated stem",
              stemType: string(info.stemType) ? info.stemType : null, kind: "stem" };
          }),
          ...midiIds.map(async (asset: string): Promise<TrackOutput> => {
            const info = await requestFadr(access, "file-info", { assetId: asset });
            return { id: asset, name: string(info.name) ? info.name : "MIDI reference",
              stemType: string(info.stemType) ? info.stemType : null, kind: "midi" };
          }),
        ]);
        setTracks(all);
        setTrackKey(string(output.key) ? output.key : null);
        setTempo(typeof output.tempo === "number" ? output.tempo : null);
        setStage("complete");
        setMessage(all.length ? "Fadr finished. Review and download the generated stems and MIDI." :
          "Fadr finished, but the file list is empty. Retry checking the task or inspect your Fadr account.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn't check processing status.");
    } finally { polling.current = false; }
  }, [access]);

  useEffect(() => {
    if (stage !== "processing" || !taskId || !assetId || !access) return;
    const timer = window.setInterval(() => { void refresh(taskId, assetId); }, 5000);
    return () => window.clearInterval(timer);
  }, [stage, taskId, assetId, access, refresh]);

  function selectAudio(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    if (!/\.(mp3|wav)$/i.test(chosen.name) || chosen.size > MAX_SIZE || chosen.size === 0) {
      setMessage("Choose a non-empty MP3 or WAV smaller than 100 MB.");
      return;
    }
    setFile(chosen); setConsent(false); setStage("idle"); setTaskId(""); setAssetId("");
    setTracks([]); setTrackKey(null); setTempo(null); setProgress(null);
    setMessage("File selected. Review the billing notice and authorize processing.");
  }

  async function processAudio() {
    if (!file || !consent || !configured || access.length < 8 || stage !== "idle") return;
    setStage("uploading");
    setMessage("Getting Fadr's secure upload URL…");
    try {
      const extension = file.name.toLowerCase().endsWith(".wav") ? "wav" : "mp3";
      const signed = await requestFadr(access, "presign", { name: file.name, extension, size: file.size });
      if (!string(signed.uploadUrl) || !string(signed.s3Path)) throw new Error("Fadr did not provide an upload location.");
      const uploadUrl = new URL(signed.uploadUrl);
      if (uploadUrl.protocol !== "https:" || !uploadUrl.hostname.endsWith(".amazonaws.com")) {
        throw new Error("Unexpected upload destination.");
      }
      setMessage("Uploading your audio directly to Fadr…");
      const uploaded = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": extension === "mp3" ? "audio/mp3" : "audio/wav" },
        body: file,
      });
      if (!uploaded.ok) throw new Error("Audio upload failed (HTTP " + uploaded.status + ").");
      const asset = await requestFadr(access, "asset", { name: file.name, extension, s3Path: signed.s3Path });
      if (!string(asset.assetId)) throw new Error("Fadr did not register the audio asset.");
      setAssetId(asset.assetId);
      setMessage("Starting stem separation…");
      // Fadr bills this action. It only runs after the user's explicit checkbox and click.
      const task = await requestFadr(access, "stem", { assetId: asset.assetId, consent: true });
      if (!string(task.taskId)) throw new Error("Fadr did not return a processing task.");
      setTaskId(task.taskId);
      setStage("processing");
      setMessage("Fadr is separating the music. Leave this tab open to see progress.");
    } catch (error) {
      setStage("idle");
      setMessage(error instanceof Error ? error.message : "Unable to start the operation.");
    }
  }

  async function download(assetIdToGet: string) {
    if (!access) return;
    setDownloading(assetIdToGet);
    try {
      const result = await requestFadr(access, "download", { assetId: assetIdToGet, quality: "download" });
      if (!string(result.url)) throw new Error("No download link available.");
      const link = document.createElement("a");
      link.href = result.url; link.target = "_blank"; link.rel = "noopener noreferrer";
      document.body.appendChild(link); link.click(); link.remove();
      setMessage("Download link opened. Files are served by Fadr and are not saved in this app.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download failed.");
    } finally { setDownloading(""); }
  }

  return <section className={styles.lab} aria-label="Fadr audio separation">
    <div className={styles.heading}><span className={styles.eyebrow}><AudioLines size={15}/> FADR AUDIO TOOLS</span>
      <h2>Make stems from a song.</h2>
      <p>Split a licensed recording into vocals, drums, bass, melodies and instrumental. Fadr also provides MIDI, chord, key and tempo information. The audio is processed by Fadr, not in your browser.</p>
    </div>
    <div className={styles.columns}>
      <div className={styles.left}>
        <div className={styles.step}><span>01</span><div><strong>Connect Fadr</strong>
          {checking ? <p>Checking the service…</p> : configured ? <p className={styles.success}><CheckCircle2 size={14}/> Server credentials are present (connection not tested)</p>
            : <p className={styles.warning}>Not configured. The studio owner must set FADR_API_KEY and FADR_STUDIO_ACCESS_TOKEN on the hosting server.</p>}
          <label className={styles.access}><KeyRound size={15}/> Studio access code
            <input type="password" autoComplete="off" value={access} maxLength={256} onChange={event => setAccess(event.target.value)} placeholder="Private studio access code" />
          </label>
          <small>This is a separate app access code, not your Fadr API key. Never paste the Fadr API key here.</small>
        </div></div>
        <div className={styles.step}><span>02</span><div><strong>Choose your audio</strong>
          <input hidden type="file" ref={picker} onChange={selectAudio} accept=".mp3,.wav,audio/mpeg,audio/wav" />
          <button className={styles.select} type="button" onClick={() => picker.current?.click()} disabled={stage === "uploading" || stage === "processing"}>
            <Upload size={17}/> {file ? "Change recording" : "Choose WAV or MP3"}</button>
          {file && <p>{file.name} · {(file.size / 1048576).toFixed(1)} MB</p>}
        </div></div>
        <div className={styles.step}><span>03</span><div><strong>Approve processing</strong>
          <p>Fadr&apos;s published API charge is <b>US$0.05 per minute of input audio</b>. A Fadr Plus subscription and API balance are required. Upload only music you have rights to process.</p>
          <label className={styles.consent}><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} disabled={stage !== "idle"} />
            I have permission to process this recording and approve Fadr&apos;s usage charges.</label>
          <button className={styles.primary} onClick={() => void processAudio()} disabled={!file || !configured || !consent || access.length < 8 || stage !== "idle"}>
            {stage === "uploading" || stage === "processing" ? <LoaderCircle size={16} className={styles.spinner}/> : <Sparkles size={16}/>}
            {stage === "uploading" ? "Uploading…" : stage === "processing" ? "Processing…" : stage === "complete" ? "Complete" : "Separate into stems"}</button>
        </div></div>
      </div>
      <div className={styles.right}>
        <strong><ShieldCheck size={16}/> Processing status</strong>
        <p className={styles.status} role="status">{message}</p>
        {progress !== null && <div className={styles.progress}><span style={{width: progress + "%"}}/><small>{progress}%</small></div>}
        {stage === "processing" && <button onClick={() => void refresh(taskId,assetId)}><LoaderCircle size={14}/> Check status now</button>}
        {taskId && <small>Fadr task ID: <code>{taskId}</code></small>}
        {stage === "complete" && <div className={styles.results}>
          <div className={styles.metadata}><span>Detected key <b>{trackKey || "–"}</b></span><span>Tempo <b>{tempo ?? "–"} BPM</b></span></div>
          {tracks.map(track => <div className={styles.track} key={track.id}><Music2 size={17}/><span><strong>{track.stemType || track.name}</strong><small>{track.kind === "midi" ? "MIDI" : "Stem audio"} · {track.name}</small></span>
            <button onClick={() => void download(track.id)} disabled={downloading === track.id} title="Download from Fadr" aria-label={"Download "+track.name}><Download size={16}/></button></div>)}
        </div>}
        <p className={styles.note}>API credentials never appear in the webpage. This feature requires server configuration; no processing or charge occurs until you explicitly approve it.</p>
      </div>
    </div>
  </section>;
}
