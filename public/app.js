import {planStore} from './storage.js';
import {speechSnapshot} from './speech.js';
import {forecast,addDays,validateParsed,scheduledItems,localToday,displayDate,samplePlan} from './core.js';
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n),today=localToday();let items=[],draft=[],recognition,parseGeneration=0;
const persistence=planStore({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)});
function storageNotice(message){$('storageStatus').textContent=message;$('storageStatus').hidden=!message}
$('balance').value='';$('start').value=today;$('date').value=today;try{const saved=persistence.load();if(saved){items=saved.items;$('balance').value=saved.balance;$('start').value=saved.start}}catch(e){storageNotice(e.message)}

function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e}
function dateHint(input){
 const hint=el('small',displayDate(input.value));hint.id=input.id?input.id+'-readable':'';
 if(hint.id)input.setAttribute('aria-describedby',hint.id);input.after(hint);
 const sync=()=>hint.textContent=displayDate(input.value);
 input.addEventListener('input',sync);input.addEventListener('change',sync);return sync;
}
const syncStart=dateHint($('start'));dateHint($('date'));
$('start').parentElement.append(el('small','Calendar dates use your device’s local day, not a server time zone.'));
const delayChoiceLabel=el('label','Income to delay'),delayChoice=document.createElement('select'),comparison=el('p','','small');
delayChoiceLabel.append(delayChoice);$('delay').after(delayChoiceLabel,comparison);
delayChoice.onchange=()=>render();
const planError=el('p','','status-message');planError.id='planError';planError.setAttribute('role','alert');planError.hidden=true;$('manual').after(planError);
function showPlanError(message){planError.textContent=message;planError.hidden=!message}
function clearForecast(message){
 $('lowest').textContent='—';$('lowest').classList.remove('negative');$('shortfall').textContent='Check your inputs';
 $('chart').replaceChildren();$('days').replaceChildren();comparison.textContent='';
 if($('planSummary'))$('planSummary').textContent=message;
}
function render(){syncStart();showPlanError('');
if(!$('balance').value.trim()){comparison.textContent='';if($('planSummary'))$('planSummary').textContent='Enter your available balance to see a forecast. No starting amount is assumed.';
 $('lowest').textContent='—';$('lowest').classList.remove('negative');$('shortfall').textContent='Enter your starting balance';$('chart').replaceChildren();$('days').replaceChildren();$('items').replaceChildren();
 items.forEach((x,i)=>{const row=el('div',null,'item');row.append(el('span',x.label+' · '+displayDate(x.date)+' · '+money(x.amount)));const remove=el('button','Remove');remove.onclick=()=>{items.splice(i,1);render()};row.append(remove);$('items').append(row)});
 storageNotice('Enter your available balance to calculate and save the plan. Nothing is assumed.');return;
}
try{try{persistence.save({items,balance:$('balance').value,start:$('start').value});storageNotice('')}catch(e){storageNotice(e.message)}const delay=Number($('delay').value);$('delayLabel').textContent=delay+' days';const selected=delayChoice.value||'all',baseline=forecast($('balance').value,items,$('start').value,30,0);
if(!items.length){clearForecast('Add upcoming bills and income. No payments have been entered yet.');$('shortfall').textContent='No payments entered';return}
delayChoice.replaceChildren();const all=el('option','All expected income');all.value='all';delayChoice.append(all);
for(const occurrence of baseline.flatMap(r=>r.events).filter(x=>x.type==='income')){const option=el('option',occurrence.label+' · '+displayDate(occurrence.date)+' · '+money(occurrence.amount));option.value=occurrence.occurrenceId;delayChoice.append(option)}
delayChoice.value=[...delayChoice.options].some(x=>x.value===selected)?selected:'all';
const rows=forecast($('balance').value,items,$('start').value,30,delay,delayChoice.value==='all'?null:delayChoice.value);
const baseLow=Math.min(...baseline.map(r=>r.balance)),scenarioLow=Math.min(...rows.map(r=>r.balance));
comparison.textContent='Baseline lowest: '+money(baseLow)+'. With delay: '+money(scenarioLow)+'. '+(delayChoice.value==='all'?'Shifts all expected income; bills stay unchanged.':'Shifts only this payment; later payments and bills stay unchanged.')+' Payments moved beyond 30 days are outside this forecast.';
const low=Math.min(...rows.map(r=>r.balance));$('lowest').textContent=money(low);$('lowest').classList.toggle('negative',low<0);const shortfall=rows.find(r=>r.balance<0);if($('planSummary'))$('planSummary').textContent=(shortfall?'Your entered plan first falls below $0 on '+displayDate(shortfall.date)+'. Lowest estimated balance: '+money(low)+'.':'Your entered plan stays at or above $0 for these 30 days. Lowest estimated balance: '+money(low)+'.')+' Only the income and expenses you added are included.';$('shortfall').textContent=shortfall?displayDate(shortfall.date):'None in 30 days';$('items').replaceChildren();items.forEach((x,i)=>{const row=el('div',null,'item'),info=el('div',x.label);info.append(el('small',`${displayDate(x.date)} · ${x.type} · ${money(x.amount)}${x.frequency&&x.frequency!=='once'?' · '+x.frequency:''}`));const remove=el('button','×');remove.setAttribute('aria-label','Remove '+x.label);remove.onclick=()=>{items.splice(i,1);render()};row.append(info,remove);$('items').append(row)});$('chart').replaceChildren();const max=Math.max(...rows.map(r=>Math.abs(r.balance)),1);rows.forEach(r=>{const bar=el('div',null,'bar'+(r.balance<0?' neg':''));bar.style.height=Math.max(5,Math.abs(r.balance)/max*80)+'px';bar.title=displayDate(r.date)+': '+money(r.balance);$('chart').append(bar)});$('days').replaceChildren();rows.filter((r,i)=>r.events.length||i===0||i===29).forEach(r=>{const row=el('div',null,'day'),info=el('div',displayDate(r.date));info.append(el('small',r.events.map(x=>x.label+' '+(x.type==='income'?'+':'−')+money(x.amount)).join(', ')||'No scheduled items'));row.append(info,el('strong',money(r.balance),r.balance<0?'negative':''));$('days').append(row)})}catch(e){showPlanError(e.message);clearForecast('Correct the inputs to see an updated forecast. Your last saved plan has not been replaced.')}}
$('balance').oninput=render;$('start').onchange=render;$('delay').oninput=render;
const recurrenceHelp=el('p','Monthly dates use the same day each month, or the last day of a shorter month. Every 2 weeks means every 14 days, not twice a month.','small');$('manual').append(recurrenceHelp);
const frequencyLabel=el('label','Repeats'),frequencySelect=document.createElement('select');frequencySelect.id='frequency';
for(const [value,text] of [['once','Once'],['weekly','Every week'],['biweekly','Every 2 weeks'],['monthly','Every month']]){const option=el('option',text);option.value=value;frequencySelect.append(option)}
frequencyLabel.append(frequencySelect);$('manual').insertBefore(frequencyLabel,$('manual').querySelector('button'));
$('manual').onsubmit=e=>{e.preventDefault();try{const x=validateParsed({items:[{label:$('label').value,type:$('type').value,amount:Number($('amount').value),date:$('date').value,frequency:frequencySelect.value}]});items.push(...x);$('label').value='';$('amount').value='';render()}catch(e){showPlanError('Item not added: '+e.message);clearForecast('This item was not added. Correct its amount, date and description, then try again.')}};
$('manual').addEventListener('invalid',()=>{showPlanError('Item not added. Check the highlighted field: enter a description, a positive amount and a valid date.');clearForecast('Correct the highlighted field to continue. Existing saved items are unchanged.')},true);
$('demo').onclick=()=>{if(items.length&&!confirm('Replace your current plan with fictional sample data?'))return;try{const d=$('start').value||today,example=samplePlan(d);$('start').value=d;items=example.items;$('balance').value=example.balance;parseGeneration++;draft=[];$('review').hidden=true;$('parse').disabled=false;$('delay').value=0;render();delayChoice.value='2:'+addDays(d,3);render()}catch(e){showPlanError(e.message);clearForecast('Choose a valid start date, then load the example.')}};
$('clear').onclick=()=>{if(!confirm('Delete the plan saved in this browser?'))return;try{persistence.clear()}catch{storageNotice('Could not clear browser storage. Your saved plan was not changed.');return}parseGeneration++;$('parse').disabled=false;items=[];$('balance').value='';draft=[];$('review').hidden=true;storageNotice('');render()};
$('parse').onclick=async()=>{if(!$('consent').checked){$('status').textContent='Confirm fictional-only data before using AI.';return}if(!$('speech').value.trim())return;const requestGeneration=++parseGeneration;draft=[];$('review').hidden=true;$('parse').disabled=true;$('status').textContent='Extracting. Nothing will be saved until you confirm.';try{const res=await fetch('/api/parse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:$('speech').value,today:$('start').value,fictionalOnly:true})});const data=await res.json();if(requestGeneration!==parseGeneration)return;if(!res.ok)throw Error(data.error);draft=validateParsed(data,{allowMissingDate:true,allowUnclearAmount:true});if(!draft.length)throw Error('No complete transactions found. Include an amount, type and date.');$('drafts').replaceChildren();draft.forEach(x=>{
 const row=el('div',null,'item'),info=el('div',x.label+' · '+x.type);
 const amountLabel=el('label',x.question||'Amount ($)'),amount=document.createElement('input');amount.type='number';amount.min='0.01';amount.step='0.01';amount.required=true;amount.value=x.amount===null?'':x.amount;amount.oninput=()=>{x.amount=amount.value.trim()===''?null:Number(amount.value);updateDraft()};amountLabel.append(amount);info.append(amountLabel);
 const remove=el('button','Remove this draft');remove.type='button';remove.onclick=()=>{draft=draft.filter(y=>y!==x);row.remove();updateDraft()};info.append(remove);
 const dateLabel=el('label',x.frequency&&x.frequency!=='once'?'First payday / first occurrence':'Transaction date'),date=document.createElement('input');date.type='date';date.value=x.date;date.required=true;date.onchange=()=>{x.date=date.value;updateDraft()};dateLabel.append(date);dateHint(date);
 const freqLabel=el('label','Repeats'),select=document.createElement('select');for(const [value,text] of [['once','Once'],['weekly','Every week'],['biweekly','Every 2 weeks'],['monthly','Every month']]){const option=el('option',text);option.value=value;select.append(option)}select.value=x.frequency||'once';select.onchange=()=>{x.frequency=select.value;updateDraft()};freqLabel.append(select);info.append(dateLabel,freqLabel);row.append(info);$('drafts').append(row)
});$('review').hidden=false;updateDraft()}catch(e){if(requestGeneration===parseGeneration)$('status').textContent=e.message}finally{if(requestGeneration===parseGeneration)$('parse').disabled=false}};
function updateDraft(){
 try{if(!draft.length)throw Error('Empty draft');const checked=validateParsed({items:draft}),events=scheduledItems(checked,$('start').value);$('confirm').disabled=false;$('status').textContent='Review before saving: '+events.length+' scheduled payments in the 30-day forecast. Monthly dates clamp to a shorter month’s last day. '+events.map(x=>displayDate(x.date)+' '+x.label+' '+money(x.amount)).join('; ')}
 catch{$('confirm').disabled=true;$('status').textContent='Resolve every amount and date before confirming. Recurring items need their first payment date. Remove any unwanted draft; nothing is saved yet.'}
}
$('confirm').onclick=()=>{let checked;try{checked=validateParsed({items:draft})}catch{updateDraft();return}items.push(...checked);draft=[];$('review').hidden=true;$('speech').value='';render();$('status').textContent='Confirmed transactions added.'};$('cancel').onclick=()=>{draft=[];$('review').hidden=true;$('status').textContent='Draft discarded. Edit the transcript or enter items manually.'};
$('mic').onclick=()=>{
  if(recognition){recognition.stop();return}
  if(!$('consent').checked){$('status').textContent='Confirm fictional-only data before starting the microphone.';return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$('status').textContent='Voice is not supported in this browser. Type your example instead.';return}
  const session=new SR();recognition=session;
  const prefix=$('speech').value.trim();let stopTimer,committed=prefix,hasInterim=false,failed=false;
  session.lang='en-US';session.continuous=true;session.interimResults=true;
  session.onresult=e=>{
    if(recognition!==session)return;
    const snapshot=speechSnapshot(e.results,prefix);
    committed=snapshot.committed;hasInterim=snapshot.hasInterim;
    $('speech').value=snapshot.preview;
  };
  session.onerror=e=>{if(recognition!==session)return;failed=true;$('status').textContent='Voice unavailable: '+e.error+'. You can type instead.'};
  session.onend=()=>{
    clearTimeout(stopTimer);if(recognition!==session)return;
    recognition=null;$('speech').value=committed;$('speech').readOnly=false;$('parse').disabled=false;
    $('mic').textContent='🎙 Start voice input';
    if(!failed)$('status').textContent=hasInterim?'Recording stopped. The unfinished phrase was not added. Review the text and type any missing words.':'Recording stopped. Review the text before extracting transactions. Include exact dates.';
  };
  try{
    session.start();$('speech').readOnly=true;$('parse').disabled=true;$('mic').textContent='■ Stop listening';
    $('status').textContent='Listening. Live words may change until finalized. Stop to review. Nothing is sent to the AI until you choose extraction.';
    stopTimer=setTimeout(()=>{if(recognition===session)session.stop()},60000);
  }catch{recognition=null;$('speech').readOnly=false;$('parse').disabled=false;$('status').textContent='Could not start microphone. You can type instead.'}
};
fetch('/api/status').then(r=>r.json()).then(x=>$('status').textContent=x.configured?'AI connection configured; fictional data only.':'AI key not connected yet. The manual calculator and example are working.').catch(()=>$('status').textContent='Server unavailable.');render();
