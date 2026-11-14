import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planStore} from './public/storage.js';
import {validateParsed} from './public/core.js';
const item={label:'Fictional bill',type:'expense',amount:1,date:'2026-11-14'};
const plan=n=>({items:Array.from({length:n},()=>({...item})),balance:'1000',start:'2026-11-14'});
function memory(raw=null){return {raw,getItem(){return this.raw},setItem(k,v){this.raw=v},removeItem(){this.raw=null}}}
test('reproduces old AI validator rejection beyond 40, while saved plans roundtrip 41 and 100 entries',()=>{
 assert.throws(()=>validateParsed(plan(41)));
 for(const n of [41,100]){const s=memory();planStore(s).save(plan(n));assert.deepEqual(planStore(s).load(),plan(n))}
});
test('unreadable saved data survives load and subsequent render save attempts byte-for-byte',()=>{
 for(const raw of ['{broken',JSON.stringify({...plan(2),start:'bad'}),JSON.stringify({...plan(2),balance:null}),JSON.stringify({...plan(2),items:[{}]})]){
 const s=memory(raw),store=planStore(s);assert.throws(()=>store.load());assert.throws(()=>store.save(plan(0)));assert.equal(s.raw,raw);
 }
});
test('explicit clear unlocks saving after failed load',()=>{
 const s=memory('broken'),store=planStore(s);assert.throws(()=>store.load());store.clear();store.save(plan(1));assert.deepEqual(store.load(),plan(1));
});
test('invalid editing state does not overwrite last valid plan',()=>{
 const s=memory(JSON.stringify(plan(1))),store=planStore(s);store.load();const old=s.raw;
 assert.throws(()=>store.save({...plan(2),start:''}));assert.equal(s.raw,old);
});
test('storage access and quota failures are surfaced rather than silently discarded',()=>{
 const store=planStore({getItem(){throw Error('denied')},setItem(){throw Error('quota')},removeItem(){throw Error('denied')}});
 assert.throws(()=>store.load());assert.throws(()=>store.save(plan(1)));assert.throws(()=>store.clear());
 const s=planStore({getItem(){return null},setItem(){throw Error('quota')}});assert.equal(s.load(),null);assert.throws(()=>s.save(plan(1)),/quota/);
});
