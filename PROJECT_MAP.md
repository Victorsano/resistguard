# ResistGuard — Project Context

**What this document is for.** It explains ResistGuard to someone (or an AI assistant) who has not seen the code. It says who the app is for, what each part does, what is real, what is fake, and what does not exist. Read it before you suggest changes or answer questions about the project.

**How facts are marked.**
- Plain statements were checked against the code on 25 November 2026 (commit `49de89d`, branch `codex/resistguard`). The only uncommitted code-side change is a re-ordering of `package.json` and `package-lock.json`, which changes no behaviour.
- Since the previous version of this map (commit `601d399`), five commits added: a Nigerian catalogue expansion (28 records), a first-visit tour, a floating "Ask ResistGuard" assistant, five new education cases, and a safeguard against conflicting blister-label readings.
- **UNDECIDED** means the code and docs give no answer. The project owner must decide. Do not fill these gaps with assumptions.
- **NOT BUILT** means the feature does not exist. Do not describe it as if it works.

---

## 1. ResistGuard in one paragraph

ResistGuard is a free educational web app, opened in a phone or computer browser, that helps an ordinary adult work out **what active ingredients are in a medicine package they are holding**, and whether that ingredient is **an antibiotic**. The person photographs the ingredient panel on the box. An AI model transcribes the ingredient names. The app compares those names against a small list of 28 generic medicine records. The person must then confirm, by looking at the box, that every ingredient matches. Only after that does the app show fixed, source-linked information: what the medicine is, why antibiotics do not treat colds or flu, why leftovers and sharing are risky, and questions to ask a pharmacist. A floating **Ask ResistGuard** button, on every page, opens a small assistant that serves the same fixed, sourced text. The app never diagnoses, prescribes, gives doses or says a medicine is safe for the person. Its long-term aim is to reduce antibiotic misuse and so slow antimicrobial resistance (AMR). That aim is not yet measured or proven.

Status: a working demo, deployed publicly on Vercel. No pharmacist has reviewed the content, and no real users have been tested.

---

## 2. Who it is for

### 2.1 Primary user — the person checking a medicine

What the code and copy imply:

| Question | Answer from the app as built |
|---|---|
| Who? | An **adult member of the public**, not a health professional. The pilot protocol limits testing to "consenting adults". |
| What do they have? | A **physical medicine package** in their hand: a box, bottle, blister-pack carton or leaflet. It may come from their own prescription, a chemist, leftovers from an earlier illness, or another person. |
| What do they want to know? | "What is actually in this?" and "Is this an antibiotic, and should I take it?" |
| What device? | A smartphone (camera) or a computer (photo upload), with a modern browser. No app install, no account. |
| What language? | English only. All interface text is English. |
| What reading level? | Short sentences and plain words, but no formal reading-level target exists. |
| When do they use it? | Before taking or sharing a medicine, or while preparing to speak to a pharmacist. |

What the app deliberately does **not** serve: diagnosing symptoms, choosing a treatment, calculating doses, checking whether a product is genuine or registered, children using it alone, or emergencies. Every screen sends the person to a pharmacist or prescriber for those.

### 2.2 Secondary users

| User | What they do in the app |
|---|---|
| **Pharmacist reviewer** | Downloads the review packet (all medical text plus sources), checks it, and signs off privately. **Has not happened yet.** |
| **Pilot facilitator** | Runs supervised test sessions with volunteers and records results in a browser-only form. **No sessions yet.** |
| **Operator / developer** | Deploys the app, sets API keys and usage limits, and can switch AI off. |
| **Demo audience (judges, funders)** | Watches the flow. The "Example insights" tab exists for them and uses fake numbers. |

### 2.3 Target audience — open questions

These are **UNDECIDED**. The project shows conflicting signals:

- **Country / market.** The project now leans toward Nigeria but never says so. The 12 newest records and the formulation examples come from the **Nigeria Essential Medicines Lists (adults and children, 2024)**. Five products link to **NAFDAC Greenbook** entries, and one passage cites **NCDC**. The original 16 records still link to **UK** sources (NHS, medicines.org.uk) and use **UK** drug names (paracetamol, co-amoxiclav). Other education passages come from the CDC (US), WHO, NICE (UK) and DailyMed (US). The assistant answers a question about NAFDAC numbers. No country is stated as the target, and the content mixes UK, US and Nigerian sources.
- **Setting.** Is the person at home, at a pharmacy counter, or at a patent-medicine store? Not stated.
- **Languages and literacy.** Is English enough? Are local languages needed? Not stated.
- **Age range and health literacy.** Only "adult" is stated.
- **Who distributes it?** A pharmacy, an NGO, a school or a health campaign? Not stated.

