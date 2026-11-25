---
name: verify
description: Run ResistGuard's full check (review packet, tests, typecheck, build) and fix what fails. Use after any code change and before saying a task is done.
allowed-tools: Bash(node scripts/review-packet.mjs) Bash(npm test) Bash(npm run typecheck) Bash(npm run build) Bash(git status *) Bash(git diff *)
---

# Verify

Run these in order. Stop at the first failure, fix it, then start again from step 1.

1. `node scripts/review-packet.mjs`. It is needed when a file in its `files` list changed, and it is always safe to run.
2. `npm test`. Every test must pass. If the "review packet fingerprint" test fails, step 1 was skipped.
3. `npm run typecheck`
4. `npm run build`. "Review packet is stale" means step 1 was skipped, or a reviewed file changed after it ran.
5. `git status --short`. Only the files you meant to change should appear. `public/review-packet.json` and `data/content-manifest.json` are expected after step 1. If `AGENTS.md` appears, `next dev` re-added its block; leave it.

## Rules
- Never edit or delete a test to make it pass. If a test looks wrong, tell me why.
- Never hand-edit `public/review-packet.json` or `data/content-manifest.json`.
- Report each command as pass or fail, with the number of tests that passed.
