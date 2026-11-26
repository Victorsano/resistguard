import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {availableHeroMedia,heroMode,heroMediaFiles} from '../lib/hero-media';

const all={webm:heroMediaFiles.webm,mp4:heroMediaFiles.mp4,poster:heroMediaFiles.poster};
const on={enabled:true,reducedMotion:false};

test('hero media only references files that exist',()=>{
 assert.deepEqual(availableHeroMedia(()=>false),{});
 assert.deepEqual(availableHeroMedia(path=>path===heroMediaFiles.poster),{poster:heroMediaFiles.poster});
 const real=availableHeroMedia(path=>existsSync(join(process.cwd(),'public',path)));
 for(const path of Object.values(real))assert.ok(existsSync(join(process.cwd(),'public',path!)));
});

test('the video plays only when switched on and a video file exists',()=>{
 assert.equal(heroMode(all,{enabled:false,reducedMotion:false}),'glow');
 assert.equal(heroMode(all,on),'video');
 assert.equal(heroMode({mp4:heroMediaFiles.mp4},on),'video');
 assert.equal(heroMode({},on),'glow');
 assert.equal(heroMode({poster:heroMediaFiles.poster},on),'poster');
});

test('reduced motion, Save-Data and 2G get the poster, and unknown networks are not treated as slow',()=>{
 assert.equal(heroMode(all,{...on,reducedMotion:true}),'poster');
 assert.equal(heroMode(all,{...on,saveData:true}),'poster');
 assert.equal(heroMode(all,{...on,effectiveType:'2g'}),'poster');
 assert.equal(heroMode(all,{...on,effectiveType:'slow-2g'}),'poster');
 assert.equal(heroMode(all,{...on,effectiveType:undefined,saveData:undefined}),'video');
 assert.equal(heroMode({webm:heroMediaFiles.webm},{...on,saveData:true}),'glow');
});
