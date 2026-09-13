(() => {
  const root=document.querySelector('#profile');
  if(!root)return;
  const id=new URLSearchParams(location.search).get('id');
  if(!id){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';return;}
  Promise.all([
    fetch('data/players.json').then(r=>r.json()),
    fetch('data/player-observations.json').then(r=>r.json())
  ]).then(([players,observations])=>{
    const player=players.players.find(p=>p.player_id===id);
    const all=(observations.snapshots&&observations.snapshots.S03)||[];
    const o=all.find(x=>x.player_id===id);
    if(!player){root.innerHTML='<div class="shell profile-shell"><div class="panel empty">بازیکن پیدا نشد.</div></div>';return;}
    const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
    const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const rank=o?.rank??'—';
    root.innerHTML=`<div class="shell profile-shell"><section class="profile-head"><div><span class="badge">PERSIA · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)}</div></div><div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a></div></section><section class="panel"><div class="profile-stats"><div class="profile-stat"><span>رتبه در Snapshot فعلی</span><strong>${rank}</strong></div><div class="profile-stat"><span>Stage</span><strong>${o?.stage??'—'}</strong></div><div class="profile-stat"><span>Total Kills</span><strong>${fmt(o?.total_kills)}</strong></div><div class="profile-stat"><span>Clan Medals</span><strong>${fmt(o?.clan_medals)}</strong></div><div class="profile-stat"><span>League Medals</span><strong>${fmt(o?.league_medals)}</strong></div><div class="profile-stat"><span>Honor Medals</span><strong>${o?`${o.honor_medals.gold} / ${o.honor_medals.silver} / ${o.honor_medals.bronze}`:'—'}</strong></div><div class="profile-stat"><span>عضویت</span><strong>${player.status==='former'?'سابق':'فعال'}</strong></div><div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(o?.last_online_display??'—')}</strong></div></div></section><section class="panel"><h2>سلاح‌ها</h2><div class="weapon-grid"><div class="weapon"><span>25mm</span><b>${o?.weapons?.['25mm']??'—'}</b></div><div class="weapon"><span>Hydra-70</span><b>${o?.weapons?.hydra??'—'}</b></div><div class="weapon"><span>Hellfire</span><b>${o?.weapons?.hellfire??'—'}</b></div></div></section><section class="panel source-note"><strong>منبع داده:</strong> Snapshot فعلی S03. این صفحه فقط داده Canonical تأییدشده را نمایش می‌دهد؛ Report خام تاریخی مستقل باقی می‌ماند و برای اصلاحات بعدی قابل مراجعه است.</section></div>`;
  }).catch(()=>{root.innerHTML='<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>';});
})();