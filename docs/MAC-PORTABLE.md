# Nastor AI Studio — portable Intel Mac edition

## What this build is

A portable app ZIP plus a drag-and-drop DMG for Intel x64 Macs, targeting macOS 10.15 Catalina or newer. This is a **legacy beta** based on Electron 32.3.3, the last Electron major version compatible with Catalina. Electron 32 is end-of-life and no longer receives security fixes. For better security use a maintained operating system and up-to-date browser.

The Mac app is an online companion for https://nastor-ai-studio.vercel.app. It is not FL Studio, does not contain an offline DAW engine, and does not parse or modify FLP projects. Web projects saved in this app profile are not automatically synchronized with other devices. Microphone permissions are requested only if an audio capture feature requests them.

## Portable ZIP

1. Download the Mac ZIP from the successful GitHub Actions artifact.
2. Extract in Finder. The result is Nastor AI Studio.app.
3. Move the app to Applications or leave it in a folder you own.
4. Launch the app and pin it using Dock > Options > Keep in Dock.

## DMG

1. Open the downloaded DMG.
2. Drag Nastor AI Studio.app into Applications.
3. Eject the disk image and open the app from Applications.

## Signing and macOS warnings

These test packages are unsigned and not notarized. Gatekeeper may refuse to open them. Proper Developer ID signing and Apple notarization is required before general distribution. Review the source and macOS warnings before choosing to approve a first run. Do not disable Gatekeeper or alter system-wide security settings.

## Build from source

Use a modern macOS development runner with Node.js 22:

    cd packaging/mac
    npm install
    npm run package:mac

The output is placed into dist as ZIP and DMG files. Avoid building directly on Catalina with modern Node.js.

## Verify on a real Intel Mac

- Unzip to a real x86_64 app bundle and confirm the app opens on Catalina 10.15.7.
- Confirm that the stable production URL shows the intended version; feature branch previews are not automatically promoted.
- Test offline fallback, file input/output, audio playback and recording permission, Fadr request consent, project state and any sign-in flows.
- API keys must stay on the server. Access to Mac local FL Studio projects would require an explicitly authorized native folder bridge.
