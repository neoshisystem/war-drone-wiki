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
    const labels={
      S01:'دوره اول · ۲۱ شهریور ۱۴۰۵ · ۱۹:۰۰',
      S02:'دوره دوم · ۲۱ شهریور ۱۴۰۵ · ۲۳:۳۰',
      S03:'دوره سوم · ۲۲ شهریور ۱۴۰۵ · ۱۱:۳۰'
    };

    const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
    const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const signed=n=>n==null?'—':Number(n)>0?`+${fmt(n)}`:fmt(n);

    const previousFor=key=>key==='S03'?snapshots.S02:key==='S02'?snapshots.S01:null;
    const stageDisplay=(key,o)=>{
      if(!o?.stage)return '—';
      const prev=previousFor(key);
      if(!prev?.stage)return fmt(o.stage);
      const delta=Number(o.stage)-Number(prev.stage);
      return `${fmt(o.stage)}${delta>0?` (+${fmt(delta)})`:''}`;
    };
    const rankDisplay=o=>{
      if(!o?.rank)return '—';
      if(o.is_new)return `${fmt(o.rank)} (جدید)`;
      if(o.rank_movement==null||Number(o.rank_movement)===0)return fmt(o.rank);
      return `${fmt(o.rank)} (${Number(o.rank_movement)>0?'↑':'↓'} ${fmt(Math.abs(Number(o.rank_movement)))})`;
    };
    const deltaDisplay=(o,key)=>{
      if(!o)return '—';
      if(o.is_new)return 'جدید';
      const value=o[key];
      return value==null?'—':signed(value);
    };
    const medalDisplay=o=>o?.honor_medals?`${fmt(o.honor_medals.gold)} / ${fmt(o.honor_medals.silver)} / ${fmt(o.honor_medals.bronze)}`:'—';
    const weaponDisplay=o=>{
      if(!o?.weapons)return '—';
      const d=o.weapons.upgrade_deltas||{};
      const part=(key,label)=>{
        const value=o.weapons[key];
        if(value==null)return '—';
        const delta=d[key];
        return delta==null?fmt(value):`${fmt(value)} (+${fmt(delta)})`;
      };
      return `${part('25mm','25mm')} / ${part('hydra','hydra')} / ${part('hellfire','hellfire')}`;
    };

    const row=o=>{
      if(!o)return `<tr><td colspan="12" class="missing">این بازیکن در این Snapshot حضور نداشته است.</td></tr>`;
      return `<tr>
        <td>${rankDisplay(o)}</td>
        <td><a class="player-name-link" href="player.html?id=${encodeURIComponent(player.player_id)}">${esc(player.display_name)}</a></td>
        <td>${esc(player.role||'Member')}</td>
        <td>${stageDisplay(o===snapshots.S01?'S01':o===snapshots.S02?'S02':'S03',o)}</td>
        <td>${fmt(o.league_medals)}</td>
        <td>${deltaDisplay(o,'league_medals_delta')}</td>
        <td>${fmt(o.clan_medals)}</td>
        <td>${medalDisplay(o)}</td>
        <td>${fmt(o.total_kills)}</td>
        <td>${deltaDisplay(o,'kills_delta')}</td>
        <td>${weaponDisplay(o)}</td>
        <td>${esc(o.last_online_display||'—')}</td>
      </tr>`;
    };

    const snapshotTable=(key)=>{
      const o=snapshots[key];
      return `<section class="panel snapshot-panel">
        <div class="snapshot-heading"><div><span class="badge">${key}</span><h2>${labels[key]}</h2></div><span class="snapshot-status">${o?'داده ثبت شده':'خارج از Snapshot'}</span></div>
        <div style="overflow:auto"><table class="profile-snapshot-table"><thead><tr>
          <th>رتبه</th>
          <th>نام کاربری</th>
          <th>سمت</th>
          <th>استیج</th>
          <th>مدال لیگ جاری</th>
          <th>تغییر مدال لیگ</th>
          <th>مدال کل کلن</th>
          <th>مدال افتخار (طلا / نقره / برنز)</th>
          <th>مجموع کیل 💀</th>
          <th>افزایش کیل 💀</th>
          <th>لول سلاح‌ها (توپ / هیدرا / هل‌فایر)</th>
          <th>آخرین آنلاین</th>
        </tr></thead><tbody>${row(o)}</tbody></table></div>
      </section>`;
    };

    const latest=snapshots.S03||snapshots.S02||snapshots.S01;
    const status=player.status==='former'?'سابق':'فعال';
    root.innerHTML=`<div class="shell profile-shell">
      <section class="profile-head">
        <div><span class="badge">PERSIA · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)} · ${esc(player.role||'Member')} · ${status}</div></div>
        <div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html">لیدربورد</a><a class="btn" href="member-history.html?id=${encodeURIComponent(player.player_id)}">تاریخچه عضویت</a></div>
      </section>

      <section class="panel">
        <div class="profile-stats">
          <div class="profile-stat"><span>رتبه</span><strong>${rankDisplay(latest)}</strong></div>
          <div class="profile-stat"><span>سمت</span><strong>${esc(player.role||'Member')}</strong></div>
          <div class="profile-stat"><span>استیج</span><strong>${stageDisplay(latest===snapshots.S03?'S03':latest===snapshots.S02?'S02':'S01',latest)}</strong></div>
          <div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(latest?.league_medals)}</strong></div>
          <div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(latest?.clan_medals)}</strong></div>
          <div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(latest?.total_kills)}</strong></div>
          <div class="profile-stat"><span>مدال افتخار</span><strong>${medalDisplay(latest)}</strong></div>
          <div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(latest?.last_online_display||'—')}</strong></div>
        </div>
      </section>

      <section class="panel source-note"><strong>ساختار جدول:</strong> عنوان‌ها و ترتیب ستون‌های پایین عمداً با جدول کامل لیدربورد یکسان نگه داشته شده‌اند؛ داده‌ها از Snapshotهای Canonical تأییدشده می‌آیند.</section>
      ${snapshotTable('S03')}
      ${snapshotTable('S02')}
      ${snapshotTable('S01')}
      <section class="panel source-note"><strong>منبع داده:</strong> Snapshotهای Canonical تأییدشده S01، S02 و S03. Reportهای خام تاریخی مستقل و دست‌نخورده باقی می‌مانند.</section>
    </div>`;
  }).catch(()=>{root.innerHTML='<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>';});
})();
