(() => {
  const root = document.querySelector('#players');
  const input = document.querySelector('#playerSearch');
  const count = document.querySelector('#count');
  if (!root) return;

  const loadJson = path => fetch(path).then(response => {
    if (!response.ok) throw new Error(path + ': ' + response.status);
    return response.json();
  });

  Promise.all([
    loadJson('data/players.json'),
    loadJson('data/snapshots.json'),
    loadJson('data/player-observations.json'),
    loadJson('data/player-observations-history.json'),
    loadJson('data/player-observations-history-s05.json')
  ]).then(([players, snapshotMeta, current, history, historyS05]) => {
    const snapshots = snapshotMeta.snapshots || [];
    const observationsBySnapshot = new Map();

    const addSnapshots = source => Object.entries(source?.snapshots || {}).forEach(([snapshotId, rows]) => {
      observationsBySnapshot.set(snapshotId, Array.isArray(rows) ? rows : []);
    });

    addSnapshots(history);
    addSnapshots(historyS05);
    addSnapshots(current);

    const currentSnapshotId = snapshotMeta.current_snapshot_id;
    const currentRows = observationsBySnapshot.get(currentSnapshotId) || [];
    const currentById = new Map(currentRows.map(row => [row.player_id, row]));

    const latestObservation = player => {
      const preferred = currentById.get(player.player_id);
      if (preferred) return preferred;

      const targetIndex = snapshots.findIndex(snapshot => snapshot.snapshot_id === player.last_seen_snapshot);
      const ordered = targetIndex >= 0
        ? snapshots.slice(0, targetIndex + 1).reverse()
        : snapshots.slice().reverse();

      for (const snapshot of ordered) {
        const row = (observationsBySnapshot.get(snapshot.snapshot_id) || [])
          .find(observation => observation.player_id === player.player_id);
        if (row) return row;
      }
      return null;
    };

    const historyLabel = player => {
      if (!player.first_seen_snapshot) return 'تاریخچه نامشخص';
      if (player.first_seen_snapshot === player.last_seen_snapshot) return player.first_seen_snapshot;
      return player.status === 'former'
        ? `${player.first_seen_snapshot} → ${player.last_seen_snapshot}`
        : `${player.first_seen_snapshot} → جاری`;
    };

    const fmt = n => n == null ? '—' : Number(n).toLocaleString('en-US');
    const esc = s => String(s ?? '').replace(/[&<>\"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
    }[c]));

    function render() {
      const q = (input.value || '').trim().toLocaleLowerCase('fa');
      const list = players.players.filter(player =>
        [player.player_id, player.display_name, player.status].join(' ').toLocaleLowerCase('fa').includes(q)
      );

      count.textContent = `${list.length} بازیکن · Snapshot جاری: ${currentSnapshotId}`;
      root.innerHTML = list.map(player => {
        const observation = latestObservation(player) || {};
        const isCurrent = Boolean(currentById.get(player.player_id));
        const observedSnapshot = isCurrent
          ? currentSnapshotId
          : player.last_seen_snapshot || '—';

        return `<a class="player-card" href="player.html?id=${encodeURIComponent(player.player_id)}">
          <header>
            <div>
              <h3>${esc(player.display_name)}</h3>
              <div class="player-id">${esc(player.player_id)}</div>
            </div>
            <span class="status">${player.status === 'former' ? 'سابق' : 'فعال'}</span>
          </header>
          <div class="stats">
            <div class="stat"><span>Rank فعلی</span><strong>${observation.rank ?? '—'}</strong></div>
            <div class="stat"><span>Stage</span><strong>${observation.stage ?? '—'}</strong></div>
            <div class="stat"><span>Kills</span><strong>${fmt(observation.total_kills)}</strong></div>
            <div class="stat"><span>League Medals</span><strong>${fmt(observation.league_medals)}</strong></div>
            <div class="stat"><span>Snapshot</span><strong>${esc(observedSnapshot)}</strong></div>
            <div class="stat"><span>History</span><strong>${esc(historyLabel(player))}</strong></div>
          </div>
        </a>`;
      }).join('') || '<div class="empty">بازیکنی با این عبارت پیدا نشد.</div>';
    }

    input.addEventListener('input', render);
    render();
  }).catch(() => {
    root.innerHTML = '<div class="empty">داده بازیکنان قابل بارگذاری نیست.</div>';
  });
})();