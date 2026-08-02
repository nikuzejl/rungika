# Copilot Project Instructions

Purpose: Keep responses and edits concise, high quality, and token efficient.

## Response Style
- Prefer short, direct answers.
- Lead with the result, then only essential details.
- Do not provide hidden reasoning or step-by-step thought process.
- Do not restate the prompt unless needed for clarity.
- Avoid long summaries when a one-liner is enough.

## Coding Behavior
- Make the smallest safe change that solves the request.
- Avoid broad refactors unless explicitly requested.
- Preserve existing style and architecture.
- Touch only relevant files.
- Prefer clear variable names and readable code over cleverness.

## Token Management
- Keep preambles and status updates to 1-2 sentences.
- Use concise bullets instead of long prose.
- Skip repeating unchanged plans or context.
- Avoid dumping large code blocks unless requested.
- When listing findings, include only actionable items.

## Quality Bar
- Keep behavior correct first, then concise.
- Validate changed files with diagnostics/tests when possible.
- If tradeoffs are needed, choose correctness and maintainability.

## Clarification Rule
- Ask a question only when blocked or requirements conflict.
- Otherwise proceed with a reasonable assumption and state it briefly.
