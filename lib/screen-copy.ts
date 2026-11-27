// Every label, heading, button and state on the check flow. Redesign v3 wording is noted where it replaced the revamp spec (REVAMP_SPEC.md, now in Git history).
// Medical body text stays in lib/safety.ts and data/.
import {medicines} from '@/lib/safety';
const lowerFirst=(name:string)=>name.charAt(0).toLowerCase()+name.slice(1);
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
  changeCrop:'Crop and zoom',
  cropTitle:'Crop and zoom your photo',
  cropHint:'Drag the frame or its corners. Keep the full ingredient list in view.',
  cropMove:'Move crop frame',
  cropCorner:{nw:'Resize top left',ne:'Resize top right',sw:'Resize bottom left',se:'Resize bottom right'},
  cropZoom:'Zoom',
  cropPreview:'Crop preview',
  cropReset:'Reset crop',
  cropApply:'Apply crop',
  cropCancel:'Cancel',
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
  privacy:'You can choose whether to send your answers for guidance.',
  prescription:'Did a doctor prescribe this medicine for you for this illness?',
  otherMedicines:'Do you take other medicines, vitamins, or herbal products?',
  medicineName:'Find or type the name on the pack',
  addMedicine:'Add medicine',
  remove:'Remove',
  removeMedicine:(name:string)=>`Remove ${name}`,
  unsureAboutNames:'I’m not sure of all the names',
  yes:'Yes',
  no:'No',
  continue:'Continue',
  guidanceConsent:'Groq will get your answers and medicine names to choose follow-up questions.',
  guidance:'Continue with Groq',
  localGuidance:'Continue without Groq'
 },
 followUp:{
  title:'A few more questions',
  loading:'Choosing questions for your medicine and answers…',
  yes:'Yes',no:'No',unsure:'Not sure',optional:'Optional',
  consent:'Choose See my result to send these answers and any details you add to Groq.',
  finish:'See my result'
 },
 answer:{
  antibiotic:'This is an antibiotic',
  notAntibiotic:'This is not an antibiotic',
  review:'Not yet reviewed by a pharmacist',
  boundary:"This tells you what's in the pack. Only a pharmacist or doctor can tell you if you need it.",
  yourAnswers:'Your answers',
  reason:'Reason for taking it',
  prescription:'Prescribed for this illness',
  otherMedicines:'Other medicines',
  noOtherMedicines:'None',
  unsureAboutNames:'Some names may be missing.',
  asTyped:'As typed',
  guidance:'What to know about your check',
  guidancePending:'Groq is writing your result from your answers and the sources…',
  guidanceFallback:'The AI explanation wasn’t available.',
  guidanceBusy:'Groq reached a request limit.',
  status:{concern:'Something to discuss',more_information:'More information needed',no_concern:'No concerns flagged by these checks'},
  reportedPrescription:{
   yes:'You said a doctor prescribed this medicine for this illness.',
   no:'A doctor didn’t prescribe this medicine for these symptoms.'
  },
  reportedAssessment:{
   yes:'You said a doctor or pharmacist already checked your symptoms.',
   no:'You said a clinician has not checked your symptoms yet.',
   unsure:'You’re unsure whether a clinician has checked your symptoms.'
  },
  gap:{
   reason_missing:'We still need to know why you are taking the medicine.',
   reason_evidence:'The available sources do not cover the full reason you entered.',
   other_medicines:'We could not check all the medicines or combinations you listed.',
   condition:'This check can’t tell how the conditions you reported affect this medicine.',
   assessment:'Ask a doctor whether this medicine fits the reason you entered.',
   unanswered:(question:string)=>`This question needs an answer. ${question}`,
   unsure:(question:string)=>`You answered “Not sure” to this question. ${question}`
  },
  checks:{
   'penicillin-reaction':'past reactions to penicillin','prior-reaction':'past reactions to this medicine',
   'long-term-condition':'long-term health conditions','stomach-ulcer':'stomach ulcers',asthma:'asthma',
   'kidney-or-liver':'kidney or liver conditions','co-amoxiclav-liver-reaction':'past jaundice or liver problems after co-amoxiclav','paracetamol-overlap':'other medicines containing paracetamol',
   pregnancy:'pregnancy',other:'other medicines'
  } as Record<string,string>,
  scope:(checks:string)=>`This result covers your answers about ${checks}.`,
  prescriberConcern:'Tell your doctor what was flagged above and ask how it affects your prescription.',
  reportedConditions:'Conditions you reported',
  reasonNotCovered:(reason:string)=>`The sources we checked can’t tell us whether this medicine would help with what you reported: “${reason}”.`,
  prescriberAction:'Ask the doctor who prescribed it',
  prescriberConditions:'Tell your doctor about the conditions listed above. Ask what the medicine is meant to treat and whether those conditions affect the plan.',
  reasonCoverage:(topics:string)=>`The sources used in this check do not cover ${topics}.`,
  statusNote:{
   concern:'Your answers or the source records flagged something to discuss.',
   no_concern:'This result covers the follow-up questions and other medicines you answered about.'
  },
  nextAction:{
   prescriber:'If you have questions, ask the doctor who prescribed it',
   previous_clinician:'Ask a doctor about your symptoms',
   doctor:'Talk to a doctor',
   pharmacist:'Ask a pharmacist about your other medicines'
  },
  nextActionFallback:{
   prescriber:'If your instructions are unclear, ask what the medicine was prescribed for and how it fits your treatment plan.',
   previous_clinician:'Tell the doctor what symptoms you have and which medicine you’re considering. Ask whether you need it.',
   doctor:'Tell the doctor why you are considering this medicine and share any other medicines or reactions you reported.',
   pharmacist:'Show the pharmacist the packs for the medicines you take and ask them to check how they may interact.'
  },
  catalogue:'Medicine record',
  activeIngredients:'Active ingredients',
  supporting:'Supporting sources',
  guidanceRetry:'Try Groq again',
  catalogueClassification:'Catalogue classification',
  matchedFrom:(name:string)=>`Matched from ${name}`,
  checkMatch:'Compare these ingredients with the pack before choosing a match.',
  useMatch:(name:string)=>`Use ${name}`,
  another:'Check another medicine',
  checked:(date:string)=>`Sources checked on ${date}`
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
