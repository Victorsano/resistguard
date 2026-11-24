# Verification — public educational AI enabled, 15 November 2026

Live: https://resistguard-rosy.vercel.app
Deployment dpl_J7DYoz6fYSMbmrQdaQx9vhgXUseU reached READY.

The user explicitly requested working public Groq access. Production pilot/review gates are now an optional policy controlled by ENFORCE_PILOT_GATES=1. They are off by default. Pharmacist review remains pending and the supervised participant pilot is not started; AI availability is not approval or clinical validation.

## Verified in this update

- All 27 automated tests passed. New checks cover public AI without pilot gates, explicit strict shared-control requirements and the per-instance daily/monthly fallback budgets.
- Local and Vercel production builds passed, including TypeScript.
- Public /api/readiness returned HTTP 200 and ai=available while clinicalReview=pending and pilot=not_started.
- Public vision endpoint recognised the fictional amoxicillin label correctly (HTTP 200, candidate, amoxicillin). Report: ../scan-public-enabled.json.
- Public GPT-OSS explanation returned AI-selected approved passages and pharmacist questions (HTTP 200; three paragraphs and three questions in the direct API check).
- Existing consent, complete ingredient confirmation, fixed rules and provider-failure fallback remain in place. The Groq key remains server-only.

## Controls and limitations

The permanent Redis service is still unconfigured. Requests currently use per-instance minute/day/month controls, which reset on restart and are not shared global spending caps. Configuring Redis enables atomic shared controls; its failures close AI. REQUIRE_DURABLE_LIMITS=1 makes the dependency mandatory. DISABLE_AI=1 remains the kill switch. Optional ENFORCE_PILOT_GATES=1 restores the stricter date/switch/review policy.

Actual pharmacist sign-off, physical-phone testing, volunteers, production shared infrastructure and provider-account monetary limits remain pending. No approval or participant result was fabricated. Prior preparation checks and the small manufacturer-label regression are recorded in docs/VERIFICATION-2026-11-15-pre-public-ai.md.

Two short product/goal charts are in docs/PRODUCT-OVERVIEW.md. Goals in the charts are intended outcomes, not measured effects already established by the app.

Final public Edge browser check: upload -> all photo checks and consent -> Groq scan -> ingredient confirmation -> AI-selected explanation and pharmacist questions passed. The first browser scan timed out and showed the intended manual fallback; an explicit second attempt succeeded. No automatic retries were introduced. Screenshot: ../resistguard-public-ai-working.png. This is a software fixture test, not physical-device or clinical validation.

## Field-guide visual redesign — 15 November 2026

- Published deployment dpl_5R7hd6c7wKDAPBtuRBYviiht5KRn, READY. Public homepage returned 200 with the new specimen illustration and headline. AI readiness remains available.
- Replaced soft green gradients, serif marketing headlines, floating capsule/shield hero and rounded card system with bold sans-serif typography, ink/paper/cobalt/orange colours, package-label rules, R/G monogram and a printed-label specimen explicitly marked as illustration.
- Shared visual treatment applied to medicine check, catalogue, learning, synthetic dashboard, pilot and camera modal. Functional safeguards and server/provider code unchanged.
- All 27 automated tests passed. Local and hosted production builds passed, including TypeScript. Review packet regenerated for current UI wording; professional review is still pending.
- Edge browser checked all five views at 320, 390, 768, 1024 and 1440 widths with no horizontal page overflow. Mobile navigation has its own horizontal scrolling area.
- Browser checks passed: new CTA scroll/focus, upload/consent gate, complete combination confirmation, catalogue search, non-antibiotic classification and quiz feedback. Only Edge's lazy-image informational message observed in that run.
- Desktop and mobile screenshots visually inspected: ../resistguard-field-guide-desktop.png and ../resistguard-field-guide-mobile.png. Design conventions recorded in docs/DESIGN.md.
# Verification — antibiotic-use education, 24 November 2026

- 31 automated tests passed and the Next.js production build completed.
- Edge browser checks at 390px and 1280px exercised the eczema, boil, sildenafil/nitrate and diclofenac/ulcer educational examples, optional evidence organisation with AI disabled, the conversation checklist and the interactive resistance lesson. No personal answers were included in the AI request.
- The source-linked passages remain visible during provider failure. The AI response must contain precisely the retrieved passage IDs. Unknown, duplicate and missing IDs are rejected.
- The generated review packet includes the new evidence and interface content. Pharmacist review remains pending. Participant studies are needed to establish impact on antibiotic use or resistance.

## Brand-independent ingredient-panel regression, 24 November 2026

- The supplied triple-antibiotic Drug Facts photo returned a clear observation with all three ingredients, no product name and a complete list through the real local vision endpoint. The result was an unsupported combination, with no selected catalogue ID.
- The regression test separately checks that an incomplete observation with the same ingredients remains unconfirmed and that a complete supported record can still match without a brand.
- The user-supplied image remains outside the repository. The regression fixture records only the observed ingredient names and classification.

## Nigerian catalogue expansion, 24 November 2026

- All 35 automated tests and the production build passed. The review packet covers 28 generic records, the formulation examples, the five linked Greenbook products and the educational passages.
- A phone-width browser check verified lookup by registration number, the recorded Greenbook status, the children’s list filter, confirmation of a full ingredient list, and retrieval of NCDC and condition-specific evidence.
- Cefixime and the complete triple-antibiotic ingredient set now have catalogue entries. Incomplete combinations still leave the medicine unselected.
