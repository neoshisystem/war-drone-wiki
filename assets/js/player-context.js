(()=>{
  'use strict';

  const PAGE=location.pathname.split('/').pop()||'index.html';
  if(!['advisor.html','clan.html','arsenal.html'].includes(PAGE)) return;

  const SELECTORS={
    stage:'#waStage,#plannerStage',
    weapons:['#waGun','#waHydra','#waHell']
  };
  const STORAGE={mode:'wd-player-context-mode',player:'wd-player-context-player'};
  const DATA={players:null,snapshots:null,observations:null};
  const cacheBust='';

  function loadJson(path){
    return fetch(new URL(path,document.baseURI).href+cacheBust,{cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  function esc(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
  function normalize(value){return String(value??'').trim().toLocaleLowerCase('fa').replace(/\s+/g,' ');}
  function stageInput(){return document.querySelector(SELECTORS.stage);}
  function weaponInputs(){return SELECTORS.weapons.map(s=>document.querySelector(s));}
  function available(){return !!stageInput();}
  function dispatchValue(el,value){if(!el||value===null||value===undefined)return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}

  function currentSnapshot(){
    const id=DATA.snapshots?.current_snapshot_id;
    const list=DATA.snapshots?.snapshots||[];
    return list.find(s=>s.snapshot_id===id)||null;
  }

  function currentObservation(playerId){
    const snap=currentSnapshot();
    const rows=DATA.observations?.snapshots?.[snap?.snapshot_id]||[];
    return rows.find(o=>o.player_id===playerId)||null;
  }

  function currentPlayer(playerId){
    return (DATA.players?.players||[]).find(p=>p.player_id===playerId)||null;
  }

  function activePlayers(){
    return (DATA.players?.players||[]).filter(p=>p.status==='active');
  }

  function contextMount(input){
    if(!input) return null;
    if(input.dataset.wdPlayerContextReady==='1') return input.previousElementSibling?.matches?.('[data-wd-player-context]')?input.previousElementSibling:null;
    let parent=input.closest('form,.advisor-form,.planner-grid');
    if(!parent) parent=input.parentElement;
    const mount=document.createElement('div');
    mount.className='wd-player-context';
    mount.dataset.wdPlayerContext='1';
    input.parentElement.insertBefore(mount,input.parentElement.firstChild);
    input.dataset.wdPlayerContextReady='1';
    return mount;
  }

  function build(mount){
    mount.innerHTML=`
      <div class="wd-player-context__top">
        <div><p class="wd-player-context__title">اطلاعات بازیکن</p></div>
        <div class="wd-player-context__modes" role="tablist" aria-label="روش ورود اطلاعات بازیکن">
          <button type="button" class="wd-player-context__mode" data-wd-mode="player">انتخاب بازیکن</button>
          <button type="button" class="wd-player-context__mode" data-wd-mode="manual">ورود دستی</button>
        </div>
      </div>
      <div class="wd-player-context__lookup">
        <div class="wd-player-context__search">
          <input class="wd-player-context__search-input" type="search" autocomplete="off" spellcheck="false" placeholder="نام بازیکن را جست‌وجو کن…" aria-label="جست‌وجوی بازیکن">
          <ul class="wd-player-context__results" role="listbox"></ul>
        </div>
        <div class="wd-player-context__selected" hidden>
          <div><div class="wd-player-context__selected-name"></div><span class="wd-player-context__selected-meta"></span></div>
          <button type="button" class="wd-player-context__change">تغییر بازیکن</button>
        </div>
      </div>
      <div class="wd-player-context__manual"><p class="wd-player-context__note">در حالت دستی، مقادیر همین فرم را خودت وارد کن و سایت از Player خاصی اطلاعات نمی‌گیرد.</p></div>
      <p class="wd-player-context__status" aria-live="polite"></p>
      <p class="wd-player-context__note">انتخاب بازیکن فقط از داده تأییدشده آخرین Snapshot انجام می‌شود؛ تایپ نام به‌تنهایی انتخاب محسوب نمی‌شود.</p>`;

    const els={
      root:mount,
      modes:[...mount.querySelectorAll('[data-wd-mode]')],
      search:mount.querySelector('.wd-player-context__search'),
      input:mount.querySelector('.wd-player-context__search-input'),
      results:mount.querySelector('.wd-player-context__results'),
      selected:mount.querySelector('.wd-player-context__selected'),
      selectedName:mount.querySelector('.wd-player-context__selected-name'),
      selectedMeta:mount.querySelector('.wd-player-context__selected-meta'),
      change:mount.querySelector('.wd-player-context__change'),
      status:mount.querySelector('.wd-player-context__status')
    };
    mount.__wdPlayerContext=els;
    return els;
  }

  function setStatus(ui,text,type=''){ui.status.textContent=text||'';ui.status.className='wd-player-context__status'+(type?` is-${type}`:'');}

  function closeResults(ui){ui.results.classList.remove('is-open');ui.results.innerHTML='';ui.activeIndex=-1;}

  function renderResults(ui){
    const q=normalize(ui.input.value);
    if(!q){closeResults(ui);return;}
    const rows=activePlayers().filter(p=>normalize(p.display_name).includes(q)).slice(0,8);
    ui.results.innerHTML=rows.length?rows.map((p,i)=>`<li role="option"><button type="button" class="wd-player-context__option" data-player-id="${esc(p.player_id)}" data-index="${i}"><span class="wd-player-context__option-name">${esc(p.display_name)}</span><span class="wd-player-context__option-meta">${esc(p.role||'Member')}</span></button></li>`).join(''):`<li><span class="wd-player-context__option-meta">بازیکنی با این نام پیدا نشد.</span></li>`;
    if(rows.length) ui.results.classList.add('is-open'); else ui.results.classList.remove('is-open');
    ui.activeIndex=-1;
  }

  function selectedMeta(player,snapshot){
    return `${player?.role||'Member'} · آخرین Snapshot: ${snapshot?.date_persian||''} · ${snapshot?.time_iran||''}`;
  }

  function fillFromPlayer(ui,player){
    const snapshot=currentSnapshot();
    const obs=currentObservation(player.player_id);
    if(!obs){
      setStatus(ui,'برای این بازیکن در آخرین Snapshot داده‌ای ثبت نشده است.','error');
      return;
    }
    const stage=stageInput();
    dispatchValue(stage,obs.stage);
    const [gun,hydra,hell]=weaponInputs();
    dispatchValue(gun,obs.weapons?.['25mm']);
    dispatchValue(hydra,obs.weapons?.hydra);
    dispatchValue(hell,obs.weapons?.hellfire);
    localStorage.setItem(STORAGE.player,player.player_id);
    localStorage.setItem(STORAGE.mode,'player');
    ui.selectedName.textContent=player.display_name;
    ui.selectedMeta.textContent=selectedMeta(player,snapshot);
    ui.selected.hidden=false;
    ui.search.hidden=true;
    ui.input.value='';
    closeResults(ui);
    setStatus(ui,'اطلاعات چهار ورودی از آخرین Snapshot پر شد.','good');
  }

  function switchMode(ui,mode){
    ui.root.classList.toggle('is-manual',mode==='manual');
    ui.modes.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.wdMode===mode));
    localStorage.setItem(STORAGE.mode,mode);
    if(mode==='player'){
      const stored=localStorage.getItem(STORAGE.player);
      const p=stored&&currentPlayer(stored);
      if(p&&currentObservation(p.player_id)) fillFromPlayer(ui,p); else {
        ui.selected.hidden=true;ui.search.hidden=false;setStatus(ui,'بازیکن را جست‌وجو و از نتایج یکی را انتخاب کن.');
      }
    }else{
      closeResults(ui);ui.selected.hidden=true;ui.search.hidden=false;setStatus(ui,'حالت دستی فعال است.');
    }
  }

  function attach(ui){
    ui.modes.forEach(btn=>btn.addEventListener('click',()=>switchMode(ui,btn.dataset.wdMode)));
    ui.input.addEventListener('input',()=>renderResults(ui));
    ui.input.addEventListener('focus',()=>{if(ui.input.value)renderResults(ui);});
    ui.change.addEventListener('click',()=>{
      ui.search.hidden=false;ui.selected.hidden=true;ui.input.value='';ui.input.focus();setStatus(ui,'بازیکن جدید را جست‌وجو کن.');
    });
    ui.results.addEventListener('click',e=>{
      const btn=e.target.closest('[data-player-id]');
      if(!btn)return;
      const p=currentPlayer(btn.dataset.playerId);
      if(p)fillFromPlayer(ui,p);
    });
    document.addEventListener('click',e=>{if(!ui.search.contains(e.target))closeResults(ui);});
    ui.input.addEventListener('keydown',e=>{
      const options=[...ui.results.querySelectorAll('[data-player-id]')];
      if(!options.length)return;
      if(e.key==='ArrowDown'){e.preventDefault();ui.activeIndex=Math.min(options.length-1,(ui.activeIndex??-1)+1);options.forEach((x,i)=>x.classList.toggle('is-active',i===ui.activeIndex));}
      else if(e.key==='ArrowUp'){e.preventDefault();ui.activeIndex=Math.max(0,(ui.activeIndex??0)-1);options.forEach((x,i)=>x.classList.toggle('is-active',i===ui.activeIndex));}
      else if(e.key==='Enter'&&ui.activeIndex>=0){e.preventDefault();options[ui.activeIndex].click();}
      else if(e.key==='Escape')closeResults(ui);
    });
    const savedMode=localStorage.getItem(STORAGE.mode);
    const savedPlayer=localStorage.getItem(STORAGE.player);
    if(savedMode==='manual') switchMode(ui,'manual');
    else if(savedPlayer&&currentPlayer(savedPlayer)&&currentObservation(savedPlayer)) switchMode(ui,'player');
    else switchMode(ui,'player');
  }

  function attachForCurrentInputs(){
    if(!available()) return;
    const stage=stageInput();
    const mount=contextMount(stage);
    if(!mount)return;
    const ui=mount.__wdPlayerContext||build(mount);
    if(ui.__attached)return;
    ui.__attached=true;
    attach(ui);
  }

  Promise.all([
    loadJson('clan-leaderboard/data/players.json'),
    loadJson('clan-leaderboard/data/snapshots.json'),
    loadJson('clan-leaderboard/data/player-observations.json')
  ]).then(([players,snapshots,observations])=>{
    DATA.players=players;DATA.snapshots=snapshots;DATA.observations=observations;
    const start=Date.now();
    const tick=()=>{attachForCurrentInputs();if(Date.now()-start<5000)setTimeout(tick,100);};
    tick();
  }).catch(err=>console.error('[player-context] data load failed',err));
})();