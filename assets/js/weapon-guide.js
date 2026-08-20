(() => {
  'use strict';

  /*
   * Community weapon-readiness layer.
   * IMPORTANT: War Drone sources often mix weapon upgrade level, damage and ammo capacity.
   * We only show a numeric target where the source context is sufficiently useful, and label
   * interpolated values as estimates rather than pretending they are official requirements.
   */

  const VERIFIED = {
    9:  {gun:'160–180', hydra:'45–55', hellfire:'8–10', confidence:'گزارش بازیکن', note:'یک گزارش عملی در Stage 9 با حدود 164 / 50 / 9 پیشروی روان را گزارش کرده است.'},
    10: {gun:'250–300', hydra:'70–75', hellfire:'10–12', confidence:'داده قوی', note:'نقطه فارم مهم؛ چند گزارش توصیه می‌کنند قبل از ترک Stage 10 این محدوده را هدف بگیری. خود بازی برای ورود به 11 حداقل پایین‌تری برای 25mm نشان داده، اما 250–300 حاشیه امن بهتری دارد.'},
    13: {gun:'255–275', hydra:'55–65', hellfire:'12–15', confidence:'گزارش بازیکن', note:'گزارش ثبت‌شده: حدود 259 / 57 / 13 و امکان ادامه تا Stage 14.'},
    15: {gun:'290–320', hydra:'65–80', hellfire:'15–20', confidence:'برآورد از داده نزدیک', note:'نقطه فارم؛ بین داده‌های Stage 13 و آمادگی توصیه‌شده برای 20 برآورد شده است.'},
    19: {gun:'370–400', hydra:'85–100', hellfire:'24–30', confidence:'داده قوی', note:'برای عبور از بازه 19–20 بهتر است نزدیک هدف Stage 20 باشی؛ 25mm همچنان اولویت اصلی است.'},
    20: {gun:'390–410', hydra:'90–105', hellfire:'28–32', confidence:'داده قوی', note:'گزارش تکمیل F2P حداقل حدود 390 / 90 / 28 را پیش از عبور از Stage 20 توصیه می‌کند.'},
    22: {gun:'390–420', hydra:'105–120', hellfire:'25–32', confidence:'داده قوی', note:'چند تجربه بازیکن برای Stage 22 محدوده نزدیک 400 / 110 / 25 را عملی گزارش کرده‌اند؛ مدیریت مهمات بسیار مهم است.'},
    27: {gun:'460–510', hydra:'180–230', hellfire:'38–48', confidence:'برآورد جامعه', note:'نقطه فارم؛ عدد رسمی نداریم. این بازه از روند گزارش‌های Stage 22، 25 و 30 ساخته شده و باید راهنما تلقی شود.'},
    28: {gun:'480–525', hydra:'200–250', hellfire:'42–52', confidence:'برآورد جامعه', note:'نقطه فارم مهم؛ به‌دلیل گزارش‌های تغییر ناگهانی سختی در Stage 28، حاشیه امن بالاتر از روند عادی در نظر گرفته شده است.'},
    30: {gun:'525–575', hydra:'250–290', hellfire:'50–60', confidence:'گزارش + برآورد', note:'بازیکنی در Stage 30 با 524 / 264 / 54 تا 87٪ رسیده؛ برای عبور کامل کمی حاشیه بالاتر منطقی است.'},
    39: {gun:'600+', hydra:'300+', hellfire:'60+', confidence:'تخمین کم‌اطمینان', note:'Stage 39 نقطه فارم مهم است، اما منبع قابل اتکای کافی برای «حداقل دقیق» سه سلاح پیدا نشد؛ این اعداد فقط کف محافظه‌کارانه‌اند.'},
    42: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'ویدیوی Stage 42 Card Levelها را نشان می‌دهد، نه لزوماً Level اصلی سه سلاح؛ عمداً این دو را با هم یکی نکرده‌ایم.'},
    52: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'Difficulty Spike تأیید شده، اما عدد قابل دفاع برای حداقل Level سه سلاح نداریم.'},
    58: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'نقطه فارم مهم است؛ تا پیدا شدن HUD یا گزارش بازیکن، عدد ساختگی نمایش داده نمی‌شود.'},
    66: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'Iron Fist دیوار سختی تأییدشده است. ویدیوی موجود خرج Gold و شکست مجدد را نشان می‌دهد، اما Level اصلی سه سلاح واضح نیست.'},
    69: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'برای این نقطه فارم هنوز حداقل عددی قابل دفاع پیدا نشده است.'},
    78: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'برای این نقطه فارم هنوز حداقل عددی قابل دفاع پیدا نشده است.'},
    88: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'برای Late-game از حدس عددی خودداری شده است.'},
    98: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'برای Late-game از حدس عددی خودداری شده است.'},
    99: {gun:'داده کافی نیست', hydra:'داده کافی نیست', hellfire:'داده کافی نیست', confidence:'نیازمند داده بیشتر', note:'برای Late-game از حدس عددی خودداری شده است.'}
  };

  const anchors = [9,10,13,15,19,20,22,27,28,30];
  const numeric = s => VERIFIED[s] && !String(VERIFIED[s].gun).includes('داده') && !String(VERIFIED[s].gun).includes('+');
  const mid = str => {
    const nums = String(str).match(/\d+/g)?.map(Number) || [];
    return nums.length > 1 ? (nums[0]+nums[1])/2 : (nums[0] || 0);
  };
  const round5 = n => Math.round(n/5)*5;

  function estimate(stage){
    if (VERIFIED[stage]) return VERIFIED[stage];
    if (stage < 9) {
      const f = stage/9;
      return {gun:`${round5(60+100*f)}–${round5(75+105*f)}`,hydra:`${round5(10+35*f)}–${round5(15+40*f)}`,hellfire:`${Math.max(1,Math.round(2+6*f))}–${Math.max(2,Math.round(3+7*f))}`,confidence:'برآورد اولیه',note:'برای مراحل ابتدایی از روند رشد داده‌های ثبت‌شده استفاده شده است.'};
    }
    if (stage > 30) return {gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای این Stage منبع مستقیمی که Level اصلی هر سه سلاح را با اطمینان نشان دهد پیدا نشده؛ عدد حدسی منتشر نمی‌کنیم.'};

    let lo=anchors[0], hi=anchors[anchors.length-1];
    for(let i=0;i<anchors.length-1;i++) if(stage>=anchors[i]&&stage<=anchors[i+1]){lo=anchors[i];hi=anchors[i+1];break;}
    const t=(stage-lo)/(hi-lo);
    const a=VERIFIED[lo], b=VERIFIED[hi];
    const lerp=(x,y)=>x+(y-x)*t;
    const g=round5(lerp(mid(a.gun),mid(b.gun))), h=round5(lerp(mid(a.hydra),mid(b.hydra))), f=Math.max(1,Math.round(lerp(mid(a.hellfire),mid(b.hellfire))));
    return {gun:`${Math.max(1,g-15)}–${g+15}`,hydra:`${Math.max(1,h-10)}–${h+10}`,hellfire:`${Math.max(1,f-3)}–${f+3}`,confidence:'برآورد بین داده‌ها',note:'این Stage گزارش مستقیم کافی ندارد؛ محدوده از نزدیک‌ترین داده‌های بازیکنان در دو طرف Stage برآورد شده است.'};
  }

  function stageNumber(card){
    const txt=card.textContent || '';
    const patterns=[/Stage\s*(\d{1,3})/i,/مرحله\s*(\d{1,3})/];
    for(const p of patterns){const m=txt.match(p);if(m)return Number(m[1]);}
    const badge=card.querySelector('[class*="stage"]');
    const m=badge?.textContent?.match(/\d{1,3}/);
    return m?Number(m[0]):null;
  }

  function decorate(){
    const grid=document.getElementById('stageGrid');
    if(!grid) return;
    [...grid.children].forEach(card=>{
      if(card.querySelector('.weapon-readiness')) return;
      const s=stageNumber(card); if(!s||s<1||s>100) return;
      const d=estimate(s);
      const box=document.createElement('div');
      box.className='weapon-readiness';
      box.style.cssText='margin-top:14px;padding:14px;border:1px solid rgba(120,170,220,.22);border-radius:16px;background:rgba(7,20,37,.55)';
      box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px"><strong>🎯 حداقل آمادگی پیشنهادی سلاح‌ها</strong><small style="opacity:.72">${d.confidence}</small></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px"><div><small style="opacity:.7">25mm</small><b style="display:block;margin-top:3px">${d.gun}</b></div><div><small style="opacity:.7">Hydra-70</small><b style="display:block;margin-top:3px">${d.hydra}</b></div><div><small style="opacity:.7">Hellfire</small><b style="display:block;margin-top:3px">${d.hellfire}</b></div></div><p style="margin:10px 0 0;font-size:.86rem;line-height:1.8;opacity:.78">${d.note}</p>`;
      card.appendChild(box);
    });
  }

  const grid=document.getElementById('stageGrid');
  if(grid){ new MutationObserver(decorate).observe(grid,{childList:true,subtree:false}); decorate(); }
})();
