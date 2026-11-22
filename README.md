# ResistGuard — supervised beta preparation

Live site: https://resistguard-rosy.vercel.app

Next.js + TypeScript educational app. No authentication, stored uploads, health history, tracking SDK or clinical validation. Sixteen source-checked generic records; every record is explicitly awaiting pharmacist review. Source checking is not professional approval.

## Current release state

Public educational AI is enabled when the server key is configured. The supervised pilot has not started and pharmacist review remains pending. Clinical review status is independent of AI availability. Static catalogue, learning, fictional test labels, source links, synthetic dashboard, review packet and local pilot observation tools remain usable during provider failures. Physical-phone trials and professional review have not been performed.

The app now provides guided ingredient-panel photography, three photo-review checks, separate external-analysis consent, specific unreadable-label recovery, retake/replacement and rejection of a wrong suggestion. Every candidate still requires the full ingredient list to be confirmed. Recognition does not verify authenticity, strength, expiry or suitability.

## Run locally

Requires Node.js 22 or newer. From this directory:

```powershell
npm ci
```

For a NEW extraction only, copy `.env.example` to `.env.local` and enter your Groq key there. Preserve an existing configured file. Do not put secrets in chat or NEXT_PUBLIC variables.

```powershell
npm run dev
```

Open http://127.0.0.1:3000. Local development can exercise AI with a configured key; production-only pilot/review gates apply only when ENFORCE_PILOT_GATES=1. Set DISABLE_AI=1 locally to test deterministic fallback without provider access. Model defaults remain qwen/qwen3.8-27b for vision and openai/gpt-oss-120b for selecting approved educational passages. No generated treatment plan or dosage.

## Verify and build

```powershell
node scripts/review-packet.mjs
npm test
npm run typecheck
npm run build
npm start
```

The review generator writes a fingerprinted public packet and a content manifest. The Next configuration refuses to build stale reviewed content. Regenerating a packet changes the fingerprint and invalidates an old production review approval. Canonical line endings make the fingerprint portable.

HTTP fallback suite: start a server with DISABLE_AI=1 on port 3001, set SMOKE_URL=http://127.0.0.1:3001, then run `node scripts/smoke.mjs`. Do not run it against an enabled provider. Live fictional-label tests: `node scripts/scan-regression.mjs`; requests are paced for token quotas.

Published manufacturer-label tests: `node scripts/fetch-real-labels.mjs` downloads three DailyMed label artwork files privately under work; inspect them, then run `node scripts/real-scan-regression.mjs` against a local enabled server. They are artwork, not physical-camera photos. The report records wrong candidates, uncertainty and unavailability separately. Source image redistribution is not assumed; work files are excluded from publication and archives.

## Professional review and pilot

Open Pilot & review. Download the complete review packet and pilot protocol. A qualified pharmacist must check the exact content and sources, document corrections, and complete all checklist items. Independently verify registration and retain signed evidence privately. No automatic publication of reviewer identities.

```powershell
node scripts/validate-review.mjs private/completed-review.json
```

This validates the file and current fingerprint, not professional identity. Corrections belong in source, followed by a newly generated packet and review. Records remain pending in this preparation release; a later release must update its review evidence and labels honestly.

The optional facilitator form records device/browser/lighting, expected record, actual candidate or uncertainty/failure, and comprehension. It derives incorrect-candidate counts instead of hiding them among successes. Observation consent and export consent are separate. No free text, names, images or health details are accepted. Rows stay only in browser memory, disappear when leaving the view or refreshing, and can be downloaded with consent. Exports are facilitator reports, not independently verified results. See public/pilot-protocol.md and docs/LAUNCH.md.

## Durable usage controls

Shared cross-instance limits require owned Upstash-compatible Redis REST credentials and a random RATE_LIMIT_SECRET of at least 32 characters. With no shared service configured, public AI uses per-instance minute/day/month request limits; these reset on restarts and are not global spending caps. Set REQUIRE_DURABLE_LIMITS=1 to require the shared service and close AI if it is missing. The REST adapter uses one atomic Lua reservation across per-client/minute, global/minute, global/day and global/month buckets. Raw IPs are never stored in Redis: daily HMAC values are used; client/minute keys expire after 120 seconds. Day and month counters contain only totals and expire after 2 and 35 days. Failed/aborted provider requests still consume reservations conservatively.

Default application ceilings: 6/client/minute, 30/global/minute, 100/day and 1000/month. They are request caps, not dollar spending limits. When Redis is configured, restarts share counters; Redis failure closes AI and preserves manual guidance. Local in-memory throttling also bounds requests. Shared counters were tested on an isolated temporary database; that database is NOT production infrastructure and must not be used for the pilot.

Production configuration:

- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL and KV_REST_API_TOKEN)
- RATE_LIMIT_SECRET (random, server-only)
- AI_CLIENT_MINUTE_LIMIT, AI_GLOBAL_MINUTE_LIMIT, AI_DAILY_REQUEST_LIMIT, AI_MONTHLY_REQUEST_LIMIT
- ENFORCE_PILOT_GATES=0 for public educational AI; set 1 only for the optional controlled pilot policy
- PILOT_AI_ENABLED=0 until opening a controlled pilot (only used when ENFORCE_PILOT_GATES=1)
- PILOT_NOT_BEFORE=2026-11-22T00:00:00Z
- REVIEWED_CONTENT_SHA256 only after genuine review of that exact version
- GROQ_API_KEY, already stored as a sensitive server variable on the existing project

Do not expose these credentials in browser code, Git, archives or reports. Only operational state is public through /api/readiness; no secret values or quota balances are returned. The readiness endpoint reports configuration, not a live Redis ping; an actual reservation can still fail closed.

## Spending and monitoring

Paid organization owners can configure a monthly Groq spending limit under Settings -> Billing -> Limits. Free accounts do not offer that feature; do not upgrade or add billing automatically. Provider spend tracking can lag 10–15 minutes. Application request caps do not replace provider controls. No provider-account spending setting was changed in this build. Official instructions: https://console.groq.com/docs/spend-limits

Server logs contain only allowlisted route, outcome and operational codes. No raw errors, prompts, images, medicine IDs, IPs or participant records are intentionally logged by application code. Use Vercel runtime logs to investigate provider timeouts, invalid responses, quota rejections and shared-control failures. Hosting/provider metadata policies apply separately. This is logging, not an actively staffed alerting service.

## Deploy to Vercel

The existing linked project is resistguard in victors-projects-6471ee68:

```powershell
vercel --prod --yes --scope victors-projects-6471ee68
```

For your own project, choose Next.js, `npm ci`, `npm run build`, framework-default output and Node.js 22+. Add secrets directly in Production environment settings and redeploy. Do not use static export; API routes are required. Public AI works by default with the configured server key. Optional ENFORCE_PILOT_GATES=1 requires the opening date, explicit switch and exact reviewed content fingerprint. Optional REQUIRE_DURABLE_LIMITS=1 requires shared quota credentials. DISABLE_AI=1 is an immediate kill switch after redeployment.

Source archives exclude local environment files, .git, .vercel, dependencies, build output, work fixtures and private evidence. See VERIFICATION.md for actual results and limitations.
