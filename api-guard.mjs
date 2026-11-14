// Shared anonymous demo budget. This deliberately does not claim per-user/IP identity:
// managed hosts may put every browser behind the same trusted network proxy.
export function demoBudget({perMinute=10,perDay=400,maxConcurrent=2,clock=Date.now}={}) {
  let recent=[],day='',used=0,active=0;
  return {
    acquire(){
      const now=clock(),today=new Date(now).toISOString().slice(0,10);
      if(today!==day){day=today;used=0}
      recent=recent.filter(t=>now-t<60000);
      if(active>=maxConcurrent)return {ok:false,retryAfter:5,error:'The shared AI demo is busy. Try again shortly; manual entry still works.'};
      if(used>=perDay)return {ok:false,retryAfter:Math.max(1,Math.ceil((Date.parse(today+'T00:00:00Z')+86400000-now)/1000)),error:'The shared daily AI demo allowance is used. Manual entry still works.'};
      if(recent.length>=perMinute)return {ok:false,retryAfter:Math.max(1,Math.ceil((recent[0]+60000-now)/1000)),error:'The shared AI demo is receiving several requests. Please wait a minute or use manual entry.'};
      recent.push(now);used++;active++;let done=false;
      return {ok:true,release(){if(!done){done=true;active--}}};
    }
  };
}
