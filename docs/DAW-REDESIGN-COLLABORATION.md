# Nastor AI Studio — DAW-centred redesign and producer collaboration

**Reference design:** [Lukulu Academy DAW Learning Lab](https://github.com/DjNastor/lukulu-daw-simulator/tree/main/src/features/daw-workspace)  
**Target product:** [Nastor AI Studio](https://github.com/DjNastor/Music-production-assistant)  
**Development branch:** `feat/producer-collab-daw-redesign`

## Product positioning

Nastor AI Studio takes the familiar workflow layout of a professional music-production workstation and turns it into a practical **production and collaboration hub**. The Lukulu Academy design serves only as the visual/interaction direction. This product is not a student simulator: it is for working producers, composers, vocalists, remixers, mix engineers, and release collaborators.

Use original branding, icons and styles. Do not copy FL Studio interface artwork, logos, commercial assets or proprietary source. Interoperability is achieved through documented exports and individually authorized integrations, not unauthorized software control.

## New main-screen blueprint

```text
┌──────────────────────────────────────────────────────────────────────┐
│ NASTOR AI STUDIO │ Studio  Assets  Collaboration │ Save │ Export    │
├──────────────────────────────────────────────────────────────────────┤
│ PROJECT / TEMPO / KEY / MODE    │ Preview │ Bar counter           │
├────────────────┬─────────────────────────────────┬───────────────────┤
│ PROJECT        │ PLAYLIST: EDITABLE ARRANGEMENT  │ PRODUCTION         │
│ BROWSER        │ Drums / Bass / Chords / Lead    │ INTELLIGENCE      │
│ Session        │ Vocals / FX                     │ AI/Gopher brief   │
│ MIDI & sounds  ├─────────────────────────────────┤ Groove suggestions│
│ Reference      │ Channel Rack | Piano | Mixer    ├───────────────────┤
│ Collaborators  │ Drum sequencer / MIDI export    │ PRODUCER TEAM     │
│                │ Mixer planning / chord previews │ Tasks & handoffs  │
├────────────────┴─────────────────────────────────┴───────────────────┤
│ STATUS: local session / no remote DAW connection                     │
└──────────────────────────────────────────────────────────────────────┘
```

### Studio / Playlist
- Six color-coded production lanes: Drums, Bass, Chords, Lead, Vocals, FX.
- Editable 32-bar arrangement (add, select, rename, shift, duplicate, delete).
- Project BPM, tonic, scale mode, session title, arrangement playhead and section navigation.
- Arrangement clips currently represent planning data, not audio blocks. No misleading rendering or real-time playback claims.

### Channel rack
- Five-channel, sixteen-step rhythm sketch; active steps can be changed.
- Browser Web Audio synthesis for a simple preview; no claim to host sample packs yet.
- Variation and reset controls.
- Future phase: user sample assignment, multi-pattern song mode, velocity, swing, sample slicing and WAV render.

### Piano roll / Harmony
- Reuses the previous workbench: real MIDI import/export, chord variations, scale snapping, synth preview and FL Studio/Gopher prompts.
- Full MIDI persistence per project and portable template download.
- Future: personal chord preference ranking, MIDI-humming conversion, polyphonic voice leading and collaboration revisions.

### Mixer planning
- Each lane has a saved level target, mute/solo planning controls and visual channel display.
- These are not currently connected to an audio engine.
- Future: loaded stems, real gain staging, EQ, compression, routing and master reference metrics.

### Production assistant
- Reads local project metadata and selected arrangement clip.
- Produces transparent rule-based arrangement advice and reviewable, project-specific Gopher prompts.
- Supports project organization, chord directions, groove improvement, mix-check preparation and producer handoff generation.
- Future: connected AI service, microphone dictation, allowed audio processing, versioned decisions and verification of actual FL Studio changes.

### Collaboration
- Prepares invitations with recipient address and role. **Does not send them.**
- Stores producer tasks, completion statuses and session notes locally.
- Creates a downloadable JSON handoff manifest containing project plan, notes, tasks, pattern and selected local asset names; audio is not embedded.
- Future: authenticated user accounts, permissioned cloud project rooms, secure expiring invitations, actual file storage and uploads, task assignments, comments attached to clips/bars, and revision history.

### Assets
- Local file picker for audio, MIDI, FLP, ZIP and sound-pack files.
- Temporary browser-only audio preview of chosen audio files; no automatic server upload or audio analysis.
- Future: permissioned Google Drive integration, sample pack explorer, tagging, loop slicing, license registry and audio-reference analysis.

## User goals supported by the longer roadmap
1. Finish unfinished music through proper analysis, melody/chord ideas, arrangement and producer decision support.
2. Analyze actual songs for tempo, key/chords, sections, frequency balance, loudness and mastering comparisons.
3. Reference legally uploaded audio or track metadata from Spotify without trying to download protected Spotify streams.
4. Generate and remix authorized versions including DJ extended, radio, instrumental, clean and stems where possible.
5. Build a personal production-DNA profile from owned MIDI and reference materials, with optional user review and preference tuning.
6. Capture voice commands, sung melodies and rough bassline ideas and convert usable monophonic pitch information into quantized MIDI.
7. Generate safe FL Studio Gopher prompts, Piano roll scripts and approved macros while preserving FLP backups.
8. Store project templates, presets and loops in a properly authenticated Google Drive asset vault.
9. Offer a genuine producer collaboration lifecycle: invites, co-producer roles, permissions, project files, decisions, version history and sign-off.
10. Export audio and production reports in WAV, MP3, MIDI, stems, PDF and release/handoff packages.

## Security and production requirements
- Require explicit consent for microphone, system audio/screen capture and third-party services.
- No background recording, implicit remote control, unreviewed destructive script execution or secret exposure.
- Scan and validate new uploads, cap size, segregate project storage by identity, and keep protected downloadable artifacts behind signed URLs.
- Store original media unchanged and create versioned derivatives.
- A project owner must authorize collaborator access; invite drafts alone do not grant file access.
- Track rights/provenance for commercially released reference songs, loops and samples.
- Distinguish local heuristics, AI-generated suggestions and verified audio measurements in the interface.

## Staging strategy
The initial production home remains on `main`; new layout is developed and reviewed as a separate pull request. The older dashboard remains accessible on `/legacy`, so reviewing the redesign does not erase earlier components. Vercel preview deployments originate from the development branch. No production domain promotion until code checks and visual/interaction review succeed.

## Remaining engineering milestones
**R1 — Design and prototype:** DAW-style workspace, editable arrangement, channel rack, piano roll, mixer planning, right-hand assistant and collaboration drafts.  
**R2 — Real collaboration backend:** Auth, persistent project rooms, invitations, comments, secure file sharing, version control.  
**R3 — Real audio analysis:** WAV/MP3 ingest, beat/key/chord confidence, structure, reference loudness and mastering guidance.  
**R4 — FL Studio companion:** Non-destructive FLP inspection, Gopher/script handoff, optional user-authorized desktop service and capture.  
**R5 — Production intelligence:** Personal chord DNA, voice-to-MIDI, arrangement recommendations, remix planning and private references.  
**R6 — Export/render ecosystem:** Sample management, stems, audio renders, professional PDF reports, cloud integrations and release packaging.

## Validation checklist
- TypeScript, ESLint and Next.js production build.
- Browser desktop/mobile layouts, track/clip editing, local persistence, project naming and export JSON.
- Drum preview start/stop and note input/export from Piano roll.
- Invitation drafts, task completion and copy actions; verify no email sent.
- File preview and memory cleanup; no cloud uploads.
- Vercel preview branch matches reviewed commit.
