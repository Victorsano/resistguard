import {Observation} from './scan';
export function scanRecovery(observation?:Observation){
 if(!observation)return {title:'Choose the ingredient panel',tip:'Find “active ingredient”, “composition” or “each tablet contains” on one package.'};
 if(observation.legibility==='unreadable')return {title:'The text could not be read',tip:'Move closer, clean the lens, hold still and tap the label to focus. Avoid digital zoom.'};
 if(observation.legibility==='partial')return {title:'Part of the label is unclear',tip:'Rotate the pack so the ingredient line is horizontal. Turn off flash, use even light and tilt foil away from reflections. Keep the full line in frame.'};
 if(!observation.ingredients.length)return {title:'The generic ingredient is missing',tip:'Turn the package over. The brand name alone is not enough; photograph the composition panel or leaflet.'};
 if(!observation.complete)return {title:'The full list has not been established',tip:'Show the entire active-ingredient section of one package, including its heading and last ingredient. The brand name is optional.'};
 return {title:'Check the transcription',tip:'Compare every active ingredient with the package. A similar name or a partial combination is not a match.'};
}
