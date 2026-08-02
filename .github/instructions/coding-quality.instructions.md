---
applyTo: "**/*.{ts,tsx,js,jsx,java,kt,json,yaml,yml,md}"
---

# Coding Quality and Efficiency

- Prefer minimal, focused diffs.
- Keep public APIs stable unless change is required.
- Add comments only for non-obvious logic.
- Avoid adding dependencies unless they provide clear value.
- Keep error messages user-friendly and specific.
- Favor deterministic behavior over implicit magic.

Validation discipline:

- Run diagnostics on touched files.
- Run the fastest relevant build/test check.
- Report only meaningful validation outcomes.
