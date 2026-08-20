(()=>{
  const saved=Math.max(1,Math.min(100,Number(localStorage.getItem('wd-current-stage')||100)));
  const to=document.querySelector('#toStage');
  const from=document.querySelector('#fromStage');
  const qs=new URLSearchParams(location.search);
  const qTo=Number(qs.get('to'));
  if(to){to.value=(qTo>=1&&qTo<=100)?qTo:saved;to.dispatchEvent(new Event('input',{bubbles:true}));}
  if(from&&!from.value)from.value=1;
  const bar=document.querySelector('#finderPersonalHint');
  if(bar)bar.innerHTML=`Stage ذخیره‌شده شما <b>${saved}</b> است. بازه «تا مرحله» به‌صورت خودکار روی همین مقدار تنظیم شده؛ هر وقت خواستی می‌توانی تغییرش بدهی.`;
  const use=document.querySelector('#useCurrentStage');
  if(use&&to)use.addEventListener('click',()=>{to.value=Math.max(1,Math.min(100,Number(localStorage.getItem('wd-current-stage')||saved)));to.dispatchEvent(new Event('input',{bubbles:true}));to.dispatchEvent(new Event('change',{bubbles:true}));});
})();