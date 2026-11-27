// Antibiogram check: plain rules, no AI, nothing stored.
// Priority levels follow the WHO Bacterial Priority Pathogens List 2024. Multidrug and extensively drug resistant follow
// Magiorakos et al. (ECDC and CDC definitions, 2012). Expected (intrinsic) resistance follows EUCAST Expected Resistant
// Phenotypes v1.2. These rules are a demo subset and have not yet been checked line by line against those documents.

export type Result='S'|'I'|'R';
export type OrganismId='escherichia-coli'|'klebsiella-pneumoniae'|'staphylococcus-aureus'|'pseudomonas-aeruginosa'|'acinetobacter-baumannii'|'salmonella-typhi'|'enterococcus-faecium';
export type AntibioticId=keyof typeof antibiotics;
export type Antibiogram={organism:OrganismId;results:Partial<Record<AntibioticId,Result>>};
export type Flag={level:'critical'|'high'|'review'|'info';title:string;detail:string};

export const antibiotics={
 'ampicillin':{name:'Ampicillin',class:'Penicillins'},
 'penicillin':{name:'Penicillin G',class:'Penicillins'},
 'amoxicillin-clavulanate':{name:'Amoxicillin-clavulanate',class:'Penicillins with a beta-lactamase inhibitor'},
 'ampicillin-sulbactam':{name:'Ampicillin-sulbactam',class:'Penicillins with a beta-lactamase inhibitor'},
 'piperacillin-tazobactam':{name:'Piperacillin-tazobactam',class:'Penicillins with a beta-lactamase inhibitor'},
 'oxacillin':{name:'Oxacillin',class:'Anti-staphylococcal beta-lactams'},
 'cefoxitin':{name:'Cefoxitin screen',class:'Anti-staphylococcal beta-lactams'},
 'cefotaxime':{name:'Cefotaxime',class:'Cephalosporins'},
 'ceftriaxone':{name:'Ceftriaxone',class:'Cephalosporins'},
 'ceftazidime':{name:'Ceftazidime',class:'Cephalosporins'},
 'cefepime':{name:'Cefepime',class:'Cephalosporins'},
 'ertapenem':{name:'Ertapenem',class:'Carbapenems'},
 'imipenem':{name:'Imipenem',class:'Carbapenems'},
 'meropenem':{name:'Meropenem',class:'Carbapenems'},
 'ciprofloxacin':{name:'Ciprofloxacin',class:'Fluoroquinolones'},
 'gentamicin':{name:'Gentamicin',class:'Aminoglycosides'},
 'tobramycin':{name:'Tobramycin',class:'Aminoglycosides'},
 'amikacin':{name:'Amikacin',class:'Aminoglycosides'},
 'trimethoprim-sulfamethoxazole':{name:'Trimethoprim-sulfamethoxazole',class:'Folate pathway inhibitors'},
 'nitrofurantoin':{name:'Nitrofurantoin',class:'Nitrofurans'},
 'chloramphenicol':{name:'Chloramphenicol',class:'Phenicols'},
 'azithromycin':{name:'Azithromycin',class:'Macrolides'},
 'erythromycin':{name:'Erythromycin',class:'Macrolides'},
 'clindamycin':{name:'Clindamycin',class:'Lincosamides'},
 'tetracycline':{name:'Tetracycline',class:'Tetracyclines'},
 'minocycline':{name:'Minocycline',class:'Tetracyclines'},
 'vancomycin':{name:'Vancomycin',class:'Glycopeptides'},
 'linezolid':{name:'Linezolid',class:'Oxazolidinones'},
 'colistin':{name:'Colistin',class:'Polymyxins'}
} as const;