These answers change the catalogue, the drug names, the sources, the language and the design. Settle them before you add content.

---

## 3. The problem it addresses

- Many people cannot tell from a box what the active ingredient is. Brand names hide the generic name.
- People take antibiotics for viral illnesses (colds, flu), reuse leftovers, or share someone else's prescription.
- Each unnecessary use helps resistant bacteria survive and spread (antimicrobial resistance). The bacteria become resistant, not the person.

ResistGuard's answer: help the person **read the label correctly**, learn **whether it is an antibiotic**, and **arrive at the pharmacist with better questions**.

---

## 4. Key terms

| Term | Meaning in this project |
|---|---|
| **Active ingredient** | The drug substance that has the effect (for example "amoxicillin"). Not fillers, flavours or brand names. |
| **Ingredient panel** | The part of a package that lists active ingredients. It can be headed "Active ingredient(s)", "Composition", "Each tablet contains", or "Drug Facts" on US packs. |
| **Catalogue / record** | One of the 28 generic medicine entries: 16 in `data/medicines.json` and 12 in `data/nigeria-catalogue.json`. Each has a name, its ingredient list, an antibiotic yes/no flag, a summary, a caution and a source link. |
| **Formulation example** | A strength and form (for example a tablet or suspension) listed for a record in a Nigerian essential medicines list, with a page or section reference. Shown in the Catalogue only. |
| **Product reference** | One of 5 branded products linked to a NAFDAC Greenbook entry (name, registration number, recorded status and date). Used for catalogue search and as a safety check. It never selects a medicine from a scan. |
| **Ask ResistGuard** | The floating assistant dialog. It offers a few preset questions and serves pre-written, sourced answers. It is not a free-text chatbot. |
| **First-visit tour** | A 4-step guide shown once to new visitors. It is dismissed with a flag in the browser's local storage. |
| **Combination** | A record with more than one active ingredient, for example co-amoxiclav = amoxicillin + clavulanic acid. |
| **Candidate** | A record the app *suggests* after a scan. It is not a confirmed result. |
| **Confirm** | The user's own check that every ingredient on the box matches the candidate. Nothing medical is shown until the user confirms. |
| **Scenario** | The situation the user picks after confirming ("A cold or flu", "Using leftovers" and so on). Each one shows fixed guidance text. |
| **Source passage** | A short, pre-written educational paragraph tied to a named public source (WHO, CDC, NHS, NICE, DailyMed). |
| **`pending_pharmacist`** | The review status on every record and passage. It means the sources were checked, but no pharmacist has approved the text. |
| **Groq** | A third-party company that hosts AI models. ResistGuard sends AI requests to Groq. |
| **Fallback** | What the user sees when AI is off or fails: the manual catalogue and the fixed source text. The app always works without AI. |

---

## 5. The label scan, step by step

This section answers "what photo, who reads it, and what happens next".

### 5.1 What photo

- **One photo of one medicine package**, showing the **whole active-ingredient section**, from its heading to the last ingredient.
- The brand name is **optional**. The front of a box showing only a brand is **not enough**: the app returns "unreadable" and asks for the ingredient panel.
- The photo must **not** include names, prescriptions, addresses or other personal details. The user ticks a box to confirm this.
- Several packages in one photo, a cropped list, glare or blur all lead to "unreadable" with a specific tip to fix it.
- Accepted files: JPEG, PNG or WebP, up to 12 MB. HEIC (default iPhone format) is rejected with a message to export as JPEG.

### 5.2 Who takes it

The user, in one of three ways:
1. **Upload photo**: pick an existing image.
2. **Open camera**: a live camera preview inside the page (needs HTTPS; back camera by default; can switch camera).
3. **Phone camera / photo picker**: hands off to the phone's own camera app.

