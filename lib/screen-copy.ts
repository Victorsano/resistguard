// Every label, heading, button and state on the check flow. Redesign v3 wording is noted where it replaced the revamp spec (REVAMP_SPEC.md, now in Git history).
// Medical body text stays in lib/safety.ts and data/.
import {medicines} from '@/lib/safety';
const lowerFirst=(name:string)=>name.charAt(0).toLowerCase()+name.slice(1);
export const reasonLabels={
 cold:'Cold, flu or runny nose',
 throat:'Sore throat',
 cough:'Cough',
 fever:'Fever',
 typhoid:'Suspected typhoid',
 diarrhoea:'Diarrhoea',
 urine:'Pain when passing urine',
 skin:'Wound or boil',
 dental:'Tooth pain',
 pain:'Other pain'
} as const;
export const copy={
 back:'Back',
 home:{
  // Redesign v3: approved Tool Home heading and lead. The one emphasised word is titleEm.
  title:'What are you about to take?',
  titleEm:'take',
  subline:"Snap the label or type the name. We'll tell you if it's an antibiotic.",
  scan:'Scan your medicine',
  upload:'Upload a photo',
  search:'Type a name, like amoxicillin or Emzoclox',
  example:'See an example',
  trust:"You confirm what AI reads. It's free, and you don't need an account."
 },
 photo:{
  title:'Check your photo',
  retake:'Retake',
  another:'Choose another',
  preparing:'Getting your photo ready…',
  tips:['The whole ingredient list is in view','No glare or blur','No names or addresses'],
  consent:"I agree to send this photo to Groq, our AI provider, to read the ingredients. ResistGuard doesn't keep it.",
  consentLink:'How your photo is handled',
  read:'Read the label',
  loading:'Reading your label…',
  loadingNote:'This usually takes under 20 seconds.',
  checking:'Checking that photo reading is on…',
  timeout:'That took too long.',
  tryAgain:'Try again',
  typeInstead:'Type the name instead',
  paused:'Photo reading is paused right now. Type the medicine name instead.',
  typeName:'Type the name'
 },
 confirm:{
  title:'Is this what your pack says?',
  chosen:(name:string)=>`You chose ${lowerFirst(name)}`,
  instruction:'Look at your pack. Does it list these, and nothing more?',
  note:'AI read this from your photo. You have the final say.',
  yes:"Yes, that's it",
  no:"No, or I'm not sure",
  exitTitle:'No problem.',
  exitBody:'Try a clearer photo, or show the pack to a pharmacist.',
  retake:'Retake photo',
  typeName:'Type the name',
  unreadable:"We couldn't read the label clearly.",
  brandTitle:'We need the ingredient list, not just the brand.',
  brandBody:"Turn the pack over and look for 'Each capsule contains' or 'Composition'.",
  notListed:"We don't have this medicine yet.",
  notListedNote:"That doesn't mean it isn't an antibiotic. Ask a pharmacist before you take it.",
  notMedicineTitle:"This doesn't look like a medicine.",
  notMedicineBody:'Scan the ingredient list on a medicine pack.'
 },
 questions:{
  reason:'Why are you taking this medicine?',
  reasonLabel:'Your reason (optional)',
  privacy:'Your answers stay in this browser.',
  prescription:'Was it prescribed for you?',
  otherMedicines:'Are you taking any other medicines?',
  medicineName:'Name on the pack',
  addMedicine:'Add medicine',
  remove:'Remove',
  removeMedicine:(name:string)=>`Remove ${name}`,
  unsureAboutNames:'I’m not sure of all the names',
  yes:'Yes',
  no:'No',
  continue:'Continue'
 },
 reviewDetails:{
  title:'Confirm what you entered',
  typed:'You typed',
  reason:'Choose a reason',
  medicine:(name:string)=>`Choose a match for ${name}`,
  placeholder:'Choose an option',
  suggested:'Suggested reasons',
  otherReasons:'Other reasons',
  keepReason:'Keep my words',
  keepMedicine:'Keep as typed',
  noMatch:'No catalogue match for this name.',
  checkIngredients:'Compare these ingredients with the pack before confirming.',
  confirm:'Confirm and continue'
 },
 answer:{
  antibiotic:'This is an antibiotic',
  notAntibiotic:'This is not an antibiotic',
  review:'Not yet reviewed by a pharmacist',
  boundary:"This tells you what's in the pack. Only a pharmacist or doctor can tell you if you need it.",
  yourAnswers:'Your answers',
  reason:'Reason for taking it',
  prescription:'Prescribed for you',
  otherMedicines:'Other medicines',
  noOtherMedicines:'None',
  unsureAboutNames:'Some names may be missing.',
  asTyped:'As typed',
  interactionNote:'Ask a pharmacist or prescriber about possible interactions.',
  before:'Before you take it',
  next:'Next steps',
  another:'Check another medicine',
  sources:'Where this information comes from',
  checked:(date:string)=>`Sources checked on ${date}`,
  cards:{cold:'I have a cold, flu or cough',leftovers:'These are left over from before',sharing:'Someone gave these to me',prescribed:'A doctor prescribed this for me',missedEffects:'I missed a dose or feel side effects',general:'What can this check tell me?'}
 },
 find:{
  title:'Find by name',
  search:'Type a name, brand or NAFDAC number',
  antibiotic:'Antibiotic',
  notAntibiotic:'Not an antibiotic',
  none:"We don't have that medicine yet. That doesn't mean it isn't an antibiotic. Ask a pharmacist.",
  all:`See all ${medicines.length} medicines`,
  note:'Nothing you type leaves your phone.'
 },
 footer:{how:'How it works',pilot:'For pharmacists and testers',sources:'Sources'},
 camera:{close:'Close'},
 pilot:{eyebrow:'Prepare, review, then invite',formEyebrow:'Optional facilitator tool · Local memory only',title:'A careful pilot.',line2:'Evidence before claims.',line2Em:'claims'},
 sources:{title:'Sources',intro:'Every public source ResistGuard links to.',medicines:'Medicine information',guidance:'Antibiotic guidance'}
} as const;