const enterobacterales=['escherichia-coli','klebsiella-pneumoniae','salmonella-typhi'];
export const organisms:Record<OrganismId,{name:string;panel:AntibioticId[];expectedResistant:AntibioticId[]}>={
 'escherichia-coli':{name:'Escherichia coli',expectedResistant:[],
  panel:['ampicillin','amoxicillin-clavulanate','piperacillin-tazobactam','cefotaxime','ceftriaxone','ceftazidime','cefepime','ertapenem','meropenem','ciprofloxacin','gentamicin','amikacin','trimethoprim-sulfamethoxazole','nitrofurantoin']},
 'klebsiella-pneumoniae':{name:'Klebsiella pneumoniae',expectedResistant:['ampicillin'],
  panel:['ampicillin','amoxicillin-clavulanate','piperacillin-tazobactam','cefotaxime','ceftriaxone','ceftazidime','cefepime','ertapenem','meropenem','ciprofloxacin','gentamicin','amikacin','trimethoprim-sulfamethoxazole']},
 'staphylococcus-aureus':{name:'Staphylococcus aureus',expectedResistant:[],
  panel:['cefoxitin','oxacillin','penicillin','erythromycin','clindamycin','tetracycline','trimethoprim-sulfamethoxazole','gentamicin','ciprofloxacin','vancomycin','linezolid']},
 'pseudomonas-aeruginosa':{name:'Pseudomonas aeruginosa',
  expectedResistant:['ampicillin','amoxicillin-clavulanate','ampicillin-sulbactam','cefotaxime','ceftriaxone','ertapenem','trimethoprim-sulfamethoxazole','tetracycline','chloramphenicol'],
  panel:['piperacillin-tazobactam','ceftazidime','cefepime','ceftriaxone','imipenem','meropenem','ciprofloxacin','tobramycin','amikacin','trimethoprim-sulfamethoxazole','colistin']},
 'acinetobacter-baumannii':{name:'Acinetobacter baumannii',expectedResistant:['ampicillin','amoxicillin-clavulanate','ertapenem','chloramphenicol'],
  panel:['ampicillin-sulbactam','piperacillin-tazobactam','ceftazidime','cefepime','imipenem','meropenem','ciprofloxacin','gentamicin','amikacin','trimethoprim-sulfamethoxazole','minocycline','colistin']},
 'salmonella-typhi':{name:'Salmonella Typhi',expectedResistant:[],
  panel:['ampicillin','chloramphenicol','trimethoprim-sulfamethoxazole','ciprofloxacin','ceftriaxone','azithromycin']},
 'enterococcus-faecium':{name:'Enterococcus faecium',expectedResistant:['cefotaxime','ceftriaxone','ceftazidime','cefepime'],
  panel:['ampicillin','vancomycin','linezolid','ciprofloxacin','nitrofurantoin','tetracycline']}
};

const notSusceptible=(r?:Result)=>r==='I'||r==='R';
const any=(a:Antibiogram,ids:AntibioticId[])=>ids.some(id=>notSusceptible(a.results[id]));
const carbapenems:AntibioticId[]=['ertapenem','imipenem','meropenem'];
const thirdGen:AntibioticId[]=['cefotaxime','ceftriaxone','ceftazidime'];

// Classes tested and classes with at least one non-susceptible result. Expected resistance is left out, as in the ECDC and CDC definitions.
export function classCounts(a:Antibiogram){
 const expected=organisms[a.organism].expectedResistant;
 const tested=new Map<string,boolean>();
 for(const [id,result] of Object.entries(a.results) as [AntibioticId,Result][]){
  if(!result||expected.includes(id))continue;
  const name=antibiotics[id].class;
  tested.set(name,(tested.get(name)??false)||notSusceptible(result));
 }
 const resistant=[...tested].filter(([,ns])=>ns).map(([name])=>name);
 return {tested:tested.size,resistant,susceptible:tested.size-resistant.length};
}

export function isMrsa(a:Antibiogram){return a.organism==='staphylococcus-aureus'&&any(a,['oxacillin','cefoxitin']);}

