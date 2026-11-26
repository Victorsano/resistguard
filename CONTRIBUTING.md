# Contributing to ResistGuard

How to build a feature that fits the existing code, design and safety rules. Read [`PROJECT_MAP.md`](PROJECT_MAP.md) first, then this file. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) explains why the patterns below exist.

## 1. Before you start

1. Install and run the app (see the [README](README.md)). Make sure `npm test` passes on a clean checkout.
2. Write or get a spec. Copy [`docs/FEATURE_SPEC_TEMPLATE.md`](docs/FEATURE_SPEC_TEMPLATE.md). A spec names the files to change, the exact user-facing words, when the feature shows, and a done checklist.
3. Branch from the shared branch `codex/resistguard`. Name it `feature/<short-name>` or `fix/<short-name>`. Never commit straight to `codex/resistguard`.
4. Tell the team if you will edit a **hot file**. Two people editing these at once causes painful merges:
   - `app/components/MedicineCheck.tsx` (the whole check flow)
   - `lib/screen-copy.ts` (every checker word)
   - `app/components/CheckApp.tsx`
   - `app/globals.css`, `app/tokens.css`
   - `scripts/review-packet.mjs`

## 2. Build in this order

The `add-feature` Claude Code skill follows the same order.

1. **Logic** in `lib/<feature>.ts`. Plain functions, no React, no browser APIs, so tests can import them.
2. **Words** in the right copy module (see section 4). Never write user-facing text inline in JSX.
3. **Tests** in `tests/<feature>.test.ts` (section 6).
4. **Component** in `app/components/<Feature>.tsx`. Add `'use client'` only if it needs state or handlers. It only renders.
5. **CSS** in `app/components/<feature>.css`, imported by the component (section 5).
6. **Wire it in** with the smallest edit to the parent: one import and one render line, behind the exact condition in the spec.
7. **Review packet:** add every new file holding user-facing or medical text to the `files` list in `scripts/review-packet.mjs`, plus one checklist id (for example `'next-steps:whatsapp-message'`). Then run `node scripts/review-packet.mjs`.
8. **Verify** (section 8).

`NextSteps` is the reference example of this pattern: `lib/next-steps.ts` → `tests/next-steps.test.ts` → `app/components/NextSteps.tsx` + `next-steps.css` → one line in `Answer.tsx`.

## 3. House style

No formatter is set up. Match the code by hand.

- Single quotes. No spaces inside import braces: `import {a,b} from '...'`.
- Dense one-line JSX and 1-space indent, like `MedicineCheck.tsx`. Never reformat lines you did not change.
- Imports use the `@/` alias in `app/` and `lib/`. Tests use relative paths (`../lib/...`).
- Icons from `lucide-react`, with `aria-hidden="true"` and a visible text label beside them.
- Outside links: `target="_blank" rel="noreferrer"`.
- Every button and button-like link gets `data-motion="press"`. Every screen root gets `data-motion="screen"`.
- Short comments that say *why*, not what.

## 4. Where words go

| Text | Put it in |
|---|---|
| Checker labels, headings, buttons, states | `lib/screen-copy.ts` under the screen's key |
| Landing page | `lib/landing-copy.ts` |
| Medical text (summaries, cautions, scenario rules) | `lib/safety.ts` and `data/*.json`. Only change it when asked; a pharmacist reviews it. |
| A new feature's own reviewed text | `lib/<feature>.ts`, added to the review packet |

Every sentence follows the voice rules in `.claude/skills/health-copy-rules/SKILL.md`. The short version:

- Never say or hint that a medicine is safe, genuine, approved, right for the user or needed. Questions are fine; claims are not.
- Never give a dose, duration, diagnosis or treatment.
- Send the user to a pharmacist, a doctor or NAFDAC.
- Short words, short sentences (12 words or fewer on screens), "you" not "users", sentence case, every button starts with a verb.
- Never put a photo, name or anything the user typed into a link or message.

## 5. Design rules

Read [`DESIGN.md`](DESIGN.md) before any UI change. The rules people break most:

