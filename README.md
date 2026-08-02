**Live app:** https://nastor-ai-studio.vercel.app

# Nastor AI Studio

A polished Phase 1 frontend prototype for an AI-assisted music production workspace. The interface is built with Next.js App Router, React, TypeScript, Tailwind CSS, and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
```

## Implemented in this prototype

- Responsive studio shell with desktop rail, mobile drawer, and mobile Copilot sheet
- Playable arrangement energy ribbon with section selection and timeline progress
- Project selection, navigation state, quick actions, filterable work queue, and local feedback toasts
- Local Copilot conversation with suggestion chips, file context, Enter-to-send, and contextual mock replies
- Command palette with `Ctrl+K` / `Cmd+K`, arrow-key navigation, Enter selection, and Escape dismissal
- Project-link copying, local collaborator invites, and a keyboard-shortcut reference
- Export dialog with WAV, MP3, and stems presets that add visible queue entries
- Accessible focus states, semantic dialogs, reduced-motion support, and responsive layouts

## Mocked service boundaries

This phase intentionally uses local state and believable mock data. AI replies, project analysis, autosave, audio playback, reference analysis, exports, authentication, file upload, and DSP integrations are **not connected to external services**. The local handlers in `app/page.tsx` mark the boundaries where future API/provider calls can be introduced.

## Real backend roadmap

The live app is a frontend prototype. To make Nastor's production assistant actually finish ideas, remix songs, inspect FLP projects, generate versions, and deliver stemz, the backend should be built as a job-based audio production system.

### Core services

1. **Project ingest API** — accepts MP3, WAV, ZIP, FLP, MIDI, stems and references; stores originals in object storage and creates a project/session id.
2. **Analysis workers** — extract BPM, key, downbeats, sections, energy, loudness, headroom, stereo image, transient density, groove feel and likely hook moments.
3. **FLP/project audit** — scans FL Studio handoff packages for sample paths, plugins, stems, MIDI, routing notes and missing assets. Original FLP files should not be overwritten.
4. **Production planner** — combines analysis with Nastor DNA to produce concrete next moves: add, remove, replay, arrange, automate, mix, master, export.
5. **Generation workers** — connect stem separation, remix/continuation engines, mastering and render services behind a queue so heavy jobs can run asynchronously.
6. **Version builder** — creates full version, DJ extended, radio edit, dub, instrumental, clean edit, social cut, acapella when possible, and grouped stemz.
7. **Delivery system** — packages WAV/MP3/stemz/notes/manifests into downloadable release packs with consistent naming and metadata.

### Safety and rights

- Only remix or transform music Nastor owns, licenses, or has permission to use.
- Keep originals untouched; generate new versions, notes or project packages.
- Require review before expensive render jobs.
- Track every generated file, prompt, setting and source under the project id.
