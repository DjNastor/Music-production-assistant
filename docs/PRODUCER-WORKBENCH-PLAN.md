# Nastor AI Studio — Producer Workbench and AI Production System

**Project:** [DjNastor/Music-production-assistant](https://github.com/DjNastor/Music-production-assistant)  
**Product owner:** DJ Nastor / Lukulu Recordings  
**Document status:** Living implementation specification — November 2026

## 1. Purpose

Nastor AI Studio is a personal, production-first music creation and delivery workspace. Its job is to help a producer turn incomplete audio, MIDI, arrangements, stems and FL Studio sessions into professionally finished records while preserving artistic control and original source files.

It is **not** a replacement for FL Studio and **not** a rebranded copy of its interface. Its browser workbench uses familiar generic DAW patterns and adds production intelligence, handoff, analysis, reusable presets and organization.

### Difference from Lukulu Academy DAW Learning Lab

| Lukulu Academy DAW simulator | Nastor AI Studio |
|---|---|
| Student learning and guided lessons | Producing and finishing original records |
| Understanding arrangement and mixer concepts | Creating arrangements and improving real productions |
| Educational channel-rack/piano-roll exercises | Editable MIDI, playable sketches, production decisions, exports |
| Transfer skills to a real DAW | Actively hand off MIDI, scripts and context to FL Studio |

The applications are separate. Reuse high-level interaction patterns, not proprietary third-party interface assets.

## 2. Core use cases and outcomes

### 2.1 Finish an unfinished production
- Input a reference/demo as WAV or MP3; optionally attach stems, MIDI, a zipped FLP handoff or track notes.
- Analyze tempo, beat grid, probable key, chords, loudness, tonal balance, structure, stereo image, headroom and groove.
- Flag uncertainty: key and chord detection are estimates, not ground truth.
- Produce specific next actions: drum placement, chord alternatives, bassline, hook, break, build, transitions, reverb/delay automation, gain staging and export checks.
- Preserve originals; version all generated materials.
- Export a production checklist and an FL Studio handoff package.

### 2.2 Produce inside an original DAW-inspired workbench
- Navigate transport, four-bar chord/phrase timeline, Piano roll, rhythm tool, sections and project context.
- Edit note positions and durations; choose tempo, root, scale and default note duration.
- Generate simple diatonic progressions, alternate progressions and octave variations.
- Snap existing MIDI pitches to selected musical scales without touching timing.
- Hear a lightweight synthesizer preview generated with browser audio APIs.
- Import MIDI or JSON templates; export valid Standard MIDI Files for FL Studio.
- Save a local session and export a portable JSON template.
- Clearly label local rule-based guidance as such until a real AI service is connected.

### 2.3 FL Studio and Image-Line Gopher integration

**Current bridge (first milestone):**
1. Create or import a chord sketch in Nastor AI Studio.
2. Choose BPM, tonic and scale, then refine notes and playback.
3. Export a Standard MIDI File; drag it into FL Studio.
4. Generate Gopher instructions for quantization, organization, arrangement or mixer cleanup.
5. Copy instructions into Gopher inside FL Studio.
6. Optionally download a `.pyscript` Piano roll scale snap script. Save an FLP backup first.

**Important implementation boundary:** Image-Line Gopher is experimental and opens inside FL Studio. It is not an always-on background connection to Nastor AI Studio. Its supported project control is permission-gated; the browser app cannot directly operate the user's FL Studio instance without a dedicated authorized bridge. Gopher can inspect project details, handle selected track/mixer actions, open windows, quantize notes and create/run Piano roll scripts within current documented limits. Scripts are not the same as VST plugins.

Official references:
- [Gopher control](https://www.image-line.com/fl-studio-learning/fl-studio-beta-online-manual/html/gopher/gopher_control.htm)
- [Piano roll scripting API](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/pianoroll_scripting_api.htm)
- [MIDI controller scripting](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/midi_scripting.htm)

**Planned bridge (later):**
- Local macOS/Windows companion service with explicitly granted access to selected files, audio devices, FL Studio project exports and loopback audio.
- Auditable, permissioned transport, session monitoring and commands. Do not assume FL Studio supports a universal remote-control API.
- FLP parsing and reporting where technically reliable; exported stems/MIDI are primary interoperable formats.
- Gopher command history, dry-run previews, backups and post-action verification.
- Generate Piano roll scripts where the published scripting API permits them; separate plugin scaffolding and build toolchains for VST3 instruments/effects.
- Never run generated scripts or delete project data without explicit review.

### 2.4 Harmony intelligence and a personal production DNA
- Import a user's owned MIDI and reference material, extract chord vocabulary, extensions, voicing density, register, rhythm and harmonic movement.
- Save opt-in preferences in a versioned production-profile store.
- Rank candidates by similarity to preferred voicings while preserving options for novelty.
- Generate MIDI chord progressions and bassline/counter-melody variations with audition and export.
- Train or tune recommendations only with properly licensed data. A user preference profile is not the same as model training.
- Later: voice/humming-to-MIDI with pitch tracking, note segmentation, scale-aware correction, quantization and variation generation.

### 2.5 Intelligent arrangement
- Convert audio and project markers to an editable timeline.
- Detect probable intro, verse, groove, breakdown, build and drop, each with confidence and manual corrections.
- Suggest bar lengths, drum/percussion changes, bass movement, hook positioning, filter automation and transitions for club and radio arrangements.
- Compare a proposed arrangement to a licensed/reference track by high-level musical attributes without recreating copyrighted notes or masters.

### 2.6 Mix and mastering reference
- Analyze LUFS-I, short-term loudness, LRA, true peak, sample peak, crest, tonal balance, low-end mono compatibility, dynamics, stereo width and clipping.
- Display track-by-track comparisons and actionable mix adjustments.
- Reference tracks may be locally uploaded when rights permit; link to Spotify tracks for discovery and metadata, but **do not** assume Spotify streams can be downloaded or analyzed as raw audio.
- Provide mastering suggestions as comparison, not a false guarantee of professional results.
- An optional mastering engine needs external DSP or rendering infrastructure.

### 2.7 Sampling, remixing and versioning
- User-supplied, authorized samples, loops and stems stored with provenance and license notes.
- Beat detection, chopping, loop points, time-stretch/pitch-shift previews and MIDI mapping.
- Stem separation, intelligent remix arrangement, and export of full, extended DJ, radio, dub, instrumental and social versions where sources allow.
- Require permission to reuse commercially released music; no indiscriminate ripping of streaming-service content.
- Maintain original audio, save derivative versions, allow A/B review, add release metadata.

### 2.8 Personal sound vault
- Organize drum loops, user presets, plugin snapshots, MIDI, FLP templates, racks, sample packs, project templates, mastered references and project notes.
- Index tags: BPM, key, instrument, mood, genre, origin, license, plugin, version and project.
- Cloud syncing via user-authorized Google Drive OAuth with narrow scopes and duplicate/version checks; browser-local storage is a temporary fallback.
- Offer search, favorites, pack previews and safe template sharing.

### 2.9 Voice-controlled sessions
- Opt-in microphone input to dictate tasks and record song ideas.
- Differentiate transcription ("create a checklist"), audio recording ("save this vocal idea"), and performance-to-MIDI ("detect sung pitches").
- Ask for confirmation before any destructive or costly command.
- Show recording status clearly. No covert screen/audio capture.

### 2.10 Export and production reports
- Music outputs: MIDI, WAV, MP3, stems, reference snippets and version manifests.
- Documents: PDF session reports, arrangement plans, plugin inventory, mastering comparison reports, copyright/license sheet and collaborator handoff.
- Include source identities, software/plugins, exported format, bit depth, sample rate, loudness settings and timestamps.

## 3. Architecture

Current frontend: Next.js App Router, React, TypeScript, CSS modules and Web Audio API.

Suggested production architecture:
- **Identity and authorization:** secure login; scoped roles; explicit permissions for collaborators and connected accounts.
- **Project API:** typed projects, assets, versions and metadata.
- **Object storage:** private WAV/FLP/stem assets with expiring signed URLs.
- **Database:** project state, tags, prompt history, user DNA, job status, outputs and audit events.
- **Analysis workers:** Python/librosa/Essentia or other validated DSP, with confidence reporting.
- **MIDI services:** musical analysis, chord matching, note estimation, quantization and export.
- **AI orchestrator:** provider-agnostic text/audio model calls with reviewable actions and retrieval from permitted project context.
- **Rendering and DSP:** asynchronous job queue for source separation, time stretch, mixing/mastering and exports.
- **Integrations:** Google Drive, optional Spotify discovery, FL Studio handoff, Gopher commands and third-party generation services where supported.
- **Desktop bridge:** opt-in local service for DAW/audio capture where technically feasible.

Protect all credentials server-side. Validate media types, file sizes and import schemas. Treat uploaded audio and external model text as untrusted data. Require explicit authorization before sharing assets or sending outputs to third-party AI services.

## 4. Current implementation and its limits

### Already present on main
- Original branded frontend shell, project selection and local Copilot mock.
- Arrangement preview, production plans, basic FL Studio handoff instructions.
- Interactive pattern desk with drum synthesis, step editing, groove heuristics, JSON import/export and local persistence.

### Implemented on `feat/producer-daw-workbench`
- New original Producer Workbench integrated into the Studio navigation.
- DAW-style Piano roll covering pitches C2–B5, 64 sixteenth-note steps and section cues.
- Chord generation, alternate voicings, scale snapping, light Web Audio chord preview.
- Standard MIDI import/export (four-bar, quantized workbench scope).
- Local session autosave and JSON template import/export.
- FL Studio Gopher prompt builder and downloadable key-specific Piano roll `.pyscript`.
- Rule-based harmony feedback with transparent limitations.

### Not yet implemented or integrated
- Audio file analysis and real-time loopback capture; microphone/voice transcription.
- Real AI reasoning backend; current Copilot replies are local mock content.
- Automatic connection to FL Studio or direct Gopher commands.
- Sample pack chopping, real VST hosting, plugin compilation and export rendering.
- Spotify/Drive/Suno authenticated integrations; cloud sync.
- Professional mastering, stem extraction and real WAV/MP3 exports.
- Multi-project persistent database or production authorization.

## 5. Build sequence and acceptance criteria

**Phase 1: Producer DAW foundation (this branch).** Workbench visible from Studio nav, editable grid, playable chords, user MIDI import/export, Gopher prompt/script exports, responsive UI, code review and CI verification.

**Phase 2: Asset ingestion.** Project vault and file upload, backend ingest service, virus/file validation, metadata, audio preview and sample library. Tests: imported samples searchable and recoverable; originals immutable.

**Phase 3: Audio understanding.** BPM, key, chord hypotheses, sections, tonal balance, loudness and uncertainty reports. Tests: benchmark against labeled tracks, offer manual corrections and accessible charts.

**Phase 4: Intelligent composition.** Saved production DNA and MIDI-aware chord/bass/melody recommendations. Tests: editable variation audition, faithful MIDI exports, opt-in preference learning.

**Phase 5: FL Studio companion.** MIDI/FLP package auditing, user-approved scripts, optional local audio capture and workflow monitoring with permission prompts. Tests: no unattended access; full logging and rollback paths.

**Phase 6: Mastering and reference.** Licensed reference upload, calibrated DSP metrics, recommendations and export reports. Tests: reliable loudness measurements and clearly labeled reference comparisons.

**Phase 7: Remix and rendering.** Authorized asset processing, stem separation, arranging, clean/dub/DJ/radio variants and export pipeline. Tests: preservation of original assets and reproducible manifests.

**Phase 8: Cloud and voice.** OAuth-connected storage, audio idea recording, voice commands, collaborative review and controlled provider integrations.

## 6. How to use the current producer workbench

1. Open Nastor AI Studio and choose **Studio**.
2. Set the project's tempo, root note and scale.
3. Generate chords or edit individual notes in the Piano roll.
4. Play the four-bar synth preview and adjust voicings.
5. Snap notes to the selected scale where needed.
6. Export MIDI, then import it into FL Studio.
7. Choose a Gopher task; copy the prompt into FL Studio's Gopher interface.
8. For scale snapping, optionally export the `.pyscript`, back up the FLP, install under the FL Studio user-data Piano roll scripts folder and review before running.
9. Download the JSON template or let browser-local autosave retain the sketch.

**Data warning:** Browser-local autosave is device/browser-specific and may be lost when data is cleared. Export a JSON template for long-term retention.

## 7. Product design standards

- Dark professional music-production environment, original Nastor branding and readable control typography.
- Keyboard and touch accessible actions, labelled buttons, responsiveness and visible running status.
- No false "AI" claims: clearly distinguish rule-based analysis, simulated demo actions and connected services.
- Avoid copying FL Studio branding or interface assets; use original, familiar DAW interaction conventions.
- Store expensive or destructive operations behind human review.
