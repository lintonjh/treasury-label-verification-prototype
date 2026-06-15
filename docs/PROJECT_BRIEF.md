# Treasury Label Verification Prototype - Project Brief

## Purpose

This project is a take-home prototype for the Department of the Treasury IT Specialist (AI) role. It demonstrates a practical, responsible AI-assisted workflow for alcohol label verification.

The app helps a compliance agent compare visible label artwork against expected application fields. It is intentionally a prototype, not a regulatory decision system.

Core principle:

> AI extracts evidence. Deterministic rules make the verification decision.

That principle should guide future changes. The model should not be asked to decide pass/fail compliance.

## Target User And Workflow

Primary user: alcohol label compliance agent.

Main flow:

1. User uploads a label image or loads a sample.
2. User enters expected application fields.
3. User clicks **Verify Label**.
4. Server-side provider extracts visible label text/fields.
5. Deterministic rules compare extracted evidence to expected fields.
6. UI displays pass, needs review, or fail checks with evidence snippets.
7. User can inspect raw extracted text and export a JSON report.

The workflow should stay obvious, fast, and low-friction. Avoid hidden controls and avoid making the UI feel like a flashy demo.

For this standalone prototype, the expected application fields are the test stand-in for the application an agent would normally pull up in COLA. The sample controls load synthetic application records paired with matching and intentionally mismatched labels so reviewers can exercise application-versus-label checks without COLA access.

## Current Architecture

Stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest
- Vercel-compatible serverless API routes

Important paths:

- `app/page.tsx`: main client workflow, form state, uploads, verification calls, JSON export.
- `app/api/verify/route.ts`: single-label verification endpoint.
- `components/`: form, uploader, result summary, evidence panel, and results table.
- `lib/vision/`: provider abstraction, OpenAI provider, usage/safety helpers.
- `lib/verification/`: deterministic normalization, parsing, fuzzy matching, rules, and scoring.
- `lib/samples/`: sample application records used by the UI.
- `public/samples/`: generated sample label PNGs.
- `tests/`: unit tests for verification logic and provider support utilities.

No database is used. Uploaded files and extracted values are processed transiently.

## Provider Model

The provider interface is in `lib/vision/types.ts`.

Current provider:

- OpenAI provider: live extraction through the Responses API.

Live OpenAI extraction is meant to extract structured evidence only. It should not return regulatory decisions. `OPENAI_API_KEY` is required for label extraction.

## Verification Rules

Rules live in `lib/verification/rules.ts`.

Current checks:

- Brand name
- Class/type
- Alcohol content
- Net contents
- Government health warning
- Bottler/producer name
- Bottler/producer address
- Country of origin when imported

Overall status policy:

- Any failed critical check means overall `fail`.
- Otherwise any `needs_review` check means overall `needs_review`.
- Otherwise overall `pass`.

When adding rules, keep them explainable and deterministic. Prefer parsing and normalization over model judgment.

## Safety And Cost Controls

Live OpenAI mode is useful for a real demo, but it creates spend and abuse risk. Keep these controls in mind:

- API key must be server-side only. Never use a `NEXT_PUBLIC_` OpenAI key.
- Use a dedicated OpenAI project/key for the demo.
- Restrict the key to the Responses API where possible.
- Use project-level OpenAI budget/rate controls.
- Revoke the demo key after the assessment window closes.
- Keep app-side caps conservative.
- Add host-level protection such as deployment password protection, SSO, or route rate limiting where available.
- Treat uploaded labels as potentially sensitive business information.

Current app-side controls include request caps, output-token caps, and request timeout. These are useful brakes, not a substitute for provider billing limits or host-level rate limiting.

Debug logging:

- `LOG_LEVEL=info`: normal behavior, no provider request/response debug logs.
- `LOG_LEVEL=debug`: log provider request/response metadata server-side.
- API keys, uploaded image bytes, and extracted label text should remain redacted in logs.

## Environment Variables

Common local live-mode setup:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
LOG_LEVEL=debug
```

Deployed demo setup, only after billing and host protections are configured:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
LOG_LEVEL=info
```

See `.env.example` for the current full set of knobs.

## Sample Labels

Generated labels live in `public/samples`.

Current examples include 25 synthetic application/label pairs across distilled spirits, wine, and malt beverages. The set covers clean matches, ABV/proof mismatches, net contents mismatches, missing government warnings, warning wording/capitalization review, imported products with country of origin, imported products missing country of origin, and producer mismatch.

The sample set is intended to exercise app behavior, not to replace official TTB examples.

## Commands

Use these before committing changes:

```bash
npm test
npm run lint
npm run build
```

`npm run build` may need elevated local permissions in this managed sandbox because Next/Turbopack binds an internal local process port during CSS/build processing.

## Current Product Boundaries

In scope:

- Label image upload
- Expected field entry and sample application records as a COLA stand-in
- OCR/vision extraction behind an interface
- Deterministic comparison rules
- Evidence and raw text display
- JSON report export
- Deployment-ready documentation

Out of scope for this prototype:

- Authentication and user accounts
- Persistent document storage
- Durable audit logs
- Formal regulatory scoring
- Font size, bold, and layout compliance
- Full TTB category-specific rule engine

## Fresh Agent Starter Prompt

Use `docs/AGENT_START_PROMPT.md` when starting a fresh agent on a new feature, bug, or cleanup task.

## Guidance For Future Agents

Before changing behavior:

1. Read this brief and `README.md`.
2. Inspect `git status -sb`; the user may have uncommitted local work.
3. Keep AI extraction and deterministic verification separate.
4. Do not commit secrets or `.env`.
5. Do not make live OpenAI calls from browser/client code.
6. Keep user-facing errors generic; log provider details server-side with request IDs.
7. Add or update tests for verification rule changes.
8. Prefer small, clear improvements over broad rewrites.

## Useful Next Improvements

- Add a visible provider mode indicator in the UI.
- Add a small local-only diagnostics panel or admin view for provider status.
- Add Vercel or host-level rate limiting instructions once the final host setup is chosen.
- Add more TTB-inspired malt beverage sample labels and rules, while documenting which rules are intentionally out of scope.
- Improve structured output robustness for live OpenAI responses.
- Revisit batch processing after the single-label workflow is polished and reliable.
