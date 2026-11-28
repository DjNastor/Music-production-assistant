# Nastor AI Studio — Windows installer (beta)

This is a **secure online companion**, not an offline audio workstation. It opens the hosted Nastor AI Studio web app. Fadr credentials stay on the hosted Next.js backend.

## Build on Windows

From the `desktop` directory:

```powershell
npm install
npm run pack:win
```

The unsigned NSIS installer is generated under `desktop/dist/`. The **Build Native Beta Apps** GitHub Actions workflow can also build the EXE on a Windows runner.

To run against a preview with a trusted owner-approved HTTPS host, start Electron with:

```powershell
$env:NASTOR_STUDIO_URL = "https://your-preview.example/"
npm start
```

## Security and limitations

- HTTPS-only navigation with Node integration **off**, context isolation **on**, and renderer sandboxing **on**.
- External HTTPS links open in the system browser; custom protocols and insecure links are not launched.
- File, camera, microphone and similar site permission requests are denied in this beta until reviewed.
- No FL Studio install, local audio DSP engine, or cloud sync is included.
- The unsigned beta installer may trigger SmartScreen. Production distribution should use trusted Windows code signing.
- The production site must deploy the new features before they appear in the default desktop wrapper.
