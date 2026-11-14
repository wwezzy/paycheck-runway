import {validateParsed,validDate,cents} from './core.js';
const KEY='runway-v1';
// AI responses have a per-response limit, not a limit on a user's whole plan.
export function validatePlan(saved){
  if(!saved||!Array.isArray(saved.items)||!validDate(saved.start)||
    !['number','string'].includes(typeof saved.balance)||String(saved.balance).trim()==='')throw Error('Invalid saved plan');
  cents(saved.balance);
  const items=saved.items.map(item=>validateParsed({items:[item]})[0]);
  return {items,balance:saved.balance,start:saved.start};
}
export function planStore(storage){
  let blocked=false;
  return {
    load(){
      try{const raw=storage.getItem(KEY);return raw===null?null:validatePlan(JSON.parse(raw))}
      catch{blocked=true;throw Error('Saved plan could not be read. It has NOT been overwritten. New changes will not be saved. Use Clear only if you want to discard the saved plan.')}
    },
    save(plan){
      if(blocked)throw Error('Saved plan is protected. Changes are not being saved. Use Clear only to discard the unreadable saved plan.');
      const valid=validatePlan(plan);
      storage.setItem(KEY,JSON.stringify(valid));
    },
    clear(){storage.removeItem(KEY);blocked=false}
  };
}
