(()=>{
  if(!document.querySelector('link[href="assets/css/advisor.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/advisor.css';document.head.appendChild(l);}
  const I=window.WD_STAGE_INTEL; if(!I)return;
  const $=id=>document.getElementById(id);
  const box=$('homeRecommendations');
  const title=$('homeRecommendationTitle');

  function recCard(x,icon,goal){
    const extra=x.evidence?`<small>${x.evidence}</small>`:'';
    return `<a class="recommendation home-rec" href="stages.html?to=${Math.max(x.stage,Number(localStorage.getItem('wd-current-stage')||x.stage))}&goal=${goal}"><b>${icon} Stage ${x.stage} · ${x.name}</b><span>${x.note}</span>${extra}</a>`;
  }

  function weaponText(d){
    if(!d)return {gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'راهنمای کیفی'};
    return d;
  }

  function render(stage){
    stage=I.clampStage(stage);
    const p=I.progression(stage);
    const w=weaponText(p.currentTarget||p.nextTarget);

    if(title) title.textContent=`برنامه پیشنهادی برای Stage ${stage}`;
    if($('advisorStop')) $('advisorStop').textContent=`Stage ${p.stop} · ${p.stopName}`;
    if($('advisorStopWhy')) $('advisorStopWhy').textContent=p.why;
    if($('advisorStay')) $('advisorStay').textContent=p.stay;
    if($('advisorNext')) $('advisorNext').textContent=`Stage ${p.next} · ${p.nextName}`;
    if($('advisorNextWhy')) $('advisorNextWhy').textContent=p.nextTarget?`برای نزدیک‌شدن به این نقطه، Weaponها را به محدوده هدف بعدی برسان.`:'برای این بازه فعلاً داده عددی قابل دفاع کم است؛ روی تعادل Upgrade و راحت‌شدن Run تمرکز کن.';
    if($('advisorGun')) $('advisorGun').textContent=w.gun;
    if($('advisorHydra')) $('advisorHydra').textContent=w.hydra;
    if($('advisorHellfire')) $('advisorHellfire').textContent=w.hellfire;
    if($('advisorConfidence')) $('advisorConfidence').textContent=w.confidence||'راهنما';

    if(!box)return;
    const cash=I.recommend('cash',stage,1)[0];
    const frenzy=I.recommend('frenzy',stage,4);
    const stop=I.recommend('farm99',stage,1)[0];
    const items=[];
    if(cash)items.push(recCard(cash,'💰','cash'));
    frenzy.forEach((x,i)=>items.push(recCard(x,i===0?'🔥':'🏆','frenzy')));
    if(stop && !items.some(v=>v.includes(`Stage ${stop.stage} ·`)))items.push(recCard(stop,'🎯','farm99'));
    box.innerHTML=items.length?items.join(''):'<div class="recommendation"><b>فعلاً روی Progress تمرکز کن</b><span>Stageهای 1 تا 4 را برای شناخت مکانیک‌ها جلو برو؛ از Stage 5 به بعد پیشنهادهای Frenzy هم فعال می‌شوند.</span></div>';
    const picks=$('homeStagePicksTitle');
    if(picks)picks.textContent=`گزینه‌های قابل تست تا Stage ${stage}`;
  }

  render(localStorage.getItem('wd-current-stage')||1);
  document.addEventListener('wd-stage-change',e=>render(e.detail));
})();