@AGENTS.md

# ResistGuard: rules for Claude Code

Read PROJECT_MAP.md before you change the scan flow, the catalogue or any medical text. Never describe a NOT BUILT feature as working.

## Commands
- `npm test`: node:test through tsx (`tests/*.test.ts`)
- `npm run typecheck`
- `npm run build`
- `node scripts/review-packet.mjs`: run it after ANY change to a file in its `files` list. If you skip it, both `npm test` and `npm run build` fail ("Review packet is stale" / "review packet fingerprint").

## House style (no formatter is set up, so match it by hand)
- Single quotes. No spaces inside import braces: `import {a,b} from '...'`
- Dense one-line JSX and 1-space indent, like `app/components/MedicineCheck.tsx`. Never reformat lines you did not change.
- Imports use the `@/` alias. Icons come from `lucide-react`.
- Styling uses the existing CSS classes (`primary`, `secondary`, `text-button`, `eyebrow`, `pharmacist-plan`, `button-row`, `source-links`). New styles go in a CSS file next to the component that imports it (like `ask-resistguard.css`). Colours come from `docs/DESIGN.md`.
- Logic you want to test goes in `lib/*.ts` as plain functions with no React. Components only render.

## Design system (read before any UI change)
- CSS loads in layers. `app/globals.css` and `app/product.css` hold an older green theme. `app/polish.css` comes last and wins: it is the real look (a "printed label field guide").
- Trap: the variable `--green` holds **cobalt blue** (#254cce), not green. Never use `var(--green)` when you want green.
- Colours: ink #18202d, paper #f3f2ec, cobalt #254cce (actions and links), orange #f56d47 (highlights), peach `.caution` box for warnings.
- Shapes: flat, no shadows, 3px corners, thin 1px rules between sections. Small labels use monospace (`.eyebrow`).
- Result-panel sections use `.pharmacist-plan` (rule on top, h3 15px, p 13px). Buttons use `.primary` / `.secondary` (min height 47px).
- Mobile breakpoint is 680px. Inputs and selects stay 16px on mobile so iPhones don't zoom.
- The floating "Ask ResistGuard" button sits bottom-right on every page. Don't put anything there.
- New CSS: one file per component, every class prefixed with the component name (for example `.next-steps-...`), so it can't change existing screens.
- Check UI changes with the `ui-check` skill before saying they are done.

## Hard limits
- No new dependencies. No new AI calls. No storage (localStorage, cookies, database, analytics).
- Never send a photo, a name or anything the user typed anywhere new.
- Change only the files the task names. Leave `data/*.json`, `lib/scan.ts` and `lib/safety.ts` alone unless asked.
- Never hand-edit `public/review-packet.json` or `data/content-manifest.json`. The script writes them. If they conflict in a merge, take either side, then rerun the script.
- Any text a user will read follows the `health-copy-rules` skill.
