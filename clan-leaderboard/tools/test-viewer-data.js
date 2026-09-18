#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const viewerData = require(path.join(ROOT, 'assets', 'viewer-data.js'));
const performance = require(path.join(ROOT, 'assets', 'performance.js'));
const read = name => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
const snapshots = read('snapshots.json');
const current = read('player-observations.json');
const history = read('player-observations-history.json');
const historyS05 = (() => { try { return read('player-observations-history-s05.json'); } catch { return { snapshots: {} }; } })();
const historyS06 = (() => { try { return read('player-observations-history-s06.json'); } catch { return { snapshots: {} }; } })();
const players = read('players.json');
const leagues = read('leagues.json');
const observationSets = [history, historyS05, historyS06, current];
const metrics = performance.computeAll(snapshots, observationSets, leagues);

const viewerSource = fs.readFileSync(path.join(ROOT, 'assets', 'viewer.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(!viewerSource.includes("reports/2026-09-14-2300.html"), 'Viewer must not hard-code S05 as its default source');
assert(viewerSource.includes("snapshotsData.current_snapshot_id"), 'Viewer must resolve the direct entry from current_snapshot_id');
assert(viewerSource.includes("'../clan-leaderboard.html'"), 'Viewer fallback source must remain available');
assert(indexSource.indexOf('assets/viewer-data.js') < indexSource.indexOf('assets/viewer.js'), 'viewer-data.js must load before viewer.js');
assert(viewerSource.includes("player-observations-history-s06.json"), 'Viewer must load the S06 history shard');

for (const snapshot of snapshots.snapshots) {
  const rows = viewerData.getRows(snapshot.snapshot_id, observationSets);
  assert.strictEqual(rows.length, snapshot.members, `${snapshot.snapshot_id}: canonical row count mismatch`);
  const ids = new Set(rows.map(row => row.player_id));
  const ranks = new Set(rows.map(row => row.rank));
  assert.strictEqual(ids.size, rows.length, `${snapshot.snapshot_id}: duplicate player_id`);
  assert.strictEqual(ranks.size, rows.length, `${snapshot.snapshot_id}: duplicate rank`);
  const min = Math.min(...ranks);
  const max = Math.max(...ranks);
  assert.strictEqual(min, 1, `${snapshot.snapshot_id}: rank range must start at 1`);
  assert.strictEqual(max, snapshot.members, `${snapshot.snapshot_id}: rank range must cover all members`);
}

const s06Rows = viewerData.getRows('S06', observationSets);
const s06 = viewerData.buildMembers('S06', observationSets, players, { baseline_snapshot_id: 'S05', period_players: {} }).members;
assert.strictEqual(s06Rows.length, 45, 'S06 must contain 45 canonical observations');
assert.strictEqual(s06.length, 45, 'Viewer model must contain 45 S06 members');
assert.strictEqual(s06[19].player_id, 'PERSIA-P-0013', 'S06 rank 20 must resolve to the stable Uk/Vk identity');
assert.strictEqual(s06[33].player_id, 'PERSIA-P-0037', 'S06 nouk identity must remain stable');
assert.strictEqual(s06[37].player_id, 'PERSIA-P-0040', 'S06 جهانبانی identity must remain stable');
assert.strictEqual(s06[19].stats['تغییر مدال کلن'], '—', 'Members without period metrics must not fabricate a delta');

const s07Rows = viewerData.getRows('S07', observationSets);
const s07 = viewerData.buildMembers('S07', observationSets, players, { baseline_snapshot_id: 'S06', period_players: {} }).members;
assert.strictEqual(s07Rows.length, 42, 'S07 must contain 42 canonical observations');
assert.strictEqual(s07.length, 42, 'Viewer model must contain 42 S07 members');
assert.strictEqual(s07[22].player_id, 'PERSIA-P-0013', 'S07 rank 23 must resolve to the stable Uk/Vk identity');
assert.strictEqual(s07[27].player_id, 'PERSIA-P-0019', 'S07 rank 28 must resolve to active saeid identity');
assert.strictEqual(s07[41].player_id, 'PERSIA-P-0051', 'S07 rank 42 must resolve to new hisystemX identity');
assert.strictEqual(s07.some(member => member.player_id === 'PERSIA-P-0049'), false, 'Kicked saied must not appear in S07 grid');
assert.strictEqual(s07.some(member => member.player_id === 'PERSIA-P-0050'), false, 'Kicked Behnam must not appear in S07 grid');

const s08 = viewerData.buildMembers('S08', observationSets, players, metrics.S08).members;
const newSaied = s08.find(member => member.player_id === 'PERSIA-P-0049');
const newNegar = s08.find(member => member.player_id === 'PERSIA-P-0052');
const newOmid = s08.find(member => member.player_id === 'PERSIA-P-0053');
for (const member of [newSaied, newNegar, newOmid]) {
  assert(member, 'S08 new/returning player must be present');
  assert.notStrictEqual(member.stats['تغییر مدال کلن'], '— / baseline', 'S08 Clan Medal must use zero baseline for a newly observed player');
  assert.strictEqual(member.stats['افزایش کیل 💀'], '— / baseline', 'S08 Kill must remain baseline for a player without S07 observation');
}
const commander = s08.find(member => member.player_id === 'PERSIA-P-0001');
assert.strictEqual(commander.stats['تغییر مدال کلن'], '+79,345', 'S08 existing player Clan Medal must be current minus S07');
assert.strictEqual(commander.stats['افزایش کیل 💀'], '+5,082', 'S08 existing player Kill must be current minus S07');

console.log(`VIEWER DATA TEST PASS: ${snapshots.snapshots.length} snapshots, current=${snapshots.current_snapshot_id}, S06=${s06.length} members, S07=${s07.length} members, stable saeid/saied identities preserved, S06 history shard loaded, fallback path preserved.`);
