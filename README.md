# Treasury Label Verification Prototype

## Overview

Treasury Label Verification Prototype is a standalone web app that helps alcohol label compliance agents compare visible label artwork against expected application fields.

The design principle is simple: **AI extracts evidence; deterministic rules make the verification decision.** The app is intended as a take-home prototype, not as a production compliance authority.

For deeper design context and agent handoff notes, see `docs/PROJECT_BRIEF.md`.

## Problem Statement

Alcohol label reviewers compare submitted artwork against application fields such as brand name, class/type, alcohol content, net contents, bottler or producer information, country of origin, and the government health warning. This prototype reduces repetitive matching work by extracting visible evidence from a label image and presenting a clear checklist for review.

## Features

- Single-label upload with image preview.
- 25 sample application records and generated labels across spirits, wine, and beer.
- Server-side AI/OCR provider abstraction.
- Deterministic verification rules for core label fields.
- Pass, Needs Review, and Fail status labels.
- Evidence snippets and raw extracted text.
- Local JSON report export.

## How To Use

1. Open the app.
2. Choose one of the sample application records, or upload a PNG, JPEG, or WebP label.
3. Enter or edit the expected application fields.
4. Click **Verify Label**.
5. Review the overall status, checklist, evidence snippets, and raw extracted text.
6. Export the JSON report if needed.

## Testing Without COLA Access

The Treasury prompt describes an agent pulling up an application in COLA and checking that the label artwork matches that application. It also says this prototype is not expected to integrate directly with COLA. This app treats the **Expected Application Fields** form as the application record for testing.

The sample dropdown loads a synthetic application record and matching or intentionally mismatched label artwork. The 25 samples cover distilled spirits, wine, and malt beverages, including expected pass paths and failures for alcohol content, net contents, government warning, country of origin, and producer information. One warning sample intentionally needs human review because the warning appears present but not in the exact expected form.

Reviewers can also edit the expected fields after loading a sample to simulate a different application record. The AI/OCR provider still only extracts visible label evidence; deterministic TypeScript rules compare that evidence against the expected application fields.

## Sample Labels

The repository includes 25 generated PNG labels in `public/samples` for manual testing:

- Distilled spirits: bourbon, mezcal, gin, vodka, rum, tequila, and Canadian whisky.
- Wine: chardonnay, merlot, riesling, and sparkling wine.
- Malt beverages: lager beer, IPA, stout, amber ale, and imported pilsner.
- Scenario coverage: clean matches, ABV mismatches, net contents mismatches, missing government warning, warning wording/capitalization review, missing country of origin, and producer mismatch.

The samples are static assets for exercising the deployed workflow with the live extraction provider.

