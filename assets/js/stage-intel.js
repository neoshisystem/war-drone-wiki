(()=>{
  'use strict';

  const names={
    5:"Viper's Nest",8:'Steel Hammer',9:'Bust Flush',10:'Desert Fox',11:'Shadow Phoenix',12:'Silent Viper',13:'Iron Shield',15:'Night Hawk',19:'Shadow Hunter',20:'Dark Horizon',27:'Dragon Strike',28:'Falcon Wing',30:'Death Wing',39:'Steel Blizzard',48:'Arctic Flame',58:'Silent Fury',69:'Desert Falcon',78:'Blaze Strike',88:'Void Lancer',98:'Sky Fortress',99:"Dragon's Wing"
  };

  const rank={
    cash:[39,58,28,15,19,27,10,69,78,88,98,99],
    clan:[39,58,28,19,27,13,10,9,5,8,11,12,69,78,88,98,99],
    kills:[39,58,48,27,19,13,10,9,8,5,69,78,88,98,99],
    frenzy:[39,58,28,27,19,13,10,9,5,8,11,12,69,78,88,98,99],
    farm99:[39,28,58,19,15,10,13,9,69,78,88,98,99]
  };

  const notes={
    5:'گزینه کم‌هزینه و سریع برای تست چرخه Frenzy؛ در تجربه عملی PERSIA گاهی Clan Medal بسیار خوبی داده است.',
    8:'از Stageهای ابتدایی قابل استفاده در Frenzy؛ برای بازیکنی که هنوز مراحل زیادی باز نکرده ارزش تست دارد.',
    9:'Stage ابتدایی خوب برای تست Frenzy و Runهای سریع؛ نتیجه بین Frenzyها می‌تواند شدیداً تغییر کند.',
    10:'نقطه توقف اولیه و یکی از گزینه‌های مناسب Frenzy اوایل بازی؛ قبل از عبور، Cash و Weapon ذخیره بساز.',
    11:'برای بازیکن تازه‌وارد قابل استفاده است؛ اگر Stageهای 5/9/10 در این Frenzy ضعیف بودند آن را تست کن.',
    12:'گزینه جایگزین در چرخه Frenzy اوایل بازی؛ اول یک Run آزمایشی بزن و Medal/min را مقایسه کن.',
    13:'یکی از گزینه‌های خوب اوایل بازی برای Clan Medal؛ هم‌زمان می‌تواند نقطه مناسبی برای آماده‌سازی Stage 15 باشد.',
    15:'گزینه زودهنگام برای فارم و تمرین کنترل پایان Stage.',
    19:'Run پایدار و ترکیب خوب Cash + Clan برای بازیکن‌های اوایل بازی.',
    20:'قبل از عبور به 21 بهتر است Weaponها و ذخیره Cash را برای جهش سختی آماده کرده باشی.',
    27:'تراکم Kill خوب؛ برای شارژ Frenzy و Kill Farm ارزشمند است.',
    28:'یکی از بهترین Benchmarkهای فعلی؛ سریع، فارم‌پسند و مناسب Clan Medal.',
    30:'مرز مهم Progression؛ قبل از 31 بهتر است Build و ذخیره Cash آماده باشد.',
    39:'یکی از قوی‌ترین Stageهای ترکیبی برای Cash، Kill و Frenzy.',
    48:'تمرکز اصلی روی تراکم Kill؛ برای Frenzy و Kill Farm مفید است.',
    58:'Stage قدرتمند برای Farm و Frenzy؛ بهتر است فقط با Run پایدار انتخاب شود.',
    69:'نقطه توقف مناسب قبل از بخش‌های سخت‌تر Late-game.',
    78:'گزینه پیشرفته؛ قبل از 100٪ کردن مطمئن شو آماده عبور هستی.',
    88:'گزینه Late-game با ارزش خوب، به شرط سرعت و ثبات Run.',
    98:'نقطه توقف Late-game؛ ریسک عبور ناخواسته را جدی بگیر.',
    99:'گزینه انتهای بازی؛ بیشتر برای بازیکن‌های کاملاً آماده.'
  };

  const frenzyEvidence={
    5:'تجربه مستقیم: در یک Frenzy حدود 1,700 Medal ثبت شده، اما Runهای حدود 300 هم دیده شده‌اند.',
    8:'تجربه مستقیم بازیکن: از Stageهای ابتدایی دارای بازده خوب در بعضی Frenzyها.',
    9:'تجربه مستقیم بازیکن: از گزینه‌های خوب اوایل بازی، با نوسان بین چرخه‌ها.',
    10:'تجربه مستقیم بازیکن: گزینه قابل اتکا برای تست در Frenzy اوایل بازی.',
    11:'تجربه مستقیم: امکان گرفتن امتیاز مفید در Progress پایین.',
    12:'تجربه مستقیم: امکان گرفتن امتیاز مفید در Progress پایین.',
    13:'تجربه مستقیم: در Progress پایین می‌تواند Clan Medal مناسبی بدهد.'
  };

  const weaponTargets={
    5:{gun:'110–130',hydra:'25–35',hellfire:'5–7',confidence:'برآورد راهنما'},
    8:{gun:'145–165',hydra:'40–50',hellfire:'7–9',confidence:'برآورد نزدیک به داده Stage 9'},
    9:{gun:'160–180',hydra:'45–55',hellfire:'8–10',confidence:'گزارش بازیکن'},
    10:{gun:'250–300',hydra:'70–75',hellfire:'10–12',confidence:'داده قوی'},
    13:{gun:'255–275',hydra:'55–65',hellfire:'12–15',confidence:'گزارش بازیکن'},
    15:{gun:'290–320',hydra:'65–80',hellfire:'15–20',confidence:'برآورد از داده نزدیک'},
    19:{gun:'370–400',hydra:'85–100',hellfire:'24–30',confidence:'داده قوی'},
    20:{gun:'390–410',hydra:'90–105',hellfire:'28–32',confidence:'داده قوی'},
    22:{gun:'390–420',hydra:'105–120',hellfire:'25–32',confidence:'داده قوی'},
    27:{gun:'460–510',hydra:'180–230',hellfire:'38–48',confidence:'برآورد جامعه'},
    28:{gun:'480–525',hydra:'200–250',hellfire:'42–52',confidence:'برآورد جامعه'},
    30:{gun:'525–575',hydra:'250–290',hellfire:'50–60',confidence:'گزارش + برآورد'},
    39:{gun:'600+',hydra:'300+',hellfire:'60+',confidence:'تخمین کم‌اطمینان'}
  };

  const milestones=[
    {min:1,max:7,stop:5,next:8,stay:'چند روز یا تا وقتی Stage 5 کاملاً سریع و کم‌ریسک شود',why:'یادگیری Spawnها و ساخت اولین ذخیره Cash'},
    {min:8,max:9,stop:9,next:10,stay:'2–5 روز، بسته به میزان بازی روزانه',why:'آماده‌شدن برای اولین نقطه توقف جدی'},
    {min:10,max:12,stop:10,next:13,stay:'حداقل چند روز؛ تا رسیدن 25mm به محدوده امن و ساخت ذخیره Cash',why:'Stage 10 اولین توقف مهم قبل از Progress بعدی است'},
    {min:13,max:14,stop:13,next:15,stay:'3–7 روز یا تا وقتی Run راحت شود',why:'برای آماده‌سازی Stage 15 و Daily Missionها'},
    {min:15,max:18,stop:15,next:19,stay:'حدود یک هفته یا بیشتر اگر Cash کم داری',why:'نقطه فارم زودهنگام قبل از ورود به بازه 19–20'},
    {min:19,max:20,stop:19,next:20,stay:'تا وقتی محدوده Weapon هدف 20 را ساخته‌ای؛ عجله برای 21 نکن',why:'قبل از جهش 20→21'},
    {min:21,max:26,stop:22,next:27,stay:'چند روز تا یک هفته بر اساس سختی Run',why:'آماده‌سازی برای نقاط فارم قوی 27 و 28'},
    {min:27,max:28,stop:28,next:30,stay:'برای فارم جدی 2–8 هفته هم می‌تواند منطقی باشد؛ معیار، نیاز Cash و سرعت Run توست',why:'Stage 28 یکی از بهترین نقاط ثبت‌شده برای Cash و Clan است'},
    {min:29,max:38,stop:30,next:39,stay:'تا وقتی Stageهای فعلی بدون فشار جدی اجرا شوند؛ برای 39 ذخیره بساز',why:'39 نقطه توقف بسیار قوی بعدی است'},
    {min:39,max:57,stop:39,next:58,stay:'در صورت نیاز به Cash/Clan می‌توانی چند هفته روی 39 بمانی',why:'ترکیب قوی Cash + Kill + Frenzy'},
    {min:58,max:68,stop:58,next:69,stay:'تا وقتی Run پایدار و Build آماده جهش بعدی شود',why:'Farm قوی و تراکم مناسب'},
    {min:69,max:77,stop:69,next:78,stay:'بر اساس نیاز منابع؛ عجله برای عبور نداشته باش',why:'نقطه توقف قبل از Late-game'},
    {min:78,max:87,stop:78,next:88,stay:'تا پایداری کامل Run و ذخیره مناسب',why:'نقطه توقف پیشرفته'},
    {min:88,max:97,stop:88,next:98,stay:'تا وقتی Build و Support برای Late-game آماده باشد',why:'آماده‌سازی انتهای بازی'},
    {min:98,max:100,stop:98,next:99,stay:'بر اساس هدف Endgame؛ قبل از 100٪ کردن تصمیم بگیر',why:'حفظ گزینه فارم در انتهای بازی'}
  ];

  const label={cash:'Cash Farm',clan:'Clan Medal',kills:'Kill Farm',frenzy:'Frenzy',farm99:'98–99٪ Farm'};
  function clampStage(v){return Math.max(1,Math.min(100,Number(v)||1));}
  function recommend(goal,maxStage=100,count=3){
    const max=clampStage(maxStage);
    return (rank[goal]||[]).filter(s=>s<=max).slice(0,count).map((stage,index)=>({stage,index:index+1,name:names[stage]||`Stage ${stage}`,note:notes[stage]||'',evidence:frenzyEvidence[stage]||'',goal,label:label[goal]||goal}));
  }
  function hybrid(goals,maxStage=100,count=3){
    const max=clampStage(maxStage); const score=new Map();
    goals.forEach(g=>(rank[g]||[]).forEach((s,i)=>{if(s<=max)score.set(s,(score.get(s)||0)+(100-i*4));}));
    return [...score.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,count).map(([stage],index)=>({stage,index:index+1,name:names[stage]||`Stage ${stage}`,note:notes[stage]||''}));
  }
  function progression(stage){
    const s=clampStage(stage);
    const m=milestones.find(x=>s>=x.min&&s<=x.max)||milestones[milestones.length-1];
    const currentTarget=weaponTargets[s]||weaponTargets[m.stop]||null;
    const nextTarget=weaponTargets[m.next]||null;
    return {...m,currentStage:s,currentTarget,nextTarget,stopName:names[m.stop]||`Stage ${m.stop}`,nextName:names[m.next]||`Stage ${m.next}`};
  }

  window.WD_STAGE_INTEL={rank,names,notes,label,frenzyEvidence,weaponTargets,milestones,recommend,hybrid,progression,clampStage};
})();