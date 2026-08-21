(()=>{
  const grid=document.getElementById('stageGrid');
  const empty=document.getElementById('emptyState');
  const count=document.getElementById('resultCount');
  const to=document.getElementById('toStage');
  if(!grid)return;

  const primaryGoals=()=>[...document.querySelectorAll('.goal.active:not(.secondary-goal)')];

  function clearWith(title,text){
    grid.innerHTML='';
    if(count)count.textContent=title;
    if(empty){
      empty.hidden=false;
      empty.innerHTML=`<strong>${title}</strong><span>${text}</span>`;
    }
  }

  function guard(){
    const hasRange=to&&String(to.value).trim()!=='';
    if(!hasRange){
      clearWith('اول محدوده مرحله را مشخص کن','در کادر «تا مرحله» آخرین مرحله‌ای را که می‌خواهی بررسی شود وارد کن؛ مثلاً 13، 20 یا 28. سایت دیگر مرحله 100 را به‌صورت پیش‌فرض فرض نمی‌کند.');
      return;
    }
    if(primaryGoals().length===0){
      clearWith('اول هدفت را مشخص کن','حداقل یکی از هدف‌های اصلی مثل «فارم پول»، «مدال کلن»، «فارم کیل» یا «فرنزی» را انتخاب کن. گزینه‌های پایین فقط برای دقیق‌تر کردن همین نتیجه‌ها هستند.');
    }
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.goal')||e.target.closest('#resetFilters')||e.target.closest('#useCurrentStage'))setTimeout(guard,0);
  });
  ['fromStage','toStage','query','sortMode'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>setTimeout(guard,0)));
  new MutationObserver(guard).observe(grid,{childList:true});
  guard();
})();