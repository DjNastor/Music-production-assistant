# Nastor AI Studio — Release Consolidation and Persistence

Last reviewed: 2026-11-28

## Canonical source of truth

- Repository: https://github.com/DjNastor/Music-production-assistant
- Canonical beta/release-candidate branch: `feat/producer-collab-daw-redesign`
- Main production branch: `main` (not changed by this consolidation)
- Consolidated review: PR #3 — https://github.com/DjNastor/Music-production-assistant/pull/3

PR #3 is descended from `feat/producer-daw-workbench` (the source branch of PR #2). The commit comparison showed PR #3 is 67 commits ahead of PR #2 and has no commits behind it. Therefore the Piano Roll, chord/MIDI workbench and Gopher prompt work from PR #2 are already present in PR #3, alongside the later DAW workspace, collaboration, Project Finisher, Fadr route, desktop/Android packaging and Tasker Automation Centre changes. Do not merge PR #2 separately; it is superseded by PR #3.

The Tasker native Android action menu was added to the PR #3 branch in commit `d41b93b58ec5c81b697063595335152136d8b563`. It is a beta source change only: the APK still needs to build and be tested on a real Android device with Tasker installed and external access enabled.

## Main app experience

The current home route already provides a simplified Production Home with:
- New production and continue session actions
- Studio, sounds, collaboration and Project Finisher navigation
- Local project list, import and JSON backup export
- A responsive production workspace and separate legacy interface at `/legacy`

The separate `StudioHome` reference component is conceptually covered by the existing `ProducerDashboard`; do not add a second competing home page. The supplied creative-workspace screenshot can guide future visual refinement of the Studio, Canvas, Audio & Stems, Style, Timeline and Assets areas.

## Persistence — verified current behaviour

The current code is **device/browser-local**, not cloud-persistent:
- Producer session/project metadata uses browser `localStorage` (`app/lib/producer-projects.ts`).
- Project Finisher records use browser `localStorage` (`app/lib/finish-projects.ts`).
- Reference audio uses browser `IndexedDB` (`app/lib/finish-audio.ts`).
- JSON export/import is available for project/session metadata; it does not embed audio assets.

This means data is not automatically synchronized between phone, desktop and browsers. Clearing site data or losing the device can remove the local-only records. Keep export backups until cloud sync is implemented.

## Cloud persistence target

Use a single authenticated Supabase backend for:
- User identity and per-user project ownership
- Production sessions, arrangement snapshots, notes, tasks and finishing progress
- Asset metadata, immutable version history and signed private audio/object-storage references
- Collaboration invitations and activity history

Apply row-level security to all user-owned tables. Keep service-role keys and provider API credentials on the server only. Upload originals to private object storage; use signed URLs and enforce file type/size limits. Preserve the original FL Studio project and create new versions rather than overwriting it.

A Supabase organization named `nastor@expand.co.za's Org` is available and a project-cost quote returned USD $0/month for project creation at the time of review. No database project has been created; user confirmation of the intended organization is still required before provisioning. Do not claim cross-device sync until migrations, authentication, upload, backup/restore and multi-device tests pass.

## Vercel deployment state

The existing public URL recorded in the project is https://nastor-ai-studio.vercel.app. The Vercel connection currently lists the team `phushiplan-4334s-projects`, but its Git-linked project inventory contains only `DjNastor/Lukulu`, not this repository. The Vercel project/deployment lookup for the existing Nastor URL returned not-found, and project creation for this team returned 403 permission denied.

A one-time Vercel team authorization link was generated for the owner to approve. After approval, retry the Vercel project lookup/creation and create a **beta preview** from `feat/producer-collab-daw-redesign`. Do not point the existing production URL at this branch until the beta build and real-device tests pass.

## Required release checks

1. GitHub Actions: Node 24 lint, type-check and Next.js production build.
2. Vercel preview: confirm the build is READY and test the home, Studio, Project Finisher, Fadr API error handling and mobile layout.
3. Android: build debug beta; install on a physical Samsung phone; test WebView navigation, import/export, Tasker missing/denied/allowed states and Tasker Run Log.
4. Windows: build and smoke-test the Electron installer.
5. Persistence: provision the approved Supabase project, apply migrations, enable RLS, test create/update/reload across two devices, backup/restore, and private audio access.
6. Integrations: add Treblo/Fadr/Suno credentials only as server-side environment variables after each provider's authentication method and API scope are verified.

## Release rule

One canonical branch and one release PR at a time. Every feature change must be committed to the canonical branch, pass checks, appear in a protected Vercel preview, and be accepted on the phone before production promotion. Never report a deployment or cloud save as complete without verifying the Vercel deployment status or a successful read-after-write from the database.
