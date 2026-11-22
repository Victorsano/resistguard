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
