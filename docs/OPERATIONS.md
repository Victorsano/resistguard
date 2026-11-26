# Operations

Environment, usage limits, deployment, monitoring, scripts, and the pharmacist review and pilot process. For local setup, see the [README](../README.md).

## Environment variables

Copy `.env.example` to `.env.local` for local work. Never commit `.env.local`, never paste a key into chat, docs or code, and never prefix a secret with `NEXT_PUBLIC_`.

| Variable | Default | What it does |
|---|---|---|
| `GROQ_API_KEY` | empty | Server-only Groq key. Empty means photo reading is paused (`not_configured`). |
| `GROQ_VISION_MODEL` | `qwen/qwen3.8-27b` | Label-reading model |
| `GROQ_TEXT_MODEL` | `openai/gpt-oss-120b` | Model for the hidden explain and evidence routes |
| `DISABLE_AI` | `0` | `1` is the kill switch: no AI calls at all. Redeploy after changing it. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL`, `KV_REST_API_TOKEN`) | empty | Shared rate-limit counters across server instances |
| `RATE_LIMIT_SECRET` | empty | Random, at least 32 characters. HMAC key for client IDs in Redis. |
| `REQUIRE_DURABLE_LIMITS` | `0` | `1` closes AI unless Redis and the secret are set |
| `AI_CLIENT_MINUTE_LIMIT` | `6` (max 20) | Requests per client per minute |
| `AI_GLOBAL_MINUTE_LIMIT` | `30` (max 100) | Requests per minute overall |
| `AI_DAILY_REQUEST_LIMIT` | `100` | Requests per day |
| `AI_MONTHLY_REQUEST_LIMIT` | `1000` | Requests per month |
| `ENFORCE_PILOT_GATES` | `0` | `1` (production only) also requires the three pilot settings below |
| `PILOT_AI_ENABLED` | `0` | Pilot switch, read only when gates are enforced |
| `PILOT_NOT_BEFORE` | `2026-11-22T00:00:00Z` | Earliest opening date when gates are enforced |
| `REVIEWED_CONTENT_SHA256` | empty | Must equal the current review fingerprint when gates are enforced. Set it only after a genuine review of that exact version. |
| `NEXT_PUBLIC_PHARMACIST_WHATSAPP` | empty | Public, built into the page. Digits only, country code first (`234...`), no plus, no leading zero. Empty lets the user pick a WhatsApp contact. Redeploy after changing it. |
| `NEXT_PUBLIC_HERO_VIDEO` | empty | `1` plays `public/media/hero.webm` or `hero.mp4` on the landing page if the file exists |

## Usage limits

- Without Redis, limits are **per server instance** and reset on restart. They are request caps, not spending caps.
- With Redis, one atomic Lua script reserves across client/minute, global/minute, day and month buckets (`quotaScript` in `lib/availability.ts`). Raw IPs are never stored: client keys are daily HMAC values that expire after 120 seconds; day and month totals expire after 2 and 35 days.
- If Redis is configured and fails, AI closes and name search keeps working.
- Failed or aborted provider calls still use a reservation.
- `lib/guard.ts` adds an in-memory limit on every AI route (6 per client and 30 overall per minute).
- Production has **no** Redis connected yet. The earlier Redis test used a temporary database that must not be used for a pilot.

## Readiness

`GET /api/readiness` returns only operational state: `ai` (`available` or `paused`), a message, `clinicalReview: pending` and `pilot: not_started`. It returns no secrets or quota balances. It checks configuration, not a live Redis ping, so a real request can still fail closed.

## Deploy to Vercel

The linked project is `resistguard` in the `victors-projects-6471ee68` scope:

```powershell
vercel --prod --yes --scope victors-projects-6471ee68
```

For a new project: framework Next.js, install `npm ci`, build `npm run build`, default output, Node.js 22 or newer. Add secrets in the Vercel project's environment settings, then redeploy. `node --env-file=.env.local scripts/configure-vercel.mjs` pushes local settings to Vercel through stdin without printing them.

Every push to a branch gets a Vercel preview URL. Use it to test on a real phone (the in-page camera needs HTTPS).

## Monitoring and spending

- Server logs hold only allowlisted route, outcome and reason codes (`operationalEvent()`), never images, prompts, ingredients or IPs. Read them in Vercel runtime logs.
- Nobody is alerted automatically.
- Groq spending limits are an account-owner setting on paid plans (Settings → Billing → Limits; [Groq docs](https://console.groq.com/docs/spend-limits)). No billing setting has been changed. Provider spend tracking can lag 10–15 minutes.

## Scripts

| Command | What it does | When |
|---|---|---|
| `node scripts/review-packet.mjs` | Regenerates the review packet and content manifest | After any change to a file in its `files` list |
| `node scripts/validate-review.mjs private/completed-review.json` | Checks a completed pharmacist review against the current fingerprint | After a real review |
| `node scripts/smoke.mjs` | HTTP fallback suite. Start a server with `DISABLE_AI=1` on port 3001 and set `SMOKE_URL=http://127.0.0.1:3001` first. Never run it against a live provider. | Before a deploy |
| `node scripts/scan-regression.mjs` | Sends the 10 fictional labels to a running server with AI on; paced for quotas | After a change to `lib/scan.ts` or the model |
| `node scripts/fetch-real-labels.mjs`, then `node scripts/real-scan-regression.mjs` | Downloads three DailyMed label images into `work/` (ignored by Git) and scans them | Same |
| `node --env-file=.env.local scripts/verify-models.mjs` | Checks the configured Groq models exist | After changing a model |
| `npx tsx scripts/verify-redis.ts` | Tests shared counters on a Redis you own | Before connecting Redis |
| `scripts/make-test-labels.ps1` | Redraws the fictional test labels from `data/scan-fixtures.json` (Windows) | After changing a fixture |

## Pharmacist review

1. Open `/check` → "For pharmacists and testers" and download the review packet and pilot protocol.
2. A qualified pharmacist checks the exact content and sources, records corrections and completes every checklist item.
3. Verify their registration independently and keep signed evidence privately (`private/`, ignored by Git). Never publish reviewer identities.
4. Make corrections in source, regenerate the packet and review again.
5. Validate with `scripts/validate-review.mjs`. It checks the file and fingerprint, not the person.

Every record stays `pending_pharmacist` until a later release updates its review evidence honestly.

## Supervised pilot

Status: **not started**. No volunteers have been contacted. Before a pilot:

- Obtain a real pharmacist review (above).
- Test on physical Android and iPhone devices.
- Connect shared Redis limits and set `REQUIRE_DURABLE_LIMITS=1`.
- Obtain volunteer consent. Follow `public/pilot-protocol.md`.

The facilitator form on the pilot page records device, browser, lighting, expected record, actual outcome and comprehension. It accepts no names, free text or images. Rows live only in browser memory and need separate consent to export. Exports are facilitator reports, not verified results.

To lock AI behind the pilot policy, set `ENFORCE_PILOT_GATES=1`, `PILOT_AI_ENABLED=1`, the opening date and `REVIEWED_CONTENT_SHA256`.
