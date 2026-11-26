# Feature spec: <feature name>

<date> · <author>

> Copy this file to `docs/specs/<feature-name>.md` and fill every section. Delete the hints in angle brackets. Run `/add-feature docs/specs/<feature-name>.md` in Claude Code, or follow `CONTRIBUTING.md` by hand.

## Summary

<Two or three sentences: what the user gets and why. Say whether it uses AI (normally no) and whether it stores anything (must be no).>

## The problem

<Who has the problem, in which moment (counter, leftovers, someone else's pack, own prescription). One sourced fact if you have one, with the link.>

## What the user sees

- **Where:** <screen from `type Screen` in `lib/flow.ts`, and the exact position, for example "on Answer, after Next steps, before Check another medicine">
- **When:** <the exact condition, for example "only after the user taps Yes, that's it" or "only when the outcome is not_listed">
- **Exact words:** <every heading, button and sentence, quoted. These go into a copy module word for word.>

| Element | Exact text |
|---|---|
| Heading | "" |
| Button | "" |
| Note | "" |

## Limits

<What the feature does not do. Anything that could be read as a medical claim, and how the wording avoids it. Any link whose address is not confirmed yet: leave it out and list it under open questions.>

## Files

| File | New or changed | Why |
|---|---|---|
| `lib/<feature>.ts` | new | Logic and reviewed text, plain functions |
| `tests/<feature>.test.ts` | new | Behaviour tests |
| `app/components/<Feature>.tsx` | new | Renders only |
| `app/components/<feature>.css` | new | Prefixed classes, token values only |
| `<parent component>` | changed | One import and one render line |
| `lib/screen-copy.ts` | changed? | New labels |
| `scripts/review-packet.mjs` | changed | Add new text files and checklist id `<feature>:<item>` |

Must not change: `app/api/`, `next.config.ts`, `data/*.json`, `lib/scan.ts`, `lib/safety.ts`, other components' CSS (unless this spec says so).

## Open questions

<Anything nobody has decided: a URL, a phone number, a wording choice. The builder stops and asks instead of guessing.>

## Done checklist

- [ ] Shows only under the condition above
- [ ] Every word matches this spec and passes `.claude/skills/health-copy-rules`
- [ ] Never says or hints "safe", "genuine", "approved" or "right for you"
- [ ] No photo, name or typed text in any link or message
- [ ] No new dependency, AI call, storage or network call
- [ ] Logic in `lib/`, tests cover real records (`amoxicillin`, `co-amoxiclav`, `paracetamol`)
- [ ] CSS in its own prefixed file; values from `app/tokens.css`; no red, and no green outside the answer card
- [ ] New text files in the review packet; `node scripts/review-packet.mjs` rerun
- [ ] `npm test`, `npm run typecheck`, `npm run build` pass
- [ ] Checked at 375 px and desktop; no sideways scroll; no new console errors
- [ ] Checked on a real phone through the Vercel preview
- [ ] `PROJECT_MAP.md` updated