Sample route: on the "Learn & try" tab, 10 fictional test labels can be loaded straight into the check. The first-visit tour also offers a "Try with a sample label" button that loads the amoxicillin sample.

### 5.3 What happens on the phone before anything is sent

- The image is **shrunk to at most 1600 px** on its longest side and **re-saved as JPEG on the device**. This strips location and other EXIF metadata.
- The user sees the photo and can **replace** or **retake** it.
- The user must tick **three photo checks**: whole panel visible; text readable without glare or blur; no names or personal details.
- The user must tick a **separate consent box**: "I agree to send this prepared photo to Groq for label analysis." It links to Groq's data policy.
- The **Read label** button stays disabled until all four boxes are ticked **and** the server reports AI as available.

### 5.4 Who reads it

**Not a person, and not ResistGuard's own code.** The photo goes from the browser to ResistGuard's server (`/api/scan`). The server checks it and forwards it to an **AI vision model, Qwen `qwen3.8-27b`, hosted by Groq**.

- The model's instructions (`scanPrompt` in `lib/scan.ts`) tell it to **only transcribe** the active ingredients printed on the label. It must not guess from brand names, invent ingredients, diagnose or recommend anything, and it must ignore any instructions printed in the image. One test label contains a hidden "ignore prior instructions" line to check this.
- ResistGuard **does not store the photo**. Groq's own data policy applies to what Groq receives.
- Timeouts: 18 seconds for the Groq call, 25 seconds for the whole request in the browser. There is **no automatic retry**.

### 5.5 What the AI sends back

Exactly five fields, which the server validates strictly. Any deviation counts as a failed scan:

| Field | Meaning |
|---|---|
| `productType` | `medicine`, `non_medicine` or `uncertain` |
| `label` | The product name if visible, otherwise empty |
| `ingredients` | Up to 6 lower-case generic names, without strengths |
| `legibility` | `clear`, `partial` or `unreadable` |
| `complete` | Whether the entire active-ingredient list was visible |

### 5.6 How ResistGuard decides the outcome (plain code, no AI)

| Outcome shown to user | When |
|---|---|
| **Unreadable / need a clearer label** | Not clear, not complete, uncertain, or no ingredients. A tailored tip explains the fix (glare, cropping, brand only and so on). |
| **Reading conflicts with a product reference** (also "unreadable") | The product name matches one of the 5 Greenbook products, but the AI's ingredients disagree with that product's record, or the list is marked complete with the wrong number of ingredients. The reading is discarded and no medicine is selected. Added for a real reflective blister pack (Emzoclox) that was misread as amoxicillin + clavulanic acid. |
| **Non-medicine** | AI says cosmetic, food or another non-medicine, with no ingredients. |
| **Outside our catalogue** (single ingredient) | Read correctly, but no record has exactly that ingredient. The app warns: "No match does not mean it is not an antibiotic." Cefixime, which used to be the example, is now **in** the catalogue. |
| **Combination outside catalogue** | Several ingredients, with no record that has exactly that set. |
| **Candidate: catalogue antibiotic** | Exactly one record matches. |
| **Candidate: non-antibiotic** | The match is paracetamol or ibuprofen. |
| **Candidate: combination record** | The full set matches co-amoxiclav, co-trimoxazole, ampicillin + cloxacillin, or the triple-antibiotic ointment set (bacitracin + neomycin + polymyxin B). |
| **Unavailable** | AI is off, a limit was hit, it timed out, or the response was invalid. The user is sent to the catalogue. |

**Matching rules** (`lib/safety.ts`):
- Exact names only. There is no fuzzy matching and no brand lookup.
- An alias list (`data/ingredient-aliases.json`) maps spellings and salt or hydrate forms to the base name: acetaminophen → paracetamol, cephalexin → cefalexin, clavulanate → clavulanic acid, sulphamethoxazole → sulfamethoxazole, and (new) forms such as ampicillin trihydrate, cloxacillin sodium, cefixime trihydrate, ceftriaxone sodium, cefuroxime axetil, clindamycin hydrochloride, gentamicin sulfate, mupirocin calcium, bacitracin zinc, neomycin sulfate and polymyxin B sulfate.
- A combination must match the **complete set**. Amoxicillin + metronidazole will never match plain amoxicillin. Ampicillin + cloxacillin matches its own record, and adding a third ingredient (amoxicillin) matches nothing.
- **Brand names do not match.** "Emzoclox" and "Emzifix" return no record. A product reference can only **block** a candidate (see the conflict outcome above). It can never create one.

