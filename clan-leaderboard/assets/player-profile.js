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
    const s03=(current.snapshots&&current.snapshots.S03)||[];
    const o=s03.find(x=>x.player_id===id);
    const s01=((history.snapshots&&history.snapshots.S01)||[]).find(x=>x.player_id===id);
    const s02=((history.snapshots&&history.snapshots.S02)||[]).find(x=>x.player_id===id);
    if(!player){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">بازیکن پیدا نشد.</div></div>';return;}
    const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
    const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const rank=o?.rank??'—';
    const row=(label,x)=>x?`<tr><td>${label}</td><td>${x.rank}</td><td>${x.stage}</td><td>${fmt(x.league_medals)}</td><td>${fmt(x.clan_medals)}</td><td>${fmt(x.total_kills)}</td><td>${x.weapons?.['25mm']??'—'} / ${x.weapons?.hydra??'—'} / ${x.weapons?.hellfire??'—'}</td><td>${esc(x.last_online_display)}</td></tr>`:'';
    const weaponDelta=x=>x?.weapons?.upgrade_deltas?Object.entries(x.weapons.upgrade_deltas).map(([k,v])=>`${k} +${v}`).join(' · '):'—';
    root.innerHTML=`<div class="shell profile-shell"><section class="profile-head"><div><span class="badge">PERSIA · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)}</div></div><div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a></div></section><section class="panel"><div class="profile-stats"><div class="profile-stat"><span>رتبه در Snapshot فعلی</span><strong>${rank}</strong></div><div class="profile-stat"><span>Stage</span><strong>${o?.stage??'—'}</strong></div><div class="profile-stat"><span>Total Kills</span><strong>${fmt(o?.total_kills)}</strong></div><div class="profile-stat"><span>Clan Medals</span><strong>${fmt(o?.clan_medals)}</strong></div><div class="profile-stat"><span>League Medals</span><strong>${fmt(o?.league_medals)}</strong></div><div class="profile-stat"><span>Honor Medals</span><strong>${o?`${o.honor_medals.gold} / ${o.honor_medals.silver} / ${o.honor_medals.bronze}`:'—'}</strong></div><div class="profile-stat"><span>عضویت</span><strong>${player.status==='former'?'سابق':'فعال'}</strong></div><div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(o?.last_online_display??'—')}</strong></div></div></section><section class="panel"><h2>سلاح‌ها</h2><div class="weapon-grid"><div class="weapon"><span>25mm</span><b>${o?.weapons?.['25mm']??'—'}</b></div><div class="weapon"><span>Hydra-70</span><b>${o?.weapons?.hydra??'—'}</b></div><div class="weapon"><span>Hellfire</span><b>${o?.weapons?.hellfire??'—'}</b></div></div></section><section class="panel"><h2>تاریخچه Snapshot</h2><div style="overflow:auto"><table style="width:100%;border-collapse:collapse;min-width:760px;font-size:.78rem"><thead><tr><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Snapshot</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">رتبه</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Stage</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">League</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Clan</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Kills</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Weapons</th><th style="text-align:right;padding:9px;border-bottom:1px solid var(--line)">Online</th></tr></thead><tbody>${row('S01 · 19:00',s01)}${row('S02 · 23:30',s02)}${row('S03 · 11:30',o)}</tbody></table></div><p style="color:var(--muted);font-size:.75rem;margin:12px 0 0">Deltaهای ثبت‌شده در منابع تاریخی حفظ شده‌اند. ارتقای سلاح در Snapshot دوم: S01=${weaponDelta(s01)} · S02=${weaponDelta(s02)} · S03=${weaponDelta(o)}</p></section><section class="panel source-note"><strong>منبع داده:</strong> Snapshotهای Canonical تأییدشده S01، S02 و S03. Reportهای خام تاریخی مستقل و دست‌نخورده باقی می‌مانند.</section></div>`;
  }).catch(()=>{root.innerHTML='<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>';});
})();
