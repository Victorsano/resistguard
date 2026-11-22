# Public AI and optional supervised pilot

Public Groq scanning and educational explanations are enabled now, subject to request limits and provider availability. This does not mean pharmacist sign-off or a user pilot has happened.

Current safeguards: consent and photo checklist, complete ingredient confirmation, approved educational passages, fixed safety rules, per-instance minute/day/month budgets and manual fallback. There is no permanent Redis connection yet. Per-instance counters reset on restarts; do not treat them as global dollar limits.

To add shared controls, connect an owned Redis REST service and set the URL, token and RATE_LIMIT_SECRET (32+ random characters) in Vercel Production. Set REQUIRE_DURABLE_LIMITS=1 to make that dependency mandatory. Configured Redis failures always preserve manual guidance and close AI.

To pause public AI, set DISABLE_AI=1 and redeploy. To use the stricter optional supervised-pilot policy, set ENFORCE_PILOT_GATES=1; it requires PILOT_AI_ENABLED=1, the not-before date and REVIEWED_CONTENT_SHA256 matching the current genuinely reviewed packet. These optional gates are off for the public educational app at the user's request.

Before a supervised pilot: obtain actual pharmacist review, verify registration privately, complete physical-phone tests and obtain volunteer consent. Use public/pilot-protocol.md and the Pilot & review form. These remain pending; no participants have been contacted.

Provider-side monetary controls remain an account-owner task where the plan supports them: https://console.groq.com/docs/spend-limits . No billing plan or spending setting was changed. Application request ceilings are not monetary guarantees.
