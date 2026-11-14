export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s}
export function cents(n){if(!Number.isFinite(Number(n))||Math.abs(Number(n))>1e8)throw Error('Enter a valid amount');return Math.round(Number(n)*100)}
export function addDays(day,n){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}

export function validateParsed(raw,{allowMissingDate=false,allowUnclearAmount=false}={}){
 if(!raw||!Array.isArray(raw.items)||raw.items.length>40)throw Error('Invalid AI response');
 return raw.items.map(x=>{
  const frequency=x.frequency||'once';
  if((!validDate(x.date)&&!(allowMissingDate&&(x.date===null||x.date==='')))||!['income','expense'].includes(x.type)||typeof x.label!=='string'||!x.label.trim()||(!(allowUnclearAmount&&x.amount===null)&&cents(x.amount)<=0)||!['once','weekly','biweekly','monthly'].includes(frequency))throw Error('Check amount, date and frequency. Unsupported schedules must be entered manually.');
  return {label:x.label.slice(0,80),type:x.type,date:x.date||'',amount:x.amount===null&&allowUnclearAmount?null:cents(x.amount)/100,...(allowUnclearAmount&&typeof x.question==='string'&&x.question.trim()?{question:x.question.slice(0,240)}:{}),...(frequency!=='once'?{frequency}: {})};
 });
}
// Keep the ORIGINAL day anchor: Jan 31 -> Feb 28 -> Mar 31, not Mar 28.
export function addMonthsClamped(day,months){
 if(!validDate(day)||!Number.isInteger(months)||months<0)throw Error('Invalid monthly anchor');
 const [y,m,d]=day.split('-').map(Number),target=new Date(0);target.setUTCFullYear(y,m-1+months,1);
 const last=new Date(0);last.setUTCFullYear(target.getUTCFullYear(),target.getUTCMonth()+1,0);
 target.setUTCDate(Math.min(d,last.getUTCDate()));return target.toISOString().slice(0,10);
}
export function scheduledItems(items,start,days=30,delay=0){
 if(!validDate(start)||!Number.isInteger(days)||days<1||days>366||!Number.isInteger(delay)||delay<0||delay>365)throw Error('Invalid forecast window');
 const end=addDays(start,days-1),events=[];
 for(const item of items){
  const x=validateParsed({items:[item]})[0],shift=x.type==='income'?delay:0;
  if(x.frequency==='monthly'){
   const earliest=addDays(start,-shift),[sy,sm]=earliest.split('-').map(Number),[ay,am]=x.date.split('-').map(Number);
   let month=Math.max(0,(sy-ay)*12+sm-am-1);
   for(;;month++){const date=addDays(addMonthsClamped(x.date,month),shift);if(date>end)break;if(date>=start)events.push({...x,date})}
  }else{
   let date=addDays(x.date,shift);
   const step=x.frequency==='weekly'?7:x.frequency==='biweekly'?14:0;
   if(step){
    if(date<start){const gap=Math.round((Date.parse(start)-Date.parse(date))/86400000);date=addDays(date,Math.ceil(gap/step)*step)}
    for(;date<=end;date=addDays(date,step))events.push({...x,date});
   }else if(date>=start&&date<=end)events.push({...x,date});
  }
 }
 return events;
}
export function forecast(balance,items,start,days=30,delay=0){
 let total=cents(balance);const safe=scheduledItems(items,start,days,delay);
 return Array.from({length:days},(_,i)=>{const date=addDays(start,i);const events=safe.filter(x=>x.date===date);total+=events.reduce((s,x)=>s+cents(x.amount)*(x.type==='income'?1:-1),0);return {date,balance:total/100,events}});
}

// Calendar-only values stay ISO internally; formatting never shifts them across time zones.
export function localToday(now=new Date()){
 return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
export function displayDate(day){
 if(!validDate(day))return 'Choose a date';
 return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T00:00:00Z'));
}
