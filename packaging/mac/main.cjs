"use strict";

const path = require("node:path");
const { app, BrowserWindow, shell, session } = require("electron");

// The hosted studio and its server API are not bundled with this desktop shell.
const configuredUrl = process.env.NASTOR_APP_URL || "https://nastor-ai-studio.vercel.app";
const parsed = new URL(configuredUrl);
if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
  throw new Error("Nastor AI Studio requires a valid HTTPS URL without credentials.");
}
const studioUrl = parsed.href;
const allowedOrigin = parsed.origin;

function studioPage(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === "https:" && url.origin === allowedOrigin;
  } catch {
    return false;
  }
}

function openBrowser(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol === "https:" || url.protocol === "mailto:") {
      void shell.openExternal(url.href);
    }
  } catch {
    // Ignore malformed links and unsafe URL schemes.
  }
}

function openStudio() {
  const win = new BrowserWindow({
    title: "Nastor AI Studio",
    backgroundColor: "#0d0e10",
    width: 1260,
    height: 820,
    minWidth: 800,
    minHeight: 550,
    show: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false
    }
  });
  win.once("ready-to-show", () => win.show());
  win.webContents.once("did-finish-load", () => {
    if (!win.isVisible()) win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    openBrowser(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!studioPage(url)) {
      event.preventDefault();
      openBrowser(url);
    }
  });
  win.webContents.on("did-fail-load", (_event, code, _description, url, isMainFrame) => {
    if (isMainFrame && code !== -3 && studioPage(url)) {
      void win.loadFile(path.join(__dirname, "offline.html"));
    }
  });
  void win.loadURL(studioUrl);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
    const media = details && Array.isArray(details.mediaTypes) ? details.mediaTypes : [];
    const audioOnly = media.length > 0 && media.every((kind) => kind === "audio");
    callback(permission === "media" && audioOnly && studioPage(contents.getURL()));
  });
  openStudio();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) openStudio();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
