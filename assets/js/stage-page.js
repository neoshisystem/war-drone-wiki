(()=>{
  const saved=Math.max(1,Math.min(100,Number(localStorage.getItem('wd-current-stage')||100)));
  const to=document.querySelector('#toStage');
  const from=document.querySelector('#fromStage');
  const qs=new URLSearchParams(location.search);
  const qTo=Number(qs.get('to'));
  const goal=qs.get('goal');

  if(to){
    to.value=(qTo>=1&&qTo<=100)?qTo:saved;
    to.dispatchEvent(new Event('input',{bubbles:true}));
    to.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(from&&!from.value)from.value=1;

  const bar=document.querySelector('#finderPersonalHint');
  if(bar)bar.innerHTML=`Stage ذخیره‌شده شما <b>${saved}</b> است. بازه «تا مرحله» به‌صورت خودکار روی همین مقدار تنظیم شده؛ هر وقت خواستی می‌توانی تغییرش بدهی.`;

  const use=document.querySelector('#useCurrentStage');
  if(use&&to)use.addEventListener('click',()=>{
    to.value=Math.max(1,Math.min(100,Number(localStorage.getItem('wd-current-stage')||saved)));
    to.dispatchEvent(new Event('change',{bubbles:true}));
  });

  // Stage Finder should answer a question, not dump every stage by default.
  // At least one primary goal is required; range/search/hard filters only refine that goal.
  const finder=document.querySelector('.finder-panel');
  const grid=document.querySelector('#stageGrid');
  const resultCount=document.querySelector('#resultCount');
  const empty=document.querySelector('#emptyState');
  const goalButtons=[...document.querySelectorAll('[data-goal]')];

  let prompt=document.querySelector('#goalRequiredPrompt');
  if(!prompt&&finder){
    prompt=document.createElement('div');
    prompt.id='goalRequiredPrompt';
    prompt.className='callout warn';
    prompt.style.margin='0 0 16px';
    prompt.innerHTML='<b>اول هدفت را انتخاب کن.</b> حداقل یک گزینه لازم است و می‌توانی چند گزینه را هم‌زمان روشن کنی. مثال: <b>فارم Cash + Frenzy</b> یا <b>Clan Medal + Kill</b>. بازه «از/تا Stage» فقط محدوده جست‌وجو را مشخص می‌کند.';
    const filters=finder.querySelector('.goal-filters');
    if(filters) filters.before(prompt); else finder.prepend(prompt);
  }

  const hasGoal=()=>goalButtons.some(b=>b.classList.contains('active'));
  let enforcing=false;
  function enforceGoalRule(){
    if(enforcing) return;
    enforcing=true;
    const active=hasGoal();
    if(prompt) prompt.hidden=active;
    if(!active){
      if(grid&&grid.children.length) grid.replaceChildren();
      if(resultCount) resultCount.textContent='حداقل یک هدف را انتخاب کنید';
      if(empty) empty.hidden=true;
    }
    enforcing=false;
  }

  // Existing app.js owns ranking/rendering. This layer only blocks meaningless no-goal output.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-goal],[data-filter],#resetFilters')) setTimeout(enforceGoalRule,0);
  });
  document.addEventListener('input',e=>{
    if(e.target.matches('#fromStage,#toStage,#query,#sortMode')) setTimeout(enforceGoalRule,0);
  });
  document.addEventListener('change',e=>{
    if(e.target.matches('#fromStage,#toStage,#query,#sortMode')) setTimeout(enforceGoalRule,0);
  });
  if(grid){
    new MutationObserver(()=>{ if(!hasGoal()) enforceGoalRule(); }).observe(grid,{childList:true});
  }

  enforceGoalRule();

  // Query-string deep links (home/planners) are allowed to preselect one goal.
  if(goal){
    const btn=document.querySelector(`[data-goal="${CSS.escape(goal)}"]`);
    if(btn&&!btn.classList.contains('active')) btn.click();
  }
})();