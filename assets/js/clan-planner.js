(()=>{
  const I=window.WD_STAGE_INTEL;if(!I)return;
  const box=document.querySelector('#frenzyRecommendations');
  const input=document.querySelector('#plannerStage');
  const rotation=document.querySelector('#frenzyRotationHint');
  function render(stage){
    stage=I.clampStage(stage);
    const list=stage>=8?I.recommend('frenzy',stage,4):[];
    if(box){
      box.innerHTML=list.length?list.map(x=>`<a class="recommendation" href="stages.html?to=${stage}&goal=frenzy"><b>${x.index}. مرحله ${x.stage} · ${x.name}</b><span>${x.note}</span>${x.evidence?`<small>${x.evidence}</small>`:''}</a>`).join(''):'<div class="recommendation"><b>هنوز برای فرنزی گزینه زیادی در دسترس نیست</b><span>از حدود مرحله ۸ به بعد می‌توانی تاثیر بیشتری در فرنزی داشته باشی. بعد از آن، حتی مرحله‌های قدیمی‌تر مثل ۵ هم ارزش امتحان‌کردن دارند.</span></div>';
    }
    if(rotation){
      rotation.innerHTML=stage>=8?'<b>روش پیشنهادی برای همین فرنزی:</b> از گزینه اول شروع کن و یک یا دو دور بازی کن. اگر مدال خیلی کم بود یا تقریباً چیزی نگرفتی، روی همان مرحله نمان؛ گزینه دوم و سوم را امتحان کن. مرحله‌ای که در یک فرنزی عالی است، الزاماً در فرنزی بعدی بهترین نیست.':'وقتی به حدود مرحله ۸ برسی، این بخش چند مرحله قابل‌امتحان برای فرنزی پیشنهاد می‌دهد.';
    }
    document.querySelectorAll('[data-planner-stage]').forEach(x=>x.textContent=stage);
  }
  if(input){const start=I.clampStage(localStorage.getItem('wd-current-stage')||8);input.value=start;render(start);input.addEventListener('input',()=>{const s=I.clampStage(input.value);localStorage.setItem('wd-current-stage',s);render(s);});}
})();