### 5.7 The human confirmation step

The screen shows **what the AI read** next to the candidate's ingredient list and asks: *"Does this match every active ingredient on your package, with no additional active ingredient?"*

- **"Yes, the complete list matches"** → results are shown.
- **"No / I'm unsure"** → nothing is shown. The app advises another photo or a pharmacist.

The AI suggests a match. **Only the user confirms it.** That decision is central to the design.

### 5.8 Manual route (no photo, no AI)

At any time the user can choose a record from a dropdown ("or use the catalogue") instead of scanning. This route sends nothing to any outside service.

---

## 6. What the user sees after confirming

On the right-hand panel:
1. The medicine name and an **"Antibiotic" or "Not an antibiotic"** label with its category.
2. A short summary and a caution, taken from the record.
3. **"What would you like to understand?"**: a scenario dropdown. Each option shows fixed text:

| Scenario | Fixed message (summary) |
|---|---|
| Understand this medicine (default) | Recognition is a start, not approval. Read the leaflet and ask a pharmacist. |
| A cold or flu | Colds and flu are viral. Antibiotics do not treat viruses. |
| Sharing a medicine | A prescription belongs to one person. Do not share. |
| Using leftovers | Leftovers are not a treatment plan. Ask about disposal. |
| My own prescription | Take it exactly as prescribed. Do not change it because of this app. |
| A missed dose | Check your leaflet and ask a pharmacist. The app will not calculate doses. |
| Side effects or other medicines | Get a medicine-specific check from a pharmacist. |

   Non-antibiotics show only general, cold, missed-dose and side-effects options. For non-antibiotics the cold scenario says "This ingredient is not an antibiotic."

4. **"Explain this simply"**: opens the **Ask ResistGuard** dialog with the explanation for the chosen scenario already running (see sections 7 and 8). It no longer expands inside the page.
5. For antibiotics, a link to the **Antibiotic use** tab.
6. "A useful next conversation" (what to bring to a pharmacist), source links, the date the source was checked, and "Pharmacist review pending".
7. On every page: a fixed emergency notice (trouble breathing, throat swelling or collapse → seek emergency help).

---

## 7. All screens (navigation tabs)

| Tab | Who it's for | What it does | Status |
|---|---|---|---|
| **Medicine check** (home) | Public | Hero section, a 4-step first-visit tour for new visitors, an optional 1-minute practice tutorial (compare "amoxicillin + clavulanic acid" with a reading of "amoxicillin" to learn not to confirm partial matches), then the full scan → confirm → understand flow above. | Works |
| **Antibiotic use** | Public | A questionnaire built on fictional cases (see below) plus an interactive AMR lesson. Works without scanning or AI. | Works |
| **Catalogue** | Public | Search and filter the 28 records by ingredient, **brand or NAFDAC registration number**. Filters: all, antibiotics, non-antibiotics, Nigerian sources, Nigeria adult list, Nigeria children's list. Each card shows ingredients, antibiotic yes/no, summary, caution, source (with section) and "review pending · check due" date. An expandable "Formulations and product references" panel shows list strengths and Greenbook entries with their recorded status date. A source register for the Nigerian expansion sits at the bottom. "Check this label" jumps to the medicine check. | Works |
| **Learn & try** | Public | 4 cards on antibiotic misuse, a 3-question quiz, 10 fictional sample labels to try, and all source links. | Works |
| **Example insights** | Demo audience | A dashboard of **made-up** numbers (240 sessions and so on), clearly labelled synthetic. | Fake by design |
| **Pilot & review** | Pharmacist, facilitator | Download the review packet and pilot protocol. A browser-only form to record test sessions. | Tools work; never used for real |

### Ask ResistGuard (all tabs)
- A floating button, bottom of every page, opens a modal dialog. On the Medicine check tab it receives context: the **confirmed** medicine and scenario, or a note that the scan needs a clearer label. On other tabs it has no context.
- Preset questions only, no typing: "How do I photograph the label?", "What does a NAFDAC number tell me?" (links to the Greenbook and to the Catalogue), "Why does responsible antibiotic use matter?" (WHO passage). With a confirmed medicine it also offers "Explain my selected topic" and, for antibiotics, "Why doesn't this antibiotic treat flu?".
- The two explanation buttons call `/api/explain`. If that fails, the same fixed text is shown with a notice.
- Footer: for diagnosis, treatment or personal suitability, speak to a pharmacist or clinician.

