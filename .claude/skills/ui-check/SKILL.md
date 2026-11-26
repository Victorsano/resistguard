---
name: ui-check
description: Check a ResistGuard UI change in a real browser at phone and desktop width, against the live site. Use after any change to a component or CSS file, before saying UI work is done. Needs browser tools (the desktop app's built-in browser, or Claude Code started with --chrome).
---

# UI check

If you have no browser tools, stop. Tell me to restart with `claude --chrome` or use the desktop app.

## 1. Start the app
Run `npm run dev` in the background (or the `dev` entry in `.claude/launch.json`). It serves on `http://127.0.0.1:3000` (not localhost). The checker is at `/check`.

## 2. Get to the Answer screen (no AI and no photo needed)
1. Open `http://127.0.0.1:3000/check`.
2. Type the medicine name in the search box. The Find by name screen opens.
3. Tap the result. On "You chose …", tap "Yes, that's it".

Do this for `co-amoxiclav` (antibiotic, two ingredients) and `paracetamol` (not an antibiotic). If the change is on another screen, reach that screen instead: Home, Find by name, the catalogue ("See all 28 medicines"), or a footer page.

## 3. Compare with the live site
Do the same steps on `https://resistguard-rosy.vercel.app/check`. That is "before"; your local app is "after".

Check at 375 px wide (phone), then at 1280 px wide (desktop). Take a screenshot of the changed screen each time.

## 4. What must be true
1. The new UI shows **only** under the condition the spec gives (for example only after "Yes, that's it").
2. Everything that existed before looks the same. Only the new block changed.
3. The new block follows `DESIGN.md`: Bricolage Grotesque, token colours only, 4px control corners, 12px card corners, no shadows, no red, no green outside the answer card, controls at least 52px tall, body text 18px.
4. Nothing scrolls sideways on the phone, and no text is cut off.
5. The footer links (How it works, For pharmacists and testers, Sources) still sit at the bottom of the screen, in normal flow.
6. Every new link opens the right address. For a WhatsApp link, read its `href`, decode it, and show me the message.
7. The browser console has no new errors.

## 5. Report
List items 1 to 7 as pass or fail. Show the before and after screenshots for the phone width. Do not save screenshots inside the repository. Stop the dev server when you finish.
