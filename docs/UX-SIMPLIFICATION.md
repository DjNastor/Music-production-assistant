# Nastor AI Studio — Simplified producer UX

## Intent
Use the Lukulu Academy DAW workspace **structure** for professional creative work without carrying over lessons or student scoring. The primary focus is music production, reference listening and producer collaboration.

## Design direction from supplied imagery
- Charcoal/ink workspace and restrained warm gold actions, inspired by the shared Lukulu brand artwork.
- An optimized derivative of the user-provided illustrated producer artwork is used in the compact entry banner (`public/brand/nastor-portrait-art.svg`).
- Nastor AI Studio keeps its own label and identity; do not replace the studio logo with Lukulu branding.
- Source imagery should only be distributed where the user has appropriate usage rights; the artwork in the repository is a tiny 140×140 display derivative, not a high-resolution downloadable master.

## Navigation
Only three primary choices: **Make music**, **My sounds**, **Collaborate**.

### Make music
- The entry banner answers “What should I do?” with three clear actions: **Build a beat**, **Write chords**, **Work together**.
- Beat and Chords actions scroll to their editor.
- The arrangement remains visible, but detailed production controls live in tabs below it.
- The project browser and AI assistant are **collapsed by default** to prioritize music creation. Both can be opened from the top bar.
- **Export brief** explicitly describes the actual file output (JSON project handoff), not a finished audio render.
- The transport action is labeled **Scan bars**; it moves a visual playhead but does not pretend to play full audio.

### My sounds
- Select and audition user-owned local audio references. Files are only held temporarily in the browser, never uploaded.
- Search chosen files and see a simple file manifest.
- Persistent uploads and audio analysis require a future backend.

### Collaborate
- Invite *drafts*, task list, role assignment and session notes.
- Draft means no email or project access was sent.
- Export a JSON handoff file for a manually coordinated producer session. Secure online collaboration remains a roadmap milestone.

## Accessibility and clarity
- Large, labeled primary controls and visible keyboard focus.
- Responsive buttons and navigation; advanced panels can be opened on mobile.
- Reduced-motion preference respected for action-to-editor scrolling.
- All AI, DAW, and audio engine features retain clear limitations rather than misleading "connected" indicators.

## Verification steps
1. Visit the Vercel preview of `feat/producer-collab-daw-redesign`.
2. Confirm the quick actions navigate to the beat editor, piano roll and collaboration screen.
3. Expand and collapse project browser and assistant. The center layout must reflow without empty columns.
4. Check responsive widths around 700, 1050 and 1200 px.
5. Create/edit arrangement clips; ensure they autosave in this browser.
6. Create a collaboration invite draft; confirm no email was sent.
7. Import a local reference and confirm playback where supported; no server upload.
8. Export a brief; verify it contains session notes but no actual audio.
9. Check that `/legacy` still opens the former control room.

## Implementation status
This is a UI simplification on the draft redesign branch. CI checks run in GitHub Actions and Vercel creates preview builds. The work is **not** merged to the main production branch without review.
