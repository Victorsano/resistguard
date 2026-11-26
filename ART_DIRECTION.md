# ResistGuard art direction: Night & Paper

## 1. Concept
A dark room with one lamp on. You walk in holding a medicine pack and one question, and the room answers it. The landing page is the room (night). The checker is the sheet of paper the answer is written on (paper). Everything else is subtracted.

## 2. Emotional response
Doubt, then clarity, then reassurance. The hero names the doubt in big, plain type. One blue word marks the turn. The page goes quiet after that. The checker should feel like a pharmacist's counter in daylight: white cards on warm paper and large text. A verdict should never feel like a warning siren unless it is the emergency strip.

## 3. Night & Paper on each surface
| | Night (landing, tool top bar, video) | Paper (tool) |
|---|---|---|
| Ground | `night #0B0D10`, flat, no texture | `paper #F5F3EF`; cards `#FFFFFF` |
| Text | `#FFF`, then `.72`, then `.56` white | `night` text, `ink-2 #4A4F59` secondary |
| Signal `#3D5AFE` | Fill of the one primary button (white label, 5.1:1). Large emphasis word only (3.8:1, so 24px and up). Small signal text uses `#6E80FF` | Primary button, links (4.6:1). Notes on `signal-50 #E9ECFF` with `#2A3BB8` text |
| Lines | `rgba(255,255,255,.12)` | `rgba(11,13,16,.12)` |

Each colour has one meaning. Signal means "do this next". Amber (`#fff0d4` / `#b25e00` / `#4d2600`) means antibiotic caution. Slate (`#e8eef5` / `#4f6b8a` / `#1d3350`) means not an antibiotic. Red `#b3261e` is the emergency strip only. The palette has no green, lavender or old cobalt. There are no shadows or gradients, except the single hero glow.

Radius is 4px on every control (buttons, inputs, chips) and 12px on paper cards. Focus is a 2px ring offset by 4px: `#6E80FF` on night, `#3D5AFE` on paper. It is the same shape everywhere.

## 4. Typography
**Bricolage Grotesque** (variable: weight 200–800, width 75–100%, optical size 12–96) carries everything. `font-optical-sizing: auto` gives display sizes the tighter 96 cut. Personality comes from the width and weight axes, not from extra typefaces:
- **Headline line 1:** bright and heavy. Weight 520–800, width 75–100%, leading .86–.95, tracking −0.02 to −0.042em. It is the only element allowed to be loud.
- **Headline line 2:** the same family but quieter. Weight 250–380, at `.72` or `.56` white.
- **Eyebrow:** 16px, weight 500, sentence case. **Lead:** 18–21px at 1.5 leading, weight 400. **Buttons:** 18–19px, weight 600.
- **Wordmark:** "ResistGuard" at 24px, weight 720, width 86%. "Demo" follows in 14px, weight 500, at `.56` white. No box, no monogram.

**Fraunces italic** (weight 400, `opsz 144`, `SOFT 100`, `WONK 1`) in signal is used for exactly one `<em>` per heading and nowhere else. Its x-height matches Bricolage at the same size, so it needs no resizing. It gets about 0.03em of right padding so the italic doesn't collide with the punctuation that follows. No caps, no system fonts, no Inter or Geist. Use typographic apostrophes (’) in display type.

## 5. Hero composition and negative space
The grid has 12 columns and a `clamp(20px, 4.2vw, 80px)` gutter. Media owns columns 1–4. The words start at column 5, 6 or 8 and end on the right gutter. Nothing else enters the left third. The hero fills the first screen alone; no next-section heading peeks in. The primary button stays above the fold from 320 to 1920px wide. Negative space is not padding left over. It is where the object will sit (left) and the pause between question and answer (above or between the lines).

`--hero-side: right` is the one switch. The copy column, its alignment and the media layer all read it. Setting it to `left` mirrors the whole composition through a CSS style query, with no second implementation. Browsers without style queries keep the default composition.

On a phone the media takes the top of the screen and the words take the bottom. The headline gets bigger, not smaller: 58–83px, three or four lines.

## 6. The video
A full-bleed `<video autoplay muted loop playsinline>` sits behind the words with `object-fit: cover`, anchored left, so the tablet, scanner and padlock stay in the left third at any aspect ratio. Its background must be exactly `#0B0D10`, so the frame edge disappears into the page. Check the encode against the page, because H.264's limited colour range lifts blacks. Until the video exists, the slot shows the placeholder: a blurred signal pool centred at 17% across and 53% down, plus a faint floor ellipse at 70% down. That marks where the objects should land. Brief for the 3D artist: keep the objects between 4–32% across and 25–75% down, and leave the right 60% empty. Use the poster image for reduced motion, Save-Data and 2G. With no media file, the page shows night plus the glow.

## 7. Five AI-design traps we refuse
1. The centred hero with a pill badge above it ("✨ New") and a violet gradient blob behind it.
2. A three-card icon grid straight after the hero, each with a circled icon and a two-line blurb.
3. Accent words sprinkled through every heading, or gradient text. Here there is one Fraunces word per heading and it is always meaningful.
4. A strip of invented numbers, or a fake phone mock-up of the product, used to look busy.
5. A fade-in on every section as you scroll. The only motion is the hero entrance, once.

## 8. What Tesla and Runway taught, and what we left behind
- **Tesla:** Keep one chromatic colour and reserve it for the action you want next. Show one message per screen. Use barely-rounded 4px buttons and no shadows. Left behind: the white showroom, carousels, the floating chat bar, and 14px body text, which is too small for Mrs Bisi.
- **Runway:** The media is the design and the interface steps back. Use a truly dark ground. Get depth from light, not from `box-shadow`. Set film-title leading near 1.0 with negative tracking. Left behind: tracked uppercase labels, one-typeface purity (we need the Fraunces word), 11–13px micro type, image grids, and pure `#000`.

## The three lab directions (Phase 1 only)
| | A: "Don’t swallow a *guess*." | B: "Is it an antibiotic?" | C: "Wrong pill today." |
|---|---|---|---|
| Idea | Editorial cover line | The question, a pause, the answer | Consequence as a film title card |
| Copy column | Columns 6–12, anchored low | Columns 8–12, question at top, answer at bottom | Shrink-wrapped to the right edge, centred vertically |
| Line 1 | Weight 640, width 90%, 165px, forced break | Weight 520, width 100%, 127px, open | Weight 800, width 75%, 188px, one line |
| Line 2 | 44px standfirst at `.72` | 75px weight 320, carries *before* | Same size as line 1, weight 250, at `.56`, carries *cure* |
| Actions | Inline button and link under the lead | 456px bar, link below | Lead left, actions pushed right in one row |

The sizes above are at 1920 × 1080.
