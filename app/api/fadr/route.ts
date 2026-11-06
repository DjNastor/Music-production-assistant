import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "https://api.fadr.com";
const IDENTIFIER = /^[a-zA-Z0-9_-]{8,96}$/;
const EXTENSIONS = new Set(["mp3", "wav"]);
type ObjectValue = Record<string, unknown>;

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
function safeEquals(received: string, expected: string) {
  const first = Buffer.from(received);
  const second = Buffer.from(expected);
  return first.length === second.length && timingSafeEqual(first, second);
}
function configured() {
  return Boolean(process.env.FADR_API_KEY && process.env.FADR_STUDIO_ACCESS_TOKEN);
}
function canAccess(request: NextRequest) {
  const expected = process.env.FADR_STUDIO_ACCESS_TOKEN;
  const value = request.headers.get("x-studio-access") || "";
  return Boolean(expected && value && value.length <= 256 && safeEquals(value, expected));
}
function isObject(value: unknown): value is ObjectValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function validName(input: unknown): input is string {
  return typeof input === "string" && input.length > 0 && input.length <= 180 &&
    !/[\\/\r\n\x00-\x1f]/.test(input);
}
async function fadr(path: string, method: "GET" | "POST", body?: ObjectValue) {
  const key = process.env.FADR_API_KEY;
  if (!key) throw new Error("Fadr API key is missing");
  const response = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: "Bearer " + key,
      ...(body ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error("Fadr rejected the request (HTTP " + response.status + "). Check your API key, Plus subscription, and balance.");
  }
  const result: unknown = await response.json();
  if (!isObject(result)) throw new Error("Unexpected Fadr response");
  return result;
}

