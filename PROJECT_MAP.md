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

## Evidence and result decisions

- `lib/flow.ts` handles reason wording and conservative phrase matching. `lib/check-guidance.ts` selects passages and checks documented interactions. `data/use-evidence.json` holds symptom passages and source links. `data/medicines.json` and `data/nigeria-catalogue.json` hold medicine records. `data/check-interactions.json` holds the documented pairs. `lib/check-follow-ups.ts` holds sourced questions.
- `app/api/check-guidance/route.ts` sends a bounded set of evidence to Groq. The model can select a relevant passage by meaning even if the user’s wording missed the automatic phrase list. It returns citation IDs from that set and has no live web access during the check. A model citation alone does not clear an evidence gap or determine the clinical outcome.
- `lib/check-result.ts` owns result status and clinician routing. `app/components/Answer.tsx` and `lib/screen-copy.ts` handle presentation and source-based wording. A prescription for this illness routes to the prescribing doctor. An unprescribed medicine must never imply the user has a prescriber or was given a treatment plan.
- For example, the checker recognizes `headace` as headache and explains that antibiotics do not directly relieve headache pain. For pus or white discharge from a scar and ampicillin + cloxacillin, it explains the possible sign of infection and gives a specific question about getting the scar checked. The prescribed and unprescribed paths use different next steps. A surgical wound has its own evidence and the general scar wording is kept separate from it.
- Source links are grouped by URL with the uses listed under each link. Product examples are general uses supported by product information. A symptom match alone cannot establish the cause or whether an antibiotic is needed.

## What is still open

- Physical Android and iPhone testing, especially camera permissions, cropped labels, reflective blister packs, retakes and interrupted connections.
- Pharmacist review of the exact release fingerprint and a consented pilot. The current release is pending review.
- Broader coverage across medicine families, symptoms and interactions. Pairs outside the documented library remain explicitly unverified. The current implementation is an initial evidence catalogue and retrieval can be expanded within that catalogue.
- Release operations such as production limits and spend monitoring should be checked against the current Vercel configuration before a broader rollout.

## Latest verification

The automated suite passed 84 tests and the production build succeeded. The earlier live browser walkthroughs used fictional inputs and covered typed lookup, result guidance in both prescription paths, source links, and WhatsApp sharing controls. Physical camera and pharmacist review remain open.

## Start developing

Run `npm ci` and `npm run dev`. For changes to tracked result copy or evidence, run `node scripts/review-packet.mjs` before `npm test` and `npm run build`. The production build checks that the review packet matches the content.

- [Architecture and API map](docs/ARCHITECTURE.md)
- [User guide](docs/USER-GUIDE.md)
- [Contributing](CONTRIBUTING.md) and [design](DESIGN.md)
- [Verification history](VERIFICATION.md) and [original check-flow spec](docs/specs/check-flow.md)
