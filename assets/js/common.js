(()=>{
  const C=window.WAR_DRONE_WIKI_CONFIG||{clanName:'PERSIA',projectAuthor:'Hisystem',defaultTheme:'dark'};
  const root=document.documentElement;

  if(!document.querySelector('link[href="assets/css/mobile-plus.css"]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='assets/css/mobile-plus.css';document.head.appendChild(l);
  }

  root.dataset.theme=localStorage.getItem('wd-theme')||C.defaultTheme||'dark';
  document.querySelectorAll('[data-clan]').forEach(x=>x.textContent=C.clanName||'PERSIA');
  document.querySelectorAll('[data-author]').forEach(x=>x.textContent=C.projectAuthor||'Hisystem');

  document.querySelectorAll('[data-theme-toggle]').forEach(btn=>{
    const sync=()=>btn.textContent=root.dataset.theme==='dark'?'☀️':'🌙';
    btn.addEventListener('click',()=>{
      root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
      localStorage.setItem('wd-theme',root.dataset.theme);sync();
    });
    sync();
  });

  const nav=document.querySelector('.main-nav');
  if(nav){
    const links=[
      ['index.html','خانه'],['academy.html','آموزش بازی'],['stages.html','تحلیل مرحله‌ها'],['clan.html','کلن و فرنزی'],
      ['arsenal.html','سلاح‌ها و کارت‌ها'],['glossary.html','واژه‌نامه'],['advisor.html','راهنمای پیشروی']
    ];
    links.forEach(([href,label])=>{
      let a=nav.querySelector(`a[href="${href}"]`);
      if(!a){a=document.createElement('a');a.href=href;nav.appendChild(a);}
      a.textContent=label;
    });
  }

  const topbar=document.querySelector('.topbar .shell');
  if(nav&&topbar&&!topbar.querySelector('.mobile-nav-toggle')){
    const toggle=document.createElement('button');toggle.type='button';toggle.className='mobile-nav-toggle';
    toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','باز کردن منوی سایت');
    toggle.innerHTML='<span>☰</span><b>منو</b>';
    const theme=topbar.querySelector('.theme-toggle');topbar.insertBefore(toggle,theme||nav);
    toggle.addEventListener('click',()=>{
      const open=document.body.classList.toggle('nav-open');toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.querySelector('span').textContent=open?'×':'☰';
    });
    nav.addEventListener('click',e=>{if(e.target.closest('a')){document.body.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false');toggle.querySelector('span').textContent='☰';}});
  }

  const raw=localStorage.getItem('wd-current-stage');
  const hasStage=raw!==null&&raw!==''&&Number(raw)>=1;
  const savedStage=hasStage?Math.max(1,Math.min(100,Number(raw))):null;
  const syncText=v=>document.querySelectorAll('[data-current-stage-text]').forEach(x=>x.textContent=v??'ثبت نشده');
  document.querySelectorAll('[data-current-stage]').forEach(inp=>{
    inp.value=savedStage??'';inp.placeholder=inp.placeholder||'مثلاً 20';
    const update=()=>{
      if(inp.value===''){localStorage.removeItem('wd-current-stage');syncText(null);document.dispatchEvent(new CustomEvent('wd-stage-clear'));return;}
      const v=Math.max(1,Math.min(100,Number(inp.value)||1));inp.value=v;localStorage.setItem('wd-current-stage',v);syncText(v);
      document.dispatchEvent(new CustomEvent('wd-stage-change',{detail:v}));
    };
    inp.addEventListener('input',update);inp.addEventListener('change',update);
  });
  syncText(savedStage);

  // واژه‌های فنی تولیدشده توسط اسکریپت‌ها را تا حد ممکن به زبان ساده نمایش می‌دهیم.
  const replacements=[
    [/Weapon & Progression Advisor/g,'راهنمای پیشروی و سلاح'],[/Weapon Readiness/g,'آمادگی سلاح‌ها'],
    [/Benchmark/g,'معیار مقایسه تجربی'],[/Requirement/g,'شرط رسمی'],[/Build/g,'وضعیت سلاح‌ها'],
    [/Late-game/g,'مراحل پایانی'],[/Early-game/g,'مراحل ابتدایی'],[/Progression/g,'پیشروی'],[/Progress/g,'پیشروی'],
    [/Upgrade/g,'ارتقا'],[/Weapons/g,'سلاح‌ها'],[/Weapon/g,'سلاح'],[/Run/g,'دور بازی'],[/Stage /g,'مرحله ']
  ];
  function polish(rootNode){
    const walker=document.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      if(!n.nodeValue||!n.nodeValue.trim())return;
      if(n.parentElement?.closest('script,style,code,pre'))return;
      let v=n.nodeValue;replacements.forEach(([r,to])=>v=v.replace(r,to));if(v!==n.nodeValue)n.nodeValue=v;
    });
  }
  polish(document.body);
  const mo=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)polish(n.nodeType===3?n.parentNode:n);})));mo.observe(document.body,{childList:true,subtree:true});
})();