### Antibiotic use tab in detail
- **10 fictional cases**: general antibiotic use; eczema flare; boil; sildenafil taken with a nitrate (interaction); diclofenac with an ulcer history; and five new ones: possible urinary infection, possible pneumonia in a child, sore throat or tonsillitis, fever and suspected typhoid, a wound that may be infected.
- For antibiotic cases, the user picks how the person would get the medicine: own prescription, self-starting, leftovers, someone else's, or unsure.
- The user ticks topics to raise with a pharmacist: age/child, allergy, other medicines, pregnancy or breastfeeding, existing conditions.
- The app shows the matching **source passages** (each linked to WHO, CDC, NICE, NHS or DailyMed) and a question list.
- **AMR lesson**: a short interactive story (found leftover antibiotics → use them or ask a professional?) explaining how misuse leads to harder-to-treat infections. It is conceptual only, with no risk numbers.
- The user's choices **stay in the browser**. Only the case name is sent if the optional AI button is used.

---

## 8. Where AI is used, and its limits

Three AI calls exist, all through Groq and all optional. **AI never writes medical advice that the user sees.** The only AI-generated text the user sees is the scan transcription (ingredient names and product name).

| Feature | Model | What AI receives | What AI may do | Guardrail |
|---|---|---|---|---|
| **Read label** | `qwen/qwen3.8-27b` (vision) | The prepared photo | Transcribe ingredients into 5 fixed fields | Strict field validation; plain code does the matching; the user must confirm |
| **Explain this simply** (now shown inside Ask ResistGuard) | `openai/gpt-oss-120b` (text) | The chosen medicine's pre-written paragraphs and questions | **Pick** 2–4 paragraph IDs and 2–3 question IDs | Unknown or duplicate IDs are rejected; the fixed text is shown on failure |
| **Organise the evidence** (Antibiotic use tab) | `openai/gpt-oss-120b` | The fictional case and its passages | **Reorder** passages only; all must be kept | Missing or extra IDs are rejected; all passages are shown regardless |

When AI is unavailable, the app says so and shows the same fixed, sourced content without AI.

---

## 9. Content inventory

### 9.1 The 28 catalogue records
All have status `pending_pharmacist`. Counted in the review packet (`data/content-manifest.json`: 28 records).

**Original 16** (`data/medicines.json`):
- **Antibiotics (14):** amoxicillin, azithromycin, metronidazole, doxycycline, ciprofloxacin, flucloxacillin, cefalexin, nitrofurantoin, clarithromycin, trimethoprim, phenoxymethylpenicillin, erythromycin, **co-amoxiclav** (amoxicillin + clavulanic acid), **co-trimoxazole** (sulfamethoxazole + trimethoprim).
- **Not antibiotics (2):** paracetamol, ibuprofen.
- **Sources:** NHS UK medicine pages for 15 records; a UK manufacturer leaflet (medicines.org.uk) for co-trimoxazole.

**Added 24 November 2026** (`data/nigeria-catalogue.json`, all antibiotics, checked 2026-11-24, review due 2027-02-24): cefixime, ceftriaxone, cefuroxime, cefpodoxime, cefazolin, ampicillin, cloxacillin, clindamycin, gentamicin, mupirocin, **ampicillin + cloxacillin**, and a **triple-antibiotic ointment** set (bacitracin + neomycin + polymyxin B).

**Totals:** 26 antibiotics, 2 non-antibiotics.

**Supporting data in the Nigerian file:**
- 15 records have formulation examples (form and strengths with a page or section reference).
- 5 Greenbook product references: Emzifix 400 mg tablet (cefixime), Emzoclox capsule (ampicillin + cloxacillin), Emcillin suspension (ampicillin), Emmox-250 dispersible tablet (amoxicillin), Zinnat 250 mg tablets (cefuroxime). Each has a registration number and recorded status.
- 8 registered sources: Nigeria Essential Medicines Lists for adults and children, NAFDAC Greenbook, the Euroclox-500 Greenbook entry, NHIA treatment guidelines, NCDC AMR fact sheet, WHO AWaRe Antibiotic Book, and the DailyMed Safetec triple-antibiotic label. The NHIA and AWaRe documents are linked for professional review only. No treatment recommendation from them is used in the app.

