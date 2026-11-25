# ResistGuard: Features to Add Before Friday

Nov 25, 2026 · @Fabian

## Summary

We can add two small features before the pitch on Friday 27 November 2026. Together they take about 2 to 3 hours. Neither one uses AI (artificial intelligence), and neither stores any data.

| Feature | Problem it fixes | Time |
| --- | --- | --- |
| 1. "Check it's genuine" box | The app says what is in the box, but not whether the box is real. Fake and weak antibiotics help germs become resistant. | About 1 hour |
| 2. "Ask a pharmacist on WhatsApp" button | The app gives information, but no easy next step. People self-medicate mainly because doctors are hard to reach and cost money. | 1 to 2 hours |

Both features appear only **after** the user confirms the medicine. Both send the user to a real authority: NAFDAC (Nigeria's drug regulator) or a pharmacist. The app itself never says "this is genuine" or "this is safe for you".

## Feature 1: "Check it's genuine" box

This box sends every user to NAFDAC's own fake-drug check while they hold the medicine. It does not detect fakes itself.

### The problem

- The World Health Organization says fake and poor-quality medicines can contain the wrong ingredients or the wrong dose, and can raise the risk of antimicrobial resistance (germs surviving antibiotics). [WHO fact sheet](https://www.who.int/mediacentre/factsheets/fs275/en/)
- About 10% of antimicrobials used in low- and middle-income countries are estimated to be substandard or falsified. [Nature Communications, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10547756/)
- A weak dose kills only the weakest germs. The strong ones survive and spread.

### Why the app cannot detect fakes itself

1. A photo shows the box, not the pill. Fakers copy the box print.
2. NAFDAC numbers can be faked too. In 2026, NAFDAC warned about counterfeit proguanil carrying a fake NAFDAC registration number. [NAFDAC alerts, March 2026](https://nafdac.gov.ng/2026/03/)
3. A real check needs a lab test, or a unique code checked against the maker's records. The app has neither.
4. If the app wrongly said "genuine", people would trust a fake drug more. That is worse than saying nothing.

### What NAFDAC already offers

- **Mobile Authentication Service (MAS):** many genuine packs have a silver scratch panel. Under it is a one-time PIN. The user texts the PIN to a short code and gets a reply saying genuine or fake. The text is free. [NAFDAC MAS page](https://nafdac.gov.ng/?p=2429)
- MAS is run by several service providers, and each has its own short code. **Do not hard-code one number** (such as 38353). Tell users to text the number printed on the pack.
- Only products whose makers joined the scheme have a scratch panel.
- **NAFDAC Greenbook:** NAFDAC's online list of approved products. Anyone can look up a NAFDAC number there.

### What the user sees

The box appears under the result, after the user confirms the medicine. It has a title and three steps:

> **Check the pack is genuine**
>
> 1. Does your pack have a silver scratch panel? Scratch it and text the PIN to the number printed beside it. The text is free. The reply tells you if the pack is genuine.
> 2. Find the NAFDAC number on the box. Look it up in the [NAFDAC Greenbook](https://greenbook.nafdac.gov.ng/).
> 3. If the reply says fake, or the box has no NAFDAC number, do not take it. Show it to a pharmacist and report it to NAFDAC.
>
> ResistGuard cannot tell if a medicine is genuine. These checks come from NAFDAC.

### Limits

- Many packs have no scratch panel. For those, only step 2 and step 3 help.
- A fake box can copy a real NAFDAC number, so a Greenbook match does not prove the pack is genuine.
- Open question: confirm the exact web address of NAFDAC's reporting page before you add the link.

### What to say on stage

"We don't claim to detect fakes. A photo can't do that. We send every user to NAFDAC's own scratch-and-text check while they hold the medicine. When NAFDAC's barcode rules roll out, we will scan the barcode directly."

## Feature 2: "Ask a pharmacist on WhatsApp" button

This button turns the result into one easy next step: a ready-made WhatsApp message to a pharmacist.

### The problem

- Today the app tells the user what is in the box, then stops. It says "ask a pharmacist", but gives no easy way to do that.
- In a national survey of Nigerian graduates, education did not change self-medication. The most common reasons were inconvenience, limited access to doctors and cost. [Scientific African, 2024](https://ui.adsabs.harvard.edu/abs/2024SciAf..2301978P/abstract)
- Most Nigerians already use WhatsApp. A message is faster and cheaper than a visit.

### What the user sees

A green button under the result: **Ask a pharmacist on WhatsApp**.

When tapped, WhatsApp opens with this message already typed. The user picks who to send it to and taps send.

> Hello, I have a medicine that contains \[ingredient names\]. ResistGuard says it is \[an antibiotic / not an antibiotic\].
>
> 1. Do I need this medicine for my illness?
> 2. Is it safe with my other medicines, allergies or conditions?
> 3. How should I take it, and for how long?

The app fills in the parts in brackets from the confirmed medicine record.

### How it works

- The button is just a link: `https://wa.me/?text=<message>`. The message is encoded so it fits in a web address.
- With no phone number in the link, WhatsApp asks the user to pick a contact.
- For the demo, we can put one pharmacist friend's number in the link instead: `https://wa.me/234XXXXXXXXXX?text=<message>`. That pharmacist must agree first.

### Privacy

- No photo is sent. No name is sent.
- The message holds only the ingredient names and the three questions.
- The user sees the full message before sending. Nothing leaves the phone until they tap send.
- The message travels through WhatsApp, not through ResistGuard. ResistGuard stores nothing.

### Limits

- The user needs a pharmacist to send it to. Many people do not know one.
- Open question: who receives messages after the demo? Options are the user's own contact, a partner pharmacy, or a Babcock pharmacy volunteer.
- It does not measure whether people actually send the message.

### What to say on stage

"People skip the pharmacist because it's slow and costs money. One tap turns our result into a WhatsApp question to a pharmacist, with no photo and no name."

### How we make money (answer for judges)

**Important:** judges often ask "How will you make money?" Use this answer. Always say it is a plan, not something that works today.

> "Today the button sends a free question to your own pharmacist. Our next step is a network of licensed pharmacists who answer for a small fee. It's cheaper than a clinic visit, and it brings in revenue."

|  | Today (built) | Next step (plan, not built) |
| --- | --- | --- |
| Who answers | Any contact the user picks | Licensed pharmacists who join our network |
| Cost to user | Free (only their data bundle) | A small fee per question |
| Reply promised? | No | Yes, within a set time |
| Revenue for us | None | A share of each fee |

What the paid version would still need:

1. Pharmacists who agree to answer and hold a current licence from the Pharmacists Council of Nigeria.
2. A way to take payment.
3. A promised reply time.
4. Clear rules on who is responsible if the advice is wrong.
5. Protection for health messages, which are private data.

## How to build both

> **Claude Code:** read "Build notes for Claude Code" at the end first. Where those notes and this section differ, the notes win.

Put both features in one new file, then add one line to the result screen. This keeps the change small and easy to undo.

| File | Change |
| --- | --- |
| `app/components/NextSteps.tsx` (new) | Holds the "Check it's genuine" box and the WhatsApp button |
| `app/components/MedicineCheck.tsx` | Import `NextSteps` and show it under the confirmed result only |
| `scripts/review-packet.mjs` | Add `app/components/NextSteps.tsx` to the `files` list, so a pharmacist reviews its text too |
| `tests/next-steps.test.ts` (new) | Check the WhatsApp link holds the right ingredient names and no photo data |

### Steps

1. Tell your teammate you are editing `MedicineCheck.tsx`, so you don't both change it.
2. Pull the latest code and make a new branch, for example `feature/next-steps`.
3. Create `NextSteps.tsx`. It takes the confirmed medicine record and shows both features.
4. In `MedicineCheck.tsx`, show `<NextSteps>` only after the user taps "Yes, the complete list matches".
5. Add the new file to the `files` list in `scripts/review-packet.mjs`.
6. Run `node scripts/review-packet.mjs`. **If you skip this, the build fails**, because `MedicineCheck.tsx` is a reviewed file.
7. Run `npm test`. All tests must pass, including the new one.
8. Run `npm run build` to check the production build.
9. Push the branch and open the Vercel preview link on a real phone. Tap the WhatsApp button and check the message.

Note: rerunning the review script resets any earlier pharmacist approval. No pharmacist has approved anything yet, so nothing is lost now.

## Done checklist

Both features are done when every box below is ticked.

- [ ] Teammate knows who is editing `MedicineCheck.tsx`
- [ ] Box and button show only after the user confirms a medicine
- [ ] Box never says "genuine" or "safe". It points to NAFDAC only
- [ ] No single MAS short code is hard-coded
- [ ] Greenbook and NAFDAC reporting links open the right pages
- [ ] WhatsApp message shows the right ingredient names for 3 test medicines
- [ ] WhatsApp message holds no photo and no name
- [ ] Demo pharmacist has agreed to receive messages (only if using a fixed number)
- [ ] `node scripts/review-packet.mjs` rerun
- [ ] `npm test` and `npm run build` pass
- [ ] Checked on a real phone through the Vercel preview
- [ ] Stage lines for both features practised once

Added by the build notes:

- [ ] Message and link logic lives in `lib/next-steps.ts`, and the test imports it from there
- [ ] Both `lib/next-steps.ts` and `app/components/NextSteps.tsx` are in the review packet `files` list
- [ ] No NAFDAC reporting link unless its web address has been confirmed
- [ ] WhatsApp button uses dark text on green, not white text, and not `var(--green)`
- [ ] No phone number appears anywhere in the code
- [ ] New block sits after "A useful next conversation" and before the source links
- [ ] No existing CSS file changed; new classes all start with `next-steps-`
- [ ] No file in `app/api/` or `next.config.ts` changed
- [ ] `ui-check` passed at phone and desktop width, compared with the live site

## Build notes for Claude Code

These close gaps found by reading the code. Where they differ from "How to build both", these notes win.

### 1. Where the code goes (use three files, not one)
- `lib/next-steps.ts` (new): plain functions, no React. For example `whatsAppMessage(medicine)` returns the message text, and `whatsAppLink(medicine, phone)` returns the full link. The node:test runner cannot easily test a React component, so the logic has to live here.
- `app/components/NextSteps.tsx` (new): only shows the box and the button. It calls the functions above.
- `tests/next-steps.test.ts` (new): imports from `lib/next-steps.ts`.
- Add **both** new files to the `files` list in `scripts/review-packet.mjs`. Both hold text a user will read. Add the checklist ids `'next-steps:nafdac-handoff'` and `'next-steps:whatsapp-message'`.

### 2. The review script breaks tests too
If you skip `node scripts/review-packet.mjs`, `npm test` fails as well as the build. The test "review packet fingerprint" in `tests/beta.test.ts` checks it.

### 3. NAFDAC reporting link
Nobody has confirmed the address yet. Write "report it to NAFDAC" as plain text, with no link. Add the link only when a person gives you a confirmed address.

### 4. The WhatsApp message
- Join ingredient names the way people say them: "amoxicillin", "amoxicillin and clavulanic acid", "bacitracin, neomycin and polymyxin b".
- Use `medicine.antibiotic` to choose "an antibiotic" or "not an antibiotic".
- Encode the whole message with `encodeURIComponent`.
- Use only the confirmed record (`result.medicine`). Never use the scan reading, the photo or the product name.

### 5. Phone number for the demo
- Read it from the environment variable `NEXT_PUBLIC_PHARMACIST_WHATSAPP`. Never write a number in the code.
- Keep digits only, country code first, with no plus sign and no leading zero (for example `2348012345678`).
- If it is empty or not valid, use `https://wa.me/?text=<message>`, so WhatsApp asks the user to pick a contact.
- Next.js puts `NEXT_PUBLIC_` values into the build. After changing the value on Vercel, redeploy.
- Add the variable to `.env.example`, empty, with a one-line comment saying it is optional and public (it is a phone number, never a secret).

### 6. Where it sits and how it looks (match the live site)
- **Place:** in `MedicineCheck.tsx`, inside the confirmed-result block, right **after** the "A useful next conversation" section and **before** the source links (`<div className="source-links">`). That section already tells people to talk to a pharmacist, so the WhatsApp button reads as its next step.
- **Shape:** two sections that copy the existing `.pharmacist-plan` sections: a thin rule on top, an h3 at 15px, body text at 13px. Add the `pharmacist-plan` class to each, plus your own prefixed class for anything extra.
- **Steps list:** a plain ordered list. Step numbers in small monospace cobalt, like the `.journey-number` labels on the home page.
- **Disclaimer line** ("ResistGuard cannot tell..."): small grey text, like `.source-links small`.
- **Greenbook link:** cobalt and underlined, like the other source links.
- **WhatsApp button:** same size and shape as `.secondary` (3px corners, min height 47px, 13px semibold). Background #25D366, text and icon in ink #18202d (about 8:1 contrast). White text on that green is about 2:1, too hard to read. Do **not** use `var(--green)`: it is blue in this app. Use the `MessageCircle` icon from `lucide-react`.
- **CSS:** put it in `app/components/next-steps.css`, imported by `NextSteps.tsx`. Prefix every class with `next-steps-`. Change no existing CSS file.
- **Links:** open with `target="_blank" rel="noreferrer"`.

### 7. Backend: change nothing
- Both features are plain links built in the browser. No new API route, no change to `app/api/`, `lib/groq.ts`, `lib/guard.ts` or `next.config.ts`.
- Nothing blocks the links: the app has no Content Security Policy (a browser rule that limits where a page can link or load from) and no middleware. The `Referrer-Policy` header means WhatsApp and NAFDAC see only the site address, never the page state.
- The only server-side touchpoints are the review packet (build gate), `.env.example`, and the Vercel environment variable.
- The "Ask ResistGuard" assistant needs no change.

### 8. What the test must check
Use three real records: `amoxicillin` (one antibiotic), `co-amoxiclav` (two ingredients) and `paracetamol` (not an antibiotic). For each one, check that:
- the decoded message holds the right ingredient names and the right antibiotic wording
- the link starts with `https://wa.me/?text=` when no number is set, and with `https://wa.me/<digits>?text=` when a valid number is set
- the link holds no `data:`, no `base64` and no product name
- the box text holds no 5-digit short code, such as 38353

### 9. Merge clashes
`public/review-packet.json` and `data/content-manifest.json` hold a timestamp, so they will clash on every merge with your teammate's work. Do not fix them by hand. Keep either version, then run `node scripts/review-packet.mjs` again.