export async function GET() {
  return json({ configured: configured(), provider: "Fadr", capability: "stem-separation", requiresAuthorization: true });
}
export async function POST(request: NextRequest) {
  if (!configured()) return json({ error: "Fadr has not been configured by the studio owner." }, 503);
  if (!canAccess(request)) return json({ error: "Invalid studio access code." }, 401);

  let input: ObjectValue;
  try {
    const body: unknown = await request.json();
    if (!isObject(body)) throw new Error("Invalid JSON");
    input = body;
  } catch { return json({ error: "Invalid request body." }, 400); }

  try {
    const action = input.action;
    if (action === "presign") {
      const { name, extension, size } = input;
      if (!validName(name) || typeof extension !== "string" || !EXTENSIONS.has(extension) ||
          typeof size !== "number" || size <= 0 || size > 100_000_000 ||
          !name.toLowerCase().endsWith("." + extension)) {
        return json({ error: "Choose an MP3 or WAV file up to 100 MB." }, 400);
      }
      const result = await fadr("/assets/upload2", "POST", { name, extension });
      if (typeof result.url !== "string" || typeof result.s3Path !== "string" ||
          !result.s3Path.startsWith("tmp/")) throw new Error("Fadr did not provide a valid upload destination");
      const url = new URL(result.url);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".amazonaws.com")) {
        throw new Error("Fadr returned an unexpected upload host");
      }
      return json({ uploadUrl: result.url, s3Path: result.s3Path });
    }
    if (action === "asset") {
      const { name, extension, s3Path } = input;
      if (!validName(name) || typeof extension !== "string" || !EXTENSIONS.has(extension) ||
          typeof s3Path !== "string" || !/^tmp\/[A-Za-z0-9_./ %()-]{5,600}$/.test(s3Path) ||
          !s3Path.endsWith("." + extension)) return json({ error: "Invalid asset metadata." }, 400);
      const result = await fadr("/assets", "POST", { name, extension, s3Path, group: "nastor-studio" });
      const asset = result.asset;
      if (!isObject(asset) || typeof asset._id !== "string") throw new Error("Fadr did not return an asset");
      return json({ assetId: asset._id });
    }
    if (action === "stem") {
      const { assetId, consent } = input;
      if (!consent || typeof assetId !== "string" || !IDENTIFIER.test(assetId)) {
        return json({ error: "Explicit processing and billing consent, and a valid Fadr asset, are required." }, 400);
      }
      // This is a chargeable Fadr API call. No hidden automatic task submission.
      const result = await fadr("/assets/analyze/stem", "POST", { _id: assetId, stemType: "main" });
      const task = result.task;
      if (!isObject(task) || typeof task._id !== "string") throw new Error("Fadr did not return a task");
      return json({ taskId: task._id, status: task.status ?? null });
    }
    if (action === "task") {
      const { taskId } = input;
      if (typeof taskId !== "string" || !IDENTIFIER.test(taskId)) return json({ error: "Invalid task ID." }, 400);
      const result = await fadr("/tasks/" + encodeURIComponent(taskId), "GET");
      const task = result.task;
      if (!isObject(task)) throw new Error("Fadr returned no task");
      return json({
        taskId, complete: isObject(task.status) && task.status.complete === true,
        progress: isObject(task.status) && typeof task.status.progress === "number" ? task.status.progress : null,
        message: isObject(task.status) && typeof task.status.msg === "string" ? task.status.msg : "",
        outputIds: isObject(task.output) && Array.isArray(task.output.assets)
          ? task.output.assets.filter((a) => typeof a === "string").slice(0, 40) : [],
      });
    }
    if (action === "asset-status") {
      const { assetId } = input;
      if (typeof assetId !== "string" || !IDENTIFIER.test(assetId)) return json({ error: "Invalid asset ID." }, 400);
      const result = await fadr("/assets/" + encodeURIComponent(assetId), "GET");
      const asset = result.asset;
      if (!isObject(asset)) throw new Error("Fadr returned no asset");
      const meta = isObject(asset.metaData) ? asset.metaData : {};
      return json({
        assetId: asset._id, name: asset.name,
        stems: Array.isArray(asset.stems) ? asset.stems.filter((v) => typeof v === "string").slice(0, 50) : [],
        midi: Array.isArray(asset.midi) ? asset.midi.filter((v) => typeof v === "string").slice(0, 50) : [],
        key: typeof meta.key === "string" ? meta.key : null,
        tempo: typeof meta.tempo === "number" ? meta.tempo : null,
        stemType: typeof meta.stemType === "string" ? meta.stemType : null,
      });
    }
    if (action === "file-info") {
      const { assetId } = input;
      if (typeof assetId !== "string" || !IDENTIFIER.test(assetId)) return json({ error: "Invalid asset ID." }, 400);
      const result = await fadr("/assets/" + encodeURIComponent(assetId), "GET");
      const asset = result.asset;
      if (!isObject(asset)) throw new Error("Fadr returned no asset");
      const meta = isObject(asset.metaData) ? asset.metaData : {};
      return json({ assetId, name: typeof asset.name === "string" ? asset.name : "Fadr file",
        stemType: typeof meta.stemType === "string" ? meta.stemType : null,
        extension: typeof asset.fileType === "string" ? asset.fileType : null });
    }
    if (action === "download") {
      const { assetId, quality } = input;
      if (typeof assetId !== "string" || !IDENTIFIER.test(assetId) ||
        (quality !== "preview" && quality !== "hqPreview" && quality !== "download")) {
        return json({ error: "Invalid download request." }, 400);
      }
      const result = await fadr("/assets/download/" + encodeURIComponent(assetId) + "/" + quality, "GET");
      if (typeof result.url !== "string") throw new Error("Fadr did not provide a download link");
      const url = new URL(result.url);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".amazonaws.com")) {
        throw new Error("Unexpected download host");
      }
      return json({ url: result.url, extension: typeof result.ext === "string" ? result.ext : null });
    }
    return json({ error: "Unknown Fadr operation." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fadr request failed";
    // Avoid exposing upstream authentication tokens, signed URLs, or secret environment values.
    return json({ error: /Fadr|host|asset|Unexpected|download/.test(message) ? message : "Fadr service is temporarily unavailable." }, 502);
  }
}
