/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const { app, BrowserWindow, shell, session } = require("electron");
const path = require("node:path");

// This launcher only loads the HTTPS studio. Credentials remain on the hosted backend.
// Set NASTOR_STUDIO_URL at runtime for an authorized staging deployment.
const source = process.env.NASTOR_STUDIO_URL || "https://nastor-ai-studio.vercel.app/";
const STUDIO = new URL(source);
if (STUDIO.protocol !== "https:" || STUDIO.username || STUDIO.password) {
  throw new Error("NASTOR_STUDIO_URL must be an HTTPS origin without credentials.");
}
const TRUSTED_ORIGIN = STUDIO.origin;

function isTrusted(candidate) {
  try {
    const link = new URL(candidate);
    return link.protocol === "https:" && link.origin === TRUSTED_ORIGIN;
  } catch {
    return false;
  }
}

function openExternalSafe(candidate) {
  try {
    const target = new URL(candidate);
    // Electron's shell must never open custom URL protocols or untrusted file paths.
    if (target.protocol === "https:" && target.hostname.length > 0) {
      void shell.openExternal(target.href);
    }
  } catch {
    // Ignore malformed navigation.
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 780,
    minHeight: 570,
    show: false,
    backgroundColor: "#0D0E10",
    autoHideMenuBar: true,
    title: "Nastor AI Studio",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
    },
  });
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrusted(url)) void win.loadURL(url);
    else openExternalSafe(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!isTrusted(url)) {
      event.preventDefault();
      openExternalSafe(url);
    }
  });
  win.webContents.on("will-redirect", (event, url) => {
    if (!isTrusted(url)) {
      event.preventDefault();
      openExternalSafe(url);
    }
  });
  win.webContents.on("did-fail-load", (_event, _errorCode, _desc, url, isMainFrame) => {
    if (isMainFrame && isTrusted(url)) void win.loadFile(path.join(__dirname, "offline.html"));
  });
  win.loadURL(STUDIO.href).catch(() => {
    if (!win.isDestroyed()) void win.loadFile(path.join(__dirname, "offline.html"));
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
