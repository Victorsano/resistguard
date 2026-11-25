---
name: add-feature
description: Build a feature into ResistGuard from a written spec, as a small change that matches the existing code. Use when starting work on a spec file.
disable-model-invocation: true
argument-hint: "[spec path, e.g. claude/FEATURES_TO_BUILD.md]"
allowed-tools: Bash(git status *) Bash(git branch *)
---

# Add a feature from a spec

Spec: $ARGUMENTS

## 1. Check the branch
!`git status --short --branch`

- If this is `main` or the shared branch (`codex/resistguard`), stop. Ask me to create a feature branch, for example `feature/next-steps`.
- If there are uncommitted changes you did not make, stop and ask.

## 2. Read before you write
1. Read the whole spec.
2. Read every file the spec says to change, in full.
3. Read one nearby component for style, for example `app/components/AskResistGuard.tsx`.
4. If the feature sits on the result screen, read the `result?` block in `app/components/MedicineCheck.tsx` and the `Medicine` type in `lib/safety.ts`.

## 3. Plan, then wait
Reply with a plan of 10 lines or fewer:
- each file you will create or change, with one line on why
- each plain function you will put in `lib/`, with its inputs and output
- every open question in the spec that blocks you (for example a web address nobody has confirmed). Do not guess these.

Wait for my OK before you edit anything.

## 4. Build in this order
1. Logic in `lib/<feature>.ts`: plain functions, no React, no browser APIs, so `node:test` can import them.
2. Tests in `tests/<feature>.test.ts`, using `node:test` and `node:assert/strict`, in the style of `tests/safety.test.ts`.
3. The component in `app/components/<Feature>.tsx`. Add `'use client'` only if it needs state or click handlers.
4. The smallest edit to the parent component: one import and one render line, behind the exact condition the spec gives.
5. Add every new file that holds user-facing text to the `files` list in `scripts/review-packet.mjs`. Add one checklist id per feature (for example `'next-steps:nafdac-handoff'`), so a pharmacist reviews it.

## 5. Finish
Run the `verify` skill. If you changed any component or CSS file, run the `ui-check` skill too. Then list the files you changed, what each change does, and anything in the spec you did not do.
