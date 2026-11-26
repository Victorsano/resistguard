# ResistGuard: new check flow spec

Status: agreed design with the first post-confirmation screens implemented. Written 26 November 2026 for the two developers implementing it.

File paths come from the repo snapshot of 25 November 2026. Check them against the current branch before editing. If this doc and the code disagree, the code is right, so update this doc.

## 0. Notes against the current code (checked 26 November 2026)

The checker uses the optional typed reason directly. It matches exact medicine names and known product aliases in the browser. When users choose Get guidance, Groq can pick a plausible catalogue correction and select relevant passages by ID. Uncertain corrections are optional. The Answer screen shows documented interactions from NAFDAC and WHO and flags unavailable coverage.

Added when this spec was committed. Where these notes and the sections below disagree, these notes win. Fix the sections below as you build.

| Spec says | Current code | What to do |
|---|---|---|
| `CURRENT_STATE.md` (sections 9, 11) | No such file. The project state lives in `PROJECT_MAP.md`. | Update `PROJECT_MAP.md` instead. |
| Section 9: remove the emergency notice from Home (`app/page.tsx`) and Answer | Already done in commit `f3a7f11`: the strip is gone from `CheckApp.tsx`, `copy.emergency` is gone from `lib/screen-copy.ts`, and `UseCheck.tsx` no longer shows it. The checker is at `/check`; `app/page.tsx` is the landing page. | Left: `emergency` is still exported from `lib/safety.ts`, returned by `assess()`, and asserted in `tests/safety.test.ts` ("emergency boundary"). Decide whether to keep or remove it. |
| New screens "wired into `MedicineCheck.tsx`" | Screens are values of `type Screen` in `lib/flow.ts`, rendered in `MedicineCheck.tsx`. All words live in `lib/screen-copy.ts`. | Add each step as a new `Screen` value and its words under a new `copy` key. See `CONTRIBUTING.md` and `docs/ARCHITECTURE.md`. |
| Two new AI routes (`/api/reason`, `/api/pick-questions`) | `CLAUDE.md` and `CONTRIBUTING.md` list "No new AI calls" as a hard limit. | This spec is the agreed exception. Update the hard limit in both files in the same pull request, and copy the guard pattern from `app/api/use-evidence/route.ts` (`sameOrigin`, `allow`, `authorizeAI`, fixed fallback). |
| Step 3: AI "maps brand names to ingredients (same label-reading path as step 1)" | The label reader only transcribes printed ingredients. Brand-name matching is deliberately NOT BUILT: a brand can block a match, never create one (`classifyObservation()` in `lib/scan.ts`). | Step 3 should reuse search (`findMedicines()` in `lib/flow.ts`, which already finds the 5 Greenbook brands) and the ingredient scan. Do not add brand-to-ingredient inference by AI. |
| Step 5 result types: no concern, concern, more information needed | The Answer screen now uses a green "check done" card for both outcomes (commits `c5b6fbf`, `42d264f`; see `DESIGN.md`). | Decide the colour for each result type before building (open question O5). A green "No concern found" risks reading as "safe to take". |
| Section 8: banned-word test vs "Is it safe with my other medicines" | `tests/flow.test.ts` checks only `lib/screen-copy.ts`. The WhatsApp text lives in `lib/next-steps.ts`, which the test does not scan. | When you extend the banned-word test to new files, allow the patient's own question in the WhatsApp message explicitly. |
| Step 6: extend the WhatsApp note | Message and link builders are `whatsAppMessage()` and `whatsAppLink()` in `lib/next-steps.ts`, tested in `tests/next-steps.test.ts`. | Extend those functions; keep the "no photo, no name, no product name" assertions. |

**Added open question**

- **O5:** Which colour and icon does each result type use (no concern, concern, more information needed), given that the answer card is green today and `DESIGN.md` reserves green for "your check is done"?

## 1. In one paragraph

ResistGuard checks a medicine before someone takes it. The new flow adds three things after the scan: why the person is taking it (and whether a doctor prescribed it), what other medicines they take, and a short set of questions about them. At the end, the app builds a note for the right professional: the prescribing doctor if it was prescribed, or a pharmacist or doctor if it wasn't. **AI helps at fixed points. It never writes medical text and never decides the result.** All medical text comes from WHO (World Health Organization) and Nigerian sources, stored in data files.

## 2. Decisions made

| # | Decision | Effect |
|---|---|---|
| D1 | No doctor or pharmacist review for now. Every question and note must come from a WHO or Nigerian source. | Each data entry carries its source. The "Not yet reviewed by a pharmacist" label stays on. |
| D2 | No emergency (danger sign) check step. | Not in the flow. |
| D3 | Remove the fixed red emergency notice from Home and Answer. | Breaks a current rule and a test. See section 9. |
| D4 | Doctors prescribe; pharmacists dispense and advise. The app never contradicts the doctor. | Routing and message wording in section 7. |
| D5 | AI picks; it doesn't write. | Guardrails in section 6. |

