---
name: diff-review
description: Fresh-eyes review of this branch's changes against the spec's done checklist. Use before pushing or opening a pull request.
disable-model-invocation: true
context: fork
agent: general-purpose
disallowed-tools: Edit Write NotebookEdit
argument-hint: "[spec path] [base branch, default origin/main]"
---

# Review the change

You did not write this code. Review it as a strict senior engineer. Do not edit any file.

Spec: $0
Base branch: $1 (if empty, use `origin/codex/resistguard`, the shared branch; if that does not exist, use `git merge-base` with the branch this one came from)

## Get the change
Run `git status --short`, `git diff` (uncommitted work) and `git diff <base>...HEAD`. Skip `public/review-packet.json` and `data/content-manifest.json`; a script writes them.

## Check, in this order
1. **Spec**: go through every item in the spec's done checklist. Mark each one pass, fail, or "a person must check" (for example the real-phone test).
2. **Scope**: did any file change that the spec did not name? Any reformatting of lines that did not need to change?
3. **When it shows**: new UI appears only under the condition the spec gives (for example only after "Yes, that's it").
4. **Health copy**: apply `.claude/skills/health-copy-rules/SKILL.md` to every new sentence a user will read.
5. **Privacy**: no photo, name, typed text, storage, analytics or new network call.
6. **Style**: matches nearby files (single quotes, `{a,b}` imports, dense JSX). New CSS lives in its own file with prefixed class names; existing classes are reused; every value comes from `app/tokens.css`; no red, and green only on the answer card. Follow the "Design system" section of `CLAUDE.md` and `DESIGN.md`.
7. **Review packet**: every new text file is in the `files` list of `scripts/review-packet.mjs`.
8. **Tests**: do they test real behaviour (encoded link, correct ingredient names, no short code), or only that a function exists?
9. **Docs**: if the change adds, hides or removes a screen, record or feature, `PROJECT_MAP.md` says so.

## Output
1. A table of problems: file:line, problem, fix. Most serious first.
2. The done checklist with pass / fail / person must check.

No praise. If nothing is wrong in a section, say "none".
