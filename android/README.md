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

## Tasker Automation Centre (Android 0.3 beta)

The native Automation Centre button shows four local setup recipes: connection test,
production session, project review, and release checklist. It works independently
of the hosted web UI. The app only requests named tasks, not arbitrary scripts.

1. Install Tasker and create the exact named task shown in the recipe. For the
   first smoke test, create Nastor Test with a Flash action.
2. Enable Tasker Preferences > Misc > Allow External Access.
3. Open Nastor Automation Centre, select Test connection, review the recipe,
   and confirm Run. Grant Tasker's Run Tasks Android permission if requested.
4. After permission is granted, select and confirm again. Verify the Flash
   appears and inspect Tasker Run Log. A sent broadcast is not proof of success.
5. Test missing Tasker, denied permission, blocked external access, missing task,
   cancelled confirmation, rotation, existing WebView project loading and storage.

The recipes are manual setup instructions, not Tasker XML import files. There is
no automatic scheduling from Nastor, no AI-generated arbitrary action execution,
no web-to-native JavaScript bridge, and no DAW or file changes. You can schedule
review notifications in Tasker using a Time profile once the test succeeds.
No live-device compatibility or Tasker execution has been verified yet.

Official reference: https://tasker.joaoapps.com/invoketasks.html
