# Verification record

What has been tested, how, and what has not. Add a dated entry at the top of "Log" whenever you verify a release. Record failures as plainly as passes. Never record a review, participant or result that did not happen.

## Current verification

The latest production-flow checks and outstanding work are summarized in [PROJECT_MAP.md](PROJECT_MAP.md). Physical-phone testing, pharmacist review and a supervised pilot remain open.

## Historical snapshot (26 November 2026, commit `d3c7189`)

| Area | Status |
|---|---|
| Automated tests | 53 pass (`npm test`) |
| Typecheck and production build | Pass |
| Live AI on the 10 fictional labels | All gave their expected outcome (earlier release; rerun after any change to `lib/scan.ts`) |
| Published manufacturer label images | 3 DailyMed images matched; one timed out on the first try |
| Real photos | One moisturiser correctly rejected; one triple-antibiotic Drug Facts panel read completely and reported as not in the list |
| Real phone photos of real packs (Android, iPhone) | **Not done** |
| Pharmacist review | **Not done.** Every record is `pending_pharmacist`. |
| Supervised pilot | **Not started.** No volunteers contacted. |
| Shared production rate limits (Redis) | **Not connected.** Tested once on a temporary database. |
| Accuracy rates | **Not measured.** Samples are far too small. |
| Whether users understand "recognised" is not "safe for me" | **Not tested** |
| Behaviour under many simultaneous users | **Not tested** |

Known weak spot: reflective blister foil. A real Emzoclox pack was misread as amoxicillin + clavulanic acid. The classifier now discards that reading, but only for the 5 Greenbook products. Other foil packs are not protected.

## Evidence files

`docs/evidence/` holds machine-readable reports from earlier runs: `scan-regression.json`, `real-label-regression.json`, `scan-public-enabled.json`, `redis-verification.json`. They contain classifications and fixture IDs only, never images or secrets.

## Log

### 26 November 2026: documentation cleanup before team merge
- `npm test`: 53 pass. `npm run typecheck` and `npm run build`: pass.
- Docs rewritten for the five-screen `/check` flow and Night & Paper design. No application code changed.

### 26 November 2026: Redesign v3 (`d3c7189`)
- One design system (Night & Paper) across the landing page and checker. Tokens in `app/tokens.css`.
- Hero media rules covered by `tests/hero-media.test.ts`.

### 25–26 November 2026: Revamp parts 1–4
- Tab bar removed. Five-screen check flow (Home, Check your photo, Is this what your pack says?, Answer, Find by name). Footer pages for How it works, pharmacists and testers, Sources.
- `tests/flow.test.ts` covers outcomes, answer cards, name search and forbidden words in screen copy.
- Pilot page label contrast raised to 4.5:1.

### 25 November 2026: NAFDAC genuine-pack check and WhatsApp pharmacist button
- `tests/next-steps.test.ts`: messages name the confirmed ingredients and antibiotic status, links hold no photo data or product name, no hard-coded short code.

### 24 November 2026: Nigerian catalogue and education cases
- Catalogue grew to 28 records with formulation examples and 5 Greenbook product references.
- Phone-width browser check of registration-number search, children's list filter and full-list confirmation.
- Emzoclox regression: conflicting reading suppressed even when the model claims the list is complete. Brand-only photo and correct ampicillin + cloxacillin reading also covered.

### 15 November 2026: public educational AI enabled
- Public `/api/readiness` returned `ai=available` with `clinicalReview=pending` and `pilot=not_started`.
- Public vision endpoint recognised the fictional amoxicillin label. Report: `docs/evidence/scan-public-enabled.json`.
- First browser scan timed out and showed the manual fallback; a second attempt succeeded. No automatic retry was added.

Older entries are in Git history (`git log -- VERIFICATION.md docs/`).
