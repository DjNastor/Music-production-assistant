# Nastor AI Studio — consolidation and deployment record

## Canonical source
Repository: DjNastor/Music-production-assistant
Development: feat/producer-collab-daw-redesign (draft PR #3)
Existing production hostname: https://nastor-ai-studio.vercel.app/
Do not create a replacement production project or domain.

## Consolidation audit
- Producer Home already implements the supplied design's actions and multiple real local sessions. Preserve its existing state and callbacks.
- Producer workbench branch is an ancestor of the development branch.
- Tasker branch is included in the development branch.
- Native installers branch has independent packaging/macOS and Android changes; do not merge blindly because it uses separate wrapper paths and package IDs. Review and test packaging before combining.
- Main has independent archive-file changes. Preserve them during future integration.
- Master Workspace links existing tools and adds a local notebook and planning snapshot. No existing project keys are renamed or cleared.
- The creative canvas/image-generation screenshot is a design reference, not a working image provider.

## Persistence
Existing browser storage keys: nastor-production-room-v1, nastor-project-library-v1, nastor-finish-projects-v1. Master Workspace notebook: nastor-master-workspace-notes-v1. Existing per-project export/import remains available. Combined snapshot is reference-only, excludes audio, and has no full restore. Android WebView and Chrome use separate storage; cloud account, authenticated database, migrations and consented audio storage are future work. Do not clear app data or uninstall to update without backups.

## Provider boundaries
Tasker native beta requires device permission, named tasks and manual confirmation. No verified live FL Studio link. Treblo and Suno generation are not connected. Previously exposed credentials must be rotated; use server-side environment configuration only after verifying provider documentation. Never store credentials in notes, source or APK.

## Deployment gate
Vercel access currently returns 403/404 and project search in connected team returned no matching project. No deployment or production merge performed. Confirm project ownership and Git connection; inspect CI for exact head; test preview, local persistence and Android WebView; resolve production access and deploy reviewed code to existing domain. Keep rollback deployment available. A web deployment updates hosted screens, not native Android code; native Tasker changes require a rebuilt APK and compatible signing.
