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
 assert.equal(forecast(0,[x],'2026-11-14').at(-1).balance,100);assert.throws(()=>validateParsed({items:[{...x,frequency:'yearly'}]}));
});
test('US date display is unambiguous and timezone-independent',async()=>{
 const {displayDate}=await import('./public/core.js');
 assert.equal(displayDate('2026-11-14'),'Nov 14, 2026');
 assert.equal(displayDate('2026-03-08'),'Mar 8, 2026');
 assert.equal(displayDate('2026-02-30'),'Choose a date');
});
test('today uses device calendar fields rather than UTC date or locale serialization',async()=>{
 const {localToday}=await import('./public/core.js');
 const fake={getFullYear:()=>2026,getMonth:()=>0,getDate:()=>2};
 assert.equal(localToday(fake),'2026-01-02');
});
test('weekly recurrence remains seven calendar days across US DST transition',()=>{
 const r=forecast(0,[{label:'Pay',type:'income',amount:100,date:'2026-03-01',frequency:'weekly'}],'2026-03-01',22);
 assert.deepEqual(r.flatMap(x=>x.events).map(x=>x.date),['2026-03-01','2026-03-08','2026-03-15','2026-03-22']);
});
test('ambiguous spoken amount remains unresolved until user supplies it',()=>{
 const raw={items:[{label:'Insurance',type:'expense',date:null,amount:null,frequency:'once',question:'Did you mean $150 or $650?'}]};
 const draft=validateParsed(raw,{allowMissingDate:true,allowUnclearAmount:true});
 assert.equal(draft[0].amount,null);assert.equal(draft[0].question,'Did you mean $150 or $650?');
 assert.throws(()=>validateParsed({items:draft}));
 draft[0].amount=650;draft[0].date='2026-11-20';
 const confirmed=validateParsed({items:draft});assert.equal(confirmed[0].amount,650);assert.equal(confirmed[0].question,undefined);
});
test('monthly clamps short months without drifting original anchor',()=>{
 const r=forecast(0,[{label:'rent',type:'expense',amount:100,date:'2026-01-31',frequency:'monthly'}],'2026-01-31',90);
 assert.deepEqual(r.flatMap(x=>x.events).map(x=>x.date),['2026-01-31','2026-02-28','2026-03-31','2026-04-30']);
});
test('monthly leap year and delayed income preserve original monthly anchor',()=>{
 const r=forecast(0,[{label:'pay',type:'income',amount:100,date:'2024-01-31',frequency:'monthly'}],'2024-02-01',65,2);
 assert.deepEqual(r.flatMap(x=>x.events).map(x=>x.date),['2024-03-02','2024-04-02']);
});
test('biweekly means 14 days, not two dates per month',()=>{
 const r=forecast(0,[{label:'pay',type:'income',amount:100,date:'2026-11-01',frequency:'biweekly'}],'2026-11-01',30);
 assert.deepEqual(r.flatMap(x=>x.events).map(x=>x.date),['2026-11-01','2026-11-15','2026-11-29']);
});
test('monthly missing first date cannot forecast, persisted frequency preserved',()=>{
 const raw={items:[{label:'rent',amount:1800,date:null,type:'expense',frequency:'monthly'}]};
 const draft=validateParsed(raw,{allowMissingDate:true});assert.equal(draft[0].frequency,'monthly');assert.throws(()=>forecast(0,draft,'2026-11-14'));
});
test('blank opening balance is unknown, while explicit zero is valid',()=>{
 for(const value of ['',null,undefined,'   '])assert.throws(()=>forecast(value,[],'2026-11-14'));
 assert.equal(forecast(0,[],'2026-11-14')[0].balance,0);
});
test('delay one income occurrence without shifting later recurring payments or expenses',()=>{
 const items=[{label:'Pay',type:'income',amount:100,date:'2026-11-14',frequency:'weekly'},{label:'Bill',type:'expense',amount:20,date:'2026-11-15'}];
 const r=forecast(0,items,'2026-11-14',15,3,'0:2026-11-14');
 assert.deepEqual(r.flatMap(x=>x.events).filter(x=>x.type==='income').map(x=>x.date),['2026-11-17','2026-11-21','2026-11-28']);
 assert.equal(r[1].balance,-20);
});
test('selected delayed occurrence outside horizon is excluded, all-income default remains',()=>{
 const item={label:'Pay',type:'income',amount:100,date:'2026-11-14',frequency:'weekly'};
 assert.equal(forecast(0,[item],'2026-11-14',7,10,'0:2026-11-14').at(-1).balance,0);
 assert.deepEqual(forecast(0,[item],'2026-11-14',10,2).flatMap(x=>x.events).map(x=>x.date),['2026-11-16','2026-11-23']);
});
test('demo baseline stays positive; delaying only its paycheck 3 days creates shortfall',async()=>{
 const {samplePlan}=await import('./public/core.js'),start='2026-11-14',p=samplePlan(start);
 const base=forecast(p.balance,p.items,start),delayed=forecast(p.balance,p.items,start,30,3,'2:'+addDays(start,3));
 assert.equal(Math.min(...base.map(x=>x.balance)),200);
 assert.equal(base.find(x=>x.balance<0),undefined);
 assert.equal(Math.min(...delayed.map(x=>x.balance)),-50);
 assert.equal(delayed.find(x=>x.balance<0).date,addDays(start,4));
 assert.equal(delayed.at(-1).balance,base.at(-1).balance);
});
test('all-income delay never imports historical paychecks already reflected in starting balance',()=>{
 const items=[{label:'Pay',amount:100,type:'income',frequency:'weekly',date:'2026-11-07'}];
 const rows=forecast(500,items,'2026-11-14',30,7);
 assert.deepEqual(rows.flatMap(x=>x.events).map(x=>x.date),['2026-11-21','2026-11-28','2026-12-05','2026-12-12']);
 assert.equal(rows[0].balance,500);assert.equal(rows.at(-1).balance,900);
 const pastSelected=forecast(500,items,'2026-11-14',30,7,'0:2026-11-07');
 assert.equal(pastSelected[0].balance,600); // Only the current Nov14 payment, never Nov7.
 assert.equal(pastSelected.flatMap(x=>x.events).length,5);
});
test('delays keep inclusive final horizon date, exclude next day and never import past one-offs',()=>{
 const items=[{label:'Past',type:'income',amount:999,date:'2026-11-13'},{label:'Future',type:'income',amount:100,date:'2026-11-14'}];
 assert.equal(forecast(0,items,'2026-11-14',3,2).at(-1).balance,100);
 assert.equal(forecast(0,items,'2026-11-14',3,3).at(-1).balance,0);
});

test('saved plan warning uses local calendar comparison without changing data',async()=>{
 const {savedPlanWarning}=await import('./public/core.js');
 const saved={start:'2026-11-14',balance:123,items:[]},snapshot=JSON.stringify(saved);
 assert.match(savedPlanWarning(saved.start,'2026-11-15'),/Nov 14, 2026/);
 assert.equal(savedPlanWarning(saved.start,'2026-11-14'),'');
 assert.equal(savedPlanWarning(saved.start,'2026-11-13'),'');
 assert.equal(savedPlanWarning('','2026-11-15'),'');
 assert.equal(JSON.stringify(saved),snapshot);
});
