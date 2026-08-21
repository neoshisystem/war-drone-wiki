(()=>{
  const grid=document.getElementById('stageGrid');
  const empty=document.getElementById('emptyState');
  const count=document.getElementById('resultCount');
  const to=document.getElementById('toStage');
  const sort=document.getElementById('sortMode');
  if(!grid)return;

  let recovering=false;
  const primaryGoals=()=>[...document.querySelectorAll('[data-goal="cash"].active,[data-goal="clan"].active,[data-goal="kills"].active,[data-goal="frenzy"].active')];

  function clearWith(title,text){
    if(grid.childElementCount) grid.innerHTML='';
    if(count)count.textContent=title;
    if(empty){
      empty.hidden=false;
      empty.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    }
  }

  function hasUsableRange(){
    return !!(to&&String(to.value).trim()!=='');
  }

  function recoverResultsIfNeeded(){
    if(recovering||!sort||grid.childElementCount>0)return;
    recovering=true;
    // app.js owns the actual filtering/rendering. Dispatching change makes it
    // rebuild results after the guard previously cleared them because only a
    // secondary filter had been selected first.
    sort.dispatchEvent(new Event('change',{bubbles:true}));
    requestAnimationFrame(()=>{recovering=false;});
  }

  function guard(){
    if(!hasUsableRange()){
      clearWith('اول محدوده مرحله را مشخص کن','در کادر «تا مرحله» آخرین مرحله‌ای را که می‌خواهی بررسی شود وارد کن؛ مثلاً 13، 20 یا 28. سایت دیگر مرحله 100 را به‌صورت پیش‌فرض فرض نمی‌کند.');
      return;
    }

    if(primaryGoals().length===0){
      clearWith('اول هدفت را مشخص کن','حداقل یکی از هدف‌های اصلی مثل «فارم پول»، «مدال کلن»، «فارم کیل» یا «فرنزی» را انتخاب کن. گزینه‌های پایین فقط برای دقیق‌تر کردن همین نتیجه‌ها هستند.');
      return;
    }

    // A primary goal is now active. If the user selected a secondary option
    // first, the grid may have been intentionally cleared by this guard.
    // Re-render immediately so selection order never changes form behavior.
    recoverResultsIfNeeded();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-goal]')||e.target.closest('[data-filter]')||e.target.closest('#resetFilters')||e.target.closest('#useCurrentStage')){
      setTimeout(guard,0);
    }
  });

  ['fromStage','toStage','query','sortMode'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',()=>setTimeout(guard,0));
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(guard,0));
  });

  new MutationObserver(()=>setTimeout(guard,0)).observe(grid,{childList:true});
  guard();
})();