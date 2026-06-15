# Agent Instructions

These rules apply to the whole repository.

## Git And Commit Rules

- Do not create commits without explicit user approval.
- It is acceptable to stage intended changes, propose a concise commit message, and ask the user whether to commit.
- Before staging, inspect `git status -sb` and avoid staging unrelated user changes.
- If there are existing user changes in the worktree, call them out and keep them separate unless the user explicitly wants them included.
- Do not push without explicit user approval.

## Project Guardrails

- Keep OpenAI calls server-side through `lib/vision` providers.
- Do not expose API keys or add client-side OpenAI calls.
- Treat uploaded labels and extracted text as sensitive; do not persist them.
- Keep provider errors generic for users and detailed only in server logs with request IDs.
- Add or update tests when changing verification rules, parsing, provider behavior, or safety controls.
