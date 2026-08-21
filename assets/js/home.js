(()=>{
  if(!document.querySelector('link[href="assets/css/advisor.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/advisor.css';document.head.appendChild(l);}
  const I=window.WD_STAGE_INTEL;if(!I)return;const $=id=>document.getElementById(id);const box=$('homeRecommendations');const title=$('homeRecommendationTitle');
  function recCard(x,icon,goal,stage){const extra=x.evidence?`<small>${x.evidence}</small>`:'';return `<a class="recommendation home-rec" href="stages.html?to=${stage}&goal=${goal}"><b>${icon} مرحله ${x.stage} · ${x.name}</b><span>${x.note}</span>${extra}</a>`;}
  const weaponText=d=>d||{gun:'داده کافی نداریم',hydra:'داده کافی نداریم',hellfire:'داده کافی نداریم',confidence:'راهنمای تقریبی'};
  function nextStopAfter(stage){const q=I.progression(Math.min(100,stage+1));if(q.stop>stage)return q.stop;if(q.next>stage)return q.next;return Math.min(100,stage+1);}
  function unknown(){
    if(title)title.textContent='اول مرحله فعلی‌ات را ثبت کن';
    ['advisorStop','advisorStay','advisorNext','advisorGun','advisorHydra','advisorHellfire'].forEach(id=>{if($(id))$(id).textContent='—';});
    if($('advisorStopWhy'))$('advisorStopWhy').textContent='تا ندانیم به کدام مرحله رسیده‌ای، پیشنهاد توقف می‌تواند اشتباه باشد.';
    if($('advisorNextWhy'))$('advisorNextWhy').textContent='شماره مرحله فعلی را بالای همین صفحه وارد کن تا پیشنهادهای شخصی نمایش داده شوند.';
    if($('advisorConfidence'))$('advisorConfidence').textContent='منتظر ثبت مرحله';
    if($('advisorWeaponNote'))$('advisorWeaponNote').textContent='بعد از ثبت مرحله، محدوده تقریبی سطح سه سلاح و محل مناسب برای توقف نمایش داده می‌شود.';
    if(box)box.innerHTML='<div class="recommendation"><b>مرحله فعلی هنوز ثبت نشده</b><span>شماره آخرین مرحله‌ای را که برایت باز شده در کادر بالای صفحه وارد کن. سایت هیچ مرحله‌ای را به‌صورت فرضی برایت انتخاب نمی‌کند.</span></div>';
  }
  function render(stage){
    if(stage===null||stage===undefined||stage===''){unknown();return;}
    stage=I.clampStage(stage);const p=I.progression(stage);const stopStage=p.stop<stage?p.next:p.stop;const stopName=I.names[stopStage]||`مرحله ${stopStage}`;const following=nextStopAfter(stopStage);const followingName=I.names[following]||`مرحله ${following}`;const target=I.weaponTargets[stopStage]||I.weaponTargets[p.next]||p.currentTarget||p.nextTarget;const w=weaponText(target);
    if(title)title.textContent=`برنامه پیشنهادی برای مرحله ${stage}`;
    if($('advisorStop'))$('advisorStop').textContent=`مرحله ${stopStage} · ${stopName}`;
    if($('advisorStopWhy'))$('advisorStopWhy').textContent=stopStage===stage?'قبل از عبور کامل، اینجا پول و سلاح‌ها را آماده کن.':`این نزدیک‌ترین محل توقف پیشنهادی بعد از مرحله ${stage} است.`;
    if($('advisorStay'))$('advisorStay').textContent=stopStage===p.stop?p.stay:'تا وقتی بازی‌کردن این مرحله راحت شود، پول کافی ذخیره داشته باشی و سلاح‌ها به وضعیت مناسبی برسند.';
    if($('advisorNext'))$('advisorNext').textContent=`مرحله ${following} · ${followingName}`;
    if($('advisorNextWhy'))$('advisorNextWhy').textContent=`بعد از آماده‌شدن در مرحله ${stopStage}، این مرحله را به‌عنوان هدف بعدی زیر نظر داشته باش.`;
    if($('advisorGun'))$('advisorGun').textContent=w.gun;if($('advisorHydra'))$('advisorHydra').textContent=w.hydra;if($('advisorHellfire'))$('advisorHellfire').textContent=w.hellfire;if($('advisorConfidence'))$('advisorConfidence').textContent=w.confidence||'راهنمای تقریبی';
    if($('advisorWeaponNote'))$('advisorWeaponNote').textContent=target?`این عددها برای آمادگی تقریبی در مرحله ${stopStage} هستند. شرط رسمی بازی نیستند و از تجربه بازیکنان و داده‌های ثبت‌شده ساخته شده‌اند.`:'برای این بازه هنوز داده عددی قابل‌اعتماد کافی نداریم؛ هزینه ارتقا، مقدار آسیب و مهمات و راحتی بازی‌کردن مرحله را معیار قرار بده.';
    if(!box)return;const cash=I.recommend('cash',stage,1)[0];const frenzy=stage>=8?I.recommend('frenzy',stage,4):[];const stop=I.recommend('farm99',stage,1)[0];const items=[];
    if(cash)items.push(recCard(cash,'💰','cash',stage));frenzy.forEach((x,i)=>items.push(recCard(x,i===0?'🔥':'🏆','frenzy',stage)));if(stop&&!items.some(v=>v.includes(`مرحله ${stop.stage} ·`)))items.push(recCard(stop,'🎯','farm99',stage));
    box.innerHTML=items.length?items.join(''):'<div class="recommendation"><b>فعلاً روی پیشروی تمرکز کن</b><span>از حدود مرحله ۸ به بعد، انتخاب مرحله برای فرنزی و فارم اهمیت بیشتری پیدا می‌کند.</span></div>';
    const picks=$('homeStagePicksTitle');if(picks)picks.textContent=`گزینه‌های قابل امتحان تا مرحله ${stage}`;
  }
  const raw=localStorage.getItem('wd-current-stage');render(raw&&Number(raw)>=1?Number(raw):null);document.addEventListener('wd-stage-change',e=>render(e.detail));document.addEventListener('wd-stage-clear',unknown);
})();