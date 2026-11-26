# ResistGuard

Know what's in the pack before you take it. ResistGuard reads the ingredient list on a medicine pack from a photo (or a typed name, brand or NAFDAC number), asks you to confirm it, then tells you whether it is an antibiotic and what to do before you take it.

- **Live demo:** https://resistguard-rosy.vercel.app (checker at `/check`)
- **Status:** working demo. No pharmacist has reviewed the content and no real users have been tested. Every record shows "Not yet reviewed by a pharmacist".
- **Stack:** Next.js 16, React 19, TypeScript, plain CSS tokens, Groq for label reading. No database, no accounts, no analytics.

## Quick start

Requires Node.js 22 or newer.

```powershell
npm ci
```

```powershell
Copy-Item .env.example .env.local
```

Put your own Groq key in `.env.local` (`GROQ_API_KEY=`). Without a key the app still runs: photo reading shows as paused and name search works. Keep an existing `.env.local` if you already have one.

```powershell
npm run dev
```

Open http://127.0.0.1:3000 (not `localhost`). The checker is at http://127.0.0.1:3000/check.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on 127.0.0.1:3000 |
| `npm test` | All tests (`node:test` through `tsx`) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build. Fails if the review packet is stale. |
| `node scripts/review-packet.mjs` | Regenerate the review packet. Run it after changing any file in its `files` list, or `npm test` and `npm run build` fail. |

Run all four checks before you push:

```powershell
node scripts/review-packet.mjs; npm test; npm run typecheck; npm run build
```

## Documentation

Read in this order if you are new:

| Doc | Read it for |
|---|---|
| [`PROJECT_MAP.md`](PROJECT_MAP.md) | What the product is, who it is for, every screen, what is real, hidden or not built |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to add a feature: branches, code patterns, the review packet, the pull request checklist |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Folder layout, request flow, API routes, data files and the patterns to copy |
| [`DESIGN.md`](DESIGN.md) | Night & Paper design system: tokens, type, components, layout, motion |
| [`ART_DIRECTION.md`](ART_DIRECTION.md) | The reasoning behind the design |
| [`docs/OPERATIONS.md`](docs/OPERATIONS.md) | Environment variables, limits, deploy, scripts, pharmacist review, pilot |
| [`docs/specs/check-flow.md`](docs/specs/check-flow.md) | **Next build:** the agreed new check flow (reason, other medicines, questions, result) |
| [`docs/FEATURE_SPEC_TEMPLATE.md`](docs/FEATURE_SPEC_TEMPLATE.md) | Template for writing a new feature spec |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Plain guide for someone using the app |
| [`VERIFICATION.md`](VERIFICATION.md) | What has been tested, and what has not |
| [`CLAUDE.md`](CLAUDE.md), [`AGENTS.md`](AGENTS.md) | Rules for AI coding assistants (also useful for people) |

## Safety boundaries

ResistGuard informs; it never decides. It does not diagnose, prescribe, give doses, or say a medicine is safe, genuine or right for you. AI only copies ingredient names; plain code matches them and the user confirms. Photos are never stored. See `PROJECT_MAP.md` sections 6 and 8.
