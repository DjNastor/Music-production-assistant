# Nastor AI Studio native beta packages

This is an **online companion**, not a standalone FL Studio replacement. The existing hosted Next.js application remains the source of truth. The Windows EXE and Android APK share its web interface but save local-only session data separately.

## Windows EXE

Source: packaging/windows, Electron 45 + electron-builder. Default HTTPS origin: https://nastor-ai-studio.vercel.app (overridable for development with NASTOR_APP_URL). Remote pages run without Node integration, with sandbox and context isolation. External links open in the default browser.

Windows local build:
1. cd packaging/windows
2. npm install
3. npm run package:win

Output: dist/*.exe (NSIS installer and portable EXE).

## Android APK

Source: packaging/android, Android Java WebView HTTPS-only beta. Requires JDK 17, Android SDK 35 and Gradle 8.13.

Build: gradle -p packaging/android :app:assembleDebug

Output: packaging/android/app/build/outputs/apk/debug/app-debug.apk. This is a development APK, not release signed for Play Store. Supports file picking; microphone capture, blob downloads, external sign-in and background audio require separate device validation.

## CI downloads

Open GitHub > Actions > Package Nastor AI Studio (beta), open the latest run and download its two artifacts. They expire after 14 days. Do not ship preview EXEs to the public before Windows code signing or preview APKs before Android release signing and functional tests.

The beta packages currently open the production domain. The newest redesign is still in a feature branch. Deploy or merge the vetted changes to the stable domain before calling these packages final. Never put Fadr API keys inside the installers.

## FL Studio source

D:\Image-Line\FL Studio\Projects is your existing FL Studio project location; treat it as read-only source data. Do not install, build or extract packages into this folder, and do not modify original .flp sessions. A future FL Studio helper may provide authorized project discovery, backups and Open in FL Studio, but FLP editing is not currently supported.

## Recommended improvements before release

- Stable production deployment, real Windows/Android smoke tests and persistent installer signing keys.
- Confirm project backup/import/export and saved session persistence on both platforms.
- Improve Android file downloads, sign-in and audio input in a supported PWA/TWA approach. TWA requires Digital Asset Links and the signing certificate fingerprint.
- Add explicit local FL Studio .flp read-only project library with user-selected folders; no native FLP parsing.
- Verify Fadr credentials and consent/payment flow server-side; add user authentication and quotas before a public multi-user rollout.
