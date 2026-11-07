# Fadr API Integration — Nastor AI Studio

## Current status

**Implementation:** The Next.js server proxy and the Fadr Stem Lab UI are committed to the redesign branch (`feat/producer-collab-daw-redesign`). No external Fadr account has been connected to this deployment and no billable integration test has been performed. Fadr remains **not configured** until its credentials are added securely in Vercel.

The application provides stem separation, downloads and selected metadata through the published Fadr API workflow. It does not expose Fadr's full interactive remix experience, act as an FL Studio VST, or grant direct control over an FL Studio session.

### Sources (verify current terms with Fadr)
- https://fadr.com/docs/api
- https://fadr.com/docs/api-stems-tutorial
- https://fadr.com/docs/api-endpoints
- https://fadr.com/docs/api-billing

## Connection steps

1. Obtain Fadr Plus and an API key through the Fadr API area. Check that the account has credits or acceptable billing arrangements.
2. In the connected Vercel project, add server-only **`FADR_API_KEY`** with the official value.
3. Separately create a long random beta access secret and add it as **`FADR_STUDIO_ACCESS_TOKEN`** on Vercel. Do not use the Fadr key as this token; do not make either secret a `NEXT_PUBLIC_` value.
4. Redeploy the branch. Go to `/studio?view=fadr` or choose **My sounds → Separate stems with Fadr**.
5. Enter the *studio access code* (never your Fadr API key). Select a WAV or MP3 under 100 MB that you own or have permission to process.
6. Approve Fadr's processing and billing consent before pressing **Separate into stems**. Nothing is sent or billed by merely selecting a file.
7. Review progress, key/tempo information and the returned stems/MIDI. Download the individual results using Fadr-generated signed links.

## API flow in this implementation

1. `POST /assets/upload2` creates a presigned upload URL.
2. The browser sends the selected audio via presigned S3 `PUT`. The browser must be permitted by the upload bucket's CORS policy. Fadr's example specifies the correct MIME type.
3. `POST /assets` registers the upload as an asset.
4. `POST /assets/analyze/stem` with `stemType: "main"` starts a chargeable separation job. This call is made only after explicit approval in the UI.
5. `GET /tasks/:_id` is polled every five seconds.
6. `GET /assets/:_id` reads generated stem and MIDI asset identifiers and, when available, key and tempo metadata.
7. `GET /assets/download/:_id/download` creates a temporary signed download link.

The proxy refuses mutating operations without a separate studio access token. This is **only a single-owner beta protection**; before broad release replace the access code with actual account authentication, owner-scoped asset validation, persistent task ownership and rate and spending controls.

## Pricing and rights

Fadr's published documentation lists **US$0.05 per input audio minute** for the Create Stem Task endpoint. Fadr Plus and API credits are required, and its terms may change. Users should confirm their Fadr balance and charges before processing.

Only process recordings you are authorized to use. Audio is transferred to and stored by Fadr under its service terms. No raw WAV, MP3, stems or MIDI files are embedded into the Nastor project manifest by default.

## Validation and limitations

- Typecheck, lint and production build must pass on the development branch.
- With no environment secrets configured, the page must correctly display an unconfigured state and prevent starting a task.
- With staging credentials, test first using a short, user-owned recording and a known billing allowance.
- Verify S3 presigned `PUT` and CORS, asset creation, chargeable task creation, polling and downloading.
- Confirm there are no credentials stored in Git, frontend code or browser bundles.
- Check session navigation, accessible status text, error reporting and mobile layout.
- The current implementation does not preserve Fadr task IDs across a refresh, analyze tracks locally, or synchronize outputs into FL Studio automatically.
- Future authenticated collaboration will require project-scoped authorization, quotas and ownership.
