@AGENTS.md

# ResistGuard: rules for Claude Code

Read PROJECT_MAP.md for the current flow and open work before changing the checker, catalogue or medical text. Check the entry point before describing a feature as available.

## Docs map
- `PROJECT_MAP.md`: current product, flow, AI, evidence, deployment and open work
- `CONTRIBUTING.md`: how to build a feature, review packet, pull request checklist
- `docs/ARCHITECTURE.md`: folders, request flow, API routes, data, patterns
- `DESIGN.md`, `ART_DIRECTION.md`: design system
- `docs/OPERATIONS.md`: env vars, limits, deploy, scripts, review and pilot
- `docs/FEATURE_SPEC_TEMPLATE.md`: spec format for `/add-feature`
- `docs/specs/`: feature specs; `docs/specs/check-flow.md` records the original checker design
- `VERIFICATION.md`: what is tested and what is not; add a dated entry when you verify a release
When a change makes one of these wrong, fix the doc in the same change.

## Commands
- `npm test`: node:test through tsx (`tests/*.test.ts`)
- `npm run typecheck`
- `npm run build`
- `node scripts/review-packet.mjs`: run it after ANY change to a file in its `files` list. If you skip it, both `npm test` and `npm run build` fail ("Review packet is stale" / "review packet fingerprint").

## House style (no formatter is set up, so match it by hand)
- Single quotes. No spaces inside import braces: `import {a,b} from '...'`
- Dense one-line JSX and 1-space indent, like `app/components/MedicineCheck.tsx`. Never reformat lines you did not change.
- Imports use the `@/` alias. Icons come from `lucide-react`.
- Styling uses the shared classes in `app/globals.css` (`primary`, `secondary`, `text-button`, `note`, `caution`, `eyebrow`, `pharmacist-plan`, `button-row`, `source-links`). New styles go in a CSS file next to the component that imports it. Colours come from `app/tokens.css` (see `DESIGN.md`).
- Logic you want to test goes in `lib/*.ts` as plain functions with no React. Components only render.

## Design system (read before any UI change)
- Read `DESIGN.md` (Night & Paper) and `ART_DIRECTION.md`. Every colour, font, space and motion value lives in `app/tokens.css`; never hard-code one in a component.
- Landing page at `/` is night (`app/page.tsx`, `app/landing.css`, copy in `lib/landing-copy.ts`). The checker is at `/check` (`app/check/page.tsx` -> `app/components/CheckApp.tsx`), paper under a night top bar.
- One brand colour, signal `#3D5AFE`, means "do this next". Green (`--success-*`) is only for the answer card, meaning "your check is done". Amber and slate label list chips. No red anywhere.
- Bricolage Grotesque for everything; Fraunces italic only for one `<em>` per heading via `Emphasis.tsx`.
- Radius 4px for controls, 12px for cards. Controls at least 52px tall. Body text 18px; nothing below 14px.
- New CSS: one file per component, every class prefixed with the component name, values only from tokens.
- Keep the `data-motion` hooks listed in `DESIGN.md`. The hero entrance is the only motion.
- Check UI changes in a real browser at 375 px and desktop widths before saying they are done. Keep screenshots out of the repository.

## Hard limits
- No new dependencies. Use the existing scan and check-guidance APIs for consented AI processing. No storage (localStorage, cookies, database, analytics).
- Never send a photo, a name or anything the user typed anywhere new.
- Change only the files the task names. Leave `data/*.json`, `lib/scan.ts` and `lib/safety.ts` alone unless asked.
- Never hand-edit `public/review-packet.json` or `data/content-manifest.json`. The script writes them. If they conflict in a merge, take either side, then rerun the script.
- Any text a user will read follows the `health-copy-rules` skill.