- **Values only from `app/tokens.css`.** No hex codes, pixel font sizes or durations in components. Use `var(--signal)`, `var(--s4)`, `var(--text-body)`, `var(--radius-card)`.
- **Colour has meaning.** Signal blue = "do this next". Green (`--success-*`) = the answer card only, meaning "your check is done". Amber and slate = the "Antibiotic" / "Not an antibiotic" labels on list chips. **No red anywhere, and no green outside the answer card.**
- **Reuse shared classes** from `app/globals.css`: `primary`, `secondary`, `text-button`, `note`, `caution`, `eyebrow`, `pharmacist-plan`, `button-row`, `source-links`, `content-view`.
- **New CSS:** one file per component, every class prefixed with the component name (`next-steps-list`, not `list`). Do not edit another component's CSS file.
- Controls at least 52px tall (default `var(--control)`, 56px). Body text 18px. Nothing below 14px.
- 4px radius on controls, 12px on cards. No shadows or gradients.
- Bricolage Grotesque everywhere. Fraunces italic for one `<em>` per heading, through `Emphasis.tsx`.
- One question per screen. No tabs.
- No new motion. The hero entrance is the only animation.
- Check at 375 px and desktop width in a real browser.

## 6. Tests

- `node:test` and `node:assert/strict`, one file per feature. Copy the style of `tests/next-steps.test.ts`.
- Test real behaviour with real records (`amoxicillin`, `co-amoxiclav`, `paracetamol`), not that a function exists.
- For anything that builds a link or message, decode it and assert it holds no `data:`, `base64`, photo or product name.
- For new copy, assert it contains none of the forbidden words (see `tests/flow.test.ts`).
- Never edit or delete an existing test to make it pass. If a test looks wrong, raise it.

## 7. The review packet (read this, it will bite you)

`scripts/review-packet.mjs` fingerprints every file with medical or user-facing text. If you change any of them and do not rerun it:

- `npm test` fails with "review packet fingerprint" (`tests/beta.test.ts`).
- `npm run build` fails with "Review packet is stale" (`next.config.ts`).

Fix: `node scripts/review-packet.mjs`, then commit `public/review-packet.json` and `data/content-manifest.json` with your change.

**Merge conflicts in those two files** happen on almost every merge, because they hold a timestamp and hash. Never fix them by hand. Take either side, finish the merge, then rerun `node scripts/review-packet.mjs` and commit.

Regenerating the packet resets any pharmacist approval. None exists yet, so nothing is lost today.

## 8. Verify before you push

```powershell
node scripts/review-packet.mjs; npm test; npm run typecheck; npm run build
```

Then `git status --short`: only the files you meant to change, plus the two generated review files if you touched reviewed content. If `AGENTS.md` shows up changed, `next dev` re-added its block; commit or discard it.

For UI changes, open the Vercel preview URL on a real phone.

## 9. Hard limits

These are product decisions, not style preferences. Raise them with the team before breaking one.

- No new dependencies.
- The check flow uses the scan and check-guidance APIs with consent. Groq explains the available evidence and reported answers using validated source IDs. The app applies the outcome rules and keeps prescribing decisions with the clinician.
- No storage: no `localStorage`, cookies, database or analytics.
- Never send a photo, name or typed text anywhere new.
- Leave `data/*.json`, `lib/scan.ts` and `lib/safety.ts` alone unless the spec asks.
- Never describe a NOT BUILT feature (see `PROJECT_MAP.md` section 9) as working, in code, copy or docs.
- Never hand-edit `public/review-packet.json` or `data/content-manifest.json`.

## 10. Pull request checklist

- [ ] Branched from `codex/resistguard`; only the files the spec names changed
- [ ] Logic in `lib/`, tested in `tests/`; component only renders
- [ ] All words in a copy module and checked against the health copy rules
- [ ] Shows only under the condition in the spec (for example only after "Yes, that's it")
- [ ] CSS in its own prefixed file, values from tokens, no new colours (green only on the answer card, no red)
- [ ] New text files added to `scripts/review-packet.mjs` with a checklist id
- [ ] Review packet regenerated; `npm test`, `npm run typecheck`, `npm run build` pass
- [ ] Checked at 375 px and desktop; no sideways scroll; no new console errors
- [ ] `PROJECT_MAP.md` updated if you added, hid or removed a screen, record or feature
- [ ] Spec's done checklist ticked in the PR description

## 11. Working with Claude Code

The repo ships project skills in `.claude/skills/`. `CLAUDE.md` loads the project rules automatically.

| Skill | Use |
|---|---|
| `/add-feature <spec path>` | Plans, waits for your OK, then builds a spec in the order above |
| `/verify` | Runs the review packet, tests, typecheck and build, and fixes failures |
| `/ui-check` | Checks a UI change in a browser at phone and desktop width |
| `/diff-review <spec path> [base]` | Fresh-eyes review of your branch against the spec |
| `health-copy-rules` | Loads automatically when Claude edits files in `app/`, `lib/` or `data/` |

Keep the docs true. When your change makes a statement in `PROJECT_MAP.md`, `docs/ARCHITECTURE.md` or `DESIGN.md` wrong, fix it in the same pull request.
