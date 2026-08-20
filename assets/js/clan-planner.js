(()=>{
  const I=window.WD_STAGE_INTEL; if(!I)return;
  const box=document.querySelector('#frenzyRecommendations');
  const input=document.querySelector('#plannerStage');
  const rotation=document.querySelector('#frenzyRotationHint');

  function render(stage){
    stage=I.clampStage(stage);
    const list=I.recommend('frenzy',stage,4);
    if(box){
      box.innerHTML=list.length?list.map(x=>`<a class="recommendation" href="stages.html?to=${stage}&goal=frenzy"><b>${x.index}. Stage ${x.stage} · ${x.name}</b><span>${x.note}</span>${x.evidence?`<small>${x.evidence}</small>`:''}</a>`).join(''):'<div class="recommendation"><b>Stage 5 هنوز باز نشده</b><span>از Stage 5 به بعد تست Frenzy معنی‌دارتر می‌شود؛ وقتی Stage 8 را باز کردی گزینه‌های بیشتری خواهی داشت.</span></div>';
    }
    if(rotation){
      rotation.innerHTML=stage>=5?`<b>روش پیشنهادی برای همین Frenzy:</b> از گزینه اول شروع کن. اگر Run اول و دوم Medal غیرعادی پایین یا صفر داد، روی همان Stage قفل نشو؛ گزینه دوم و سوم را تست کن. Frenzy می‌تواند چرخه‌ای/نوسانی رفتار کند و Stage برنده یک Frenzy الزاماً در Frenzy بعدی بهترین نیست.`:'بعد از بازشدن Stage 5 این بخش گزینه‌های عملی برای تست Frenzy نشان می‌دهد.';
    }
    document.querySelectorAll('[data-planner-stage]').forEach(x=>x.textContent=stage);
  }

  if(input){
    const start=I.clampStage(localStorage.getItem('wd-current-stage')||8);
    input.value=start;render(start);
    input.addEventListener('input',()=>{const s=I.clampStage(input.value);localStorage.setItem('wd-current-stage',s);render(s);});
  }
})();