## 3. The flow

| Step | What the user does | How the app helps | What the user confirms | Status |
|---|---|---|---|---|
| 1. Scan and confirm | Takes or uploads a photo, or types a name | Reads the ingredients from the label | User taps "Yes, that's it". No result before this. | Built |
| 2. Why and prescribed? | Types an optional reason and answers "Was it prescribed for you?" | Uses the reason to select guidance | The typed reason goes straight to the recap | Built |
| 3. Other medicines | If applicable, types medicine names or marks that some names may be missing | Matches exact names and offers catalogue spelling corrections for consenting users | User can accept an uncertain match from the result | Built. Documented interaction coverage is limited. |
| 4. Questions about you | Answers Yes / No / "I'm not sure" | Picks and orders question IDs from `question-bank.json` | Code validates the IDs. Mandatory questions are always added. | To build |
| 5. Result | Reads the result | Nothing | Result decided by fixed rules in `result-rules.json` | To build |
| 6. Next step | Taps to send the note on WhatsApp | Nothing | User sees the full message before sending | WhatsApp button built; add answers |

**Result types** (step 5): no concern found, concern found, more information needed. There's no emergency result (D2).

**Routing** (step 6):

- Prescribed: "Tell the doctor who prescribed it before you take it."
- Not prescribed, leftover, or someone else's: "Speak to a pharmacist or doctor before you take it."

## 4. Data: what exists

| File | What it holds | Source | Notes |
|---|---|---|---|
| `data/medicines.json` | 16 medicine records: name, category, summary, caution, ingredients, antibiotic yes/no | Mostly NHS (UK) pages | Not WHO or Nigerian. Decide whether to re-source (open question O1). |
| `data/nigeria-catalogue.json` | 12 more records, formulations, 5 NAFDAC Greenbook products | Nigeria Essential Medicines List, adults (8th edition, 2024) and children (2nd edition, 2024), plus the NAFDAC Greenbook | `reviewStatus: pending_pharmacist` |
| `data/ingredient-aliases.json` | Alternative names mapped to one ingredient (for example "cephalexin" to "cefalexin") | Hand-built | Reuse in step 3 |
| `data/use-evidence.json` | Education passages with source, section and check date | WHO, NCDC (Nigeria Centre for Disease Control), CDC, NICE, NHS, DailyMed | Reuse for reason notes where the source is WHO or NCDC |
| `lib/safety.ts` | Merges both medicine files; holds fixed safety text | — | All medical wording must stay word for word from data files |
| `lib/use-check.ts` | `validateEvidenceOrder()`: lets a model reorder IDs and rejects anything else | — | **Reuse this pattern** for picking questions |

**The 28 medicines covered:** amoxicillin, co-amoxiclav, flucloxacillin, phenoxymethylpenicillin, ampicillin, cloxacillin, ampicillin + cloxacillin, cefalexin, cefixime, ceftriaxone, cefuroxime, cefpodoxime, cefazolin, azithromycin, clarithromycin, erythromycin, ciprofloxacin, doxycycline, metronidazole, nitrofurantoin, trimethoprim, co-trimoxazole, clindamycin, gentamicin, mupirocin, bacitracin + neomycin + polymyxin B, paracetamol and ibuprofen.

## 5. Data: what's new

Four new files. Each entry must carry a `source` object. An entry with no source must not ship.

### 5.1 Sources to use

| Source | Publisher | Use it for | Link |
|---|---|---|---|
| WHO AWaRe (Access, Watch, Reserve) antibiotic book, 2022 | WHO | Reason notes (step 2): when an antibiotic is or isn't needed for 30+ common infections | https://www.who.int/publications/i/item/9789240062382 |
| Nigeria Standard Treatment Guidelines, 3rd edition (launched 24 November 2022) | Federal Ministry of Health, Nigeria | Reason notes and Nigerian treatment context | Get the PDF from the Federal Ministry of Health |
| Nigeria Essential Medicines List (adults 8th edition, children 2nd edition, 2024) | Federal Ministry of Health, Nigeria | The medicine list (already used) | Links in `data/nigeria-catalogue.json` |
| NAFDAC-approved product leaflets | NAFDAC (National Agency for Food and Drug Administration and Control) and the product maker | Allergy, "do not take with", pregnancy and health-condition questions (steps 3 and 4) | Product record in the NAFDAC Greenbook, plus the leaflet inside the pack |
| WHO and NCDC fact sheets | WHO, NCDC | General antibiotic-use messages | Already in `data/use-evidence.json` |

