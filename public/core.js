export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s}
export function cents(n){if(!Number.isFinite(Number(n))||Math.abs(Number(n))>1e8)throw Error('Enter a valid amount');return Math.round(Number(n)*100)}
export function addDays(day,n){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}

export function validateParsed(raw,{allowMissingDate=false}={}){
 if(!raw||!Array.isArray(raw.items)||raw.items.length>40)throw Error('Invalid AI response');
 return raw.items.map(x=>{
  const frequency=x.frequency||'once';
  if((!validDate(x.date)&&!(allowMissingDate&&(x.date===null||x.date==='')))||!['income','expense'].includes(x.type)||typeof x.label!=='string'||!x.label.trim()||cents(x.amount)<=0||!['once','weekly'].includes(frequency))throw Error('Check amount, date and frequency. Unsupported schedules must be entered manually.');
  return {label:x.label.slice(0,80),type:x.type,date:x.date||'',amount:cents(x.amount)/100,...(frequency==='weekly'?{frequency}: {})};
 });
}
export function scheduledItems(items,start,days=30,delay=0){
 if(!validDate(start)||!Number.isInteger(days)||days<1||days>366||!Number.isInteger(delay)||delay<0||delay>365)throw Error('Invalid forecast window');
 const end=addDays(start,days-1),events=[];
 for(const item of items){
  const x=validateParsed({items:[item]})[0];
  let date=x.type==='income'?addDays(x.date,delay):x.date;
  if(x.frequency==='weekly'){
   if(date<start){const gap=Math.round((Date.parse(start)-Date.parse(date))/86400000);date=addDays(date,Math.ceil(gap/7)*7)}
   for(;date<=end;date=addDays(date,7))events.push({...x,date});
  }else if(date>=start&&date<=end)events.push({...x,date});
 }
 return events;
}
export function forecast(balance,items,start,days=30,delay=0){
 let total=cents(balance);const safe=scheduledItems(items,start,days,delay);
 return Array.from({length:days},(_,i)=>{const date=addDays(start,i);const events=safe.filter(x=>x.date===date);total+=events.reduce((s,x)=>s+cents(x.amount)*(x.type==='income'?1:-1),0);return {date,balance:total/100,events}});
}
