import {Observation} from './scan';
export function scanRecovery(observation?:Observation){
 if(!observation)return {title:'Choose the ingredient panel',tip:'Find “active ingredient”, “composition” or “each tablet contains” on one package.'};
 if(observation.legibility==='unreadable')return {title:'The text could not be read',tip:'Move closer, clean the lens, hold still and tap the label to focus. Avoid digital zoom.'};
 if(observation.legibility==='partial')return {title:'Part of the label is unclear',tip:'Tilt the package away from reflections. Include every edge of the ingredient panel in one sharp photo.'};
 if(!observation.ingredients.length)return {title:'The generic ingredient is missing',tip:'Turn the package over. The brand name alone is not enough; photograph the composition panel or leaflet.'};
 if(!observation.complete)return {title:'The full list has not been established',tip:'Use one package at a time. Show all active ingredients together; do not crop out a second ingredient.'};
 return {title:'Check the transcription',tip:'Compare every active ingredient with the package. A similar name or a partial combination is not a match.'};
}
