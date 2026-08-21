(()=>{
  const raw=localStorage.getItem('wd-current-stage');
  const saved=(raw!==null&&raw!==''&&Number(raw)>=1)?Math.max(1,Math.min(100,Number(raw))):null;
  const to=document.querySelector('#toStage');const from=document.querySelector('#fromStage');
  const qs=new URLSearchParams(location.search);const qTo=Number(qs.get('to'));const goal=qs.get('goal');
  if(from)from.value=qs.get('from')||from.value||1;
  if(to){if(qTo>=1&&qTo<=100)to.value=qTo;else if(saved)to.value=saved;else to.value='';if(to.value){to.dispatchEvent(new Event('input',{bubbles:true}));to.dispatchEvent(new Event('change',{bubbles:true}));}}
  const bar=document.querySelector('#finderPersonalHint');
  if(bar)bar.innerHTML=saved?`Stage ذخیره‌شده شما <b>${saved}</b> است. اگر می‌خواهی فقط مراحل در دسترس خودت بررسی شوند، از همین مقدار استفاده کن.`:'هنوز Stage فعلی‌ات را ثبت نکرده‌ای. می‌توانی همین پایین بازه «از مرحله / تا مرحله» را خودت وارد کنی، یا ابتدا Stage فعلی را ثبت کنی.';
  const use=document.querySelector('#useCurrentStage');
  if(use){use.disabled=!saved;use.textContent=saved?'استفاده از Stage ذخیره‌شده من':'هنوز Stage ثبت نشده';if(saved&&to)use.addEventListener('click',()=>{to.value=saved;to.dispatchEvent(new Event('change',{bubbles:true}));});}
  if(goal){const btn=document.querySelector(`[data-goal="${CSS.escape(goal)}"]`);if(btn&&!btn.classList.contains('active'))btn.click();}
})();