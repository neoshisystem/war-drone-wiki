(() => {
  const root=document.querySelector('#profile');
  if(!root)return;
  const id=new URLSearchParams(location.search).get('id');
  if(!id){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';return;}

  Promise.all([
    fetch('data/players.json').then(r=>r.json()),
    fetch('data/player-observations.json').then(r=>r.json()),
    fetch('data/player-observations-history.json').then(r=>r.json())
  ]).then(([players,current,history])=>{
    const player=players.players.find(p=>p.player_id===id);
    if(!player){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">بازیکن پیدا نشد.</div></div>';return;}

    const snapshots={
      S01:((history.snapshots&&history.snapshots.S01)||[]).find(x=>x.player_id===id),
      S02:((history.snapshots&&history.snapshots.S02)||[]).find(x=>x.player_id===id),
      S03:((current.snapshots&&current.snapshots.S03)||[]).find(x=>x.player_id===id)
    };
    const labels={S01:'S01 · ۲۱ شهریور ۱۴۰۵ · ۱۹:۰۰',S02:'S02 · ۲۱ شهریور ۱۴۰۵ · ۲۳:۳۰',S03:'S03 · ۲۲ شهریور ۱۴۰۵ · ۱۱:۳۰'};
    const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
    const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const signed=n=>n==null?'—':Number(n)>0?`+${fmt(n)}`:fmt(n);
    const stageDelta=(a,b)=>a?.stage!=null&&b?.stage!=null?Number(b.stage)-Number(a.stage):null;
    const numericDelta=(a,b,key)=>a?.[key]!=null&&b?.[key]!=null?Number(b[key])-Number(a[key]):null;
    const rankDisplay=o=>{if(!o?.rank)return '—';if(o.is_new)return `${fmt(o.rank)} (جدید)`;if(Number(o.rank_movement||0)===0)return fmt(o.rank);return `${fmt(o.rank)} (${Number(o.rank_movement)>0?'↑':'↓'} ${fmt(Math.abs(Number(o.rank_movement)))})`;};
    const honor=o=>o?.honor_medals?`${fmt(o.honor_medals.gold)} / ${fmt(o.honor_medals.silver)} / ${fmt(o.honor_medals.bronze)}`:'—';
    const weapons=o=>{if(!o?.weapons)return '—';const d=o.weapons.upgrade_deltas||{};const p=k=>o.weapons[k]==null?'—':d[k]==null?fmt(o.weapons[k]):`${fmt(o.weapons[k])} (+${fmt(d[k])})`;return `${p('25mm')} / ${p('hydra')} / ${p('hellfire')}`;};
    const val=(o,key)=>o?.[key]==null?'—':key==='honor_medals'?honor(o):key==='weapons'?weapons(o):key==='rank'?rankDisplay(o):fmt(o[key]);
    const metricRows=[
      ['رتبه','rank',true],
      ['نام کاربری','name',false],
      ['سمت','role',false],
      ['استیج','stage',true],
      ['مدال لیگ جاری','league_medals',true],
      ['تغییر مدال لیگ','league_medals_delta',true],
      ['مدال کل کلن','clan_medals',true],
      ['مدال افتخار (طلا / نقره / برنز)','honor_medals',false],
      ['مجموع کیل 💀','total_kills',true],
      ['افزایش کیل 💀','kills_delta',true],
      ['لول سلاح‌ها (توپ / هیدرا / هل‌فایر)','weapons',false],
      ['آخرین آنلاین','last_online_display',false]
    ];

    const metricValue=(o,key)=>{
      if(key==='name')return player.display_name;
      if(key==='role')return player.role||'Member';
      if(key==='rank'||key==='stage'||key==='league_medals'||key==='clan_medals'||key==='total_kills')return val({...o,rank:o?.rank},key);
      if(key==='league_medals_delta'||key==='kills_delta')return o?.is_new?'جدید':o?.[key]==null?'—':signed(o[key]);
      return val(o,key);
    };
    const comparison=(key,a,b)=>{
      if(!a||!b)return '—';
      if(key==='stage'){const d=stageDelta(a,b);return d==null?'—':d===0?'0':signed(d);}
      if(key==='league_medals'||key==='clan_medals'||key==='total_kills'){const d=numericDelta(a,b,key);return d==null?'—':signed(d);}
      if(key==='rank'){const d=Number(a.rank)-Number(b.rank);return !Number.isFinite(d)||d===0?'—':d>0?`↑ ${fmt(d)}`:`↓ ${fmt(Math.abs(d))}`;}
      if(key==='league_medals_delta'||key==='kills_delta')return b?.is_new?'جدید':signed(numericDelta(a,b,key));
      if(key==='weapons'){return '—';}
      return '—';
    };
    const cell=(o,key)=>o?esc(metricValue(o,key)):'—';
    const active=snapshots.S03||snapshots.S02||snapshots.S01;

    const rows=metricRows.map(([label,key])=>`<tr><th>${label}</th><td>${cell(snapshots.S01,key)}</td><td class="delta">${comparison(key,snapshots.S01,snapshots.S02)}</td><td>${cell(snapshots.S02,key)}</td><td class="delta">${comparison(key,snapshots.S02,snapshots.S03)}</td><td>${cell(snapshots.S03,key)}</td></tr>`).join('');
    const missing=!snapshots.S03;

    root.innerHTML=`<div class="shell profile-shell">
      <section class="profile-head">
        <div><span class="badge">PERSIA · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)} · ${esc(player.role||'Member')} · ${player.status==='former'?'سابق':'فعال'}</div></div>
        <div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html">لیدربورد</a><a class="btn" href="member-history.html?id=${encodeURIComponent(player.player_id)}">تاریخچه عضویت</a></div>
      </section>
      <section class="panel"><div class="profile-stats">
        <div class="profile-stat"><span>رتبه فعلی</span><strong>${rankDisplay(active)}</strong></div>
        <div class="profile-stat"><span>سمت</span><strong>${esc(player.role||'Member')}</strong></div>
        <div class="profile-stat"><span>استیج فعلی</span><strong>${active?.stage==null?'—':fmt(active.stage)}</strong></div>
        <div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(active?.league_medals)}</strong></div>
        <div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(active?.clan_medals)}</strong></div>
        <div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(active?.total_kills)}</strong></div>
        <div class="profile-stat"><span>مدال افتخار</span><strong>${honor(active)}</strong></div>
        <div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(active?.last_online_display||'—')}</strong></div>
      </div></section>

      <section class="panel progression-panel">
        <div class="snapshot-heading"><div><span class="badge">PROGRESSION</span><h2>سیر پیشرفت و مقایسه Snapshotها</h2><p class="muted">هر ردیف یک شاخص است؛ مقدار هر Snapshot کنار تغییر آن نسبت به Snapshot بعدی قرار گرفته تا روند رشد یا افت کاربر یک‌جا قابل مقایسه باشد.</p></div></div>
        <div class="table-wrap profile-progression-wrap"><table class="profile-progression-table"><thead><tr><th>شاخص</th><th>${labels.S01}</th><th>تغییر S01 → S02</th><th>${labels.S02}</th><th>تغییر S02 → S03</th><th>${labels.S03}</th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>
      ${missing?'<section class="panel empty">این بازیکن در Snapshot فعلی حضور ندارد.</section>':''}
      <section class="panel source-note"><strong>نکته:</strong> تغییرات از داده‌های تأییدشده Snapshotها خوانده می‌شوند؛ هیچ مقدار پنهان یا مقدار حدس‌زده‌شده‌ای تولید نمی‌شود.</section>
    </div>`;
  }).catch(()=>{root.innerHTML='<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>';});
})();