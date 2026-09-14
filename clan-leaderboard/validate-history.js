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
    fetchJson('player-observations.json'),
    fetchJson('player-observations-history-s05.json')
  ]).then(([players, snapshots, history, current, historyS05]) => {
    const ids = new Set(players.players.map(p => p.player_id));
    ids.size === players.players.length ? ok(`player_id unique: ${ids.size}`) : fail('duplicate player_id');

    const datasets = {
      S01: history.snapshots?.S01 || [],
      S02: history.snapshots?.S02 || [],
      S03: history.snapshots?.S03 || [],
      S04: history.snapshots?.S04 || [],
      S05: historyS05.snapshots?.S05 || []
    };

    for (const [sid, rows] of Object.entries(datasets)) {
      const ranks = new Set();
      const rowIds = new Set();
      for (const row of rows) {
        ids.has(row.player_id) ? null : fail(`${sid}: unknown player ${row.player_id}`);
        rowIds.has(row.player_id) ? fail(`${sid}: duplicate player ${row.player_id}`) : rowIds.add(row.player_id);
        ranks.has(row.rank) ? fail(`${sid}: duplicate rank ${row.rank}`) : ranks.add(row.rank);
      }
      const expectedCount = sid === 'S02' ? 46 : 47;
      rows.length === expectedCount ? ok(`${sid} member count = ${expectedCount}`) : fail(`${sid}: unexpected member count ${rows.length}`);
      if (ranks.size === rows.length) ok(`${sid}: ranks unique`);
    }

    const s01 = new Set(datasets.S01.map(x => x.player_id));
    const s02 = new Set(datasets.S02.map(x => x.player_id));
    const s03 = new Set(datasets.S03.map(x => x.player_id));
    const s04 = new Set(datasets.S04.map(x => x.player_id));
    const s05 = new Set(datasets.S05.map(x => x.player_id));

    const removed = [...s01].filter(id => !s02.has(id));
    const added = [...s02].filter(id => !s01.has(id));
    removed.length === 1 && removed[0] === 'PERSIA-P-0043' ? ok('S01→S02: Death Ghost is the sole removed player') : fail(`S01→S02 removal mismatch: ${removed.join(',')}`);
    added.length === 0 ? ok('S01→S02: no added player') : fail(`S01→S02 unexpected additions: ${added.join(',')}`);

    const s02to03Added = [...s03].filter(id => !s02.has(id));
    s02to03Added.length === 1 && s02to03Added[0] === 'PERSIA-P-0048' ? ok('S02→S03: ایرانی باوقار is the sole added player') : fail(`S02→S03 addition mismatch: ${s02to03Added.join(',')}`);

    const s03to04Changed = [...s03].filter(id => s04.has(id)).length;
    s03to04Changed === 47 ? ok('S03→S04: all 47 player identities retained') : fail(`S03→S04 retention mismatch: ${s03to04Changed}`);
    const s04to05Changed = [...s04].filter(id => s05.has(id)).length;
    s04to05Changed === 47 ? ok('S04→S05: all 47 player identities retained') : fail(`S04→S05 retention mismatch: ${s04to05Changed}`);

    const meta = new Map((snapshots.snapshots || []).map(s => [s.snapshot_id, s]));
    for (const sid of ['S01','S02','S03','S04','S05']) {
      const expected = meta.get(sid)?.members;
      datasets[sid].length === expected ? ok(`${sid}: observations match snapshots.json members`) : fail(`${sid}: metadata/observation count mismatch`);
    }

    const currentRows = current.snapshots?.S05 || [];
    const shardRows = historyS05.snapshots?.S05 || [];
    const currentById = new Map(currentRows.map(r => [r.player_id, r]));
    const shardById = new Map(shardRows.map(r => [r.player_id, r]));
    const currentIds = [...currentById.keys()].sort();
    const shardIds = [...shardById.keys()].sort();
    JSON.stringify(currentIds) === JSON.stringify(shardIds)
      ? ok('S05: current/shard player_id sets match')
      : fail('S05: current/shard player_id sets differ');
    if (currentIds.length === shardIds.length && JSON.stringify(currentRows) === JSON.stringify(shardRows)) {
      ok('S05: current observation and historical shard are byte-equivalent JSON rows');
    } else {
      fail('S05: current observation and historical shard differ');
    }

    const failed = checks.filter(c => !c.ok);
    root.innerHTML = `<div class="validation-summary"><strong>${failed.length ? 'FAIL' : 'PASS'}</strong><span>${checks.length} checks</span></div><pre>${checks.map(c => `${c.ok ? '✓' : '✗'} ${c.message}`).join('\n')}</pre>`;
    root.dataset.status = failed.length ? 'fail' : 'pass';
  }).catch(err => {
    root.innerHTML = `<div class="validation-summary"><strong>FAIL</strong><span>Validation could not complete</span></div><pre>${String(err.message || err)}</pre>`;
    root.dataset.status = 'fail';
  });
})();