**Important:** none of these sources publish ready-made patient questions. A person turns each piece of guidance into a plain question and records exactly where it came from (document, page or section, date checked). This wording step is where mistakes happen, so keep the wording close to the source.

### 5.2 `data/reasons.json`

The fixed list of reasons the AI can match to in step 2.

```json
{
  "id": "R1",
  "label": "Cold, flu or runny nose",
  "note": "<wording taken from the source>",
  "source": { "name": "WHO AWaRe antibiotic book", "url": "...", "section": "...", "checked": "2026-11-27" }
}
```

Planned reasons: cold or flu, sore throat, cough, fever, suspected typhoid, diarrhoea, pain when passing urine, wound or boil, tooth pain, other or not sure.

### 5.3 `data/question-bank.json`

Every question the app can ever ask.

```json
{
  "id": "P1",
  "text": "Are you allergic to penicillin or any penicillin-type antibiotic?",
  "answers": ["yes", "no", "not_sure"],
  "appliesTo": { "ingredients": ["amoxicillin", "ampicillin", "cloxacillin", "flucloxacillin", "phenoxymethylpenicillin"] },
  "mandatory": true,
  "source": { "name": "<leaflet or guideline>", "url": "...", "section": "...", "checked": "2026-11-27" },
  "reviewStatus": "pending_pharmacist"
}
```

- `appliesTo` can use `ingredients`, `reasons` or `"all"`.
- `mandatory: true` means the question is always asked when it applies, whatever the AI picks.
- Groups to cover: questions for everyone (child, pregnancy, past reactions, kidney and liver disease, other medicines, long-term conditions such as high blood pressure and diabetes), then one group per medicine family.

A first draft (not yet sourced) is in the Claude doc "ResistGuard question bank". Use it only as a checklist of topics. Replace every row with sourced wording.

### 5.4 `data/interactions.json`

What each medicine shouldn't be taken with. Used in step 3.

```json
{
  "medicine": "clarithromycin",
  "avoidWith": [
    { "ingredient": "<other ingredient>", "noteId": "N12", "source": { "name": "<leaflet>", "section": "...", "checked": "..." } }
  ]
}
```

Only from leaflets or guidelines, never from AI memory.

### 5.5 `data/result-rules.json`

Fixed rules that turn answers into a result. The AI never decides the result.

```json
{
  "concern": [
    { "if": { "question": "P1", "answer": "yes" }, "noteId": "N1" },
    { "if": { "interaction": true }, "noteId": "N12" }
  ],
  "more_info": [
    { "if": { "anyAnswer": "not_sure" }, "noteId": "N20" }
  ],
  "no_concern": "otherwise"
}
```

Order: any concern rule wins, then "more information needed", then "no concern found".

## 6. AI guardrails: AI helps, it doesn't act as a doctor

This section is what we show judges and any medical reviewer.

| # | Guardrail | How the code enforces it |
|---|---|---|
| G1 | **AI has exactly three jobs:** read the label, match the reason to a reason ID, pick question IDs. | Three API routes, one per job. No general "ask the AI" route. |
| G2 | **AI returns IDs only, never text shown to the patient.** | The model must return JSON such as `{"questionIds": ["G4", "P1"]}`. Parse it, check every ID exists in the allowed list, and reject anything else. Copy the `validateEvidenceOrder()` pattern in `lib/use-check.ts`. |
| G3 | **The user confirms every AI step.** | Steps 1, 2 and 3 each end with a confirm screen. Nothing moves forward without a tap. |
| G4 | **Mandatory questions can't be dropped.** | After the AI picks, the code adds every `mandatory` question that applies. The AI may add or reorder, never remove. |
| G5 | **Fixed rules decide the result.** | `result-rules.json` is evaluated in code. The AI's output never reaches this step. |
| G6 | **All medical text comes from data files, word for word.** | Same rule as today in `lib/safety.ts`. Every note and question has a `source`. |
| G7 | **Every question shows its source.** | A "Where this comes from" link under each question and on the result. |
| G8 | **It works without AI.** | If the AI is off, slow or returns bad JSON, step 2 falls back to picking from the reason list, and step 4 asks the mandatory questions in a fixed order. |
| G9 | **It never contradicts the doctor.** | Wording rules in section 7. A test fails on banned phrases. |
| G10 | **It sends the AI as little as possible.** | Step 4 sends codes only (for example `medicine: amoxicillin, reason: R1, answers: {G4: no}`), never names or free text. Step 2 sends only the typed reason. The consent text must say this. |
| G11 | **Label stays honest.** | "Not yet reviewed by a pharmacist" on every result until someone reviews it. |

