// Every word on the landing page, from the approved Redesign v3 copy. Display text uses typographic apostrophes.
export const landing={
 eyebrow:'AI medicine check · Made for Nigeria',
 // First headline line breaks after "swallow"; "guess" is the one emphasised word.
 line1:{before:'Don’t swallow',after:'a',em:'guess',end:'.'},
 line2:'Know what’s in the pack before you take it.',
 lead:'Snap the label. Our AI tells you if it’s an antibiotic, and a pharmacist is one tap away.',
 cta:'Check my medicine',
 example:'See an example',
 stakes:'The antibiotic you misuse today may fail you tomorrow.',
 stat:{figure:'1 in 10',text:'Antimicrobials in low- and middle-income countries are estimated to be fake or substandard.',source:{label:'Nature Communications, 2023',url:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10547756/'}},
 howTitle:'How it works',
 features:[
  {id:'label',title:'Read the label',text:'Photograph the ingredient list. Nothing shows until you confirm what AI read.'},
  {id:'pharmacist',title:'Ask a pharmacist',text:'One tap opens WhatsApp with your question already written. No photo. No name.'},
  {id:'pack',title:'Check the pack',text:'We point you to NAFDAC’s own checks. We don’t claim to spot fakes.'},
  {id:'privacy',title:'Your privacy',text:'Your photo goes only to the label reader and isn’t kept. Typing a name sends nothing.'}
 ],
 research:{
  title:'For labs and researchers',
  lead:'Resistance is caught in the lab. Photograph an antibiogram and ResistGuard flags the results that need action.',
  features:[
   {id:'read',title:'Read the lab report',text:'Photograph a printed or handwritten antibiogram. Check what AI read before you rely on it.'},
   {id:'flag',title:'Flag priority resistance',text:'WHO priority pathogens, multidrug resistance and results that should not be possible.'},
   {id:'record',title:'Keep the record',text:'Save each result as a spreadsheet file for your lab records. ResistGuard keeps nothing.'}
  ],
  cta:'Check an antibiogram'
 },
 closing:{text:'Not sure? Ask before you swallow.',em:'Ask'},
 honesty:'Not yet reviewed by a pharmacist.'
} as const;
