(() => {
  const root = typeof document !== 'undefined' ? document.querySelector('#validation') : null;
  const report = [];
  const fail = message => report.push({ok:false,message});
  const pass = message => report.push({ok:true,message});
  Promise.all([
    fetch('data/players.json').then(r => r.json()),
    fetch('data/player-observations.json').then(r => r.json()),
    fetch('data/snapshots.json').then(r => r.json()),
    fetch('data/memberships.json').then(r => r.json()),
    fetch('data/leagues.json').then(r => r.json())
  ]).then(([players, observations, snapshots, memberships, leagues]) => {
    const ids = new Set(players.players.map(p => p.player_id));
    players.players.length === ids.size ? pass('player_id values are unique') : fail('duplicate player_id detected');
    const obsIds = new Set();
    for (const [sid, rows] of Object.entries(observations.snapshots || {})) {
      const ranks = new Set();
      for (const row of rows) {
        ids.has(row.player_id) ? pass(`${sid}: known player ${row.player_id}`) : fail(`${sid}: unknown player ${row.player_id}`);
        const key = `${sid}:${row.player_id}`;
        obsIds.has(key) ? fail(`duplicate observation ${key}`) : obsIds.add(key);
        ranks.has(row.rank) ? fail(`${sid}: duplicate rank ${row.rank}`) : ranks.add(row.rank);
      }
    }
    const current = observations.snapshots?.[snapshots.current_snapshot_id] || [];
    current.length === snapshots.snapshots.find(s => s.snapshot_id === snapshots.current_snapshot_id)?.members ? pass('current snapshot member count matches observations') : fail('current snapshot member count mismatch');
    const currentIds = new Set(current.map(row => row.player_id));
    for (const player of players.players) {
      if (currentIds.has(player.player_id)) {
        player.last_seen_snapshot === snapshots.current_snapshot_id
          ? pass(`${snapshots.current_snapshot_id}: last_seen_snapshot current for ${player.player_id}`)
          : fail(`${snapshots.current_snapshot_id}: last_seen_snapshot stale for ${player.player_id} (found ${player.last_seen_snapshot})`);
      }
    }
    const membershipIds = new Set((memberships.memberships || []).map(m => m.player_id));
    for (const id of membershipIds) ids.has(id) ? pass(`membership references known player ${id}`) : fail(`membership references unknown player ${id}`);
    Array.isArray(leagues.seasons) ? pass('league dataset loaded') : fail('league dataset missing seasons array');
    const failed = report.filter(x => !x.ok);
    if (root) {
      root.innerHTML = `<div class="validation-summary"><strong>${failed.length ? 'FAIL' : 'PASS'}</strong><span>${report.length} checks</span></div><pre>${report.map(x => `${x.ok ? '✓' : '✗'} ${x.message}`).join('\n')}</pre>`;
      root.dataset.status = failed.length ? 'fail' : 'pass';
    }
    if (failed.length) throw new Error(failed.map(x => x.message).join('; '));
  }).catch(err => {
    if (root && !root.dataset.status) {
      root.innerHTML = `<div class="validation-summary"><strong>FAIL</strong><span>Validation could not complete</span></div><pre>${String(err.message || err)}</pre>`;
    }
  });
})();
