# Nastor AI Studio — Android APK (beta)

This is a small Android WebView wrapper around the **hosted** Nastor AI Studio at
https://nastor-ai-studio.vercel.app/. It is not a native DAW or an offline audio engine.

## Build locally

Open `android/` in Android Studio and let Gradle sync. Install Android SDK 35 and
JDK 17, then run `gradle assembleDebug` from `android/` or choose **Build APK(s)**
from Android Studio. The debug APK appears in `android/app/build/outputs/apk/debug/`.

Our GitHub Actions **Build Native Beta Apps** workflow can build a debug APK
automatically on Ubuntu. The debug APK uses Android's development signing key;
it is **not** a release-signed or Play Store-ready app.

## Security and limitations

- HTTPS-only, allowlisted studio host; other HTTPS links use an external browser.
- JavaScript is enabled for Next.js but there is no privileged JavaScript bridge.
- The app allows user-selected files through the system picker (e.g. for sample uploads).
- Camera and microphone requests are denied until explicitly implemented and tested.
- Fadr API keys are never stored in this client.
- Downloads from external provider links open in the system browser.
- Browser-local projects will not automatically sync between the Windows, Android,
  web and other installation profiles.
- The default app shows production at `nastor-ai-studio.vercel.app`. Changes on a
  feature branch only become visible here after an authorized production deploy.
- Before public release: add application authentication and rate limiting, prepare
  a release keystore, test the real site on devices, and run accessibility checks.
