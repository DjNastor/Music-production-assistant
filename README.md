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
- Project selection, navigation state, quick actions, work queue, and local feedback toasts
- Local Copilot conversation with suggestion chips and contextual mock replies
- Command palette with `Ctrl+K` / `Cmd+K`, keyboard navigation, and Escape dismissal
- Export dialog with WAV, MP3, and stems preset selection
- Accessible focus states, semantic dialogs, reduced-motion support, and responsive layouts

## Mocked service boundaries

This phase intentionally uses local state and believable mock data. AI replies, project analysis, autosave, audio playback, reference analysis, exports, authentication, file upload, and DSP integrations are **not connected to external services**. The local handlers in `app/page.tsx` mark the boundaries where future API/provider calls can be introduced.
