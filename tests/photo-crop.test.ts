import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjustPhotoCrop,fullPhotoCrop,photoCropPixels,zoomPhotoCrop} from '../lib/image';

test('zoom selects a smaller centered area and returns to the whole photo',()=>{
 const crop=zoomPhotoCrop(fullPhotoCrop,2);
 assert.deepEqual(crop,{x:.25,y:.25,width:.5,height:.5});
 assert.deepEqual(zoomPhotoCrop(crop,1),fullPhotoCrop);
 assert.deepEqual(photoCropPixels(crop,4000,2000),{x:1000,y:500,width:2000,height:1000});
});

test('dragging crop edges and moving the frame stay within the source image',()=>{
 const crop=adjustPhotoCrop(fullPhotoCrop,'se',-.25,-.5);
 assert.deepEqual(crop,{x:0,y:0,width:.75,height:.5});
 assert.deepEqual(adjustPhotoCrop(crop,'move',2,-2),{x:.25,y:0,width:.75,height:.5});
 assert.deepEqual(adjustPhotoCrop(crop,'nw',2,2),{x:.625,y:.375,width:.125,height:.125});
});

test('crop pixels are rounded and never extend past the source image',()=>{
 assert.deepEqual(photoCropPixels({x:.5,y:.5,width:.5,height:.5},3,5),{x:2,y:3,width:1,height:2});
 assert.deepEqual(photoCropPixels(fullPhotoCrop,1,1),{x:0,y:0,width:1,height:1});
});
