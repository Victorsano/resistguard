# ResistGuard: project map

**What this is for.** It explains ResistGuard to a teammate (or an AI assistant) who has not seen the code: who it is for, what each part does, what is real, what is hidden and what does not exist. Read it before you change the scan flow, the catalogue or any medical text.

**How facts are marked.**
- Plain statements were checked against the code on 26 November 2026 (commit `d3c7189`, "Redesign v3").
- **HIDDEN** means the code exists and builds, but nothing in the app opens it.
- **NOT BUILT** means the feature does not exist. Never describe it as working.
- **UNDECIDED** means nobody has decided yet. Ask the project owner; do not fill the gap with a guess.

---

## 1. ResistGuard in one paragraph

ResistGuard is a free web app for anyone in Nigeria holding a medicine they are unsure about. You photograph the ingredient list on the pack (or type a name, brand or NAFDAC number). An AI model copies the ingredient names. Plain code matches them against 28 generic medicine records. **You** then confirm that the list matches your pack. Only then does the app say whether the medicine is an antibiotic, show fixed source-linked guidance for your situation, and offer two next steps: a prewritten WhatsApp message to a pharmacist, and NAFDAC's own checks for a genuine pack. It never diagnoses, prescribes, gives doses or says a medicine is safe for you. The long-term aim is less antibiotic misuse and slower antimicrobial resistance (AMR). That aim is not yet measured.

**Status:** a working demo, deployed on Vercel (`https://resistguard-rosy.vercel.app`). No pharmacist has reviewed the content. No real users have been tested. Built for a competition pitch on 27 November 2026.

---

## 2. Who it is for

### 2.1 The people the design serves

| Person | Their situation | What the design must do |
|---|---|---|
| Mrs Bisi, 62, retired teacher | Weak eyesight, buys medicine for her grandchildren | Big text, big buttons, one thing per screen |
| Ngozi, 38, market trader | Reads English slowly, little time | Short words, an icon with every key label, no long paragraphs |
| Tunde, 20, student | In a hurry, has leftovers from last term | Answer in seconds, easy to share with a pharmacist |
| A judge | Holding your phone for the first time | Understands the product in 10 seconds, finishes in 3 taps |

### 2.2 The moments it is built for

1. **At the chemist counter.** About to buy something for a cough.
2. **At home with leftovers.** Half a strip from the last illness, and now a cold.
3. **When someone hands you theirs.** "Take this, it worked for me."
4. **With your own prescription.** You want to know what you were given and what to ask.

### 2.3 What it deliberately does not serve

Diagnosing symptoms, choosing a treatment, doses, proving a pack is genuine, children using it alone, or emergencies. Every screen points to a pharmacist, a doctor or NAFDAC for those.

### 2.4 Secondary users

| User | What they do | Status |
|---|---|---|
| Pharmacist reviewer | Downloads the review packet (all medical text and sources) from "For pharmacists and testers" and signs off privately | Has not happened |
| Pilot facilitator | Records supervised test sessions in a browser-only form on the same page | No sessions yet |
| Operator / developer | Deploys, sets keys and limits, can switch AI off | See `docs/OPERATIONS.md` |

### 2.5 Research behind the design

