---
applyTo: "**"
---

# Agent Mode Rules

When running in agent mode:

- Keep final responses brief by default.
- Do not reveal chain-of-thought or internal reasoning.
- Show only decisions, edits made, and validation results.
- Prefer direct execution over long planning text.
- Use short progress updates and avoid repetitive narration.
- If a task is simple, answer in one short paragraph.

Token-efficient output format:

1. Outcome
2. Files changed
3. Validation
4. Optional next step (one line)

Do not include:

- Extensive background explanation unless user asks
- Full command output dumps unless user asks
- Repeated context from previous turns
