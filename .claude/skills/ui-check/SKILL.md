---
name: ui-check
description: Check a ResistGuard UI change in a real browser at phone and desktop width, against the live site. Use after any change to a component or CSS file, before saying UI work is done. Needs Claude Code started with --chrome.
---

# UI check

If you have no browser tools, stop. Tell me to restart with `claude --chrome`.

## 1. Start the app
Run `npm run dev` in the background. It serves on `http://127.0.0.1:3000` (not localhost).

## 2. Get to the result screen (no AI and no photo needed)
1. Open `http://127.0.0.1:3000`. If the first-visit tour shows, skip it.
2. In "or use the catalogue", choose a record.
3. Tap "Yes, the complete list matches".

Do this for `co-amoxiclav` (antibiotic, two ingredients) and `paracetamol` (not an antibiotic).

## 3. Compare with the live site
Do the same steps on `https://resistguard-rosy.vercel.app/`. That is "before"; your local app is "after".

Check at 375 px wide (phone), then at 1280 px wide (desktop). Take a screenshot of the result panel each time and save it to disk.

## 4. What must be true
1. The new UI shows **only** after "Yes, the complete list matches". Before that, it is not on the page.
2. Everything that existed before looks exactly the same. Only the new block was added.
3. The new block looks like it belongs: same fonts, sizes, colours, spacing, 3px corners, thin rules. Nothing is rounded, shadowed or a new colour unless the spec says so.
4. Nothing spills sideways on the phone, and no text is cut off.
5. The floating "Ask ResistGuard" button does not cover the new button when it is scrolled into view.
6. Every new link opens the right address. For the WhatsApp link, read its `href`, decode it, and show me the message.
7. The browser console has no new errors.

## 5. Report
List items 1 to 7 as pass or fail. Show the before and after screenshots for the phone width. Stop the dev server when you finish.