Any medicine outside this list is reported as "outside our catalogue". That includes most real-world antibiotics.

### 9.2 Education passages (`data/use-evidence.json`)
17 passages from 12 sources: CDC (antibiotic do's and don'ts), WHO (AMR fact sheet, pneumonia in children, typhoid), NICE NG190 (eczema infection), NHS (boils, urinary tract infections, tonsillitis, cuts and grazes), DailyMed sildenafil label, DailyMed diclofenac label, and NCDC (AMR). Topics: need for an antibiotic, prescriptions, leftovers and sharing, AMR, antibiotic stewardship in Nigeria, eczema (×2), boils (×2), sildenafil–nitrate interaction, diclofenac–ulcer, children, and one assessment passage each for urinary symptoms, breathing difficulty, sore throat, fever and wounds.

### 9.3 Test labels (`public/test-labels/`, `data/scan-fixtures.json`)
10 **fictional** images stamped "SIMULATED PACKAGING – SOFTWARE TEST ONLY": amoxicillin, doxycycline, paracetamol, co-amoxiclav, cefixime (expected result changed: it was "outside catalogue" and is now a catalogue candidate), amoxicillin + metronidazole (must not collapse to one ingredient), moisturiser (non-medicine), blank (must not guess), brand only "Zithromax" (no ingredients shown), and a prompt-injection label.

---

## 10. Privacy and data handling

- No accounts, no login, no database, no analytics or tracking scripts.
- Photos are resized and stripped of metadata on the device, sent only after consent, forwarded to Groq, and **never stored by ResistGuard**.
- Scenario and questionnaire choices stay in the browser.
- The only thing saved in the browser is a flag (`resistguard:tour-dismissed` in local storage) that records the first-visit tour was finished or skipped.
- The assistant has no free-text box, so nothing typed by the user is ever sent to it. Opening an explanation sends only a medicine ID and a scenario name.
- Server logs record only fixed codes (route, success or fallback, reason). They never record images, ingredients, IP addresses or prompts.
- Rate limiting hashes client IPs. If Redis is configured, it stores daily HMAC keys, never raw IPs.
- Pilot observations live only in browser memory. They vanish on refresh unless exported with separate consent, and the form accepts no names, free text or images.
- Browser camera permission is allowed for the site only. Microphone and location are blocked.

---

## 11. What does NOT exist (NOT BUILT)

Do not assume any of these:

- **Barcode scanning** or reading a barcode/QR to identify a product.
- **Brand-name matching in the scan** (for example "Augmentin → co-amoxiclav"). This is deliberately excluded. The Catalogue can search 5 branded products by name or NAFDAC number, but only to show their reference entries. A scan never uses a brand to pick a medicine.
- **Authenticity, counterfeit, expiry or live registration checks.** The Catalogue shows the Greenbook status as recorded on 24 November 2026 for 5 products and tells the user to check the register directly. It does not query NAFDAC.
- **A free-text or conversational AI assistant.** Ask ResistGuard uses preset questions only.
- **Strength or dose reading**, dose calculation, or treatment plans.
- **Symptom checker or diagnosis.**
- **Interaction checker** beyond one fictional teaching example.
- **User accounts, history, saved scans** or any database.
- **Languages other than English.**
- **A native mobile app.** It is web only.
- **Offline mode.** Scanning needs the internet; the catalogue loads with the page.
- **Pharmacist chat, referral or pharmacy finder.**
- **Complete Nigerian coverage.** Only 12 records, 15 formulation examples and 5 Greenbook products exist. This is a sample of the Nigerian lists, not the whole register, and nothing has been reviewed by a Nigerian pharmacist.
- **Automatic retry** when the AI times out.
- **Shared production rate limiting.** The Redis code exists and was tested on a temporary database, but production has none connected.
- **Monitoring alerts** to a person. Logs exist; nobody is notified.
- **Real usage data.** The dashboard is synthetic.

---

## 12. Real vs fake vs placeholder

