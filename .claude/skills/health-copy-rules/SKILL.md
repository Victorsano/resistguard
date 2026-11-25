---
name: health-copy-rules
description: Rules for any text a ResistGuard user reads, such as buttons, steps, warnings, prefilled messages and links. Use whenever you write or change user-facing text in app/, lib/ or data/.
paths:
  - app/**
  - lib/**
  - data/**
---

# Health copy rules

ResistGuard informs. It never decides for the user. Pharmacists and judges will read every word.

## Never
- Never say or hint that a medicine is genuine, fake, safe, right for the user, or needed. Questions are fine ("Is it safe with my other medicines?"). Claims are not.
- Never give a dose, a duration, a diagnosis or a treatment.
- Never hard-code an SMS (text message) short code such as 38353. Each NAFDAC MAS (Mobile Authentication Service) provider has its own code. Say "the number printed on the pack".
- Never add a link nobody has confirmed. If a web address is an open question in the spec, leave the link out and tell me.
- Never put a photo, a name or anything the user typed into a link or a message.

## Always
- Send the user to a real authority: NAFDAC (National Agency for Food and Drug Administration and Control, Nigeria's drug regulator) or a pharmacist.
- When a feature touches whether a medicine is real, show this line: "ResistGuard cannot tell if a medicine is genuine. These checks come from NAFDAC."
- Use plain English: short sentences, common words. Write the full name beside an abbreviation.
- Reuse web addresses already in the code. Greenbook: `https://greenbook.nafdac.gov.ng/`
- Open outside links with `target="_blank" rel="noreferrer"`, like the rest of the app.
- Copy text from the spec word for word, unless I approve a change.

## Before you finish
Read every new user-facing sentence against the "Never" list. Quote any sentence that comes close, and say why it is still fine or how you changed it.
