# ResistGuard revamp audit

Audit only. No code was changed. Version audited: commit `74417ac` (the last commit before "Add NAFDAC genuine-pack check and WhatsApp pharmacist button", `261f1d8`). All `file:line` references are to `74417ac`. `app/page.tsx` is unchanged in `261f1d8`. `MedicineCheck.tsx` lines after 63 shift by about 1 on the current branch.

The one job: **"Tell me what this medicine is, whether it's an antibiotic, and what to do next."**

---

## 1. Verdict

**Both, but structure first.** On a 375px phone the first working scan button is 1,502px down (1.85 screens). After you confirm, the answer starts 1,848px down (2.3 screens), under the whole input form. Four of the six nav tabs (Antibiotic use, Learn & try, Example insights, Pilot & review: 1,690 visible words) do nothing for the one job, while the Medicine check tab holds only 412 of the app's ~4,600 visible words. The look problems (9–10px nav and labels, a decorative fake label taking half the desktop hero) are real but secondary. A reskin would leave the app just as slow to use.

## 2. Tools used

| What | Used | Notes |
|---|---|---|
| Browser | **Headless Google Chrome, driven by my own script over the Chrome DevTools Protocol** (Node 26's built-in WebSocket, no packages) | Playwright MCP was not connected. The scripts are `audit/cdp.mjs` and `audit/walk.mjs` in the scratchpad. Phones were emulated at 375×812 (touch, device pixel ratio 2) and desktop at 1280×800. Every task used a fresh browser profile, so each one was a true first visit. |
| App version | `74417ac` in a git worktree in the scratchpad, `next dev --webpack` on port 3100 | No `.env.local`, so AI was paused locally. The **AI scan step of Task A** ran on https://resistguard-rosy.vercel.app. I checked that the live site is pre-feature: the confirmed result has no "Check the pack is genuine" box and no WhatsApp button ([live result, full page](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-08-A6-result-fullpage.png)). The worktree has been removed. The working branch was not touched. |
| Critique skill | **impeccable** (engine v0.1.30), installed with `npx impeccable skills install` | It was not installed before. I installed it into an empty scratch folder (project scope), so nothing was written to this repo. The installer also put the engine at `~/.impeccable/bin/0.1.30/` and I set `telemetry off` in `~/.impeccable/config.json`. A skill installed mid-session can't be invoked as `/impeccable`, so I followed its `critique` playbook by hand on its **read-only path**: ⚠️ **DEGRADED: single-context (read-only audit; skill not loadable mid-session; no sub-agents)**. Its deterministic detector (`impeccable detect --json`) ran on `app/` and on the home URL at 390×844 and 1280×800. The result screen has no URL, so the detector covered only the home screen. The result screen was reviewed by hand. No snapshot was saved and no command that edits files was run. |
| Not product UI | The round "N" badge bottom-left in local screenshots | Next.js dev indicator. It doesn't exist in production. |

Screenshots (66) are in `C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/`. **The scratchpad can be wiped by a reboot. Copy any screenshots you want for the pitch.**

## 3. Numbers

| Measure | 375×812 phone | 1280×800 desktop | How measured |
|---|---|---|---|
| Nav items | 6 tabs + logo link + floating "Ask ResistGuard" = 8 always-on controls. **Only 4 tabs fit on screen**, with no scroll cue. Nav text is 10px. | 6 tabs + logo + Ask | `page.tsx:45`, nav-visibility check |
| Sections on the home tab | **8 stacked blocks**: topline, hero, step strip, check workspace (2 panels), "02 / Keep the context" intro, 3 cards, safety banner, footer. The floating button is extra. | same (hero gets a decorative label illustration) | `page.tsx:49–65` |
| Things that open without the user asking | **1**: the first-visit tour. It reappears as 4 inline boxes at 4 points in the flow (step 4 has 3 variants). After you confirm, focus jumps to the result heading and scrolls the page. | same | `page.tsx:23–26, 53`; `MedicineCheck.tsx:50, 54, 57, 64` |
| Words above the fold | **103** first visit / 86 returning | 137 / 115 | visible text nodes above 812 / 800px |
| Words on the home tab | **443** first visit / 412 returning / **521 with a result** | 483 / 452 / 561 | all visible text nodes |
| Page length, home | 4.4 screens (5.3 with a result) | 3.1 screens | scrollHeight ÷ viewport |
| Controls on the home tab | 21 (12 in the first screen, **none of them Upload or Camera**) | 21 | visible buttons, links, inputs |
| Checkboxes before a scan can start | **4**: three photo checks + Groq consent | 4 | `MedicineCheck.tsx:55` |
| Words per other tab | Antibiotic use 400 · Catalogue **2,489** (18 screens) · Learn & try 630 · Example insights 207 · Pilot & review 453 | same words, shorter pages | |
| Content shown in more than one place | **11 groups** (below) | | |

**Duplicated content (11 groups):**

1. **"A match isn't approval / we don't diagnose".** Hero tag "Education first" (`page.tsx:55`), placeholder "What a match tells you" (`MedicineCheck.tsx:66`), "general" scenario "Recognition is the beginning, not approval" (`lib/safety.ts:27`), dark card "Recognition isn't approval" (`page.tsx:62`), safety banner (`page.tsx:64`), Ask footer (`AskResistGuard.tsx:102`), quiz Q1 (`Learning.tsx:6`). That's **5 times on the home tab alone.**
2. **Photo instructions.** ScanGuide's 3 tips (`ScanGuide.tsx:4`), upload-area text (`MedicineCheck.tsx:52`), the 3 photo checkboxes (the same 3 points again, `:55`), the "Brand-only or incomplete label?" note (`:62`), tour step 2 (`:50`), the camera dialog (`CameraCapture.tsx:28`) and Ask "How do I photograph the label?" (`AskResistGuard.tsx:14`).
3. **Privacy line.** Topline "No account. No saved health data." (`page.tsx:49`), footer (`:65`), upload area (`MedicineCheck.tsx:52`), consent line (`:55`).
4. **Ways into the catalogue: 7.** Nav tab, in-page dropdown, "Browse catalogue ↗" (`MedicineCheck.tsx:61`), bottom card "Explore the catalogue" (`page.tsx:62`), scan recovery "Look up a NAFDAC number" (`:58`), Ask "Open Catalogue", tour step 3.
5. **Cold / leftovers guidance.** Result scenario dropdown (`lib/safety.ts:26–34`), Learn & try cards (`Learning.tsx:9`), Antibiotic use plans and lesson (`UseCheck.tsx:56–67`, `lib/use-check.ts:19`), Ask "Why doesn't this antibiotic treat flu?", and the Explain dialog.
6. **Why antibiotic resistance (AMR) matters.** Bottom card (`page.tsx:62`), Learn & try header (`Learning.tsx:9`), ResistanceLesson (`UseCheck.tsx:30–71`), Ask "Why does responsible antibiotic use matter?".
7. **Questions for a pharmacist.** "A useful next conversation" (`MedicineCheck.tsx:66`), the Explain dialog's "Ask a pharmacist" list, and UseCheck's "Take these questions with you" (`UseCheck.tsx:167`).
8. **Summary and caution.** Shown on the result, then repeated word for word as bullets in the "Explain this simply" dialog (`AskResistGuard.tsx:51`).
9. **Onboarding: 3 systems.** The first-visit tour, "First time? Try a practice check" (FirstCheckGuide), and the 10 sample labels on Learn & try.
10. **Three buttons to the Antibiotic use tab.** Hero "Before taking an antibiotic", the nav tab, and the result's "Explore antibiotic use".
11. **Step counters that clash.** "01 / The label comes first" and "02 / Keep the context" (eyebrows), "01 Identify → 02 Confirm → 03 Understand" (step strip) and "Step 1 of 4" (tour) are all on screen in the same flow.

## 4. Tasks A–D

Taps count every tap a first-time user makes. Picking from a native dropdown counts as 2 taps (open, choose). "Scroll-heights" is how far the user has to scroll to reach the next control, in viewport heights. "Choices" is the number of controls visible on screen at each decision point.

| Task | Viewport | Taps | Scroll-heights | Choices shown on the way | Where it got confusing | Screenshots |
|---|---|---|---|---|---|---|
| **A. Sample label → confirmed result** (live AI; first visit, tour path: Read a label → Try with a sample label → 3 checks + consent → Read label → Yes) | 375 | **8** | **2.3** | home 12 → after "Read a label" 4 → photo loaded 3 → confirm 5 | "Read a label" only scrolls the page; it doesn't open anything. The sample is buried in the tour (returning visitors find it at the bottom of Learn & try). The 3-tip guide still sits above the photo after you pick one, pushing the preview half a screen down. A *fictional* sample still asks you to tick "There are no names or personal details". After you confirm, the answer appears below the whole form. | [home](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-01-A0-home.png) · [after Read a label](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-02-A1-after-read-a-label.png) · [photo](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-03-A2-photo-loaded.png) · [4 boxes](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-04-A3-checks-ticked.png) · [scan result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-05-A4-scan-result.png) · [confirm](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-06-A5-confirm.png) · [result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-07-A6-result-viewport.png) · [full page](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-08-A6-result-fullpage.png) |
| A | 1280 | **8** | **1.7** | 12 → 4 → 5 → 5 | Same steps. The result sits beside the form (good), but the floating Ask button covers its first heading. | [home](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-desktop-A-01-A0-home.png) · [confirm](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-desktop-A-06-A5-confirm.png) · [result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-desktop-A-07-A6-result-viewport.png) |
| A, AI off (local `74417ac`) | 375 / 1280 | 7, then stops | 1.1 / 1.0 | | Fails safely: "Read label" stays disabled and says "The scanner is unavailable. Use the catalogue below…". That's good. | [phone](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-A-04-A3-checks-ticked.png) |
| **B1. No camera: home dropdown → amoxicillin** | 375 | **3** | **1.8** | a 28-option dropdown, labelled "Exact active ingredient or combination" | The dropdown is 1,730px down, under the upload box. **After you choose, the confirm box appears *above* the dropdown, off-screen**, so you have to scroll back up. Then the answer appears 2.3 screens down. | [confirm](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-01-B1-confirm.png) · [result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-02-B1-result.png) |
| B1 | 1280 | 3 | 1.7 | same | same | [result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-B1-02-B1-result.png) |
| **B2. No camera: Catalogue tab → search → "Check this label" → Yes** | 375 | **4** + typing | **1.5** | 6 tabs, search box, a 6-option filter, 2 results, each with 2 links | The search works well (2 hits for "amoxicillin"), but it's tab 3 of 6. The button says "Check this label" when there is no label. It sends you back to the home tab, and you still need to confirm. | [catalogue](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B2-01-B2-catalogue.png) · [search](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B2-02-B2-search-results.png) · [back on home](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B2-03-B2-after-check-this-label.png) · [result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B2-04-B2-result.png) |
| B2 | 1280 | 4 + typing | 1.3 | same | same | [search](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-B2-02-B2-search-results.png) |
| **C. First 10 seconds** | 375 / 1280 | 0 | 0 | 12 controls; no Upload or Camera button | See section 5. | [phone, first visit](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-C-01-home-first-visit.png) · [phone, full page](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-C-02-home-first-visit-fullpage.png) · [desktop, first visit](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-C-01-home-first-visit.png) · [desktop, returning](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-C-03-home-returning.png) |
| **D1. From a confirmed amoxicillin result → "I have a cold"** | 375 | **2** | 0.7 | a dropdown labelled "What would you like to understand?" with **7 options** (cold is #2), plus 5 other controls in the panel | You can't see the cold/leftovers guidance without opening a dropdown whose label doesn't say "what to do next". | [cold](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-03-D1-cold.png) |
| **D2. → "Leftover antibiotics"** | 375 | **2** | 0 | same 7 options ("Using leftovers" is #4) | same | [leftovers](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-04-D2-leftovers.png) |
| D1 / D2 | 1280 | 2 / 2 | 0.6 / 0 | same | same | [cold](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-B1-03-D1-cold.png) |
| D, other routes | 375 | 1 | | "Explain this simply" opens a dialog of 153 words that repeats the summary and caution already on screen. "Explore antibiotic use" opens a page with **39 controls and 10 fictional situations that never mention amoxicillin** (the medicine is not carried over). | Both routes lose the "my medicine, my next step" thread. | [explain dialog](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-05-D3-explain-dialog.png) · [antibiotic use tab](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-06-D4-antibiotic-use-tab.png) |

## 5. Judge's 10-second test

- **What the first screen says now:** "This is an awareness project about reading medicine labels." The phone screen shows a giant question, a tour box, three equal buttons ("Read a label" squeezed to 90px wide and 3 lines) and tags saying "Education first". On desktop, half the screen is a picture of a label captioned "An illustration. Not a medicine label." Neither width shows a camera or upload button.
- **What it should say:** "Point your camera at the medicine's ingredient list and find out if it's an antibiotic and what to ask a pharmacist." One big Scan button, a "type the ingredient name" box, a "Try a sample" link and the emergency line, all on the first screen.

## 6. Problems

Severity uses Nielsen's 0–4 scale (4 = fix before the demo).

| # | Screen | Problem | Principle | Sev | Evidence |
|---|---|---|---|---|---|
| 1 | Home | No working scan control on the first screen. Upload/Camera are at 1,502px on phones (1.85 screens) and 1,438px on desktop. The hero's "Read a label" only scrolls down to them. | Krug "Don't make me think"; Fitts's law (the main target is off-screen) | **4** | `page.tsx:54`, `MedicineCheck.tsx:52`; [phone first screen](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-C-01-home-first-visit.png) |
| 2 | Result | The answer is added *below* the input form, not shown as a new step. On phones it starts 2.3 screens down, under the photo, 4 checkboxes, the scan result and the dropdown, which all stay on screen. | Nielsen #1 visibility of system status; cognitive load | **4** | `MedicineCheck.tsx:49–66` (one `workspace`, two panels); [live result, full page](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-mobile-A-08-A6-result-fullpage.png) |
| 3 | Global nav | 6 tabs, of which 4 are off the core job. 2 are meant for judges and facilitators ("Example insights" with synthetic numbers, "Pilot & review"). On phones 2 tabs are cut off and nav text is 10px. | Hick's law; Nielsen #8 aesthetic and minimalist design | **4** | `page.tsx:45`; nav check: "Example insights" and "Pilot & review" are off-screen at 375 |
| 4 | Home | The first screen describes a process ("Compare the reading with the small print…"). It never names the outcome (antibiotic yes/no, what to do next). 103 words above the fold, 443 on the tab. | Nielsen #2 match with the real world; Krug | **3** | `page.tsx:52` |
| 5 | Home → flow | The first-visit tour opens unasked and then appears as 4 boxes at 4 points. It sits on top of 2 other onboarding systems (practice check, sample set). The step counters clash (section 3, groups 9 and 11). | Cognitive load; Nielsen #3 user control; Nielsen #4 consistency | **3** | `page.tsx:23–26, 53`; `MedicineCheck.tsx:50, 54, 57, 64`; `FirstCheckGuide.tsx` |
| 6 | Photo review | 4 checkboxes before scanning. 3 of them repeat the 3 tips shown just above. A fictional sample still asks "no names or personal details". The tip panel stays above the photo after you pick one. | Hick's law; progressive disclosure | **3** | `MedicineCheck.tsx:51, 55`; [phone, 4 boxes](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-A-04-A3-checks-ticked.png) |
| 7 | Result | "What to do next" is hidden in a native dropdown, "What would you like to understand?", with 7 options. Cold and leftovers are #2 and #4. Six other controls compete in the same panel. | Nielsen #6 recognition rather than recall; Hick's law | **3** | `MedicineCheck.tsx:63`; `lib/safety.ts:26–34` |
| 8 | Result → Antibiotic use | "Explore antibiotic use" drops the confirmed medicine. It lands on 10 fictional situations, 39 controls, an "AI organise" button and a lesson, with no mention of amoxicillin. | Nielsen #4 consistency; cognitive load (memory bridge) | **3** | `MedicineCheck.tsx:65`, `UseCheck.tsx:122–179`; [antibiotic use tab](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-06-D4-antibiotic-use-tab.png) |
| 9 | Manual route | After you choose from the dropdown, the confirm box renders *above* the dropdown, off-screen on phones. Nothing tells you it appeared. | Nielsen #1 visibility of system status | **3** | `MedicineCheck.tsx:59` comes before `:61`; [confirm](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-01-B1-confirm.png) |
| 10 | Home / result | The emergency notice is only in the bottom banner: 3,300px down on phones (4.1 screens) and 2,334px on desktop. It's on every page, but almost nobody scrolls that far. | Progressive disclosure inverted (critical safety text hidden, extras shown) | **3** | `page.tsx:64` |
| 11 | Home | The Manual route (a must-stay item) is a 28-option dropdown with jargon labels ("Exact active ingredient or combination", "Choose a catalogue record") at 1,730px on phones. The good search (with brand and NAFDAC number) is on another tab. | Hick's law; Nielsen #2 | **3** | `MedicineCheck.tsx:61`; `Catalogue.tsx:23` |
| 12 | Result | "Explain this simply" opens a 153-word dialog. Its bullets repeat the summary and caution already on screen. | Nielsen #8 | 2 | `AskResistGuard.tsx:49–54`; [explain dialog](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-B1-05-D3-explain-dialog.png) |
| 13 | Home (phone), result (desktop) | The floating Ask button covers "First time? Try a practice check" on phones and the result's first heading on desktop. | Fitts's law (overlapping targets) | 2 | `ask-resistguard.css`; [phone home](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-C-01-home-first-visit.png), [desktop result](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/live-desktop-A-07-A6-result-viewport.png) |
| 14 | Home (phone) | The primary button "Read a label" is squeezed to 90px wide, wrapped onto 3 lines at 12px, next to 2 siblings of the same visual weight. | Fitts's law; Hick's law | 2 | `page.tsx:54`; measured 90×82px |
| 15 | Global | Undersized text. Detector at 390px: 16 "undersized UI text" + 9 "tiny text" findings (nav 10px, eyebrows 9px, topline and DEMO badge 8px) and 3 low-contrast findings (orange card 4.1–4.2:1, grey 4.48:1). | Nielsen #8 (legibility); WCAG 1.4.3 | 2 | `detect-url-390.json`; `polish.css` |
| 16 | Home (desktop) | Half the hero is a decorative "label" that says "An illustration. Not a medicine label." It looks like the product but isn't. | Nielsen #8; Krug | 2 | `page.tsx:57`; [desktop first visit](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-desktop-C-01-home-first-visit.png) |
| 17 | Home | The boundary message ("not approval") appears 5 times on the home tab. Repetition makes people skim, so the safety copy stops being read. | Nielsen #8; cognitive load | 2 | section 3, group 1 |
| 18 | Example insights | The synthetic dashboard is one tap from the home screen. A judge may read it as invented traction, even though it's labelled synthetic. | Nielsen #2 | 2 | `page.tsx:63` |
| 19 | Catalogue | The full list runs 18 screens on a phone (2,489 words). Each card shows its summary, caution and review line before any search. | Progressive disclosure | 2 | [phone catalogue, full page](C:/Users/fabia/AppData/Local/Temp/claude/f32f92b068a057ae/a21e510a-36b3-493c-8cda-456ee2aaa5a0/scratchpad/shots/local-mobile-inv-02-tab-Catalogue-fullpage.png) |
| 20 | Home | Heading levels skip (h1 → h3). The detector flags it at both widths. | Nielsen #4 | 1 | `detect-url-*.json` |
| 21 | Header | "A medicine literacy project" is dead copy: CSS hides it at every width except 1001–1100px. | Nielsen #8 | 1 | `page.tsx:46`; `globals.css:3`, `polish.css:3, 19` |

**Impeccable heuristic scores** (degraded single-context run; band from the playbook):

| # | Heuristic | Home | Result | Key issue |
|---|---|---|---|---|
| 1 | Visibility of system status | 2 | 2 | Readiness check and spinner are good; the confirm box and result appear off-screen |
| 2 | Match with the real world | 2 | 2 | "Catalogue record", "Consistent safety guidance", "What would you like to understand?" |
| 3 | User control and freedom | 3 | 3 | Reset, remove photo, "No / I'm unsure" all exist |
| 4 | Consistency and standards | 2 | 2 | 3 step counters; "Check this label" with no label; context lost across tabs |
| 5 | Error prevention | 3 | 3 | The confirm gate and full-set matching are strong (but heavy) |
| 6 | Recognition rather than recall | 2 | 1 | Next steps hidden in a dropdown |
| 7 | Flexibility and efficiency | 2 | 2 | Two routes, both slow |
| 8 | Aesthetic and minimalist design | 1 | 2 | 8 home blocks, 5× repeated boundary, decorative illustration |
| 9 | Error recovery | 3 | 3 | Specific recovery tips for unreadable photos |
| 10 | Help and documentation | 2 | 2 | Too much help: tour + practice + guide + assistant |
| | **Total** | **22/40** | **22/40** | **Acceptable**: "significant improvements needed" |

What already works (keep it): the confirm-before-answer gate; specific recovery tips for unreadable scans; the catalogue search (it finds brand names and NAFDAC numbers); a clean fallback when AI is off; and the flat "printed label" visual language, which is distinctive and fits the product.

Personas walked (from the impeccable rubric): **Jordan (first-timer).** Three onboarding systems, and the scan button is 1.85 screens down. Likely to give up before the camera. **Casey (distracted phone user).** 8 taps, 2.3 screens of scrolling, and the answer appears far below where they last tapped. **Judge (project-specific).** Sees "Education first", a tour box and 6 tabs. Reads it as a teaching website.

## 7. Cut list

Default for anything off the core path: **Hide**, meaning stop rendering it in the main UI but keep the component and its `lib/` logic. Every component below except `CameraCapture.tsx` is in the review packet (`scripts/review-packet.mjs:3`). So **any** edit to them, even just hiding them, changes the content fingerprint. Then `node scripts/review-packet.mjs` must be rerun, or `npm test` and `npm run build` fail, and the pharmacist packet becomes a new version. Tests only cover `lib/` plus the fingerprint (`tests/beta.test.ts:22`). **Hiding UI breaks no test logic. Deleting `lib/pilot.ts`, `lib/use-check.ts` or `lib/scan-guide.ts` would break `beta.test.ts` / `use-check.test.ts`, so don't.**

| # | Item (file:line) | When it appears · ~words | Decision | Reason | Principle | What it would break |
|---|---|---|---|---|---|---|
| 1 | Skip link (`page.tsx:42`) | always (focus only) · 3 | **Keep** | Accessibility | Nielsen #7 | — |
| 2 | Logo + DEMO badge (`page.tsx:44`) | always · 2 | **Keep** (enlarge the 8px badge) | Honesty about the demo | Nielsen #2 | fingerprint |
| 3 | Nav "Medicine check" (`page.tsx:45`) | always · 2 | **Keep, simplify** into the single app flow (no tab bar) | It is the product | Hick's law | fingerprint |
| 4 | Nav "Antibiotic use" + `UseCheck.tsx` (intro, "Education only", 10 situations, plan radios, 5 topic checkboxes, AI organise, ResistanceLesson) | on tap · ~400 | **Hide** (tab). **Move** the leftovers/sharing/prescription guidance into the result's next steps, where it already exists as `scenarios` | Generic and loses the medicine; 39 controls | Cognitive load; Hick's law | fingerprint (`UseCheck.tsx`, `use-check.ts`, `use-evidence.json` stay in the packet); keep `/api/use-evidence` |
| 5 | Nav "Catalogue" + `Catalogue.tsx` | on tap · ~2,489 | **Move**: becomes "Find by name", opened from the home search box ("See all 28"). Cards start collapsed. | It is the must-stay manual route, but on the wrong tab | Progressive disclosure | fingerprint; keep the "Pharmacist review pending · Check due" line (`Catalogue.tsx:33`) |
| 6 | Nav "Learn & try" + `Learning.tsx`: AMR intro + 4 cards | on tap · ~150 | **Hide** | Repeats the scenario text | Nielsen #8 | fingerprint |
| 7 | Learn & try: 3-question quiz (`Learning.tsx:10`) | on tap · ~110 | **Hide** | Teaching, not the tool | Hick's law | fingerprint |
| 8 | Learn & try: 10 sample labels (`Learning.tsx:11`) | on tap · ~250 | **Move**: one "Try a sample label" link on the home screen (amoxicillin), plus a short sample picker for the demo | Needed for the demo; buried now | Fitts's law | fingerprint; the `public/test-labels/*` files stay |
| 9 | Learn & try: "Read the evidence" list (`Learning.tsx:12`) | on tap · ~120 | **Hide** (sources stay per result) | Duplicate of per-record sources | Nielsen #8 | fingerprint |
| 10 | Nav "Example insights" (synthetic dashboard, `page.tsx:63`) | on tap · ~207 | **Hide** | Fake numbers in front of judges | Nielsen #2 | — (not in the packet, but `page.tsx` is) |
| 11 | Nav "Pilot & review" + `Pilot.tsx` (review packet download, protocol, observation form, "Pharmacist review pending" pills) | on tap · ~453 | **Hide** from the nav. **Move** to a footer link "For pharmacists and testers" | For facilitators and reviewers, not users; the packet download must stay reachable | Hick's law | fingerprint; `beta.test.ts` pilot tests unaffected |
| 12 | Header note "A medicine literacy project" (`page.tsx:46`) | 1001–1100px only · 4 | **Remove** | Dead copy, already hidden almost everywhere | Nielsen #8 | fingerprint |
| 13 | Topline "MEDICINE LITERACY / ANTIBIOTIC AWARENESS" (`page.tsx:49`) | always · 4 | **Remove** | Frames the app as education | Krug | fingerprint |
| 14 | Topline privacy line "No account. No saved health data." (`page.tsx:49`) | desktop · 6 | **Move** next to the consent box | Privacy belongs where the photo leaves the phone | Progressive disclosure | fingerprint |
| 15 | Hero eyebrow "01 / The label comes first" (`page.tsx:52`) | home · 5 | **Remove** | Clashing numbering | Nielsen #4 | fingerprint |
| 16 | Hero h1 + paragraph (`page.tsx:52`) | home · ~26 | **Keep, rewrite** around the outcome (section 8) | First-impression copy | Krug | fingerprint |
| 17 | First-visit tour, steps 1–4 (`FirstVisitTour.tsx`, `page.tsx:53`, `MedicineCheck.tsx:50, 54, 57, 64`) | first visit, unasked · ~110 total | **Hide** | The flow should explain itself; the tour opens unasked; it uses localStorage | Cognitive load; Nielsen #3 | fingerprint |
| 18 | Hero "Read a label" button (`page.tsx:54`) | home · 3 | **Merge** with Upload/Camera (the hero button *is* the camera) | It only scrolls today | Fitts's law | fingerprint |
| 19 | Hero "Before taking an antibiotic" (`page.tsx:54`) | home · 4 | **Hide** | Leads to the hidden tab | Hick's law | fingerprint |
| 20 | "First time? Try a practice check" + `FirstCheckGuide.tsx` | on tap · ~58 | **Hide** (the confirm step teaches the same thing for real) | Third onboarding system | Cognitive load | fingerprint |
| 21 | Hero tags "Source-linked guidance · Education first" (`page.tsx:55`) | home · 4 | **Remove** | Education framing; 9px text | Krug | fingerprint |
| 22 | Label illustration (`page.tsx:57`) | desktop · ~25 | **Remove** | Decorative and looks like the product | Nielsen #8 | fingerprint |
| 23 | Step strip "01 Identify → 02 Confirm → 03 Understand" (`MedicineCheck.tsx:49`) | home · 8 | **Keep, simplify** into the only step indicator (Scan → Check → Answer) | One progress cue | Nielsen #1 | fingerprint |
| 24 | Panel heading "Start with the label" + reset icon (`MedicineCheck.tsx:49`) | home · 9 | **Merge**: reset becomes a labelled "Check another medicine" | Icon-only reset | Nielsen #6 | fingerprint |
| 25 | ScanGuide, 3 photo tips (`ScanGuide.tsx:4`) | home · ~55 | **Merge** with the photo checks: show the 3 tips as plain lines beside the preview | The same text appears twice | Nielsen #8 | fingerprint |
| 26 | Upload area: Upload photo / Open camera + file notes (`MedicineCheck.tsx:52`) | home · ~35 | **Keep, move** to the first screen | The core action | Fitts's law | fingerprint |
| 27 | Camera dialog (`CameraCapture.tsx`) | on tap · ~40 | **Keep** | Core | — | — (not in the packet) |
| 28 | Photo review: preview, Replace, Retake (`MedicineCheck.tsx:52`) | after photo · ~20 | **Keep** | Core | Nielsen #3 | fingerprint |
| 29 | 3 photo-check checkboxes (`MedicineCheck.tsx:55`) | after photo · ~25 | **Merge** into the tip lines (no checkboxes). Fold "no names or personal details" into the consent sentence. | Fewer gates; the privacy point is kept | Hick's law | fingerprint; safety copy (privacy) must survive the merge |
| 30 | Groq photo consent (`MedicineCheck.tsx:55`) | after photo · ~22 | **Keep** (must stay) | Required | — | — |
| 31 | Scanner readiness help text (`MedicineCheck.tsx:55`) | after photo · ~20 | **Keep** | Good system status | Nielsen #1 | — |
| 32 | "Read label" button + spinner (`MedicineCheck.tsx:55`) | after photo · 4 | **Keep** | Core | — | — |
| 33 | Scan result + "What the AI read · check against your label" (`MedicineCheck.tsx:58`, text in `lib/scan.ts`) | after scan · ~60–80 | **Keep, simplify** (must stay). There is **no single "AI only reads labels" sentence in the pre-feature UI**: the idea lives in this box and the scan messages. Add one explicit line here. | Trust and accuracy | Nielsen #1 | fingerprint (`lib/scan.ts` is off limits without asking: put the line in the component) |
| 34 | Scan recovery tips (`MedicineCheck.tsx:58`, `lib/scan-guide.ts`) | unreadable only · ~40 | **Keep** | Best error recovery in the app | Nielsen #9 | — |
| 35 | Confirm step (`MedicineCheck.tsx:59`) | candidate · ~25 | **Keep** (must stay). Show it as its own step, on screen. | Core safety gate | Nielsen #5 | — |
| 36 | "You left the match unconfirmed" (`MedicineCheck.tsx:60`) | after "No / unsure" · ~45 | **Keep** | Safe exit | Nielsen #3 | — |
| 37 | "Or use the catalogue" dropdown, 28 options (`MedicineCheck.tsx:61`) | home · ~20 | **Keep, move, simplify** (must stay): a type-to-search box on the first screen, using the Catalogue's matching on names, brands and NAFDAC numbers | Manual route; dropdown is slow | Hick's law | fingerprint |
| 38 | "28 sourced records · No brand or authenticity verification" + "Browse catalogue" (`MedicineCheck.tsx:61`) | home · ~12 | **Merge** into the search box hint | Duplicate catalogue entry | Nielsen #8 | fingerprint |
| 39 | Note "Brand-only or incomplete label?…" (`MedicineCheck.tsx:62`) | home · ~15 | **Merge** into the tips | Duplicate | Nielsen #8 | fingerprint |
| 40 | Placeholder "What a match tells you" (`MedicineCheck.tsx:66`) | home, before any result · ~50 | **Hide** | A full panel of copy before anything has happened | Progressive disclosure | fingerprint |
| 41 | Result: name, Antibiotic / Not an antibiotic pill, category, summary, caution (`MedicineCheck.tsx:63`) | after confirm · ~45 | **Keep**. Make "Antibiotic / Not an antibiotic" the headline. | It *is* the answer | Krug | fingerprint |
| 42 | Scenario dropdown "What would you like to understand?" (`MedicineCheck.tsx:63`) | after confirm · 7 options | **Merge** into a visible "What next?" list (one tap each) | Hidden choices | Nielsen #6; Hick's law | fingerprint; keep the antibiotic/non-antibiotic filter logic |
| 43 | Rule block "Consistent safety guidance" (`MedicineCheck.tsx:63`) | after confirm · ~40 | **Keep** as the body of each "What next?" item. Drop the eyebrow. | The guidance itself | Nielsen #2 | fingerprint; safety copy from `lib/safety.ts` unchanged |
| 44 | "Explain this simply" → Ask dialog (`MedicineCheck.tsx:63`, `AskResistGuard.tsx:42–67`) | on tap · ~153 | **Hide** | Repeats on-screen text; an extra AI call path | Nielsen #8 | fingerprint; `/api/explain` stays |
| 45 | "Before using an antibiotic → Explore antibiotic use" (`MedicineCheck.tsx:65`) | antibiotic result · ~20 | **Hide** | Loses the medicine | Nielsen #4 | fingerprint |
| 46 | "A useful next conversation" (`MedicineCheck.tsx:66`) | after confirm · ~30 | **Keep, merge** into "Ask a pharmacist" in What next. On the current branch the WhatsApp button goes here. | A real next action | Nielsen #6 | fingerprint |
| 47 | Source links + "Source checked … · Pharmacist review pending" (`MedicineCheck.tsx:66`) | after confirm · ~25 | **Keep** (must stay). Put "Pharmacist review pending" next to the medicine name; sources in a collapsed "Sources" row. | Honesty | Progressive disclosure | fingerprint |
| 48 | Section intro "02 / Keep the context" (`page.tsx:61`) | home · 12 | **Remove** | Filler; clashing numbering | Nielsen #8 | fingerprint |
| 49 | Bottom cards "Why antibiotics need care" + "Go straight to the source" (`page.tsx:62`) | home · ~40 | **Hide** | Link to hidden tabs | Hick's law | fingerprint |
| 50 | Dark card "Recognition isn't approval" (`page.tsx:62`) | home · ~15 | **Merge** into one boundary line on the answer screen | 5× duplicate; it's boundary copy, so not removed | Nielsen #8 | fingerprint; boundary message must survive once |
| 51 | Safety banner: boundary text + emergency notice (`page.tsx:64`) | every tab, at the bottom · ~55 | **Keep + move** (must stay). The emergency notice becomes a one-line strip on the first screen and on the answer screen. The boundary text appears once, on the answer. | Safety text is now 4 screens down | Progressive disclosure | fingerprint; `emergency` in `lib/safety.ts` unchanged |
| 52 | Footer (`page.tsx:65`) | always · ~15 | **Keep, simplify**: links "How it works", "For pharmacists and testers" (pilot + review packet), "Sources" | Home for hidden material | Hick's law | fingerprint |
| 53 | Floating "Ask ResistGuard" button + dialog (`page.tsx:67–68`, `AskResistGuard.tsx`) | always · 2 (dialog ~38) | **Hide** during scan and confirm; **Move** the 3 preset answers into "How it works". *Conflicts with the CLAUDE.md rule that the button sits on every page: owner's call.* | Covers controls; repeats content | Fitts's law; Nielsen #8 | fingerprint; CLAUDE.md design rule |
| 54 | Auto-focus jump to the result heading (`MedicineCheck.tsx:24`) | after confirm | **Keep** (with a separate answer step it lands correctly) | Accessibility | Nielsen #1 | — |
| 55 | *(current branch only)* "Check the pack is genuine" + "Ask a pharmacist on WhatsApp" (`NextSteps.tsx`) | after confirm | **Keep** inside "What next?" | Real next actions; not audited here | — | already in the packet |

## 8. New structure

One flow, one screen at a time. No tab bar. The extra material lives behind footer links.

| # | Screen | What it holds |
|---|---|---|
| 1 | **Open** | Logo + DEMO. Headline: *"Is this medicine an antibiotic?"* One line: *"Scan the ingredient list. See what the medicine is, if it is an antibiotic, and what to ask a pharmacist."* Big **Scan the ingredient list** button (opens the camera), **Upload a photo**, a search box **"Or type the ingredient, brand or NAFDAC number"**, a **Try a sample label** link, and a one-line **emergency strip**. Footer: How it works · For pharmacists and testers · Sources. |
| 2a | **Photo** (scan route) | Preview with Replace / Retake. Three tip lines (whole ingredient panel · no glare · no names or personal details). The line *"The AI only copies the ingredient names it can see. You check them."* The **Groq consent checkbox** with the privacy line. **Read label**, with readiness status. |
| 2b | **Find by name** (manual route) | Type-ahead over the 28 records plus the 5 brand and NAFDAC references. "See all 28" opens the collapsed catalogue. Nothing is sent anywhere. |
| 3 | **Check** | "The AI read: amoxicillin" (or "You chose: amoxicillin") next to the record's full ingredient list. *"Does your package list exactly these active ingredients, and nothing else?"* **Yes, it matches** / **No, or I'm not sure**. Unreadable, outside-catalogue and non-medicine outcomes show here with their recovery tips. |
| 4 | **Answer** | Medicine name. Big **Antibiotic** / **Not an antibiotic** + category. "Pharmacist review pending". Summary. Caution (peach box). One boundary line: *"This tells you what the label says. It cannot tell you if you need this medicine."* Sources (collapsed). |
| 5 | **What next?** (same screen as 4, directly below) | Visible list, one tap each (accordion). Antibiotic: *I have a cold or flu* · *I have leftover antibiotics* · *Someone offered me theirs* · *It's my own prescription* · *More: missed dose, side effects*. Non-antibiotic: the 4 scenarios already allowed. Then **Ask a pharmacist** (questions to bring; on the current branch, the WhatsApp button), **Check the pack is genuine** (current branch, NAFDAC box), **Check another medicine**, and the emergency strip. |

All five scenario texts are already written and source-linked in `lib/safety.ts` (`scenarios`), so this needs no new medical copy.

| Task | Old taps / scroll (phone) | New taps / scroll (phone) |
|---|---|---|
| **A** sample → confirmed result | **8 taps, 2.3 screens** (Read a label, Try sample, 3 checks, consent, Read label, Yes) | **4 taps, 0 screens** (Try a sample label, consent, Read label, Yes) |
| **B** amoxicillin with no camera | **3 taps, 1.8 screens** (28-option dropdown + Yes), or **4 taps + typing, 1.5 screens** via the Catalogue tab | **3 taps + typing, 0 screens** (tap search, type "amox", tap Amoxicillin, Yes) |
| D cold / leftovers from the result | 2 taps each, inside a dropdown | 1 tap each, visible |

## 9. Demo path

**First screen the judges see:** screen 1 on a phone, mirrored: *"Is this medicine an antibiotic?"*, one big Scan button, the search box, the emergency strip. No tour, no tabs.

| Time | Step | What to point out |
|---|---|---|
| 0:00–0:20 | Screen 1. Say the problem in one line (people can't tell an antibiotic from the box, so they take leftovers for colds). | One job, one button. |
| 0:20–0:50 | Tap **Try a sample label** (or scan a printed fictional label). Show the photo screen, tick consent, tap **Read label**. | Nothing leaves the phone without consent. The AI only copies ingredient names. |
| 0:50–1:15 | **Check** screen: "The AI read: amoxicillin." Tap **Yes, it matches**. | A human confirms every match. The AI never decides alone. |
| 1:15–1:40 | **Answer**: *Antibiotic · Penicillin*, the penicillin-allergy caution, "Pharmacist review pending". | Honest about review status. |
| 1:40–2:10 | **What next?** Tap *I have a cold or flu* ("Antibiotics do not treat viruses"), then *I have leftover antibiotics*. | The AMR message arrives at the moment of decision, attached to the medicine in hand. |
| 2:10–2:30 | **Ask a pharmacist** / **Check the pack is genuine** (if the current-branch features are merged into this structure). | It hands off to a real authority. |
| 2:30–2:50 | **Check another medicine** → type "paracetamol" → Yes → **Not an antibiotic**. | Manual route: no camera, no AI, nothing sent. |
| 2:50–3:00 | Close on the emergency strip and "works without AI". | Safety boundary. |

Backup: the live AI call has timed out before (PROJECT_MAP section 13). If **Read label** spins for more than 10 seconds, switch to the typed route straight away. It gives the same answer and needs no AI.

## 10. Open decisions and audit limits

*The brief's section 10 heading was cut off. I used it for the things the owner must decide and the limits of this audit. Replace it if you meant something else.*

**Owner decisions**
- The floating "Ask ResistGuard" button is required on every page by CLAUDE.md, but it covers content and repeats other text. Keep it, or hide it during scan and confirm (item 53)?
- Any restructure changes the review-packet fingerprint, so the pharmacist packet becomes a new version. Fine for the demo, but it should be said.
- Hiding the tour removes the app's only localStorage use. The tour flag is the one exception to the "no storage" rule today.
- Should the hidden tabs stay reachable by URL for judges who ask about the pilot or AMR education, or only through footer links?

**What this audit did not cover**
- Real phone photos and real devices. Phones were emulated in headless Chrome.
- The detector covered the home screen only (the result screen has no URL). The result screen was reviewed by hand.
- A returning visitor's sample-label route (Learn & try → sample) was estimated from the layout, not walked.
- The two new features on `feature/next-steps` were left out on purpose, as the brief asked.