## Local Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` for local development.

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
LOG_LEVEL=info
OPENAI_DEMO_MAX_REQUESTS_PER_MINUTE=3
OPENAI_DEMO_MAX_REQUESTS_PER_HOUR=30
OPENAI_DEMO_MAX_REQUESTS_PER_DAY=100
OPENAI_MAX_OUTPUT_TOKENS=700
OPENAI_REQUEST_TIMEOUT_MS=20000
```

`OPENAI_API_KEY` is required for label extraction. The app applies conservative request caps, an output-token cap, and a provider timeout before making OpenAI calls. These app-side brakes are useful for demos but are not a substitute for an OpenAI project spend limit or host-level rate limiting.

For local debugging, set `LOG_LEVEL=debug` to log OpenAI provider request and response metadata on the server. API keys, uploaded image bytes, and extracted label text are always redacted from these logs.

## Running Tests

```bash
npm test
npm run lint
npm run build
```

The tests cover normalization, fuzzy matching, ABV/proof parsing, net contents parsing, government warning detection, rule outcomes, and overall status aggregation.

## Architecture

The app uses Next.js App Router with server-side API routes:

- `app/page.tsx` coordinates the upload, form state, verification request, and JSON export.
- `app/api/verify/route.ts` validates inputs, processes the uploaded image transiently, calls the selected vision provider, and runs verification rules.
- `lib/vision` isolates OCR/AI extraction behind a provider interface.
- `lib/verification` contains deterministic parsing, normalization, matching, and status logic.

No database is used. Uploaded labels, application fields, extracted text, and reports are not persisted by the app.

## Tools Used

- Next.js App Router and React for the web app.
- TypeScript for application, provider, and verification logic.
- Tailwind CSS for styling.
- Zod for request validation.
- Vitest and ESLint for automated checks.
- Server-side OpenAI Responses API integration for label evidence extraction.
- Static sample labels for exercising the workflow.

## AI/OCR Approach

The provider interface is:

```ts
export interface VisionProvider {
  extractLabelFields(input: {
    imageBase64: string;
    mimeType: string;
  }): Promise<ExtractedLabel>;
}
```

The OpenAI provider runs server-side and asks the model to return structured JSON evidence only. The model does not decide whether a field passes or fails.

This abstraction allows the prototype provider to be replaced with an agency-approved OCR service, private endpoint, or hosted model in a production federal environment.

## Verification Rules

- **Brand name:** normalized exact or strong fuzzy match passes; close match needs review; missing or clearly different fails.
- **Class/type:** normalized match passes; partial or close match needs review; missing or clearly different fails.
- **Alcohol content:** ABV and proof are parsed and normalized; `45% Alc./Vol.` and `90 Proof` are treated as equivalent.
- **Net contents:** liters and milliliters are normalized; `750 mL`, `750ml`, and `0.75 L` are equivalent.
- **Government warning:** checks for warning presence, all-caps `GOVERNMENT WARNING:`, and core wording.
- **Producer/bottler/address:** simple normalized and fuzzy matching.
- **Country of origin:** required only when the expected application marks the product as imported.

Overall status is Fail if any critical check fails, Needs Review if at least one check needs review and none fail, and Pass otherwise.

## Assumptions

- The prototype is standalone and does not integrate with COLA.
- The deployed app is configured with API access for live label extraction.
- Label and application data may be sensitive business information, so the prototype avoids persistence.
- True font size, bold, and layout validation are outside this prototype’s scope.

## Security And Privacy Notes

- Uploaded labels are processed transiently in server-side API routes.
- The app does not intentionally store uploaded images, expected fields, extracted text, or reports.
- The app does not log document contents or application field values.
- API keys are never exposed to the browser.
- Browser code never calls external AI services directly.
- Live OpenAI calls include demo request caps, output-token caps, timeout controls, and privacy-preserving safety identifiers.
- The JSON report export is created locally in the user’s browser.

## Network And Provider Considerations

Some federal environments block outbound traffic to third-party ML endpoints. This prototype accounts for that by keeping AI/OCR calls behind a server-side provider interface.

For production, the provider should be replaced with an approved OCR or AI service reachable through Treasury-approved networking controls. Options could include an agency-hosted model, a private endpoint, AWS GovCloud, Azure Government, or another approved federal platform depending on Treasury standards.

## Accessibility And UX Notes

- Statuses use text labels, not color alone.
- Buttons and fields have visible labels and focus styles.
- The main workflow is available on the first screen.
- The app is desktop-first but responsive enough for smaller screens.

## Known Limitations

- Live AI extraction quality depends on image clarity and provider availability.
- Font size, bold, placement, and full layout compliance are not validated.

## Future Improvements

- Batch review queue for high-volume submissions, with per-label status and export.
- Image quality screening for blurry, angled, dark, cropped, or glare-obscured labels before extraction, with unclear images routed for review or a clearer upload request.
- Direct application intake from COLA or another approved system of record.
- More detailed warning-statement readability and layout checks.
- Human review queue that prioritizes failed and uncertain checks.
- Agency-approved deployment path with authentication, audit logging, retention policy, rate limiting, and approved OCR/AI infrastructure.

## Trade-offs

The prototype favors a clean, explainable, working core over enterprise infrastructure. It avoids a database, queues, authentication, and permanent storage because those would add operational complexity without improving the assessment’s core question: can the app extract label evidence, compare it against expected fields, and present useful review results quickly and responsibly?