export function checkAntibiogram(a:Antibiogram):{flags:Flag[];resistantClasses:string[];testedClasses:number;steps:string[]}{
 const flags:Flag[]=[];
 const organism=organisms[a.organism];
 const counts=classCounts(a);
 const enterobacterale=enterobacterales.includes(a.organism);
 // WHO priority patterns
 if(enterobacterale&&any(a,carbapenems))flags.push({level:'critical',title:'Carbapenem-resistant Enterobacterales',detail:'WHO critical priority. Carbapenems are last-line antibiotics for these bacteria.'});
 else if(enterobacterale&&any(a,thirdGen))flags.push({level:'critical',title:'Third-generation cephalosporin-resistant Enterobacterales',detail:'WHO critical priority. Carbapenems still test susceptible, so this may be an ESBL producer. Confirm with an ESBL test.'});
 if(a.organism==='acinetobacter-baumannii'&&any(a,carbapenems))flags.push({level:'critical',title:'Carbapenem-resistant Acinetobacter baumannii',detail:'WHO critical priority.'});
 if(a.organism==='pseudomonas-aeruginosa'&&any(a,carbapenems))flags.push({level:'high',title:'Carbapenem-resistant Pseudomonas aeruginosa',detail:'WHO high priority.'});
 if(isMrsa(a))flags.push({level:'high',title:'Methicillin-resistant Staphylococcus aureus (MRSA)',detail:'WHO high priority. Oxacillin or the cefoxitin screen tests resistant.'});
 if(a.organism==='staphylococcus-aureus'&&notSusceptible(a.results.vancomycin))flags.push({level:'review',title:'Vancomycin non-susceptible Staphylococcus aureus',detail:'This is very rare. Confirm the identification and the result at a reference laboratory before release.'});
 if(a.organism==='enterococcus-faecium'&&notSusceptible(a.results.vancomycin))flags.push({level:'high',title:'Vancomycin-resistant Enterococcus faecium',detail:'WHO high priority.'});
 if(a.organism==='salmonella-typhi'&&notSusceptible(a.results.ciprofloxacin))flags.push({level:'high',title:'Fluoroquinolone-resistant Salmonella Typhi',detail:'WHO high priority.'});
 // Typhoid has its own standard definitions
 const typhoidMdr=a.organism==='salmonella-typhi'&&(['ampicillin','chloramphenicol','trimethoprim-sulfamethoxazole'] as AntibioticId[]).every(id=>notSusceptible(a.results[id]));
 if(typhoidMdr){
  const xdr=notSusceptible(a.results.ciprofloxacin)&&notSusceptible(a.results.ceftriaxone);
  flags.push(xdr
   ?{level:'critical',title:'Extensively drug-resistant typhoid',detail:'Resistant to ampicillin, chloramphenicol, trimethoprim-sulfamethoxazole, fluoroquinolones and third-generation cephalosporins.'}
   :{level:'high',title:'Multidrug-resistant typhoid',detail:'Resistant to ampicillin, chloramphenicol and trimethoprim-sulfamethoxazole.'+(a.results.ceftriaxone==='S'?' Ceftriaxone still tests susceptible, so this is not extensively drug resistant.':'')});
 }
 // Multidrug and extensively drug resistant (ECDC and CDC definitions), judged on the classes tested
 if(!typhoidMdr){
  const xdrPossible=counts.tested>=7&&counts.susceptible<=2;
  if(xdrPossible)flags.push({level:'critical',title:'Extensively drug resistant',detail:`Non-susceptible in ${counts.resistant.length} of ${counts.tested} classes tested. Only ${counts.susceptible===0?'no class':counts.susceptible===1?'1 class':'2 classes'} still tests susceptible.`});
  else if(counts.resistant.length>=3||isMrsa(a))flags.push({level:'high',title:'Multidrug resistant',detail:isMrsa(a)?'MRSA always counts as multidrug resistant.':`Non-susceptible in ${counts.resistant.length} classes. The standard threshold is 3 or more.`+(counts.tested<7?' Too few classes were tested to judge extensive resistance.':'')});
 }
 // Results that contradict expected resistance
 for(const id of organism.expectedResistant){
  const result=a.results[id];
  if(result==='S'||result==='I')flags.push({level:'review',title:`Check the ${antibiotics[id].name.toLowerCase()} result`,detail:`${organism.name} is naturally resistant to ${antibiotics[id].name.toLowerCase()}, so "${result}" is unexpected. Check the identification and repeat the test before release.`});
 }
 const priority=flags.some(f=>f.level==='critical'||f.level==='high');
 const review=flags.some(f=>f.level==='review');
 const steps=[
  ...(review?['Recheck the flagged results before you release this report.']:[]),
  ...(priority?['Tell your infection prevention and control team today.','Send the isolate to a reference laboratory to confirm the resistance.','Report it through your national antimicrobial resistance surveillance contact at NCDC.']:[]),
  ...(!priority&&!review?['No priority pattern in the antibiotics tested. Report as usual.']:[])
 ];
 return {flags,resistantClasses:counts.resistant,testedClasses:counts.tested,steps};
}

