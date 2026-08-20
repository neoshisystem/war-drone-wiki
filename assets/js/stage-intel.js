(()=>{
  'use strict';
  const names={
    10:'Desert Fox',15:'Night Hawk',19:'Shadow Hunter',27:'Dragon Strike',28:'Falcon Wing',39:'Steel Blizzard',48:'Arctic Flame',58:'Silent Fury',69:'Desert Falcon',78:'Blaze Strike',88:'Void Lancer',98:'Sky Fortress',99:"Dragon's Wing"
  };
  const rank={
    cash:[39,58,28,15,19,27,10,69,78,88,98,99],
    clan:[39,58,28,19,27,69,78,88,98,99],
    kills:[39,58,48,27,69,78,88,98,99,19],
    frenzy:[39,58,28,27,19,69,78,88,98,99],
    farm99:[39,28,58,19,15,10,69,78,88,98,99]
  };
  const notes={
    10:'نقطه توقف اولیه؛ برای ساخت ذخیره Cash قبل از جهش بعدی مناسب است.',
    15:'گزینه زودهنگام برای فارم و تمرین کنترل پایان Stage.',
    19:'Run پایدار و ترکیب خوب Cash + Clan برای بازیکن‌های اوایل بازی.',
    27:'تراکم Kill خوب؛ برای شارژ Frenzy و Kill Farm ارزشمند است.',
    28:'یکی از بهترین Benchmarkهای فعلی؛ سریع، فارم‌پسند و مناسب Clan Medal.',
    39:'یکی از قوی‌ترین Stageهای ترکیبی برای Cash، Kill و Frenzy.',
    48:'تمرکز اصلی روی تراکم Kill؛ برای Frenzy و Kill Farm مفید است.',
    58:'Stage قدرتمند برای Farm و Frenzy؛ بهتر است فقط با Run پایدار انتخاب شود.',
    69:'نقطه توقف مناسب قبل از بخش‌های سخت‌تر Late-game.',
    78:'گزینه پیشرفته؛ قبل از 100٪ کردن مطمئن شو آماده عبور هستی.',
    88:'گزینه Late-game با ارزش خوب، به شرط سرعت و ثبات Run.',
    98:'نقطه توقف Late-game؛ ریسک عبور ناخواسته را جدی بگیر.',
    99:'گزینه انتهای بازی؛ بیشتر برای بازیکن‌های کاملاً آماده.'
  };
  const label={cash:'Cash Farm',clan:'Clan Medal',kills:'Kill Farm',frenzy:'Frenzy',farm99:'98–99٪ Farm'};
  function clampStage(v){return Math.max(1,Math.min(100,Number(v)||1));}
  function recommend(goal,maxStage=100,count=3){
    const max=clampStage(maxStage);
    return (rank[goal]||[]).filter(s=>s<=max).slice(0,count).map((stage,index)=>({
      stage,index:index+1,name:names[stage]||`Stage ${stage}`,note:notes[stage]||'',goal,label:label[goal]||goal
    }));
  }
  function hybrid(goals,maxStage=100,count=3){
    const max=clampStage(maxStage); const score=new Map();
    goals.forEach(g=>(rank[g]||[]).forEach((s,i)=>{if(s<=max)score.set(s,(score.get(s)||0)+(100-i*4));}));
    return [...score.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,count).map(([stage],index)=>({stage,index:index+1,name:names[stage]||`Stage ${stage}`,note:notes[stage]||''}));
  }
  window.WD_STAGE_INTEL={rank,names,notes,label,recommend,hybrid,clampStage};
})();