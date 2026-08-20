(()=>{
  const I=window.WD_STAGE_INTEL; if(!I)return;
  const box=document.querySelector('#frenzyRecommendations');
  const input=document.querySelector('#plannerStage');
  function render(stage){
    stage=I.clampStage(stage);
    const list=I.recommend('frenzy',stage,3);
    if(box){
      box.innerHTML=list.length?list.map(x=>`<a class="recommendation" href="stages.html?to=${stage}&goal=frenzy"><b>${x.index}. Stage ${x.stage} · ${x.name}</b><span>${x.note}</span></a>`).join(''):'<div class="recommendation"><b>هنوز زود است</b><span>چند Stage اول را برای یادگیری مکانیک‌ها جلو برو.</span></div>';
    }
    document.querySelectorAll('[data-planner-stage]').forEach(x=>x.textContent=stage);
  }
  if(input){
    const start=I.clampStage(localStorage.getItem('wd-current-stage')||28);
    input.value=start;render(start);
    input.addEventListener('input',()=>{const s=I.clampStage(input.value);localStorage.setItem('wd-current-stage',s);render(s);});
  }
})();