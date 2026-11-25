// "How it works" page: short fixed answers that used to be the Ask ResistGuard presets.
// Plain data only, so tests and the review packet can read it.
import {getPassage} from '@/lib/use-check';
export type HowItWorksAnswer={id:string;question:string;text:string;sources:{name:string;url:string}[];catalogue?:boolean};
const amr=getPassage('amr');
export const howItWorks={
 title:'How it works',
 intro:'Short answers about reading a medicine label and using antibiotics responsibly.',
 footer:'For diagnosis, treatment or personal suitability, speak to a pharmacist or clinician.',
 answers:[
  {id:'scan',question:'How do I photograph the label?',text:'Turn the pack so the ingredient line is horizontal. Use even light and keep the entire ingredient line in frame. If glare hides a word, tilt the pack and try again.',sources:[]},
  {id:'registry',question:'What does a NAFDAC number tell me?',text:'It points to a product record in the Greenbook. In Catalogue, search the number and compare the complete ingredient list with the pack.',sources:[{name:'NAFDAC Greenbook',url:'https://greenbook.nafdac.gov.ng/'}],catalogue:true},
  {id:'amr',question:'Why does responsible antibiotic use matter?',text:amr.text,sources:[{name:amr.reference.name,url:amr.reference.url}]}
 ]
} as const satisfies {title:string;intro:string;footer:string;answers:readonly HowItWorksAnswer[]};