| Item | Truth |
|---|---|
| Example insights dashboard | **Fake**: fixed synthetic numbers, labelled so. |
| Sample/test labels | **Fictional** packaging, not real medicines. |
| "Pharmacist review" | **Not done.** Every record shows "pending". Source checking ≠ professional approval. |
| Pilot | **Not started.** No volunteers contacted. The UI says so. |
| Pilot form exports produced so far | **Fabricated test data** from browser testing, not evidence. |
| Rate limits | **Per server instance**, reset on restart. Not a true global or spending cap. |
| Greenbook status shown in the Catalogue | **Recorded snapshot** (24 November 2026), not a live lookup. May be out of date. |
| Impact on antibiotic misuse | **Unmeasured.** It is a goal, not a result. |

---

## 13. What has and has not been verified

**Verified:**
- 36 automated tests pass (re-run on 25 November 2026). They cover matching, combinations, AI response validation, limits, pilot logic, the evidence order, the Nigerian records' source traceability, brand names failing to bypass ingredient matching, and the five new education cases.
- The production build passed at the Nigerian expansion (24 November). It was not re-run for this update.
- A phone-width browser check of the Nigerian catalogue covered lookup by registration number, recorded Greenbook status, the children's list filter, confirming a full ingredient list, and retrieval of NCDC and condition-specific evidence.
- A regression test reproduces the Emzoclox blister-pack misreading (wrong amoxicillin + clavulanic acid pair). The classifier discards it, including when the model claims the list was complete. It also covers a brand-only photo and a correct ampicillin + cloxacillin reading.
- All 10 fictional labels gave their expected outcomes through the live AI.
- 3 published US manufacturer label images (DailyMed artwork: amoxicillin, acetaminophen, sulfamethoxazole + trimethoprim) matched correctly. One timed out on the first try.
- A real photo of a moisturiser was correctly rejected as non-medicine.
- A real triple-antibiotic "Drug Facts" photo with no brand was read completely and correctly reported as "outside catalogue".
- Layout was checked at 320–1440 px widths in Microsoft Edge.

**Not verified:**
- **Real phone photos of real medicine boxes** on Android or iPhone (glare, blur, small print, poor networks). Reflective blister foil is a known weak spot, shown by the Emzoclox misreading. The fix suppresses wrong readings only for the 5 Greenbook products. Other foil packs are not protected by it.
- The **first-visit tour** and **Ask ResistGuard** with real users. Only the build and unit tests cover them.
- The new records' ingredient lists have not been checked by a pharmacist.
- Accuracy rates of any kind. The samples are far too small.
- Whether real users understand that "recognised" ≠ "safe for me".
- Any pharmacist review of the content.
- Behaviour under many simultaneous users.

---

## 14. Technology and operations (short)

- **Frontend:** Next.js 16 (App Router; this version has breaking changes, so read `node_modules/next/dist/docs/` before coding), React 19, Tailwind 4, lucide-react icons. Everything is one page (`app/page.tsx`) with tab switching.
- **Backend:** Next.js API routes on Node: `/api/scan`, `/api/explain`, `/api/use-evidence`, `/api/readiness`.
- **AI:** Groq API. The key is server-only.
- **Data:** static JSON files in `data/`. No database. `lib/safety.ts` merges `medicines.json` with `nigeria-catalogue.json` into one `medicines` list.
- **Hosting:** Vercel, public URL `https://resistguard-rosy.vercel.app`.
- **Usage limits:** 6 AI requests per client per minute, 30 per minute overall, 100 per day and 1,000 per month per server instance (all configurable).
- **Switches (environment variables):** `DISABLE_AI=1` turns AI off; `ENFORCE_PILOT_GATES=1` locks AI behind a pilot date and reviewed-content fingerprint (currently off); `REQUIRE_DURABLE_LIMITS=1` requires Redis.
- **Review fingerprint:** the build **fails** if any reviewed file changes (medical text, safety rules, key UI files) until `node scripts/review-packet.mjs` is rerun. Rerunning it invalidates any earlier pharmacist approval.

---

## 15. Demo risks

