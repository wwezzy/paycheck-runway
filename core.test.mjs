import {test} from 'node:test';import assert from 'node:assert/strict';import {forecast,addDays,validateParsed} from './public/core.js';
test('predicts real shortfall before paycheck',()=>{const r=forecast(1000,[{label:'rent',type:'expense',amount:800,date:'2026-11-16'},{label:'insurance',type:'expense',amount:250,date:'2026-11-18'},{label:'pay',type:'income',amount:600,date:'2026-11-21'}],'2026-11-14');assert.equal(r.find(x=>x.balance<0).date,'2026-11-18');assert.equal(r[7].balance,550)});
test('delay shifts income only',()=>{const r=forecast(0,[{label:'pay',type:'income',amount:100,date:'2026-11-14'}],'2026-11-14',3,2);assert.deepEqual(r.map(x=>x.balance),[0,0,100])});
test('cent arithmetic',()=>assert.equal(forecast(.1,[{label:'x',type:'income',amount:.2,date:'2026-11-14'}],'2026-11-14',1)[0].balance,.3));
test('crosses month boundary',()=>assert.equal(addDays('2026-11-30',2),'2026-12-02'));
test('rejects impossible date and unknown type',()=>{assert.throws(()=>validateParsed({items:[{label:'x',type:'expense',amount:2,date:'2026-02-30'}]}));assert.throws(()=>validateParsed({items:[{label:'x',type:'other',amount:2,date:'2026-02-20'}]}))});
