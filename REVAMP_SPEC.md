# ResistGuard Revamp: Product, Copy and Demo Spec

Nov 25, 2026 · @Fabian

## Verdict on REVAMP\_AUDIT.md

The audit's diagnosis is right, but its cure is not. It measured the clutter well. Then it rebuilt the app as an engineer would: shorter steps, same flat voice, no story, no selling. Keep its numbers and its cut list. Replace its words, its demo and its idea of who the user is.

### Keep from the audit

| What | Why it holds up |
| --- | --- |
| The scan button is 1.85 screens down on a phone | Measured, and it is the main reason the app feels like a website |
| The answer appears under the form, 2.3 screens down | Measured. The answer must be its own screen |
| 6 tabs, 4 of them off the core job | Hide them. Move the pilot and review packet to the footer |
| 11 groups of repeated text | Say each thing once, where it matters |
| The confirm step, recovery tips and catalogue search | These are the strongest parts of the product |
| Task A drops from 8 taps to 4, Task B from 1.8 screens of scrolling to 0 | The right target. Use it as a pass/fail check |

### What is wrong with it

| Problem | Example from the audit | Why it fails |
| --- | --- | --- |
| **No reason to care.** The first screen names a task, not a benefit. | "Is this medicine an antibiotic?" | Nobody wakes up wanting to classify a pill. They want to know: "Should I take this?" The headline must answer the person's real question. |
| **Engineer's English.** The copy describes how the system works. | "The AI only copies the ingredient names it can see. You check them." / "Does your package list exactly these active ingredients, and nothing else?" | Stiff, long and cold. It reads like a disclaimer, not a helpful product. |
| **Generic users.** It used the skill's stock personas ("Jordan", "Casey"). | No older user, no low-literacy user, no Nigerian setting | The real users are a mother at a chemist counter, an older man with weak eyes, a trader who reads slowly and a student in a hurry. |
| **No research on the screen.** | Nothing tells a judge why this matters | Judges reward teams who clearly understand the problem. One sourced fact, placed well, shows that. |
| **The AI is hidden or apologised for.** | "AI only copies..." framed as a limit | This is an AI-for-AMR (antimicrobial resistance) competition. "AI reads the label, you confirm it" is a trust feature. Sell it as one. |
| **A weak demo.** | "Say the problem in one line (people can't tell an antibiotic from the box, so they take leftovers for colds)" | That was a speaker note, not screen text, but it is still weak. It sounds like blame, opens with no person and no stakes, and starts with a fake sample label. |
| **Risky colour logic.** It never said how the verdict should look. | – | If "Not an antibiotic" shows in green, users read it as "safe to take". That is a health risk. |
| **No microcopy.** | Loading, timeout, no-match and error messages are missing | These moments decide whether the app feels trustworthy. They need written words, not defaults. |

## Positioning

ResistGuard helps you check a medicine before you take it, at the moment you're holding it. Every screen, word and demo step must serve that one moment.

### The promise, in one sentence

> For anyone in Nigeria holding a medicine they're unsure about, ResistGuard reads the label and tells you in seconds whether it's an antibiotic, and what to do before you take it. Leaflets and campaigns talk about antibiotics in general. ResistGuard works on the exact pack in your hand.

### The moments it's built for

1. **At the chemist counter.** You're about to buy something for a cough and want to know what it is.
2. **At home with leftovers.** You find half a strip from your last illness, and you have a cold.
3. **When someone hands you theirs.** A relative or friend says, "Take this, it worked for me."
4. **With your own prescription.** You want to know what you've been given and what to ask.

### Who uses it

| Person | Their situation | What the design must do |
| --- | --- | --- |
| Mrs Bisi, 62, retired teacher | Weak eyesight, buys medicine for her grandchildren | Big text, big buttons, one thing per screen |
| Ngozi, 38, market trader | Reads English slowly, little time | Short words, icons with every label, no long paragraphs |
| Tunde, 20, student | In a hurry, has leftovers from last term | Answer in seconds, easy to share with a pharmacist |
| A judge | Holding your phone for the first time | Understands the product in 10 seconds, finishes in 3 taps |

