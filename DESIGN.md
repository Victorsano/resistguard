# ResistGuard design system: Night & Paper

One product, one design language. The landing page (`/`) is night. The medicine checker (`/check`) is paper under a night top bar. Both are surfaces of the same product. The direction and its reasoning live in `ART_DIRECTION.md`; this file is the working reference. Every value below is defined once in `app/tokens.css`, and nothing else may define a colour, font or motion value.

## Colour: one brand colour, three meaning colours

| Token | Value | Use |
|---|---|---|
| `--night` | `#0B0D10` | Landing ground, tool top bar, hero video ground, tool text (`--ink`) |
| `--paper` | `#F5F3EF` | Tool ground |
| `--card` | `#FFFFFF` | Cards, inputs and secondary buttons on paper |
| `--ink-2` | `#4A4F59` | Secondary text on paper (7.4:1) |
| `--on-night` / `-2` / `-3` | `#FFF` / `.72` / `.56` white | Text on night: primary, secondary, muted |
| `--line` / `--line-strong` | night at `.12` / `.28` | Hairlines / control borders on paper |
| `--line-night` / `--line-night-strong` | white at `.12` / `.32` | Hairlines / control borders on night |
| `--signal` | `#3D5AFE` | **Do this next.** Primary buttons and links on paper; the large emphasis word on night |
| `--signal-press` | `#2F49E0` | Hover and press of signal fills |
| `--signal-300` | `#6E80FF` | Small signal text and the focus ring on night |
| `--signal-50` / `--signal-ink` | `#E9ECFF` / `#2A3BB8` | Information notes on paper (paused photo reading, "AI read this", timeouts) |
| `--amber-*` | `#FFF0D4` `#B25E00` `#8A4500` `#4D2600` | **Antibiotic caution** only: verdict and chips |
| `--slate-*` | `#E8EEF5` `#4F6B8A` `#34506F` `#1D3350` | **Not an antibiotic** only: calm information |
| `--emergency` | `#B3261E` | The emergency strip, nothing else |

Rules:
- No green anywhere: "not an antibiotic" must never read as "safe to take".
- No gradients or shadows, except the one hero glow.
- Signal never marks decoration; if something is blue, it can be tapped or it is the one emphasised word.

## Type

- **Bricolage Grotesque** (variable: weight 200–800, width 75–100%, optical size automatic) for every word. Hierarchy comes from size, weight and width:

  | Role | Size | Weight / width | Leading / tracking |
  |---|---|---|---|
  | Hero line 1 | 56–176px | 640 / 90% | .9 / −.042em |
  | Hero line 2 | 22–44px | 380 / 100%, `--on-night-2` | 1.14 / −.015em |
  | Tool Home heading | 44–80px | 640 / 90% | .96 / −.04em |
  | Screen heading | 34–48px | 640 / 90% | 1.02 / −.03em |
  | Section heading | 24–26px | 650 / 92–95% | 1.15–1.2 |
  | Verdict | 28–34px | 700 / 86% | 1.1 |
  | Body | 18px | 400 | 1.55 |
  | Lead | 20px | 400, `--ink-2` | 1.5 |
  | Small and notes | 16px | 400–600 | 1.5 |
  | Buttons | 18–19px | 600 | 1.2 |
  | Wordmark | 22px (20px on phones) | 720 / 86%; "Demo" 14px at `.56` | 1 |

- **Fraunces italic** (weight 400; `opsz 144`, `SOFT 100`, `WONK 1`) in signal, for **one `<em>` per heading** only. Use `app/components/Emphasis.tsx`. Never use it in body text, buttons, verdicts or medical text.
- Nothing below 14px. Body is never below 18px in the tool. No caps, no monospace, no system fonts.
- Display text on the landing page uses typographic apostrophes (’).

## Shape, space, focus

- Radius: `4px` for every control (buttons, inputs, chips); `12px` for cards and verdicts on paper.
- Space scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Page gutter is `clamp(20px, 4.2vw, 80px)`.
- Controls are at least 52px tall; the default is 56px, and primary actions on Home are 64px.
- Focus is a 2px ring offset 3px: signal on paper, signal-300 on night (`.on-night`).
- The verdict uses a full 2px border plus a tint, an icon and words. Never a side stripe, and never colour alone.

## Components

- **Wordmark:** `app/components/Wordmark.tsx`. "ResistGuard" followed by "Demo" in small text. No monogram, no badge.
- **Buttons:** `.primary` (signal fill), `.secondary` (white with a 1px border), `.text-button` (signal underline). The landing page uses `.landing-button` with a trailing arrow: one rectangle, one arrow.
- **Notes:** `.note` (signal-50) for information; `.caution` (white card) for medicine cautions.
- **Emergency strip:** rendered once by `CheckApp`, in normal flow at the bottom of every tool screen. It is never fixed or sticky.
- **Hero media:** `app/components/HeroMedia.tsx`. The rules are in `lib/hero-media.ts`:
  - The video renders only when `NEXT_PUBLIC_HERO_VIDEO=1` and `public/media/hero.webm` or `hero.mp4` exists.
  - `hero-poster.jpg` is shown for reduced motion, Save-Data and 2G.
  - Otherwise the slot shows night and the glow.
  - `--hero-side: right` puts the words on the right; `left` mirrors the hero.

## Layout

- The landing page uses a 12-column grid. Hero media owns columns 1–4, and the words run from column 6 to the right edge. There are at most four sections after the hero, separated by space, never by rules. No card grids, no numbered circles.
- The tool uses one 640px column for the check flow, 760px for information pages, and 1040–1120px for the pilot page and the catalogue. One question per screen.
- The phone breakpoint is 760px on the landing page. Phone layouts keep the headline large; the media takes the top of the hero.

## Motion

Only the hero moves. It enters once on load in five steps (eyebrow, line 1, line 2, lead, actions), each 440ms with a 65ms stagger, using opacity and a 14px rise. Space is reserved, so nothing reflows. There is no animation library, no scroll-triggered motion and no transform on page wrappers. A single `prefers-reduced-motion` block in `tokens.css` stops all of it.

Stable `data-motion` hooks for later work:

| Hook | Where |
|---|---|
| `hero-eyebrow`, `hero-line-1`, `hero-line-2`, `hero-lead`, `hero-cta` | The landing hero |
| `reveal` | Every landing section after the hero |
| `screen` | The root of every tool screen and information page |
| `verdict` | The answer verdict |
| `scan-state` | The photo screen's reading, paused and timeout area |
| `press` | Every button and button-like link |

## Copy

Landing copy is in `lib/landing-copy.ts`; all tool copy is in `lib/screen-copy.ts`. Medical text stays in `lib/safety.ts` and `data/` and is never edited for presentation. Follow the voice rules in `.claude/skills/health-copy-rules`.
