# Fresh Agent Starter Prompt

You are working on the Treasury Label Verification Prototype.

Read first:
1. README.md
2. docs/PROJECT_BRIEF.md
3. git status -sb

Core invariant:
AI extracts label evidence; deterministic TypeScript rules make pass / needs review / fail decisions. Do not move compliance judgment into the LLM.

Repo-specific constraints:
- Keep OpenAI calls server-side through lib/vision providers.
- Do not expose API keys or add client-side OpenAI calls.
- Treat uploaded labels and extracted text as sensitive; do not persist them.
- Keep provider errors generic for users and detailed only in server logs with request IDs.
- Keep debug logs redacting API keys, image bytes, and extracted label text.
- Add or update tests when changing verification rules, parsing, provider behavior, or safety controls.

Before handoff, run the relevant checks:
- npm test
- npm run lint
- npm run build

Summarize changed files, validation results, and any environment/deployment changes.
