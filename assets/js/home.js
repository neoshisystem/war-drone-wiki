(()=>{
  if(!document.querySelector('link[href="assets/css/advisor.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/advisor.css';document.head.appendChild(l);}
  const I=window.WD_STAGE_INTEL;if(!I)return;const $=id=>document.getElementById(id);const box=$('homeRecommendations');const title=$('homeRecommendationTitle');
  function recCard(x,icon,goal){const extra=x.evidence?`<small>${x.evidence}</small>`:'';return `<a class="recommendation home-rec" href="stages.html?to=${Math.max(x.stage,Number(localStorage.getItem('wd-current-stage')||x.stage))}&goal=${goal}"><b>${icon} Stage ${x.stage} · ${x.name}</b><span>${x.note}</span>${extra}</a>`;}
  const weaponText=d=>d||{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'راهنمای کیفی'};
  function nextStopAfter(stage){const q=I.progression(Math.min(100,stage+1));if(q.stop>stage)return q.stop;if(q.next>stage)return q.next;return Math.min(100,stage+1);}
  function render(stage){
    stage=I.clampStage(stage);const p=I.progression(stage);const stopStage=p.stop<stage?p.next:p.stop;const stopName=I.names[stopStage]||`Stage ${stopStage}`;const following=nextStopAfter(stopStage);const followingName=I.names[following]||`Stage ${following}`;const target=I.weaponTargets[stopStage]||I.weaponTargets[p.next]||p.currentTarget||p.nextTarget;const w=weaponText(target);
    if(title)title.textContent=`برنامه پیشنهادی برای Stage ${stage}`;
    if($('advisorStop'))$('advisorStop').textContent=`Stage ${stopStage} · ${stopName}`;
    if($('advisorStopWhy'))$('advisorStopWhy').textContent=stopStage===stage?'قبل از عبور کامل، اینجا Cash و Weaponها را آماده کن.':`این نزدیک‌ترین نقطه توقف پیشنهادی بعد از Stage ${stage} است.`;
    if($('advisorStay'))$('advisorStay').textContent=stopStage===p.stop?p.stay:'تا وقتی Run این نقطه راحت شود، Cash ذخیره داشته باشی و Weaponهای هدف را ساخته باشی.';
    if($('advisorNext'))$('advisorNext').textContent=`Stage ${following} · ${followingName}`;
    if($('advisorNextWhy'))$('advisorNextWhy').textContent=`بعد از آماده‌شدن در Stage ${stopStage}، این نقطه را به‌عنوان توقف/هدف بعدی زیر نظر داشته باش.`;
    if($('advisorGun'))$('advisorGun').textContent=w.gun;if($('advisorHydra'))$('advisorHydra').textContent=w.hydra;if($('advisorHellfire'))$('advisorHellfire').textContent=w.hellfire;if($('advisorConfidence'))$('advisorConfidence').textContent=w.confidence||'راهنما';
    if($('advisorWeaponNote'))$('advisorWeaponNote').textContent=target?`هدف تقریبی برای آمادگی در Stage ${stopStage}. Requirement رسمی نیست؛ از تجربه بازیکنان و برآورد بین داده‌های ثبت‌شده ساخته شده است.`:'برای این بازه هنوز Level عددی قابل دفاع کافی نداریم؛ هزینه Upgrade، Damage/Ammo و راحتی Run را معیار قرار بده.';
    if(!box)return;const cash=I.recommend('cash',stage,1)[0];const frenzy=stage>=8?I.recommend('frenzy',stage,4):[];const stop=I.recommend('farm99',stage,1)[0];const items=[];
    if(cash)items.push(recCard(cash,'💰','cash'));frenzy.forEach((x,i)=>items.push(recCard(x,i===0?'🔥':'🏆','frenzy')));if(stop&&!items.some(v=>v.includes(`Stage ${stop.stage} ·`)))items.push(recCard(stop,'🎯','farm99'));
    box.innerHTML=items.length?items.join(''):'<div class="recommendation"><b>فعلاً روی Progress تمرکز کن</b><span>Frenzy از حدود Stage 8 به بعد برایت وارد برنامه می‌شود. بعد از آن حتی Stageهای قدیمی‌تر مثل 5 را هم می‌توانی برای Medal تست کنی.</span></div>';const picks=$('homeStagePicksTitle');if(picks)picks.textContent=`گزینه‌های قابل تست تا Stage ${stage}`;
  }
  render(localStorage.getItem('wd-current-stage')||1);document.addEventListener('wd-stage-change',e=>render(e.detail));
})();