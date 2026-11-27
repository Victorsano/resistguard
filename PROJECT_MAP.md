# ResistGuard project context

Start here when picking up the project. This is the current implementation and handoff. The original check-flow design and older verification records remain available for historical context.

## Product and deployment

ResistGuard helps people in Nigeria identify the active ingredients in a medicine pack, see whether it contains an antibiotic, and decide what to ask a doctor or pharmacist. The checker provides source-linked information. Diagnosis, prescribing, dose selection, and treatment decisions stay with a health professional.

- Public repository: [Victorsano/resistguard](https://github.com/Victorsano/resistguard). Its default branch is `codex/resistguard`.
- Production: [Vercel homepage](https://resistguard-rosy.vercel.app/) and [checker](https://resistguard-rosy.vercel.app/check).
- The Next.js app serves HTML and Node API routes on Vercel. It reads the checked-in JSON evidence catalogue. A database is unnecessary for evidence lookup. Shared rate limiting is a separate concern.
- `GROQ_API_KEY` is a hidden production environment variable in Vercel. Keep secrets in server-side configuration. See [operations](docs/OPERATIONS.md) for environment settings and deployment.

## Current user flow

1. The landing page has a decorative Three.js particle animation that changes shape every two seconds and respects reduced-motion preferences.
2. On `/check`, scan or upload a label, crop it, approve AI photo processing, and confirm the complete ingredient list. Typed lookup and catalogue search are also available.
3. Enter the reason once, report whether a doctor prescribed the medicine for this illness, and enter any other medicines or supplements. Companion packs can be searched, typed or scanned.
4. Select **Continue** to request AI-assisted follow-up questions. Required questions and the optional prior-assessment question are selected by the app. Prior assessment is asked when a reason is present and the medicine was not prescribed for it. Groq may add up to two optional questions. Relevant answers can include additional detail.
5. Read the result and one concrete next step. The app computes the three outcome states from documented interactions, reported answers and evidence gaps. Groq writes an explanation and can suggest a question for a doctor or pharmacist. Source-based results remain available if Groq fails.
6. Expand **Medicine record** for ingredients and uses and **Supporting sources** for links and where they were used. The in-app NAFDAC Greenbook lookup checks a registration number. Saved records are dated fallbacks.
7. Preview a WhatsApp draft and choose whether to include prescription status, reason, other medicines or relevant follow-up details. The user chooses the recipient and sends the message.

## Antibiogram check (demo)

`/lab` (`app/lab/page.tsx` -> `app/components/LabCheck.tsx`), linked from the home page section "For labs and researchers", lets a lab scientist upload photos of a stack of antibiograms (one report per photo, several photos at once) or enter them by hand. A summary ranks every isolate by its most serious finding and counts WHO critical, WHO high, multidrug resistant and recheck results, so the team knows what to act on first. The sample menu disappears once the user's own photos are read. A photo showing several reports is not read: the model counts the reports and the page asks for one photo per report, because testing showed the model invents isolates when several reports share one photo. Groq vision calls ask for at most 1,000 output tokens (`lib/groq.ts`), the per-minute cap on the key used for local testing; the page waits and retries twice when the provider is rate-limited. It flags WHO priority resistance (Bacterial Priority Pathogens List 2024), multidrug and extensively drug resistance (ECDC and CDC definitions) and results that contradict expected resistance (EUCAST). It covers 7 bacteria. The rules are plain functions in `lib/antibiogram.ts` with tests in `tests/antibiogram.test.ts`, built from the eight fictional sample sheets. A photo is read through the existing `/api/scan` route (mode `antibiogram`; prompt and parser in `lib/antibiogram.ts`) only after the user ticks consent. The model only transcribes; the rules decide the flags. All isolates can be saved as one CSV file in the browser. Nothing is stored. On 2026-11-27 the rules were checked against the sources: WHO priority tiers against the 2024 list; expected resistance against EUCAST Expected Resistant Phenotypes v1.2, tables 1, 2 and 4 (this removed trimethoprim-sulfamethoxazole for *P. aeruginosa* and chloramphenicol for *A. baumannii*, and added cephalosporins and tetracycline for *A. baumannii* and macrolides for *E. faecium*); typhoid definitions against CDC MMWR 2019 and WHO Disease Outbreak News 2018. The multidrug threshold (3 or more categories) is confirmed, but the per-organism category lists of Magiorakos et al. 2012 could not be read, so the page groups antibiotics into simplified classes and reports extensive resistance only as "possible". WHO tier labels appear only on WHO priority pathogens; resistance definitions use their own "Resistance pattern" level. WHONET already has isolate alerts for important resistance; ResistGuard's addition is reading paper reports from a phone photo. The CSV is one row per isolate with a column per antibiotic, which WHONET's BacLink can import after the lab maps the columns once. On 2026-11-27 the vision model read all seven readable fictional sample sheets with no errors, including a handwritten one. Not built yet: a WHONET-specific export format.

## Evidence and result decisions

- `lib/flow.ts` handles reason wording and conservative phrase matching. `lib/check-guidance.ts` selects passages and checks documented interactions. `data/use-evidence.json` holds symptom passages and source links. `data/medicines.json` and `data/nigeria-catalogue.json` hold medicine records. `data/check-interactions.json` holds the documented pairs. `lib/check-follow-ups.ts` holds sourced questions.
- `app/api/check-guidance/route.ts` sends a bounded set of evidence to Groq. For a final result, the first high-effort GPT-OSS call reads the reported case and selects evidence IDs by meaning. The second reads the full case again with the selected text and the rule-based result, then writes a short explanation and next step. It can cite only the retrieved passages. The model has no live web access during the check. A model citation alone does not clear an evidence gap or determine the clinical outcome.
- `lib/check-result.ts` owns result status and clinician routing. `app/components/Answer.tsx` and `lib/screen-copy.ts` handle presentation and source-based wording. A prescription for this illness routes to the prescribing doctor. An unprescribed medicine must never imply the user has a prescriber or was given a treatment plan.
- For example, the checker recognizes `headace` as headache and explains that antibiotics do not directly relieve headache pain. For pus or white discharge from a scar and ampicillin + cloxacillin, it explains the possible sign of infection and gives a specific question about getting the scar checked. The prescribed and unprescribed paths use different next steps. Pus from a surgical wound has its own source and a prompt to contact the surgical team promptly, even if AI guidance is unavailable.
- Source links are grouped by URL with the uses listed under each link. Product examples are general uses supported by product information. A symptom match alone cannot establish the cause or whether an antibiotic is needed.

## What is still open

- Physical Android and iPhone testing, especially camera permissions, cropped labels, reflective blister packs, retakes and interrupted connections.
- Pharmacist review of the exact release fingerprint and a consented pilot. The current release is pending review.
- Broader coverage across medicine families, symptoms and interactions. Pairs outside the documented library remain explicitly unverified. The current implementation is an initial evidence catalogue and retrieval can be expanded within that catalogue.
- Release operations such as production limits and spend monitoring should be checked against the current Vercel configuration before a broader rollout.

## Latest verification

The automated suite passed 86 tests and the production build succeeded. The earlier live browser walkthroughs used fictional inputs and covered typed lookup, result guidance in both prescription paths, source links, and WhatsApp sharing controls. Physical camera and pharmacist review remain open.

## Start developing

Run `npm ci` and `npm run dev`. For changes to tracked result copy or evidence, run `node scripts/review-packet.mjs` before `npm test` and `npm run build`. The production build checks that the review packet matches the content.

- [Architecture and API map](docs/ARCHITECTURE.md)
- [User guide](docs/USER-GUIDE.md)
- [Contributing](CONTRIBUTING.md) and [design](DESIGN.md)
- [Verification history](VERIFICATION.md) and [original check-flow spec](docs/specs/check-flow.md)
