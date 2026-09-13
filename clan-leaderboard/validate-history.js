(() => {
  const root = document.querySelector('#validation');
  if (!root) return;
  const checks = [];
  const ok = message => checks.push({ ok: true, message });
  const fail = message => checks.push({ ok: false, message });
  const fetchJson = path => fetch(`data/${path}`).then(r => {
    if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
    return r.json();
  });

  Promise.all([
    fetchJson('players.json'),
    fetchJson('snapshots.json'),
    fetchJson('player-observations-history.json'),
    fetchJson('player-observations.json')
  ]).then(([players, snapshots, history, current]) => {
    const ids = new Set(players.players.map(p => p.player_id));
    ids.size === players.players.length ? ok(`player_id unique: ${ids.size}`) : fail('duplicate player_id');

    const datasets = { S01: history.snapshots?.S01 || [], S02: history.snapshots?.S02 || [], S03: current.snapshots?.S03 || [] };
    for (const [sid, rows] of Object.entries(datasets)) {
      const ranks = new Set();
      const rowIds = new Set();
      for (const row of rows) {
        ids.has(row.player_id) ? null : fail(`${sid}: unknown player ${row.player_id}`);
        rowIds.has(row.player_id) ? fail(`${sid}: duplicate player ${row.player_id}`) : rowIds.add(row.player_id);
        ranks.has(row.rank) ? fail(`${sid}: duplicate rank ${row.rank}`) : ranks.add(row.rank);
      }
      if (rows.length === 47 && sid === 'S01') ok('S01 member count = 47');
      else if (rows.length === 46 && sid === 'S02') ok('S02 member count = 46');
      else if (rows.length === 47 && sid === 'S03') ok('S03 member count = 47');
      else fail(`${sid}: unexpected member count ${rows.length}`);
      if (ranks.size === rows.length) ok(`${sid}: ranks unique`);
    }

    const s01 = new Set(datasets.S01.map(x => x.player_id));
    const s02 = new Set(datasets.S02.map(x => x.player_id));
    const s03 = new Set(datasets.S03.map(x => x.player_id));
    const removed = [...s01].filter(id => !s02.has(id));
    const added = [...s02].filter(id => !s01.has(id));
    removed.length === 1 && removed[0] === 'PERSIA-P-0043' ? ok('S01→S02: Death Ghost is the sole removed player') : fail(`S01→S02 removal mismatch: ${removed.join(',')}`);
    added.length === 0 ? ok('S01→S02: no added player') : fail(`S01→S02 unexpected additions: ${added.join(',')}`);
    const s02to03Added = [...s03].filter(id => !s02.has(id));
    s02to03Added.length === 1 && s02to03Added[0] === 'PERSIA-P-0048' ? ok('S02→S03: ایرانی باوقار is the sole added player') : fail(`S02→S03 addition mismatch: ${s02to03Added.join(',')}`);

    const meta = new Map((snapshots.snapshots || []).map(s => [s.snapshot_id, s]));
    for (const sid of ['S01','S02','S03']) {
      const expected = meta.get(sid)?.members;
      datasets[sid].length === expected ? ok(`${sid}: observations match snapshots.json members`) : fail(`${sid}: metadata/observation count mismatch`);
    }

    const failed = checks.filter(c => !c.ok);
    root.innerHTML = `<div class="validation-summary"><strong>${failed.length ? 'FAIL' : 'PASS'}</strong><span>${checks.length} checks</span></div><pre>${checks.map(c => `${c.ok ? '✓' : '✗'} ${c.message}`).join('\n')}</pre>`;
    root.dataset.status = failed.length ? 'fail' : 'pass';
  }).catch(err => {
    root.innerHTML = `<div class="validation-summary"><strong>FAIL</strong><span>Validation could not complete</span></div><pre>${String(err.message || err)}</pre>`;
    root.dataset.status = 'fail';
  });
})();
