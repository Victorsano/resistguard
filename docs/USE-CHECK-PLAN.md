# Antibiotic-use education and AMR prevention

## Implementation plan

1. Add a public Antibiotic use tab and a shortcut after medicine identification. Support learning without a scan, an account or an AI connection.
2. Use a small set of fictional examples and general antibiotic-use questions. Include eczema, boils and two documented medication-safety examples (a medicine interaction and ulcer history). Explain why starting a leftover or shared antibiotic raises concerns, and encourage a professional medicine review for uncertainty, children or pregnancy.
3. Store educational passages in structured JSON with source, section, source-check date and pharmacist-review status. Retrieve by topic. The model may choose emphasis within the retrieved evidence. The application displays the mandatory passages regardless of the model's output. Personal answers stay in the browser.
4. Provide an interactive conceptual AMR lesson. Show the relationship between unnecessary antibiotic use and harder-to-treat infections, then show actions that support responsible use. Use illustrative qualitative stages, with no individual or population risk calculation.
5. Extend the review packet and automated verification. Test the public flow with fictional data, including disabled AI and an invalid model response.
6. Publish the reviewed software changes to GitHub and deploy to the existing Vercel project. Clinical review remains a separate milestone.

## Content maintenance

Treat these examples as educational material. The first release uses selected WHO, CDC, NICE, NHS and DailyMed passages. The Nigerian Essential Medicines List is a future catalogue reference, NAFDAC Greenbook is a registration reference, and NCDC and NHIA are candidates for local guidance. Review the specific documents and reconcile newer guidance before extending the library. WHO notes that its 2022 AWaRe book is being updated. This is a staged expansion, without ingestion of dosing schedules or clinical treatment protocols.

For each new passage, record the specific source and section, paraphrase the narrow education claim, record when it was checked, and have a pharmacist review the exact version. Keep the original source link in the UI, reject unknown IDs in model output, add a test for each new rule, regenerate the review packet and recheck the demo. Recheck changes to guidance at the recorded review date. The pilot should measure whether participants recognise when to stop and seek clarification, using fictional examples.
