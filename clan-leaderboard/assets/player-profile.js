(() => {
  const root = document.querySelector('#profile');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">شناسه بازیکن مشخص نشده است.</div></div>';
    return;
  }

  Promise.all([
    fetch('data/players.json').then(r => r.json()),
    fetch('data/player-observations.json').then(r => r.json()),
    fetch('data/player-observations-history.json').then(r => r.json())
  ]).then(([players, current, history]) => {
    const player = players.players.find(p => p.player_id === id);
    if (!player) {
      root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">بازیکن پیدا نشد.</div></div>';
      return;
    }

    const snapshotSets = { ...(history.snapshots || {}), ...(current.snapshots || {}) };
    const order = Object.keys(snapshotSets).sort().reverse();
    const snapshotMeta = {
      S01: { period: 'دوره ۰۱', date: '۲۱ شهریور ۱۴۰۵', time: '۱۹:۰۰' },
      S02: { period: 'دوره ۰۲', date: '۲۱ شهریور ۱۴۰۵', time: '۲۳:۳۰' },
      S03: { period: 'دوره ۰۳', date: '۲۲ شهریور ۱۴۰۵', time: '۱۱:۳۰' },
      S04: { period: 'دوره ۰۴', date: '۲۲ شهریور ۱۴۰۵', time: '۲۳:۰۰' },
      S05: { period: 'دوره ۰۵', date: '۲۳ شهریور ۱۴۰۵', time: '۲۳:۰۰' }
    };

    const rows = order.map(key => ({ key, obs: (snapshotSets[key] || []).find(x => x.player_id === id) || null }));
    const activeRow = [...rows].find(x => x.obs) || rows[0] || { obs: null };
    const fmt = n => n == null ? '—' : Number(n).toLocaleString('en-US');
    const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c]));
    const signed = n => n == null ? '—' : Number(n) > 0 ? `+${fmt(n)}` : fmt(n);
    const rankDisplay = o => { if (!o?.rank) return '—'; if (o.is_new) return `${fmt(o.rank)} (جدید)`; const movement = Number(o.rank_movement || 0); if (!movement) return fmt(o.rank); return `${fmt(o.rank)} (${movement > 0 ? '↑' : '↓'} ${fmt(Math.abs(movement))})`; };
    const stageDisplay = o => o?.stage == null ? '—' : fmt(o.stage);
    const deltaDisplay = (o, field) => !o ? '—' : o.is_new ? 'جدید' : o[field] == null ? '—' : signed(o[field]);
    const honorDisplay = o => o?.honor_medals ? `${fmt(o.honor_medals.gold)} / ${fmt(o.honor_medals.silver)} / ${fmt(o.honor_medals.bronze)}` : '—';
    const weaponDisplay = o => { if (!o?.weapons) return '—'; const d = o.weapons.upgrade_deltas || {}; const part = key => { const value = o.weapons[key]; if (value == null) return '—'; return d[key] == null ? fmt(value) : `${fmt(value)} (+${fmt(d[key])})`; }; return `${part('25mm')} / ${part('hydra')} / ${part('hellfire')}`; };
    const snapshotLabel = key => { const meta = snapshotMeta[key]; return meta ? `<span class="snapshot-badge">${esc(key)}</span><span class="snapshot-date">${esc(meta.date)} · ${esc(meta.time)}</span>` : `<span class="snapshot-badge">${esc(key)}</span>`; };
    const leaderboardColumns = ['رتبه','نام کاربری','سمت','استیج','مدال لیگ جاری','تغییر مدال لیگ','مدال کل کلن','مدال افتخار (طلا / نقره / برنز)','مجموع کیل 💀','افزایش کیل 💀','لول سلاح‌ها (توپ / هیدرا / هل‌فایر)','آخرین آنلاین'];
    const renderObservation = (key, o) => { if (!o) return `<tr class="snapshot-missing"><td colspan="13">این بازیکن در Snapshot ${esc(key)} حضور نداشته است.</td></tr>`; return `<tr><td class="rank-cell">${esc(rankDisplay(o))}</td><td><a class="player-name-link" href="player.html?id=${encodeURIComponent(player.player_id)}">${esc(player.display_name)}</a></td><td>${esc(player.role || 'Member')}</td><td>${esc(stageDisplay(o))}</td><td>${fmt(o.league_medals)}</td><td>${esc(deltaDisplay(o,'league_medals_delta'))}</td><td>${fmt(o.clan_medals)}</td><td>${esc(honorDisplay(o))}</td><td>${fmt(o.total_kills)}</td><td>${esc(deltaDisplay(o,'kills_delta'))}</td><td>${esc(weaponDisplay(o))}</td><td>${esc(o.last_online_display || '—')}</td><td class="snapshot-cell">${snapshotLabel(key)}</td></tr>`; };
    const tableRows = rows.map(({key,obs}) => renderObservation(key,obs)).join(''); const active = activeRow.obs;
    root.innerHTML = `<div class="shell profile-shell"><section class="profile-head"><div><span class="badge">PERSIA · PLAYER</span><h1>${esc(player.display_name)}</h1><div class="identity">${esc(player.player_id)} · ${esc(player.role || 'Member')} · ${player.status === 'former' ? 'سابق' : 'فعال'}</div></div><div class="profile-actions"><a class="btn" href="players.html">← اعضای کلن</a><a class="btn" href="index.html">لیدربورد</a><a class="btn" href="member-history.html?id=${encodeURIComponent(player.player_id)}">تاریخچه عضویت</a></div></section><section class="panel"><div class="profile-stats"><div class="profile-stat"><span>رتبه فعلی</span><strong>${rankDisplay(active)}</strong></div><div class="profile-stat"><span>سمت</span><strong>${esc(player.role || 'Member')}</strong></div><div class="profile-stat"><span>استیج فعلی</span><strong>${active?.stage == null ? '—' : fmt(active.stage)}</strong></div><div class="profile-stat"><span>مدال لیگ جاری</span><strong>${fmt(active?.league_medals)}</strong></div><div class="profile-stat"><span>مدال کل کلن</span><strong>${fmt(active?.clan_medals)}</strong></div><div class="profile-stat"><span>مجموع کیل 💀</span><strong>${fmt(active?.total_kills)}</strong></div><div class="profile-stat"><span>مدال افتخار</span><strong>${honorDisplay(active)}</strong></div><div class="profile-stat"><span>آخرین آنلاین</span><strong>${esc(active?.last_online_display || '—')}</strong></div></div></section><section class="panel progression-panel"><div class="snapshot-heading"><div><span class="badge">HISTORY</span><h2>تاریخچه عملکرد کاربر</h2><p class="muted">هر سطر یک Snapshot است و ترتیب و عنوان ستون‌ها با جدول اصلی Leaderboard یکسان نگه داشته شده است. مشخصات Snapshot در ستون انتهایی هر سطر قرار دارد.</p></div></div><div class="table-wrap profile-history-wrap"><table class="profile-history-table"><thead><tr>${leaderboardColumns.map(c => `<th>${c}</th>`).join('')}<th>Snapshot</th></tr></thead><tbody>${tableRows}</tbody></table></div></section>${!active ? '<section class="panel empty">برای این بازیکن در هیچ Snapshot ثبت‌شده‌ای رکوردی پیدا نشد.</section>' : ''}<section class="panel source-note"><strong>منبع داده:</strong> Snapshotهای Canonical تأییدشده. هر مقدار از همان Snapshot خوانده می‌شود و برای مقایسهٔ دقیق، مقدار جدیدی خارج از دادهٔ ثبت‌شده تولید نمی‌شود.</section></div>`;
  }).catch(() => { root.innerHTML = '<div class="shell profile-shell"><div class="panel empty">داده پروفایل قابل بارگذاری نیست.</div></div>'; });
})();