### What the research says, and what it means for the design

| Finding | Design decision |
| --- | --- |
| In a Nigerian survey, 31.3% of people who took antibiotics in the past six months had no prescription, and only 8.3% had good knowledge of antimicrobial resistance. [Survey](https://pmc.ncbi.nlm.nih.gov/articles/PMC7238560) | People don't need a lecture. They need an answer about the pack they're holding. |
| In the same survey, 76.6% believed they were powerless to stop the spread of resistance. [Survey](https://pmc.ncbi.nlm.nih.gov/articles/PMC7238560) | Give people one small action they can take now. "Check before you take it" turns powerlessness into a step. |
| In a national survey of graduates, education didn't change self-medication. Inconvenience, limited access to doctors and cost were the main reasons. [Scientific African, 2024](https://ui.adsabs.harvard.edu/abs/2024SciAf..2301978P/abstract) | Being educated isn't enough. Make the next step easy: WhatsApp a pharmacist, check the pack. |
| In a rural northern sample, chemist shops (58.2%) were the main source of self-medicated antibiotics, and ampicillin/cloxacillin was the most used. [Rural study, 2016](https://uilspace.unilorin.edu.ng/items/ea5defe9-4523-4971-9fcd-34ec1077c930) | Design for the counter moment. Use Nigerian examples (ampicillin + cloxacillin) in samples and the demo. |
| Nigeria had an estimated 263,400 deaths associated with antimicrobial resistance in 2019. [allAfrica](https://allafrica.com/stories/202411250006.html) | Use this in the pitch, not on the tool screen. It shows judges the stakes. |
| Research on low-literacy health apps recommends one question per screen with large buttons, like an ATM (automated teller machine). [Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9634204/table/t2) | One decision per screen. Large buttons. No tabs. |

## Voice and copy rules

ResistGuard sounds like a calm, knowledgeable pharmacist friend: warm, direct and never preachy. Every word on the site follows these rules.

1. **Answer the person's question, not the system's.** Write "Should you take this?", not "Medicine classification".
2. **Say what to do, then why.** "Ask a pharmacist first. Antibiotics don't treat colds."
3. **Use "you". Avoid "we" except for limits.** For example: "We can't tell if you need this medicine."
4. **Use short words and short sentences.** Aim for 12 words or fewer per sentence on screens. No "catalogue record", "candidate" or "active ingredient" without a plain gloss.
5. **Use sentence case everywhere.** No ALL CAPS eyebrows and no numbered section labels like "01 /".
6. **Never blame.** Write "Leftovers aren't a treatment plan", not "People misuse leftovers".
7. **Never imply safety.** Never write "safe", "approved" or "OK to take" about a medicine.
8. **Say each limit once, where it matters.** The boundary line appears once, on the answer screen.
9. **Every button starts with a verb and says what happens.** "Scan your medicine", not "Read a label" or "Start".
10. **Pair every key label with an icon.** This helps people who read slowly.

### Before and after

| Before | After |
| --- | --- |
| MEDICINE LITERACY / ANTIBIOTIC AWARENESS | (removed) |
| Read a label | Scan your medicine |
| Exact active ingredient or combination | Type a medicine name |
| The AI only copies the ingredient names it can see. You check them. | AI reads the label. You check it. |
| Does your package list exactly these active ingredients, and nothing else? | Does your pack say this, and nothing more? |
| What would you like to understand? | Before you take it |
| Recognition is the beginning, not approval. | This tells you what's in the pack. Only a pharmacist or doctor can tell you if you need it. |
| Pharmacist review pending | Not yet reviewed by a pharmacist |
| Check this label | Check this medicine |

## Screen-by-screen spec

The app becomes one path of five screens, one decision per screen: Home, Check your photo, Is this what your pack says?, Answer, and Find by name. There are no tabs. Quoted text is the exact copy to use.

**Medical text rule:** change labels and headings only. The body of each medicine record and each scenario stays exactly as it is in `lib/safety.ts` and the data files, because that text is what the pharmacist review covers.

### Screen 1: Home

| Element | Exact copy |
| --- | --- |
| Headline | "Check your medicine before you take it" |
| Subline | "Scan the label. In seconds, see if it's an antibiotic and what to ask your pharmacist." |
| Primary button (camera icon, full width) | "Scan your medicine" |
| Secondary button (upload icon) | "Upload a photo" |
| Search box (search icon) | Placeholder: "Or type a name, like amoxicillin or Emzoclox" |
| Small link | "See an example" (loads the ampicillin + cloxacillin sample, or amoxicillin if that sample doesn't exist) |
| Trust line (small, under the buttons) | "AI reads the label. You confirm it. Free, no account." |
| Emergency strip (always visible, bottom) | "Trouble breathing, a swollen face or throat, or fainting? Get emergency help now." |

Remove: the topline, "01 / The label comes first", the tags, the label illustration, the tour, "First time? Try a practice check", "02 / Keep the context", the three cards and the floating Ask button.

### Screen 2: Check your photo

| Element | Exact copy |
| --- | --- |
| Title | "Check your photo" |
| Photo preview | Buttons: "Retake" and "Choose another" |
| 3 tips with tick icons (not checkboxes) | "The whole ingredient list is in view" / "No glare or blur" / "No names or addresses" |
| Consent (the one checkbox) | "I agree to send this photo to Groq, our AI provider, to read the ingredients. ResistGuard doesn't keep it." Link: "How your photo is handled" |
| Primary button | "Read the label" |
| Loading state | "Reading your label…" then, below: "This usually takes under 20 seconds." |
| Timeout | "That took too long." Buttons: "Try again" and "Type the name instead" |
| AI paused | "Photo reading is paused right now. Type the medicine name instead." Button: "Type the name" |

### Screen 3: Is this what your pack says?

| Element | Exact copy |
| --- | --- |
| Title | "Is this what your pack says?" |
| What the AI read | Each ingredient as a large chip, for example "Ampicillin" and "Cloxacillin" |
| Instruction | "Look at your pack. Does it list these, and nothing more?" |
| Note under the chips | "AI read this from your photo. You have the final say." |
| Buttons | "Yes, that's it" (primary) and "No, or I'm not sure" |
| After "No, or I'm not sure" | "No problem. Try a clearer photo, or show the pack to a pharmacist." Buttons: "Retake photo" and "Type the name" |
| Manual route version | Title: "You chose amoxicillin". Same instruction and buttons. |

Other outcomes on this screen:

| Outcome | Exact copy |
| --- | --- |
| Unreadable | "We couldn't read the label clearly." Then the matching tip from `lib/scan-guide.ts`. Buttons: "Retake photo" and "Type the name" |
| Brand name only | "We need the ingredient list, not just the brand. Turn the pack over and look for 'Each capsule contains' or 'Composition'." |
| Not in our list | "We don't have this medicine yet." Then: "That doesn't mean it isn't an antibiotic. Ask a pharmacist before you take it." Button: "Ask a pharmacist on WhatsApp" |
| Not a medicine | "This doesn't look like a medicine. Scan the ingredient list on a medicine pack." |

### Screen 4: Answer

| Element | Exact copy |
| --- | --- |
| Verdict card (icon, colour and words together) | "This is an antibiotic" or "This is not an antibiotic" |
| Under the verdict | Medicine name and family, for example "Amoxicillin · penicillin family" |
| Review badge | "Not yet reviewed by a pharmacist" |
| Summary and caution | Unchanged text from the record. The caution sits in its own box. |
| Boundary line (shown once) | "This tells you what's in the pack. Only a pharmacist or doctor can tell you if you need it." |
| Section heading | "Before you take it" |
| One-tap cards (antibiotic) | "I have a cold, flu or cough" / "These are left over from before" / "Someone gave these to me" / "A doctor prescribed this for me" / "I missed a dose or feel side effects" |
| One-tap cards (not an antibiotic) | "I have a cold, flu or cough" / "I missed a dose or feel side effects" (plus the other allowed scenarios) |
| Card body | The existing scenario text from `lib/safety.ts`, unchanged |
| Section heading | "Next steps" |
| Actions | "Ask a pharmacist on WhatsApp" (primary) / "Check the pack is genuine" (expands the NAFDAC box) / "Check another medicine" |
| Collapsed row | "Where this information comes from" (source links and date checked) |

### Screen 5: Find by name

| Element | Exact copy |
| --- | --- |
| Search box | Placeholder: "Type a name, brand or NAFDAC number" |
| Each result | Medicine name plus a small verdict chip: "Antibiotic" or "Not an antibiotic" |
| No result | "We don't have that medicine yet. That doesn't mean it isn't an antibiotic. Ask a pharmacist." |
| Link | "See all 28 medicines" |
| Note | "Nothing you type leaves your phone." |

### Footer (every screen)

"How it works" · "For pharmacists and testers" (pilot form and review packet) · "Sources"

## Visual rules

The look should feel like a confident medical tool, not a school project. Keep the existing "printed label" style, which the audit found distinctive. Make it bigger, bolder and calmer.

| Rule | Value | Why |
| --- | --- | --- |
| "This is an antibiotic" verdict | Deep amber, with a pill-and-alert icon | Means "handle with care", not "danger" |
| "This is not an antibiotic" verdict | Slate blue, with an info icon | **Never green.** Green reads as "safe to take", which the app must never imply |
| Red | Emergency strip only | Red keeps its meaning: act now |
| Body text | 18 px minimum. No text under 14 px anywhere | Older eyes. The audit found 8–10 px labels |
| Headlines | 28 px or larger on phone | Read at arm's length |
| Buttons | 52 px tall minimum, full width on phone, one primary button per screen | Easy for shaky thumbs; one clear next step |
| Contrast | 4.5:1 or higher for all text (WCAG AA, the main web accessibility standard) | The audit found 3 failures |
| Icons | Always paired with words | Helps slow readers; icons alone are ambiguous |
| Spacing | One idea per block, generous white space | Lower reading load |
| Motion | Only for state changes (loading, verdict appearing) | Shows the system is working |
| Remove | Decorative label illustration, ALL CAPS eyebrows, "01 /" numbering, floating Ask button during the flow | Noise that competes with the one job |

## Demo script for the judges

Open with a moment every judge has lived, prove it with one number, then let the product answer it live on a real pack. The script below runs about 3 minutes. The quoted lines are what you say out loud. They never appear on screen.

| Time | On screen | What you say |
| --- | --- | --- |
| 0:00–0:25 | Home screen, mirrored to the projector | "You have a cold. In your drawer, there's half a strip of capsules from last time. Do you take them?" Pause. "In one Nigerian survey, nearly 1 in 3 people who'd taken antibiotics had no prescription. Only 8 in 100 understood resistance. Most people don't misuse antibiotics on purpose. They just can't tell what's in the pack." |
| 0:25–0:55 | Tap "Scan your medicine". Photograph a real ampicillin + cloxacillin pack. Show "Check your photo". | "Point your phone at the ingredient list. Nothing is sent until you agree." Tick consent, tap "Read the label". |
| 0:55–1:20 | "Is this what your pack says?" with the ingredient chips | "AI reads the label in seconds. But AI doesn't make the call alone. You check it against your pack." Tap "Yes, that's it". |
| 1:20–1:50 | "This is an antibiotic" verdict | Tap "I have a cold, flu or cough". "Right when you're about to take it, you learn antibiotics don't treat colds." |
| 1:50–2:20 | "Next steps" | "Not sure? One tap sends your question to a pharmacist on WhatsApp. Worried it's fake? We take you to NAFDAC's own check." |
| 2:20–2:40 | "Check another medicine" → type "paracetamol" → "This is not an antibiotic" | "No camera, no data? Type the name. It works without AI, and nothing leaves your phone." |
| 2:40–3:00 | Back to Home | "Next, a version for the chemist counter, where most antibiotics are sold. Our goal is simple: fewer antibiotics taken for colds, one check at a time." Then hand a judge the phone: "Try it yourself." |

### Rules for the demo

- **Practise with the real pack.** Use the exact pack you'll use on stage at least 5 times. Pick one that scans cleanly.
- **Have a fallback.** If "Reading your label…" runs past 10 seconds, say "Here's the backup route" and type the name. Never wait in silence.
- **Warm up the server.** Run one scan 2 minutes before you go on stage, so the first call doesn't time out.
- **Use your phone's hotspot,** not the venue Wi-Fi.
- **Use your own story if you have one.** If you, a friend or a relative has actually taken leftover antibiotics for a cold, open with that instead. Don't invent one.
- **Every number must have a source.** Have the survey link ready in case a judge asks.

## Build order and instructions for Claude Code

Build in four stages, and commit after each one passes the checks. If a stage runs an hour over, stop and keep the last working commit.

### Decisions to make first

1. **Floating Ask button:** remove it from the flow and update the rule in `CLAUDE.md`. (Recommended. It covers buttons and repeats text.)
2. **Hidden tabs:** reachable only from the footer links. (Recommended.)
3. **Demo pack:** choose a real cardboard carton, not shiny foil. The Emzoclox foil pack was misread before. Test it 5 times.

### Stages

| Stage | What gets built | Done when |
| --- | --- | --- |
| 1. Cut | Remove the tab bar. Hide the 4 off-path tabs, the tour, the practice check, the illustration and the bottom cards. Move the pilot and review packet to the footer. | The home screen shows only screen 1 elements. Tests and build pass. |
| 2. Flow | Turn the single long page into the 5 screens, in order. Put the answer on its own screen. Move the confirm box so it never appears off-screen. | Task A in 4 taps with no scrolling. Task B in 3 taps plus typing. |
| 3. Words | Apply every exact copy line from the screen spec. Labels and headings only; medical body text stays unchanged. | Every screen matches the spec word for word. |
| 4. Look | Apply the visual rules. Then run `/impeccable polish`. | Verdict colours correct, no text under 14 px, contrast 4.5:1, buttons 52 px. |

After every stage, run `node scripts/review-packet.mjs`, then `npm test`, then `npm run build`.

### Prompt to paste into Claude Code

Save this doc as `REVAMP_SPEC.md` in the repo root first, then paste:

```
Read REVAMP_SPEC.md, PROJECT_MAP.md and CLAUDE.md. REVAMP_SPEC.md overrides REVAMP_AUDIT.md wherever they disagree.
Work on a new branch called revamp. Do stage 1 only, then stop and show me screenshots at 375x812 and 1280x800.
Rules:
- Hide, don't delete. Never delete anything in lib/ or data/.
- Medical body text in lib/safety.ts and data/ stays word for word. Change labels and headings only.
- Keep: the confirm step, the photo consent, the emergency notice, "Not yet reviewed by a pharmacist", the type-a-name route, and the genuine-check and WhatsApp features.
- After the stage: node scripts/review-packet.mjs, npm test, npm run build. Fix any failure, then commit.
```

Then run stages 2, 3 and 4 the same way, one at a time, checking the screenshots between each.

## Sources

- [Antibiotic use and AMR awareness among the Nigerian public (survey of 482 people)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7238560)
- [National survey of antibiotic use and self-medication among Nigerian graduates, Scientific African 2024](https://ui.adsabs.harvard.edu/abs/2024SciAf..2301978P/abstract)
- [Self-medication with antibiotics in a Nigerian rural population, 2016](https://uilspace.unilorin.edu.ng/items/ea5defe9-4523-4971-9fcd-34ec1077c930)
- [Nigeria's fight against superbugs, World Antimicrobial Awareness Week 2024 (allAfrica)](https://allafrica.com/stories/202411250006.html)
- [Design guidance for low-literacy health apps (review table)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9634204/table/t2)
- [Design guidelines of mobile apps for older adults, JMIR mHealth 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10557006/)
- REVAMP\_AUDIT.md (Claude Code audit of commit 74417ac, 25 November 2026)
