(() => {
  'use strict';
  const VERIFIED = {
    9:{gun:'160–180',hydra:'45–55',hellfire:'8–10',confidence:'گزارش بازیکن',note:'در یک گزارش عملی، این محدوده برای مرحله ۹ بازی روانی داشته است.'},
    10:{gun:'250–300',hydra:'70–75',hellfire:'10–12',confidence:'داده قوی',note:'مرحله ۱۰ نقطه مهمی برای جمع‌کردن منابع است. قبل از عبور، بهتر است سلاح‌ها حاشیه امن خوبی داشته باشند.'},
    13:{gun:'255–275',hydra:'55–65',hellfire:'12–15',confidence:'گزارش بازیکن',note:'یک گزارش ثبت‌شده با اعداد نزدیک 259 / 57 / 13 امکان پیشروی تا مرحله ۱۴ را نشان داده است.'},
    15:{gun:'290–320',hydra:'65–80',hellfire:'15–20',confidence:'برآورد از داده‌های نزدیک',note:'این محدوده با استفاده از داده مرحله‌های نزدیک برآورد شده و عدد رسمی بازی نیست.'},
    19:{gun:'370–400',hydra:'85–100',hellfire:'24–30',confidence:'داده قوی',note:'برای عبور از محدوده ۱۹ تا ۲۰، مسلسل 25mm همچنان مهم‌ترین اولویت است.'},
    20:{gun:'390–410',hydra:'90–105',hellfire:'28–32',confidence:'داده قوی',note:'یک گزارش بازیکن بدون خرید پولی، محدوده نزدیک 390 / 90 / 28 را پیش از عبور از مرحله ۲۰ مناسب دانسته است.'},
    22:{gun:'390–420',hydra:'105–120',hellfire:'25–32',confidence:'داده قوی',note:'چند تجربه بازیکن اعداد نزدیک 400 / 110 / 25 را عملی گزارش کرده‌اند. مدیریت مهمات هم در این مرحله بسیار مهم است.'},
    27:{gun:'460–510',hydra:'180–230',hellfire:'38–48',confidence:'برآورد تجربی',note:'برای این مرحله عدد رسمی نداریم. این بازه از روند داده‌های مرحله‌های نزدیک ساخته شده و فقط راهنمای تصمیم‌گیری است.'},
    28:{gun:'480–525',hydra:'200–250',hellfire:'42–52',confidence:'برآورد تجربی',note:'مرحله ۲۸ نقطه مهمی برای فارم است؛ برای راحت‌ترشدن تکرار مرحله، کمی حاشیه قدرت اضافه در نظر گرفته شده است.'},
    30:{gun:'525–575',hydra:'250–290',hellfire:'50–60',confidence:'گزارش + برآورد',note:'یک بازیکن با اعداد نزدیک 524 / 264 / 54 تا ۸۷٪ پیش رفته؛ برای عبور کامل، کمی حاشیه بیشتر منطقی است.'},
    39:{gun:'600+',hydra:'300+',hellfire:'60+',confidence:'تخمین با اطمینان پایین',note:'مرحله ۳۹ نقطه فارم مهمی است، اما هنوز داده کافی برای تعیین حداقل دقیق سه سلاح نداریم. این اعداد فقط کف محافظه‌کارانه هستند.'},
    42:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'ویدیوی مرحله ۴۲ سطح بعضی کارت‌ها را نشان می‌دهد، نه لزوماً Level اصلی سه سلاح؛ این دو را یکی در نظر نگرفته‌ایم.'},
    52:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'سختی بالای مرحله ۵۲ تایید شده، اما هنوز عدد قابل‌اعتمادی برای حداقل Level سه سلاح نداریم.'},
    58:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'مرحله ۵۸ نقطه مهمی برای فارم است، اما تا پیدا شدن داده روشن‌تر عدد ساختگی نمایش نمی‌دهیم.'},
    66:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'مرحله ۶۶ یک دیوار سختی تاییدشده است. ویدیوی موجود خرج زیاد طلا و شکست دوباره را نشان می‌دهد، اما Level اصلی سه سلاح واضح نیست.'},
    69:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای این مرحله هنوز حداقل عددی قابل‌اعتماد پیدا نشده است.'},
    78:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای این مرحله هنوز حداقل عددی قابل‌اعتماد پیدا نشده است.'},
    88:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای مرحله‌های پایانی، تا وقتی داده کافی نداریم از حدس عددی خودداری می‌کنیم.'},
    98:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای مرحله‌های پایانی، تا وقتی داده کافی نداریم از حدس عددی خودداری می‌کنیم.'},
    99:{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای مرحله‌های پایانی، تا وقتی داده کافی نداریم از حدس عددی خودداری می‌کنیم.'}
  };
  const anchors=[9,10,13,15,19,20,22,27,28,30];
  const mid=str=>{const nums=String(str).match(/\d+/g)?.map(Number)||[];return nums.length>1?(nums[0]+nums[1])/2:(nums[0]||0)};
  const round5=n=>Math.round(n/5)*5;
  function estimate(stage){
    if(VERIFIED[stage])return VERIFIED[stage];
    if(stage<9){const f=stage/9;return{gun:`${round5(60+100*f)}–${round5(75+105*f)}`,hydra:`${round5(10+35*f)}–${round5(15+40*f)}`,hellfire:`${Math.max(1,Math.round(2+6*f))}–${Math.max(2,Math.round(3+7*f))}`,confidence:'برآورد اولیه',note:'برای مرحله‌های ابتدایی از روند رشد داده‌های ثبت‌شده استفاده شده است.'};}
    if(stage>30)return{gun:'داده کافی نیست',hydra:'داده کافی نیست',hellfire:'داده کافی نیست',confidence:'نیازمند داده بیشتر',note:'برای این مرحله هنوز منبع مستقیمی که Level اصلی هر سه سلاح را با اطمینان نشان دهد نداریم؛ بنابراین عدد حدسی منتشر نمی‌کنیم.'};
    let lo=anchors[0],hi=anchors[anchors.length-1];for(let i=0;i<anchors.length-1;i++)if(stage>=anchors[i]&&stage<=anchors[i+1]){lo=anchors[i];hi=anchors[i+1];break;}
    const t=(stage-lo)/(hi-lo),a=VERIFIED[lo],b=VERIFIED[hi],lerp=(x,y)=>x+(y-x)*t;const g=round5(lerp(mid(a.gun),mid(b.gun))),h=round5(lerp(mid(a.hydra),mid(b.hydra))),f=Math.max(1,Math.round(lerp(mid(a.hellfire),mid(b.hellfire))));
    return{gun:`${Math.max(1,g-15)}–${g+15}`,hydra:`${Math.max(1,h-10)}–${h+10}`,hellfire:`${Math.max(1,f-3)}–${f+3}`,confidence:'برآورد بین داده‌ها',note:'برای این مرحله گزارش مستقیم کافی نداریم؛ محدوده از نزدیک‌ترین داده‌های ثبت‌شده در دو طرف این مرحله برآورد شده است.'};
  }
  function stageNumber(card){const txt=card.textContent||'';const patterns=[/Stage\s*(\d{1,3})/i,/مرحله\s*(\d{1,3})/];for(const p of patterns){const m=txt.match(p);if(m)return Number(m[1]);}const badge=card.querySelector('[class*="stage"]');const m=badge?.textContent?.match(/\d{1,3}/);return m?Number(m[0]):null;}
  function decorate(){const grid=document.getElementById('stageGrid');if(!grid)return;[...grid.children].forEach(card=>{if(card.querySelector('.weapon-readiness'))return;const s=stageNumber(card);if(!s||s<1||s>100)return;const d=estimate(s);const box=document.createElement('div');box.className='weapon-readiness';box.style.cssText='margin-top:14px;padding:14px;border:1px solid rgba(120,170,220,.22);border-radius:16px;background:rgba(7,20,37,.55)';box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px"><strong>🎯 آمادگی تقریبی سلاح‌ها برای این مرحله</strong><small style="opacity:.72">${d.confidence}</small></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px"><div><small style="opacity:.7">مسلسل 25mm</small><b style="display:block;margin-top:3px">${d.gun}</b></div><div><small style="opacity:.7">هایدرا (Hydra-70)</small><b style="display:block;margin-top:3px">${d.hydra}</b></div><div><small style="opacity:.7">هلفایر (Hellfire)</small><b style="display:block;margin-top:3px">${d.hellfire}</b></div></div><p style="margin:10px 0 0;font-size:.86rem;line-height:1.8;opacity:.78">${d.note}</p>`;card.appendChild(box);});}
  const grid=document.getElementById('stageGrid');if(grid){new MutationObserver(decorate).observe(grid,{childList:true,subtree:false});decorate();}
})();