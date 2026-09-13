(() => {
  const root=document.querySelector('#players');
  const input=document.querySelector('#playerSearch');
  const count=document.querySelector('#count');
  if(!root)return;
  Promise.all([
    fetch('data/players.json').then(r=>r.json()),
    fetch('data/player-observations.json').then(r=>r.json())
  ]).then(([players,observations])=>{
    const obs=(observations.snapshots&&observations.snapshots.S03)||[];
    const byId=new Map(obs.map(o=>[o.player_id,o]));
    const fmt=n=>n==null?'—':Number(n).toLocaleString('en-US');
    const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    function render(){
      const q=(input.value||'').trim().toLocaleLowerCase('fa');
      const list=players.players.filter(p=>[p.player_id,p.display_name,p.status].join(' ').toLocaleLowerCase('fa').includes(q));
      count.textContent=`${list.length} بازیکن`;
      root.innerHTML=list.map(p=>{
        const o=byId.get(p.player_id)||{};
        return `<a class="player-card" href="player.html?id=${encodeURIComponent(p.player_id)}"><header><div><h3>${esc(p.display_name)}</h3><div class="player-id">${esc(p.player_id)}</div></div><span class="status">${p.status==='former'?'سابق':'فعال'}</span></header><div class="stats"><div class="stat"><span>Rank فعلی</span><strong>${o.rank??'—'}</strong></div><div class="stat"><span>Stage</span><strong>${o.stage??'—'}</strong></div><div class="stat"><span>Kills</span><strong>${fmt(o.total_kills)}</strong></div><div class="stat"><span>League Medals</span><strong>${fmt(o.league_medals)}</strong></div></div></a>`;
      }).join('')||'<div class="empty">بازیکنی با این عبارت پیدا نشد.</div>';
    }
    input.addEventListener('input',render); render();
  }).catch(()=>{root.innerHTML='<div class="empty">داده بازیکنان قابل بارگذاری نیست.</div>';});
})();