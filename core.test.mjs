import {test} from 'node:test';import assert from 'node:assert/strict';import {forecast,addDays,validateParsed} from './public/core.js';
test('predicts real shortfall before paycheck',()=>{const r=forecast(1000,[{label:'rent',type:'expense',amount:800,date:'2026-11-16'},{label:'insurance',type:'expense',amount:250,date:'2026-11-18'},{label:'pay',type:'income',amount:600,date:'2026-11-21'}],'2026-11-14');assert.equal(r.find(x=>x.balance<0).date,'2026-11-18');assert.equal(r[7].balance,550)});
test('delay shifts income only',()=>{const r=forecast(0,[{label:'pay',type:'income',amount:100,date:'2026-11-14'}],'2026-11-14',3,2);assert.deepEqual(r.map(x=>x.balance),[0,0,100])});
test('cent arithmetic',()=>assert.equal(forecast(.1,[{label:'x',type:'income',amount:.2,date:'2026-11-14'}],'2026-11-14',1)[0].balance,.3));
test('crosses month boundary',()=>assert.equal(addDays('2026-11-30',2),'2026-12-02'));
test('rejects impossible date and unknown type',()=>{assert.throws(()=>validateParsed({items:[{label:'x',type:'expense',amount:2,date:'2026-02-30'}]}));assert.throws(()=>validateParsed({items:[{label:'x',type:'other',amount:2,date:'2026-02-20'}]}))});
test('weekly salary spans forecast and never mutates original records',()=>{
 const items=[{label:'Salary',type:'income',amount:1000,date:'2026-11-16',frequency:'weekly'}],before=JSON.stringify(items);
 const rows=forecast(0,items,'2026-11-14');assert.equal(rows.at(-1).balance,4000);assert.equal(rows.flatMap(r=>r.events).length,4);assert.equal(JSON.stringify(items),before);
});
test('missing first payday is reviewable but cannot be confirmed or forecast',()=>{
 const raw={items:[{label:'Salary',type:'income',amount:1000,date:null,frequency:'weekly'}]};
 const draft=validateParsed(raw,{allowMissingDate:true});assert.equal(draft[0].date,'');assert.throws(()=>validateParsed({items:draft}));assert.throws(()=>forecast(0,draft,'2026-11-14'));
});
test('weekly starts before forecast and delayed income shift consistently',()=>{
 const item={label:'Salary',type:'income',amount:100,date:'2026-11-01',frequency:'weekly'};
 const r=forecast(0,[item],'2026-11-14',10,2);assert.deepEqual(r.flatMap(x=>x.events).map(x=>x.date),['2026-11-17']);assert.equal(r.at(-1).balance,100);
});
test('legacy one-off records stay one-off and unsupported recurrence rejected',()=>{
 const x={label:'Pay',type:'income',amount:100,date:'2026-11-14'};
 assert.equal(forecast(0,[x],'2026-11-14').at(-1).balance,100);assert.throws(()=>validateParsed({items:[{...x,frequency:'monthly'}]}));
});
