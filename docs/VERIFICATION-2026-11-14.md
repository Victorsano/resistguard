# Verification — 14 November 2026

Live app: https://resistguard-rosy.vercel.app

## Build and safeguards

- Production builds passed locally and on Vercel with Next.js 16.4.6. Deployment dpl_27tXQGP7fwVDovPcYzz1p75FLgWT reached READY. Homepage is static; AI endpoints are server routes.
- All 14 automated tests and TypeScript checking passed. Coverage includes complete ingredient sets, combinations, non-antibiotic separation, uncertain/malformed observations, approved passage selection, request limits, origins and bounded bodies.
- Production-server fallback HTTP suite passed with DISABLE_AI=1: homepage, explanation fallback, unknown medicine, invalid scenario, remote image rejection, signature rejection, cross-site POST rejection, disabled scan and rate-limit recovery.
- Groq key is a sensitive Production server variable. Environment and Vercel authentication files are excluded from deployment/source archive. No client-side provider request or public key variable.

## Live AI

- Vision uses qwen/qwen3.8-27b; educational passage selection uses openai/gpt-oss-120b. Support checked against official Groq documentation.
- Local live regression reached 10/10 expected outcomes. Two transient failures (connection and timeout) passed on explicit retry and remain recorded in ../scan-regression.json. Earlier rapid requests hit provider quotas, so tests are paced 35 seconds apart. This authored suite is not a clinical accuracy estimate.
- Cases include supported medicines, non-antibiotic, supported/unsupported combinations, unknown ingredient, cosmetic, blank, brand-only and adversarial label text.
- Public homepage returned HTTP 200 without login. Published scan identified the amoxicillin fixture with the expected ID. Published explanation returned AI-selected approved paragraphs and pharmacist questions. See ../scan-production.json.
- Provider failures preserve manual catalogue lookup and source-based explanations. No automatic retry loop.

## Browser and camera

- Edge checked at desktop and 390 x 844 mobile dimensions. Catalogue search, non-antibiotic flow, full combination confirmation, explanations/questions, 10-item gallery and sample selection passed. Main and learning views fit without horizontal overflow at 390 pixels.
- An emulated live MediaStream passed preview/capture and track cleanup. Denied permission showed recovery instructions. Consent was required before image analysis. This tests browser stream lifecycle, not a physical camera sensor.
- Separate file upload and camera entry are implemented. Camera switching, close, page hiding and component cleanup stop streams. A native camera picker offers another mobile path.
- Screenshots: ../resistguard-v2-desktop.png, ../resistguard-v2-mobile.png, ../resistguard-camera-permission.png.

## Scope and limits

- Educational demo, not clinically validated. Twelve source-checked records are not an exhaustive medicine database. No diagnosis, doses, personal treatment, authenticity, Nigerian registration checks or live surveillance.
- Every image candidate requires complete ingredient confirmation. Unknown combinations and incomplete labels cannot silently become a supported single ingredient.
- Physical phone cameras, every mobile browser and all packaging/lighting conditions remain unverified.
- No account, database, saved uploads, health history or analytics SDK. Provider/hosting policies apply separately to request processing and network metadata. External photo analysis requires consent.
- In-memory limits reset on cold starts and do not impose a durable global spending cap. Provider quotas can limit availability. Configure provider spending controls before wider distribution.
- Dashboard data is explicitly synthetic, unrelated to actual users or scans.

- Final published-site Edge flow passed: upload PNG, verify consent gate, scan with live AI, confirm complete ingredients, request explanation, display pharmacist questions. Screenshot: ../resistguard-production.png. Client asset scan found no provider key.

## UI refresh — 14 November 2026

- Published updated design to the same live URL. Deployment dpl_8ooWKvGjxW7ebShm6GhYAaquPu8U reached READY; public HTTP 200 confirmed the new hero, journey guide and skip link.
- Local and hosted production builds passed including TypeScript. All 14 safety tests passed again.
- Visually inspected desktop and mobile screenshots. All four views checked at widths 320, 390, 768, 1024 and 1440 pixels, without horizontal page overflow.
- Browser checks passed: new start button scroll/focus, combination confirmation, catalogue search, non-antibiotic result, quiz feedback, 10-sample gallery, upload preview, consent gate, reset and denied-camera recovery/close.
- No browser errors observed; Edge emitted only a lazy-image informational message.
- UI refresh does not expand prior clinical validation or physical-camera coverage. Existing live AI and fallback evidence above remains scoped to its recorded checks.
- New screenshots: ../resistguard-polished-desktop.png, ../resistguard-polished-mobile.png, ../resistguard-polished-learn.png, ../resistguard-polished-dashboard.png.
