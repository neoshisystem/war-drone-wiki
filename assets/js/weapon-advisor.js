(()=>{
  'use strict';
  if(!/arsenal\.html$/i.test(location.pathname)) return;

  const clampStage=v=>Math.max(1,Math.min(100,Number(v)||1));
  const clampWeapon=v=>Math.max(0,Math.min(5000,Number(v)||0));

  // Practical community targets. These are planning benchmarks, not official requirements.
  const TARGETS={
    9:{gun:170,hydra:50,hell:9,label:'Stage 9',confidence:'گزارش عملی'},
    10:{gun:250,hydra:70,hell:10,label:'Stage 10',confidence:'داده قوی'},
    13:{gun:270,hydra:65,hell:15,label:'Stage 13',confidence:'گزارش + هموارسازی'},
    15:{gun:305,hydra:75,hell:18,label:'Stage 15',confidence:'برآورد نزدیک'},
    19:{gun:385,hydra:95,hell:28,label:'Stage 19',confidence:'داده قوی'},
    20:{gun:400,hydra:100,hell:30,label:'Stage 20',confidence:'داده قوی'},
    22:{gun:410,hydra:115,hell:30,label:'Stage 22',confidence:'گزارش بازیکن'},
    27:{gun:485,hydra:210,hell:45,label:'Stage 27',confidence:'برآورد جامعه'},
    28:{gun:505,hydra:225,hell:48,label:'Stage 28',confidence:'برآورد جامعه'},
    30:{gun:550,hydra:270,hell:55,label:'Stage 30',confidence:'گزارش + حاشیه امن'}
  };
  const STOPS=[9,10,13,15,19,20,27,28,39,58,69,78,88,98,99];
  const STOP_NOTE={
    9:'برای Early-game و Frenzy قابل استفاده است؛ اگر Run پایدار است می‌توانی کمی منابع جمع کنی.',
    10:'قبل از جهش 10→11 نقطه خوبی برای ذخیره Cash و آماده‌کردن 25mm است.',
    13:'نقطه Early-game خوب برای توقف، فارم و شرکت مفیدتر در Frenzy.',
    15:'گزینه فارم زودهنگام؛ قبل از رفتن به 19 می‌توانی Build را مرتب کنی.',
    19:'ترکیب مناسب Cash و Clan؛ قبل از ورود به 20/21 ارزش توقف دارد.',
    20:'قبل از جهش بعدی، اگر Build لب‌مرز است عجله نکن.',
    27:'Kill و Frenzy خوب؛ مقدمه مناسبی برای Stage 28.',
    28:'یکی از بهترین نقاط فارم شناخته‌شده؛ سرعت Run و Cash خوبی دارد.',
    39:'نقطه فارم بسیار قوی برای Cash/Clan/Frenzy.',
    58:'نقطه فارم پیشرفته؛ فقط وقتی Run واقعاً پایدار است.',
    69:'نقطه توقف Late-game قبل از فشار بیشتر مراحل بعدی.',
    78:'نقطه پیشرفته؛ قبل از 100٪ کردن آمادگی عبور را بررسی کن.',
    88:'Late-game farm stop؛ ثبات Run مهم‌تر از صرفاً Level بالاتر است.',
    98:'نقطه توقف انتهای بازی؛ خطر عبور ناخواسته را جدی بگیر.',
    99:'Endgame stop؛ برای بازیکن کاملاً آماده.'
  };

  function targetAtOrBefore(stage){
    const keys=Object.keys(TARGETS).map(Number).sort((a,b)=>a-b);
    let k=keys[0];
    keys.forEach(x=>{if(x<=stage)k=x;});
    return {stage:k,...TARGETS[k]};
  }
  function nextStop(stage){ return STOPS.find(s=>s>=stage)||99; }
  function nextStopAfter(stage){ return STOPS.find(s=>s>stage)||99; }
  function ratio(value,target){ return target?value/target:0; }

  function readiness(g,h,f,t){
    const parts=[ratio(g,t.gun),ratio(h,t.hydra),ratio(f,t.hell)];
    const min=Math.min(...parts), avg=parts.reduce((a,b)=>a+b,0)/parts.length;
    return {min,avg,parts};
  }

  function furthestReachable(current,g,h,f){
    const candidates=Object.keys(TARGETS).map(Number).sort((a,b)=>a-b).filter(s=>s>=current);
    let best=null;
    for(const s of candidates){
      const r=readiness(g,h,f,TARGETS[s]);
      // 25mm matters most; allow modest secondary-weapon lag but not severe imbalance.
      const gunOk=g>=TARGETS[s].gun*.95;
      const secondaryOk=h>=TARGETS[s].hydra*.82 && f>=TARGETS[s].hell*.82;
      if(gunOk&&secondaryOk&&r.avg>=.92) best=s; else break;
    }
    return best;
  }

  function weakLink(g,h,f,t){
    const vals=[['25mm Gun',ratio(g,t.gun)],['Hydra-70',ratio(h,t.hydra)],['Hellfire',ratio(f,t.hell)]].sort((a,b)=>a[1]-b[1]);
    return vals[0];
  }

  function stageOnlyAdvice(stage){
    const stop=nextStop(stage);
    const next=nextStopAfter(stop);
    if(stage>30){
      return {
        headline:`Stage ${stage}: تحلیل Stage فعال است، اما برای Level سلاح‌های Late-game داده عددی کافی نداریم.`,
        stop:`نقطه توقف نزدیک: Stage ${stop}`,
        next:`هدف بعدی: Stage ${next}`,
        body:'برای این بازه بهتر است از Stage Finder، ثبات Run، هزینه Upgrade و Difficulty Spikeها استفاده کنی. Advisor عمداً Level ساختگی برای مراحل بالاتر منتشر نمی‌کند.'
      };
    }
    const t=targetAtOrBefore(Math.max(stage,stop));
    return {
      headline:`برای Stage ${stage}، نزدیک‌ترین توقف برنامه‌ریزی‌شده Stage ${stop} است.`,
      stop:`Stage ${stop} — ${STOP_NOTE[stop]||'نقطه توقف و بازبینی Build.'}`,
      next:`بعد از آماده‌شدن: Stage ${next}`,
      body:`برای محدوده ${t.label}، Benchmark فعلی حدود 25mm=${t.gun}، Hydra=${t.hydra} و Hellfire=${t.hell} است. این اعداد Requirement رسمی نیستند و برای برنامه‌ریزی استفاده می‌شوند.`
    };
  }

  const balance=document.querySelector('#balance');
  if(!balance) return;
  const section=document.createElement('section');
  section.className='section';
  section.id='advisor';
  section.innerHTML=`
    <div class="shell">
      <div class="section-head">
        <span class="kicker">Weapon & Progression Advisor</span>
        <h2>با Build فعلی، تا کجا پیش بروم و کجا توقف کنم؟</h2>
        <p>Stage فعلی را وارد کن. اگر Level هر سه سلاح را هم بدهی، تحلیل دقیق‌تر می‌شود و سیستم بررسی می‌کند آیا بهتر است فعلاً فارم کنی، یک سلاح را جبران کنی یا تا نقطه توقف بعدی جلو بروی.</p>
      </div>
      <div class="advisor-tool">
        <div class="advisor-form">
          <label><span>Stage فعلی</span><input id="waStage" type="number" min="1" max="100" inputmode="numeric"></label>
          <label><span>LEVEL — 25mm Gun</span><input id="waGun" type="number" min="0" max="5000" inputmode="numeric" placeholder="مثلاً 486"></label>
          <label><span>LEVEL — Hydra-70</span><input id="waHydra" type="number" min="0" max="5000" inputmode="numeric" placeholder="مثلاً 210"></label>
          <label><span>LEVEL — Hellfire</span><input id="waHell" type="number" min="0" max="5000" inputmode="numeric" placeholder="مثلاً 46"></label>
          <button class="btn primary" id="waRun" type="button">تحلیل Build من</button>
        </div>
        <div class="advisor-help">
          <figure class="shot"><img src="assets/images/guides/11-weapon-upgrade-costs.jpg" alt="محل نمایش Level سلاح‌ها"><figcaption><b>کدام عدد را وارد کنم؟</b> عدد LEVEL بالای کارت هر Weapon را وارد کن؛ نه Damage، Ammo و نه قیمت Upgrade.</figcaption></figure>
          <div class="callout warn"><b>مهم:</b> Level تنها معیار نیست. Cardها، Buffها، Ammo، مهارت Run و نوع دشمن Stage هم روی نتیجه اثر دارند. این ابزار «پیشنهاد پیشروی» می‌دهد، نه تضمین عبور.</div>
        </div>
      </div>
      <div class="advisor-result" id="waResult" aria-live="polite"></div>
    </div>`;
  balance.after(section);

  const style=document.createElement('style');
  style.textContent=`
    .advisor-tool{display:grid;grid-template-columns:1fr .9fr;gap:18px;padding:22px;border:1px solid var(--line);border-radius:var(--radius);background:linear-gradient(145deg,var(--panel),var(--panel2));box-shadow:var(--shadow)}
    .advisor-form{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start}.advisor-form label span{display:block;color:var(--muted);font-size:.82rem;margin-bottom:5px}.advisor-form input{width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:12px;background:var(--bg2);color:var(--text);font-size:1rem}.advisor-form .btn{grid-column:1/-1}.advisor-help{display:grid;gap:12px}.advisor-result{margin-top:16px}.advisor-output{display:grid;gap:14px;padding:20px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel)}.advisor-output h3{margin:0}.advisor-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.advisor-metric{padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--panel2)}.advisor-metric span{display:block;color:var(--muted);font-size:.78rem}.advisor-metric b{display:block;margin-top:4px;color:var(--cyan)}.advisor-actions{display:flex;gap:8px;flex-wrap:wrap}.advisor-status.good{color:var(--green)}.advisor-status.warn{color:var(--gold)}.advisor-status.bad{color:var(--danger)}
    @media(max-width:800px){.advisor-tool{grid-template-columns:1fr}.advisor-form{grid-template-columns:1fr}.advisor-metrics{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const stageEl=document.querySelector('#waStage'), gunEl=document.querySelector('#waGun'), hydraEl=document.querySelector('#waHydra'), hellEl=document.querySelector('#waHell'), result=document.querySelector('#waResult');
  stageEl.value=clampStage(localStorage.getItem('wd-current-stage')||1);
  gunEl.value=localStorage.getItem('wd-weapon-gun')||'';
  hydraEl.value=localStorage.getItem('wd-weapon-hydra')||'';
  hellEl.value=localStorage.getItem('wd-weapon-hell')||'';

  function save(){
    localStorage.setItem('wd-current-stage',clampStage(stageEl.value));
    if(gunEl.value) localStorage.setItem('wd-weapon-gun',clampWeapon(gunEl.value));
    if(hydraEl.value) localStorage.setItem('wd-weapon-hydra',clampWeapon(hydraEl.value));
    if(hellEl.value) localStorage.setItem('wd-weapon-hell',clampWeapon(hellEl.value));
  }

  function render(){
    save();
    const stage=clampStage(stageEl.value);
    const raw=[gunEl.value,hydraEl.value,hellEl.value];
    const complete=raw.every(v=>String(v).trim()!==''&&Number(v)>0);
    if(!complete){
      const a=stageOnlyAdvice(stage);
      result.innerHTML=`<div class="advisor-output"><h3>${a.headline}</h3><div class="advisor-metrics"><div class="advisor-metric"><span>توقف نزدیک</span><b>${a.stop}</b></div><div class="advisor-metric"><span>قدم بعدی</span><b>${a.next}</b></div><div class="advisor-metric"><span>تحلیل دقیق Weapon</span><b>سه Level را کامل وارد کن</b></div></div><p>${a.body}</p><div class="advisor-actions"><a class="btn" href="stages.html?to=${stage}&goal=cash">Stageهای فارم قابل دسترس</a><a class="btn" href="clan.html">Frenzy Planner</a></div></div>`;
      return;
    }

    const g=clampWeapon(gunEl.value), h=clampWeapon(hydraEl.value), f=clampWeapon(hellEl.value);
    if(stage>30){
      result.innerHTML=`<div class="advisor-output"><h3>Build ثبت شد؛ اما برای Stage ${stage} هنوز Benchmark عددی کافی نداریم.</h3><p>Levelهای شما: 25mm <b>${g}</b>، Hydra <b>${h}</b>، Hellfire <b>${f}</b>. برای Late-game عمداً از ساخت عدد حداقل خودداری می‌کنیم. از این داده برای مقایسه هزینه Upgrade، ضعف نسبی Weaponها و Stage Finder استفاده کن.</p><div class="advisor-actions"><a class="btn primary" href="stages.html?to=${stage}&goal=clan">تحلیل Stageهای قابل دسترس</a><a class="btn" href="clan.html">Frenzy Planner</a></div></div>`;
      return;
    }

    const baseline=targetAtOrBefore(stage);
    const currentR=readiness(g,h,f,baseline);
    const weak=weakLink(g,h,f,baseline);
    const reach=furthestReachable(stage,g,h,f);
    const plannedStop=nextStop(stage);
    let destination=reach||stage;
    if(destination<plannedStop && reach) destination=reach;
    if(reach&&reach>=plannedStop) destination=plannedStop;
    const next=nextStopAfter(destination);

    let statusClass='warn', status='Build قابل استفاده است، ولی بهتر است قبل از جهش بعدی کمی تقویت شود.';
    if(currentR.min>=.9&&currentR.avg>=1){statusClass='good';status='Build برای محدوده فعلی متعادل و آماده به نظر می‌رسد.';}
    if(currentR.min<.72){statusClass='bad';status='یکی از سه Weapon نسبت به Benchmark فعلی عقب است؛ پیشروی تهاجمی توصیه نمی‌شود.';}

    let action='فعلاً روی 25mm تمرکز کن و Hydra/Hellfire را فقط برای جبران ضعف یا Daily Mission بالا ببر.';
    if(weak[0]==='Hydra-70') action='Hydra نسبت به Build فعلی عقب‌تر است؛ قبل از Stageهای گروهی چند Upgrade هدفمند روی Hydra منطقی است.';
    if(weak[0]==='Hellfire') action='Hellfire نسبت به Benchmark فعلی عقب‌تر است؛ اگر Armor و تانک‌ها زمان Run را خراب می‌کنند، این شاخه را جبران کن.';
    if(weak[0]==='25mm Gun') action='25mm حلقه ضعیف فعلی است و اولویت اصلی Cash تو باید همین سلاح باشد.';

    const destNote=destination>stage?`با این Build، پیشروی محافظه‌کارانه تا <b>Stage ${destination}</b> قابل دفاع است. ${STOP_NOTE[destination]||''}`:`بهتر است فعلاً روی <b>Stage ${stage}</b> یا نزدیک‌ترین Farm Stage قابل دسترس بمانی و Build را کامل‌تر کنی.`;
    result.innerHTML=`<div class="advisor-output"><h3 class="advisor-status ${statusClass}">${status}</h3><div class="advisor-metrics"><div class="advisor-metric"><span>پیشنهاد پیشروی</span><b>${destination>stage?`تا Stage ${destination}`:'فعلاً توقف'}</b></div><div class="advisor-metric"><span>ضعیف‌ترین نسبت</span><b>${weak[0]}</b></div><div class="advisor-metric"><span>نقطه بعدی برای بازبینی</span><b>Stage ${next}</b></div></div><p>${destNote}</p><p><b>اولویت Upgrade:</b> ${action}</p><p style="color:var(--muted)">Benchmark نزدیک (${baseline.confidence}): 25mm ${baseline.gun} · Hydra ${baseline.hydra} · Hellfire ${baseline.hell}. Card، Buff، Ammo و مهارت بازی می‌توانند نتیجه واقعی را جابه‌جا کنند.</p><div class="advisor-actions"><a class="btn primary" href="stages.html?to=${Math.max(stage,destination)}&goal=cash">Stageهای مناسب فارم من</a><a class="btn" href="stages.html?to=${Math.max(stage,destination)}&goal=frenzy">Stageهای Frenzy من</a><a class="btn" href="clan.html">رفتن به Clan Planner</a></div></div>`;
  }

  document.querySelector('#waRun').addEventListener('click',render);
  [stageEl,gunEl,hydraEl,hellEl].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')render();}));
  render();
})();