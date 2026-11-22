# Verification — 15 November 2026 preparation release

Live: https://resistguard-rosy.vercel.app
Deployment: dpl_5FXSap9yA9Bs2J6Sy6bzUepr8CEY (READY).

## Implemented and checked

- Guided ingredient-panel photography, sharpness/completeness/privacy checklist, separate external-analysis consent, cause-specific unreadable-label recovery, replacement/retake and explicit wrong-match rejection. Every candidate still requires full ingredient confirmation.
- Catalogue expanded from 12 to 16. Added trimethoprim, phenoxymethylpenicillin, erythromycin and co-trimoxazole after consulting NHS/manufacturer sources. Co-trimoxazole retains both sulfamethoxazole and trimethoprim; aliases never expand brands. All records have pending-pharmacist status and review-due metadata. Source checking is not clinical validation.
- Fingerprinted review packet, private sign-off validator and source-integrity build check. Pending template was correctly rejected by the validator. Source changes invalidate the fingerprint and require a new packet/review; actual reviewer identity still needs independent verification.
- Local facilitator pilot tool with separate observation/export consent, controlled fields, incorrect/correct/uncertain/unavailable counts, comprehension observations, export and clear. No participant submissions endpoint, database, names, free-text health information or stored photos. This browser feature was tested using fabricated UI inputs, not real participants.
- Durable quota adapter atomically reserves per-client/minute, global/minute, daily and monthly counters. Daily HMAC client keys, expiries, fail-closed control errors, conservative counting of attempted provider calls. Logs use only fixed operational route/outcome/error codes.
- Explicit production pilot switch, not-before date, exact reviewed content fingerprint and configured durable controls required before AI can open. No automatic opening. Public site currently reports paused/pending/not_started.

## Automated and HTTP checks

- All 24 unit tests passed, including production gates, shared reservations, failure closure, bounded configuration, new complete combination, photo recovery, pilot error counting and review fingerprint.
- Local production build passed with Next.js 16.4.6 and TypeScript. Hosted final production build also passed.
- Disabled-provider HTTP suite passed: homepage, explanations, unknown ingredient, invalid scenario, remote-image rejection, signature rejection, cross-origin rejection, keyless/disabled scan and request-limit fallback.
- Isolated REAL Redis test passed: 10 simultaneous same-client reservations admitted exactly 2 under the test limit; shared global minute and daily caps held across independent calls and minute boundaries. Report: ../redis-verification.json. This used a temporary database only; it is not connected to production.
- Final public HTTP 200 for homepage, readiness, review packet and pilot protocol. Published packet fingerprint matches local manifest and 16-record catalogue. A valid test-image POST was stopped with reason pilot_closed. Source-based explanation works while public AI is paused.

## Image evidence

Three published DailyMed manufacturer label artwork files were downloaded privately and visually inspected. They are not physical-phone photographs:

- Amoxicillin: expected amoxicillin, actual amoxicillin candidate.
- Acetaminophen: expected paracetamol, first call timed out, explicit retry returned paracetamol/non-antibiotic.
- Sulfamethoxazole + trimethoprim: expected co-trimoxazole, actual complete combination record.

All three eventually returned the expected candidates; zero incorrect candidates observed in this small set. The timeout is retained in ../real-label-regression.json. This is not a clinical accuracy estimate and does not measure glare/blur performance on physical phones.

The user's existing real Simple moisturiser front photo was uploaded through the browser, prepared locally, checklist/consent confirmed and correctly classified non_medicine. No medicine record was attached. Screenshot: ../resistguard-beta-real-cosmetic.png. Original private photos and manufacturer artwork are excluded from deployment and source archives.

## Browser evidence

- Edge: pilot form consent, a deliberately fabricated incorrect-candidate observation, separate export consent, successful JSON download and clearing passed. The test data is not real pilot evidence.
- A 320-pixel layout check found overflow caused by the newly added long medicine name. Corrected with shrinkable cards and wrapping names; all five views then fit 320, 390, 768 and 1440 pixels. Final hosted verification repeats these checks without injected styles.
- New photo checklist prevents proceeding before all checks and external-analysis consent. Final hosted pilot pause also keeps the Read label control disabled even after checks are satisfied.
- Previous emulated camera preview/capture/track cleanup and permission recovery evidence remains documented in docs/VERIFICATION-2026-11-14.md. No physical camera testing has been performed in this release.
- Edge logged only its informational lazy-image message during the tested form/layout flow.

## Still pending — not presented as completed

1. Physical Android/iPhone camera and real medicine photography sessions (glare, blur, small print, permissions, interrupted networks and browser differences).
2. Qualified pharmacist review, independently verified registration, signed evidence and resolved corrections.
3. Real consenting participants and measured understanding/feasibility results. User requested no recruitment/use until the planned week of 22 November 2026.
4. Permanent owned production Redis connection and server-only secret. No marketplace resources/installations were found; the temporary test database is intentionally not production infrastructure.
5. Provider-account dollar spending configuration. No billing upgrade or account spending setting was changed. Groq's configurable monetary limits require an eligible paid organization owner and may lag usage; see https://console.groq.com/docs/spend-limits . Application request ceilings are not monetary guarantees.
6. Staffed monitoring/alert delivery. Structured operational logs exist; no external alert recipients were configured.

Public AI remains paused, with static education and manual catalogue available. The synthetic dashboard stays separate from optional locally recorded pilot observations. See docs/LAUNCH.md for exact preparation and opening steps.
