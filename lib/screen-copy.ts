// Every label, heading, button and state on the check flow. Medical body text stays in lib/safety.ts and data/.
import {emergency} from '@/lib/safety';
export const copy={
 back:'Back',
 emergency,
 home:{
  title:'What’s in that medicine?',
  subline:'Photograph the ingredient list on a medicine package. Compare the reading with the small print, then see what to ask a pharmacist.',
  scan:'Open camera',
  upload:'Upload photo',
  search:'Ingredient, brand or NAFDAC number',
  example:'Try with a sample label',
  trust:'No account. No saved health data.'
 },
 photo:{
  title:'Review your photo',
  retake:'Retake',
  another:'Replace',
  preparing:'Preparing the photo on your device…',
  tips:['The whole active-ingredient panel is visible.','I can read the text without glare or blur.','There are no names or personal details.'],
  consent:'I agree to send this prepared photo to Groq for label analysis. ResistGuard does not save it.',
  consentLink:'Provider data policy',
  read:'Read label',
  loading:'Reading the label…',
  loadingNote:'Checking the visible label. Usually takes a few seconds.',
  checking:'Checking whether the scanner is available…',
  timeout:'The scan could not finish. Check your connection or try again.',
  tryAgain:'Try again',
  typeInstead:'Use the catalogue',
  paused:'The scanner is unavailable. Use the catalogue to look up the printed ingredients.',
  typeName:'Use the catalogue'
 },
 confirm:{
  title:'Compare with the printed package',
  chosen:(name:string)=>name,
  instruction:'Does this match every active ingredient on your package, with no additional active ingredient?',
  note:'What the AI read · check against your label',
  yes:'Yes, the complete list matches',
  no:'No / I’m unsure',
  exit:'Look for “active ingredients” or “each tablet contains”. If you still can’t read every name, take the box or leaflet to a pharmacist and ask them to check the list with you.',
  retake:'Use another photo',
  typeName:'Use the catalogue',
  unreadable:'We need a clearer ingredient label',
  brandOnly:'The generic ingredient is missing. Turn the package over. The brand name alone is not enough; photograph the composition panel or leaflet.',
  notListed:'This ingredient is outside our catalogue',
  notListedNote:'No match does not mean it is not an antibiotic.',
  notMedicine:'This appears to be a non-medicine product'
 },
 answer:{
  antibiotic:'Antibiotic',
  notAntibiotic:'Not an antibiotic',
  review:'Pharmacist review pending',
  boundary:'A match means the ingredient names you checked appear together in our catalogue. It cannot tell you whether you need this medicine.',
  before:'What would you like to understand?',
  next:'A useful next conversation',
  another:'Reset medicine check',
  sources:'Sources',
  checked:(date:string)=>`Source checked ${date}`,
  cards:{cold:'A cold or flu',leftovers:'Using leftovers',sharing:'Sharing a medicine',prescribed:'My own prescription',missedEffects:'A missed dose, side effects or other medicines',general:'Understand this medicine'}
 },
 find:{
  title:'Medicine catalogue',
  search:'Ingredient, brand or NAFDAC number',
  antibiotic:'Antibiotic',
  notAntibiotic:'Non-antibiotic',
  none:'No entries match this search. Try the generic ingredient printed on the package or ask a pharmacist.',
  all:'Browse catalogue',
  note:'28 sourced records · No brand or authenticity verification'
 },
 footer:{how:'How it works',pilot:'For pharmacists and testers',sources:'Sources'},
 sources:{title:'Sources',intro:'Every public source ResistGuard links to.',medicines:'Medicine information',guidance:'Antibiotic guidance',catalogue:'Browse catalogue'}
} as const;