1. **AI timeouts.** The first scan sometimes times out (18 s) and there is no auto-retry. The user must press the button again or use the catalogue.
2. **Limits.** A room of people scanning at once can hit 30 per minute and get pushed to the manual route.
3. **Real boxes.** Untested on physical phones. A brand-only front gives "unreadable".
4. **Catalogue size.** 28 records still leave many real medicines "outside our catalogue". Mixed UK and Nigerian sourcing may confuse a viewer who asks "which country is this for?".
5. **Camera** needs HTTPS. It will not work on plain-HTTP local network addresses.
6. **Visible "pending" labels.** The UI openly says review is pending and the pilot has not started.

---

## 16. Decisions needed before further work

| # | Decision | Why it matters |
|---|---|---|
| 1 | **Target country/market** (Nigeria? UK? other?) | Decides drug names, which medicines go in the catalogue, which sources to cite, and regulatory wording. The latest commits add Nigerian data without stating this choice. |
| 2 | **Target user profile**: age, literacy, language(s), smartphone access | Decides copy, reading level, translations and photo guidance. |
| 3 | **Usage setting**: home, pharmacy counter, campaign or classroom | Decides whether a pharmacist is present and which features matter. |
| 4 | **Catalogue scope**: which medicines, and should brand names ever be supported? | 16 UK generics cover little of real-world use. |
| 5 | **Who reviews the content**: a named, registered pharmacist in the target country | Nothing can be called approved until this happens. |
| 6 | **What success looks like**: the metric for the pilot (for example "user does not confirm a wrong match", "user knows to ask a pharmacist") | Without it the pilot cannot show anything. |
| 7 | **Is this a competition demo, a research pilot or a public product?** | Decides how much to invest in limits, monitoring and polish. |

---

## Appendix — where things live in the code

| Area | Files |
|---|---|
| Page and tabs | `app/page.tsx`, `app/layout.tsx` |
| Scan flow UI | `app/components/MedicineCheck.tsx`, `CameraCapture.tsx`, `ScanGuide.tsx`, `FirstCheckGuide.tsx` |
| First-visit tour | `app/components/FirstVisitTour.tsx`, `first-visit-tour.css` (state lives in `app/page.tsx` and `MedicineCheck.tsx`) |
| Ask ResistGuard assistant | `app/components/AskResistGuard.tsx`, `ask-resistguard.css` (launcher button in `app/page.tsx`) |
| Nigerian catalogue data | `data/nigeria-catalogue.json`, merge logic and `nigeriaCatalogueDetails()` in `lib/safety.ts`, `tests/nigeria-catalogue.test.ts`, `docs/DATA-AND-ARCHITECTURE.md` |
| Photo preparation (on device) | `lib/image.ts` |
| AI prompt, response validation, outcome rules | `lib/scan.ts`, `lib/scan-guide.ts` (recovery tips) |
| Groq client | `lib/groq.ts` |
| Matching, scenarios, emergency text | `lib/safety.ts`, `data/medicines.json`, `data/ingredient-aliases.json` |
| Explain simply | `app/api/explain/route.ts`, `lib/education.ts` |
| Antibiotic use tab | `app/components/UseCheck.tsx`, `lib/use-check.ts`, `data/use-evidence.json`, `app/api/use-evidence/route.ts` |
| Catalogue, learning, samples | `app/components/Catalogue.tsx`, `catalogue-references.css`, `Learning.tsx`, `data/scan-fixtures.json`, `public/test-labels/` |
| Product-reference safeguard | `classifyObservation()` in `lib/scan.ts`, `tests/scan.test.ts` |
| Pilot and review | `app/components/Pilot.tsx`, `lib/pilot.ts`, `public/pilot-protocol.md`, `public/review-packet.json`, `scripts/review-packet.mjs`, `scripts/validate-review.mjs` |
| Limits, kill switch, readiness | `lib/guard.ts`, `lib/availability.ts`, `app/api/readiness/route.ts` |
| Fake dashboard | `data/dashboard.json` |
| Tests | `tests/*.test.ts` (`npm test`) |
| Background docs | `README.md`, `FEATURE_GUIDE.md` (dated 15 November, out of date), `docs/PRODUCT-OVERVIEW.md`, `docs/USER-GUIDE.md`, `docs/LAUNCH.md`, `docs/USE-CHECK-PLAN.md`, `docs/DATA-AND-ARCHITECTURE.md`, `VERIFICATION.md` |
