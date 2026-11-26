// The hero media slot. Plain functions only, so node:test can import them and the client can use heroMode.
// Put the real files in public/media/ with these names. Nothing is referenced unless the file exists.
export const heroMediaFiles={webm:'/media/hero.webm',mp4:'/media/hero.mp4',poster:'/media/hero-poster.jpg'} as const;
export type HeroMedia={webm?:string;mp4?:string;poster?:string};
export type HeroMode='glow'|'poster'|'video';
export type HeroEnvironment={enabled:boolean;reducedMotion:boolean;saveData?:boolean;effectiveType?:string};

// Keeps only the files that exist. `exists` is passed in so this file stays free of node:fs.
export function availableHeroMedia(exists:(publicPath:string)=>boolean):HeroMedia{
 const media:HeroMedia={};
 for(const key of ['webm','mp4','poster'] as const)if(exists(heroMediaFiles[key]))media[key]=heroMediaFiles[key];
 return media;
}

// The video only plays when NEXT_PUBLIC_HERO_VIDEO=1 and a video file exists.
// Reduced motion, Save-Data and 2G get the still poster. Missing network information is not treated as slow.
// With no usable file the slot is the night ground and its faint glow.
export function heroMode(media:HeroMedia,env:HeroEnvironment):HeroMode{
 if(!env.enabled)return 'glow';
 const light=env.reducedMotion||env.saveData===true||env.effectiveType==='2g'||env.effectiveType==='slow-2g';
 if(!light&&(media.webm||media.mp4))return 'video';
 return media.poster?'poster':'glow';
}