// Screen text for the lab page.
export const labCopy={
 eyebrow:'For lab scientists and doctors',
 title:'Check an antibiogram for',
 titleEm:'dangerous resistance',
 lead:'Choose the bacterium and enter each result. ResistGuard flags WHO priority resistance, multidrug resistance and results that should not be possible.',
 organism:'Bacterium',
 sample:'Load a sample sheet',
 samplePlaceholder:'Choose a fictional sample',
 results:'Results',
 notTested:'Not tested',
 clear:'Clear results',
 findings:'What this result shows',
 empty:'Enter at least one result to see the check.',
 classes:(resistant:number,tested:number)=>`Non-susceptible in ${resistant} of ${tested} antibiotic classes tested.`,
 next:'Next steps',
 limits:'Demo. These rules follow the WHO Bacterial Priority Pathogens List 2024, the ECDC and CDC multidrug resistance definitions and EUCAST expected resistant phenotypes, but have not been checked line by line. Confirm every result with your lab’s own standards. ResistGuard does not choose a treatment and stores nothing.',
 levels:{critical:'WHO critical',high:'High priority',review:'Check result',info:'Note'}
};

// The eight fictional sheets from the sample antibiogram page, for demos and tests.
export const sampleAntibiograms:{id:string;label:string;antibiogram:Antibiogram}[]=[
 {id:'1',label:'Sheet 1 · E. coli, urine',antibiogram:{organism:'escherichia-coli',results:{'ampicillin':'R','amoxicillin-clavulanate':'S','ceftriaxone':'S','ciprofloxacin':'S','gentamicin':'S','nitrofurantoin':'S','trimethoprim-sulfamethoxazole':'R'}}},
 {id:'2',label:'Sheet 2 · Klebsiella, blood',antibiogram:{organism:'klebsiella-pneumoniae',results:{'ampicillin':'S','amoxicillin-clavulanate':'R','ceftriaxone':'R','ceftazidime':'R','meropenem':'R','ciprofloxacin':'R','gentamicin':'R','trimethoprim-sulfamethoxazole':'R'}}},
 {id:'3',label:'Sheet 3 · S. aureus, wound',antibiogram:{organism:'staphylococcus-aureus',results:{'cefoxitin':'R','oxacillin':'R','penicillin':'R','erythromycin':'R','clindamycin':'S','tetracycline':'R','trimethoprim-sulfamethoxazole':'S','gentamicin':'S','vancomycin':'S','linezolid':'S'}}},
 {id:'4',label:'Sheet 4 · E. coli, urine',antibiogram:{organism:'escherichia-coli',results:{'ampicillin':'R','amoxicillin-clavulanate':'I','cefotaxime':'R','ceftriaxone':'R','ceftazidime':'R','meropenem':'S','ciprofloxacin':'R','gentamicin':'S','nitrofurantoin':'S'}}},
 {id:'5',label:'Sheet 5 · Pseudomonas, aspirate',antibiogram:{organism:'pseudomonas-aeruginosa',results:{'piperacillin-tazobactam':'R','ceftazidime':'R','cefepime':'R','ceftriaxone':'S','imipenem':'R','meropenem':'R','ciprofloxacin':'R','tobramycin':'S','amikacin':'S','trimethoprim-sulfamethoxazole':'S','colistin':'S'}}},
 {id:'6',label:'Sheet 6 · Acinetobacter, blood',antibiogram:{organism:'acinetobacter-baumannii',results:{'ampicillin-sulbactam':'R','piperacillin-tazobactam':'R','ceftazidime':'R','cefepime':'R','imipenem':'R','meropenem':'R','ciprofloxacin':'R','gentamicin':'R','amikacin':'R','trimethoprim-sulfamethoxazole':'R','minocycline':'R','colistin':'S'}}},
 {id:'7',label:'Sheet 7 · Salmonella Typhi, blood',antibiogram:{organism:'salmonella-typhi',results:{'ampicillin':'R','chloramphenicol':'R','trimethoprim-sulfamethoxazole':'R','ciprofloxacin':'R','ceftriaxone':'S','azithromycin':'S'}}}
];