**Model choice:** use Groq now, with JSON output and the checks above. Meditron (EPFL's open medical model) is a roadmap item. It must be self-hosted, and its makers advise more testing before medical use. Keep the API route model-agnostic so it can be swapped later.

**How to say it on stage:** "AI understands. Sources decide. The patient checks with their doctor or pharmacist."

## 7. Wording rules

1. Never say "safe", "approved" or "OK to take". An existing test checks this; extend it to the new screens.
2. Never say or imply the doctor was wrong. Never tell someone to stop a prescribed medicine on their own.
3. Only point out what the doctor may not have known: an allergy, pregnancy, another medicine, a health condition.
4. Prescribed: "Your doctor may not know this. Tell them before you take it."
5. Not prescribed: "Speak to a pharmacist or doctor before you take it."
6. "I'm not sure" counts as a reason to check, never as "no".

## 8. WhatsApp note (step 6)

Extend the existing message. It holds only ingredients, the result, the reason, the answers that raised a flag, and the questions to ask. It never holds a photo or a name.

```
Hello, I have a medicine that contains [ingredients]. ResistGuard says it is [an antibiotic / not an antibiotic].
I'm taking it for: [reason]. Prescribed by a doctor: [yes / no].
Things to check: [flagged answers, e.g. "I'm allergic to penicillin", "I also take [ingredient]"].
1. Do I need this medicine for my illness?
2. Is it safe with my other medicines, allergies or conditions?
3. How should I take it, and for how long?
```

Note: question 2 in the existing message uses the word "safe". It's a question the patient asks, not a claim by the app, but check that the banned-word test allows it.

## 9. Removing the emergency notice (D3)

Today the notice comes from `emergency` in `lib/safety.ts`. It's shown on Home (`app/page.tsx`) and in the use-check component, and `tests/safety.test.ts` asserts that it's present ("emergency boundary").

1. Remove the notice from Home and Answer.
2. Update or remove the test assertion, or the build fails.
3. Update the "Rules that must not break" list in `CURRENT_STATE.md`.
4. The "Emergency symptoms" outcome from the original user story is also gone.

## 10. Implementation plan

Proposed file names; adjust to the current structure.

| Area | Files |
|---|---|
| Data | `data/reasons.json`, `data/question-bank.json`, `data/interactions.json`, `data/result-rules.json` |
| Logic | `lib/questions.ts` (filter by medicine and reason, add mandatory questions, validate AI IDs), `lib/result-rules.ts` (evaluate rules), `lib/interactions.ts` |
| AI routes | `app/api/reason/route.ts` (typed reason to reason ID), `app/api/pick-questions/route.ts` (codes in, IDs out) |
| Screens | `ReasonStep.tsx`, `OtherMedicinesStep.tsx`, `QuestionsStep.tsx`, `ResultStep.tsx`; wire into `MedicineCheck.tsx`; extend `NextSteps.tsx` |
| Tests | Every question and note has a source; AI output with an unknown ID is rejected; mandatory questions survive any AI output; each result rule fires correctly; banned words on all new screens; the WhatsApp note holds no photo or name |
| Review packet | Add every new file to the `files` list in `scripts/review-packet.mjs`, then run `node scripts/review-packet.mjs`, `npm test`, `npm run typecheck` and `npm run build` |

## 11. What's left

- [ ] Get the source documents: WHO AWaRe book, Nigeria STG 3rd edition, leaflets for all 28 medicines
- [ ] Write `reasons.json` from WHO and STG, with sources
- [ ] Write `question-bank.json` from leaflets and STG, with sources
- [ ] Expand NAFDAC and WHO interaction coverage beyond the initial documented pairs
- [ ] Write `result-rules.json`
- [x] Build the step 2 screen with a typed reason and a Yes/No prescription choice
- [x] Use the reason as typed to select guidance
- [x] Build the step 3 screen with a Yes/No question and a typed list
- [x] Suggest catalogue matches and let the user confirm or keep typed names
- [ ] Build the step 4 screen and pick-questions route with guardrails G2, G4 and G8
- [ ] Build the step 5 result screen
- [ ] Extend the WhatsApp note
- [x] Remove the emergency notice from the checker
- [x] Explain that Get guidance from Groq sends the typed reason and medicine names
- [ ] Tests and review packet
- [ ] Update `PROJECT_MAP.md` when the remaining steps are implemented

## 12. Open questions

- **O1:** `data/medicines.json` uses NHS (UK) pages. Re-source from Nigerian or WHO documents to match D1, or keep them?
- **O2:** Who writes the sourced question wording, and who double-checks it against the source?
- **O3:** Step 2 sends the typed reason to Groq. Is that acceptable, or should step 2 be tap-only (no AI) to keep health text off third-party servers?
- **O4:** The pitch on 27 November: which parts are demoed as built and which as roadmap?