| Finding | Design decision |
|---|---|
| In a Nigerian survey, 31.3% of people who took antibiotics in the past six months had no prescription; only 8.3% had good AMR knowledge. [Survey](https://pmc.ncbi.nlm.nih.gov/articles/PMC7238560) | Answer about the pack in hand, not a lecture. |
| 76.6% in the same survey felt powerless to stop resistance. | Give one small action: "check before you take it". |
| Education did not change self-medication among graduates; cost and access did. [Scientific African, 2024](https://ui.adsabs.harvard.edu/abs/2024SciAf..2301978P/abstract) | Make the next step easy: WhatsApp a pharmacist, check the pack. |
| Chemist shops were the main source of self-medicated antibiotics; ampicillin + cloxacillin was the most used. [Rural study, 2016](https://uilspace.unilorin.edu.ng/items/ea5defe9-4523-4971-9fcd-34ec1077c930) | Design for the counter moment. Use Nigerian examples. |
| Low-literacy health apps work best with one question per screen and large buttons. [Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9634204/table/t2) | One decision per screen. No tabs. |

---

## 3. Key terms

| Term | Meaning in this project |
|---|---|
| **Active ingredient** | The drug substance (for example "amoxicillin"), not fillers or brand names. |
| **Ingredient panel** | The part of a pack that lists active ingredients: "Composition", "Each capsule contains", "Drug Facts". |
| **Record** | One of 28 generic medicine entries: 16 in `data/medicines.json`, 12 in `data/nigeria-catalogue.json`, merged in `lib/safety.ts`. |
| **Combination** | A record with more than one ingredient, for example co-amoxiclav = amoxicillin + clavulanic acid. |
| **Candidate** | A record the scan *suggests*. Not a result until the user confirms it. |
| **Confirm** | The user's own check that every ingredient on the pack matches. Nothing medical shows before it. |
| **Product reference** | One of 5 branded products linked to a NAFDAC Greenbook entry. Used for search and to *block* a wrong scan. It never selects a medicine. |
| **Answer card** | One situation on the Answer screen ("These are left over from before"). Each opens fixed text from `lib/safety.ts`. |
| **`pending_pharmacist`** | Review status of every record and passage: sources checked, no pharmacist approval. |
| **Review packet** | `public/review-packet.json`: every reviewed file plus a SHA-256 fingerprint. The build fails if it is stale. |
| **Groq** | The third-party AI host. All AI calls go there. |
| **Paused** | Photo reading is off (no key, `DISABLE_AI=1`, a limit, or a gate). Name search still works. |

---

## 4. Surfaces and screens

### 4.1 Landing page: `/` (night)

`app/page.tsx`, styles in `app/landing.css`, every word in `lib/landing-copy.ts`. Hero ("Don't swallow a *guess*."), one sourced statistic, four "How it works" points, a closing call to action and the honesty line "Not yet reviewed by a pharmacist." Buttons go to `/check` and `/check?example=1`. The hero media slot (`HeroMedia.tsx`, rules in `lib/hero-media.ts`) shows night plus a glow until a video is added (see `DESIGN.md`).

### 4.2 The checker: `/check` (paper under a night top bar)

`app/check/page.tsx` renders `CheckApp.tsx` per request, so the first paint already knows if photo reading is paused. `CheckApp` holds the top bar and a footer with three links. The fixed emergency strip was removed on 26 November 2026 (decision D3 in `docs/specs/check-flow.md`). `MedicineCheck.tsx` runs the flow. Screen names come from `type Screen` in `lib/flow.ts`. All words come from `lib/screen-copy.ts`.

| Screen | What the user does | Key code |
|---|---|---|
| **Home** | "What are you about to *take*?" Scan your medicine (in-page camera), upload a photo, or start typing a name. "See an example" loads the fictional amoxicillin label. If paused, the scan buttons are replaced by a note. | `MedicineCheck.tsx`, `CameraCapture.tsx` |
| **Find by name** | Type a name, brand or NAFDAC number. Results show an Antibiotic / Not an antibiotic chip. Nothing typed leaves the phone. "See all 28 medicines" opens the catalogue. | `FindByName.tsx`, `findMedicines()` in `lib/flow.ts` |
| **Catalogue** | All 28 records with filters (all, antibiotics, other, Nigerian sources, adult list, children's list), formulation examples and Greenbook references. | `Catalogue.tsx` |
| **Check your photo** | See the prepared photo, retake or choose another, read three photo tips, tick the consent box, tap "Read the label". Timeouts, failures and paused states stay on this screen with "Try again" and "Type the name instead". | `MedicineCheck.tsx`, `lib/image.ts` |
| **Is this what your pack says?** | Compare the ingredient chips with the pack: "Yes, that's it" or "No, or I'm not sure". The same screen shows the other outcomes: unreadable (with a tailored tip), brand only, not in our list (with a WhatsApp button), not a medicine. | `MedicineCheck.tsx`, `lib/scan-guide.ts`, `scanOutcome()` in `lib/flow.ts` |
| **Check questions** | Type an optional reason. Choose whether it was prescribed and whether you take other medicines. If yes to other medicines, add the names from the packs or say you're unsure of the names. | `CheckQuestions.tsx`, `MedicineCheck.tsx` |
| **Answer** | Verdict in a green "check done" card with a check icon, the same colour for both outcomes (the words carry the meaning), name and category, "Not yet reviewed by a pharmacist", summary, caution, the boundary line, your answers, guidance selected for the entered reason and medicines, "Next steps" (WhatsApp a pharmacist, check the pack is genuine), "Check another medicine", and sources. | `Answer.tsx`, `NextSteps.tsx`, `lib/check-guidance.ts`, `/api/check-guidance`, `lib/next-steps.ts` |

Choosing "Yes, that's it" opens the check questions, followed by Answer. The flow has no URL per screen. Answers reset on reload or when starting a new check. Choosing Get guidance sends the reason and medicine details to Groq. The source-based path keeps the answers in the browser.

### 4.3 Footer pages (inside `/check`)

| Link | What it shows | Code |
|---|---|---|
| How it works | Three fixed answers: photographing a label, what a NAFDAC number tells you, why responsible antibiotic use matters | `HowItWorks.tsx`, `lib/how-it-works.ts` |
| For pharmacists and testers | Download the review packet and pilot protocol; a browser-only pilot observation form | `Pilot.tsx`, `lib/pilot.ts`, `public/pilot-protocol.md` |
| Sources | Every public source the app links to, without duplicates | `Sources.tsx`, `allSources()` in `lib/flow.ts` |

### 4.4 HIDDEN code (builds, but nothing opens it)

| Code | What it was | Why it matters |
|---|---|---|
| `UseCheck.tsx`, `lib/use-check.ts`, `data/use-evidence.json`, `/api/use-evidence` | "Antibiotic use" tab: 10 fictional cases, WHO/NCDC/NHS passages, an AMR lesson, optional AI ordering | Reachable only by editing `View` in `CheckApp.tsx`. `lib/use-check.ts` still feeds "How it works". |
| `Learning.tsx` | "Learn & try": misuse cards, a quiz, the 10 test labels | Kept in `CheckApp.tsx` as view `'learn'` |
| Dashboard in `CheckApp.tsx`, `data/dashboard.json` | Synthetic demo numbers | View `'dashboard'`; fake by design |
| `AskResistGuard.tsx`, `/api/explain`, `lib/education.ts` | Floating assistant; AI picks fixed paragraphs | Not imported anywhere. `/api/explain` still answers if called. |
| `FirstVisitTour.tsx`, `FirstCheckGuide.tsx`, `ScanGuide.tsx` | Old first-visit tour, practice tutorial and photo guide | Not imported anywhere. The tour's old "dismissed" flag lived in `localStorage`, which the current rules forbid. |

Before you revive any of these, read the "Hard limits" in `CLAUDE.md`: they predate the current design and do not follow `DESIGN.md`.

---

## 5. The label scan, step by step

### 5.1 The photo
- One pack, showing the **whole** active-ingredient section. The brand name is optional; a brand-only front is not enough.
- No names, prescriptions or addresses in frame (one of the three photo tips).
- Accepted: JPEG, PNG or WebP. HEIC is rejected with a message to export as JPEG.

### 5.2 On the phone, before anything is sent (`lib/image.ts`)
- Shrunk to at most 1600 px on the longest side and re-saved as JPEG. This strips location and other EXIF data.
- The user sees the photo and can retake or replace it.
- "Read the label" stays disabled until the consent box is ticked **and** `/api/readiness` reports AI as available.

### 5.3 Who reads it
Not a person. The browser posts the photo to `/api/scan`. The server checks origin, rate limits, file type and size, then the AI gates (`authorizeAI` in `lib/availability.ts`), and forwards it to **Qwen `qwen3.8-27b` on Groq** (override with `GROQ_VISION_MODEL`). The prompt (`scanPrompt` in `lib/scan.ts`) says: only transcribe printed active ingredients, never guess from a brand, ignore instructions printed in the image. ResistGuard stores nothing. Timeouts: 18 s for Groq, 25 s in the browser. No automatic retry.

### 5.4 What the AI returns
Exactly five fields, validated strictly by `parseObservation()`. Anything else fails the scan.

| Field | Meaning |
|---|---|
| `productType` | `medicine`, `non_medicine` or `uncertain` |
| `label` | Product name if visible, else empty |
| `ingredients` | Up to 6 lower-case generic names, no strengths |
| `legibility` | `clear`, `partial` or `unreadable` |
| `complete` | Whether the whole ingredient list was visible |

### 5.5 How the outcome is decided (plain code, no AI)

`classifyObservation()` in `lib/scan.ts` produces a status; `scanOutcome()` in `lib/flow.ts` maps it to a screen state.

| Outcome (`ScanOutcome`) | When | Where it shows |
|---|---|---|
| `match` | Exactly one record has exactly this ingredient set | Confirm screen with chips |
| `not_listed` | Read clearly, but no record has this exact set | "We don't have this medicine yet" + WhatsApp |
| `not_medicine` | Cosmetic, food or other | Confirm screen |
| `brand_only` | Clear photo, no ingredients | Confirm screen |
| `unreadable` | Partial, incomplete, uncertain, or conflicts with a product reference | Confirm screen with a tip from `lib/scan-guide.ts` |
| `timeout`, `failed` | Too slow, or provider error | Stays on the photo screen |
| `paused` | AI off, out of budget or gated | Stays on the photo screen; offers name search |

**Matching rules** (`lib/safety.ts`):
- Exact names only. No fuzzy matching, no brand lookup.
- `data/ingredient-aliases.json` maps spellings and salts to base names (acetaminophen → paracetamol, clavulanate → clavulanic acid, cloxacillin sodium → cloxacillin, and so on).
- A combination must match the **complete set**. Amoxicillin + metronidazole never matches plain amoxicillin.
- A product reference can **block** a candidate (the Emzoclox blister-pack misreading), never create one.

---

## 6. Where AI is used

All through Groq (`lib/groq.ts`), all optional. **AI never writes medical text the user sees.** The only AI text shown is the ingredient transcription.

| Feature | Model (default) | AI may | Guardrail | Status |
|---|---|---|---|---|
| Read the label | `qwen/qwen3.8-27b` | Transcribe 5 fields | Strict validation; code matches; user confirms | Live |
| Explain simply | `openai/gpt-oss-120b` | Pick 2–4 fixed paragraph IDs and 2–3 question IDs | Unknown or repeated IDs rejected; fixed text on failure | HIDDEN |
| Order evidence | `openai/gpt-oss-120b` | Reorder fixed passage IDs | Must keep every ID, add none | HIDDEN |

When AI is unavailable, the app says so and name search, the catalogue and all fixed text still work.

---

## 7. Content inventory

### 7.1 The 28 records (all `pending_pharmacist`)
- **`data/medicines.json` (16):** amoxicillin, azithromycin, metronidazole, doxycycline, ciprofloxacin, flucloxacillin, cefalexin, nitrofurantoin, clarithromycin, trimethoprim, phenoxymethylpenicillin, erythromycin, co-amoxiclav, co-trimoxazole (antibiotics); paracetamol, ibuprofen (not antibiotics). Sources: NHS UK pages and one UK manufacturer leaflet.
- **`data/nigeria-catalogue.json` (12, all antibiotics):** cefixime, ceftriaxone, cefuroxime, cefpodoxime, cefazolin, ampicillin, cloxacillin, clindamycin, gentamicin, mupirocin, ampicillin + cloxacillin, triple-antibiotic ointment (bacitracin + neomycin + polymyxin B). Sources: Nigeria Essential Medicines Lists 2024. Also holds 15 formulation examples, 5 Greenbook product references (Emzifix, Emzoclox, Emcillin, Emmox-250, Zinnat) and the source register.
- **Totals:** 26 antibiotics, 2 not antibiotics. Anything else is "not in our list", which includes most real antibiotics.

### 7.2 Guidance text
- **Answer cards:** the scenario rules in `lib/safety.ts` (cold, leftovers, sharing, prescribed, missed dose, side effects, general). Antibiotics get five cards; other medicines get three (`answerCards()`).
- **Next steps:** WhatsApp message and genuine-pack steps in `lib/next-steps.ts`.
- **Education passages:** 17 in `data/use-evidence.json` (CDC, WHO, NICE, NHS, DailyMed, NCDC). Only the AMR passage is visible today (How it works).

### 7.3 Test labels
10 fictional images in `public/test-labels/`, stamped "SIMULATED PACKAGING – SOFTWARE TEST ONLY", with expected outcomes in `data/scan-fixtures.json`. One hides a prompt-injection line. Scripts in `scripts/` run them against a live server (see `docs/OPERATIONS.md`).

---

## 8. Privacy and data handling

- No accounts, no database, no analytics, no cookies, no `localStorage`.
- Photos are shrunk and stripped on the device, sent only after consent, forwarded to Groq and **never stored** by ResistGuard.
- Name search runs in the browser. Nothing typed is sent anywhere.
- The WhatsApp link holds only the confirmed record's ingredient names and antibiotic status: no photo, no name, no product name.
- Server logs hold only fixed codes (`operationalEvent()` in `lib/availability.ts`).
- Rate limiting hashes client IPs. Redis, if configured, stores daily HMAC keys, never raw IPs.
- Pilot observations live only in browser memory and need separate consent to export.
- `Permissions-Policy`: camera for this site only; microphone and location blocked (`next.config.ts`).

---

## 9. NOT BUILT

Do not describe any of these as working:

- Barcode or QR scanning.
- Brand-name matching in the scan (deliberately excluded).
- Authenticity, counterfeit, expiry or live registration checks. The app points to NAFDAC's own checks and says it cannot tell if a medicine is genuine.
- A typed-question assistant or chatbot.
- A question bank about the user and concern / no-concern results. These are planned in `docs/specs/check-flow.md`.
- Strength or dose reading, dose calculation, treatment plans.
- Symptom checker or diagnosis.
- Comprehensive interaction coverage. The checker flags a small set of documented combinations from NAFDAC and WHO.
- Accounts, history, saved scans.
- Languages other than English.
- Native app or offline mode.
- Pharmacist network, referral or pharmacy finder. The WhatsApp button opens a contact the user picks, or the demo number in `NEXT_PUBLIC_PHARMACIST_WHATSAPP`.
- Complete Nigerian coverage (12 records, 5 Greenbook products).
- Automatic retry after a timeout.
- Shared production rate limiting (Redis code exists; production has none connected).
- Alerts to a person. Logs exist; nobody is notified.
- Real usage data. The hidden dashboard is synthetic.

---

## 10. What is verified

See `VERIFICATION.md` for the record. In short:

- **Verified:** 53 automated tests pass (26 November 2026). They cover matching, combinations, AI response validation, the five-screen outcomes, screen copy, next-steps links, limits, the review fingerprint and hero media rules. All 10 fictional labels gave their expected outcomes through the live AI. Three published manufacturer label images matched.
- **Not verified:** real phone photos of real packs; reflective blister foil beyond the 5 Greenbook products; any pharmacist review; any accuracy rate; whether users understand that "recognised" does not mean "safe for me"; behaviour under load.

---

## 11. Decisions still UNDECIDED

| # | Decision | Why it matters |
|---|---|---|
| 1 | Source policy: the original 16 records cite UK sources and UK names (paracetamol, co-amoxiclav) while the product targets Nigeria | Decides names, sources and which records to add |
| 2 | Languages beyond English | Decides copy and layout |
| 3 | Who reviews the content: a named, registered Nigerian pharmacist | Nothing can be called approved until then |
| 4 | Pilot success metric (for example "user does not confirm a wrong match") | Without it the pilot shows nothing |
| 5 | Whether to delete or revive the HIDDEN code in section 4.4 | It adds review-packet surface and maintenance |
| 6 | Competition demo, research pilot or public product | Decides spend on limits, monitoring and polish |

---

## Appendix: where things live

| Area | Files |
|---|---|
| Landing page | `app/page.tsx`, `app/landing.css`, `lib/landing-copy.ts`, `HeroMedia.tsx`, `lib/hero-media.ts` |
| Checker shell | `app/check/page.tsx`, `CheckApp.tsx`, `check-app.css` |
| Check flow | `MedicineCheck.tsx`, `medicine-check.css`, `lib/flow.ts`, `lib/screen-copy.ts` |
| Camera and photo | `CameraCapture.tsx`, `lib/image.ts` |
| Name search and catalogue | `FindByName.tsx`, `Catalogue.tsx`, `catalogue-references.css` |
| Answer and next steps | `Answer.tsx`, `NextSteps.tsx`, `lib/next-steps.ts` |
| AI prompt, validation, outcomes | `lib/scan.ts`, `lib/scan-guide.ts`, `app/api/scan/route.ts` |
| Matching, scenarios, emergency text | `lib/safety.ts`, `data/medicines.json`, `data/nigeria-catalogue.json`, `data/ingredient-aliases.json` |
| Groq client | `lib/groq.ts` |
| Limits, kill switch, readiness | `lib/guard.ts`, `lib/availability.ts`, `app/api/readiness/route.ts` |
| Footer pages | `HowItWorks.tsx`, `Pilot.tsx`, `Sources.tsx` |
| Review packet | `scripts/review-packet.mjs`, `scripts/validate-review.mjs`, `public/review-packet.json`, `data/content-manifest.json`, `next.config.ts` |
| Design system | `app/tokens.css`, `app/globals.css`, `Wordmark.tsx`, `Emphasis.tsx`, `DESIGN.md`, `ART_DIRECTION.md` |
| Tests | `tests/*.test.ts` |
