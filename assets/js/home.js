(()=>{
  const I=window.WD_STAGE_INTEL; if(!I)return;
  const box=document.querySelector('#homeRecommendations');
  const title=document.querySelector('#homeRecommendationTitle');
  function card(x,icon){return `<a class="recommendation home-rec" href="stages.html?to=${x.stage}"><b>${icon} Stage ${x.stage} · ${x.name}</b><span>${x.note}</span></a>`;}
  function render(stage){
    stage=I.clampStage(stage);
    if(title)title.textContent=`پیشنهادهای قابل دسترس تا Stage ${stage}`;
    if(!box)return;
    const cash=I.recommend('cash',stage,1)[0];
    const frenzy=I.recommend('frenzy',stage,1)[0];
    const stop=I.recommend('farm99',stage,1)[0];
    const items=[];
    if(cash)items.push(card(cash,'💰'));
    if(frenzy && (!cash||frenzy.stage!==cash.stage))items.push(card(frenzy,'🔥'));
    if(stop && !items.some(i=>i.includes(`Stage ${stop.stage} ·`)))items.push(card(stop,'🎯'));
    box.innerHTML=items.length?items.join(''):'<div class="recommendation"><b>فعلاً روی Progress تمرکز کن</b><span>چند Stage اول را جلو برو تا نقاط فارم مطمئن‌تری باز شوند.</span></div>';
  }
  render(localStorage.getItem('wd-current-stage')||1);
  document.addEventListener('wd-stage-change',e=>render(e.detail));
})();