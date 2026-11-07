"use strict";
const path = require("node:path");
const { app, BrowserWindow, shell, session } = require("electron");

const configuredUrl = process.env.NASTOR_APP_URL || "https://nastor-ai-studio.vercel.app";
const parsed = new URL(configuredUrl);
if (parsed.protocol !== "https:" || !parsed.hostname) {
  throw new Error("The studio URL must use HTTPS.");
}
const studioUrl = parsed.href;
const origin = parsed.origin;

function isAllowed(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && url.origin === origin;
  } catch { return false; }
}
function openExternally(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "mailto:") void shell.openExternal(url.href);
  } catch { /* Ignore invalid URLs */ }
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 860, minHeight: 600,
    title: "Nastor AI Studio", backgroundColor: "#0d0e10", show: false,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, sandbox: true,
      webSecurity: true, allowRunningInsecureContent: false, webviewTag: false,
    },
  });
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternally(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowed(url)) {
      event.preventDefault();
      openExternally(url);
    }
  });
  win.webContents.on("did-fail-load", (_event, code, _description, url, mainFrame) => {
    if (mainFrame && code !== -3 && isAllowed(url)) {
      void win.loadFile(path.join(__dirname, "offline.html"));
    }
  });
  void win.loadURL(studioUrl);
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
    const requested = details?.mediaTypes || [];
    const audioOnly = requested.length > 0 && requested.every((type) => type === "audio");
    callback(permission === "media" && audioOnly && isAllowed(contents.getURL()));
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
