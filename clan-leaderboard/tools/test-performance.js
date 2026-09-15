#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const performance = require('../assets/performance.js');
const ROOT = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
const snapshots = read('snapshots.json');
const history = read('player-observations-history.json');
const historyS05 = read('player-observations-history-s05.json');
const current = read('player-observations.json');
const leagues = read('leagues.json');
const results = performance.computeAll(snapshots, [history, historyS05, current], leagues);
function fail(message) { throw new Error(`PERFORMANCE TEST FAILED: ${message}`); }
for (const id of ['S01', 'S02', 'S03', 'S04', 'S05']) if (!results[id]) fail(`missing ${id}`);
if (results.S01.weekly_clan_medals_earned !== 0 || results.S01.weekly_kills_earned !== 0) fail('baseline must start at zero');
if (![results.S01, results.S02, results.S03, results.S04, results.S05].every(item => item.league_week === '2026-09-10')) fail('S01-S05 must belong to the 2026-09-10 league week');
function rows(id) { const merged = { ...(history.snapshots || {}), ...(historyS05.snapshots || {}), ...(current.snapshots || {}) }; return merged[id] || []; }
function transition(prevId, currentId) {
  const prev = new Map(rows(prevId).map(row => [row.player_id, row]));
  return rows(currentId).reduce((sum, row) => {
    const before = prev.get(row.player_id);
    return sum + (before ? Number(row.clan_medals) - Number(before.clan_medals) : 0);
  }, 0);
}
const expectedS05Clan = transition('S04', 'S05') + results.S04.weekly_clan_medals_earned;
if (results.S05.weekly_clan_medals_earned !== expectedS05Clan) fail('S05 weekly clan-medal accumulation mismatch');
const expectedS05Kills = rows('S04').reduce((sum, before) => {
  const after = new Map(rows('S05').map(row => [row.player_id, row])).get(before.player_id);
  return sum + (after ? Number(after.total_kills) - Number(before.total_kills) : 0);
}, 0) + results.S04.weekly_kills_earned;
if (results.S05.weekly_kills_earned !== expectedS05Kills) fail('S05 weekly-kill accumulation mismatch');
const syntheticSnapshots = JSON.parse(JSON.stringify(snapshots));
syntheticSnapshots.snapshots.push({ snapshot_id:'S06', captured_at_utc:'2026-09-17T00:00:00Z', date_persian:'26 شهریور 1405', time_iran:'03:30', type:'delta-report', members:47, capacity:50 });
syntheticSnapshots.snapshots.push({ snapshot_id:'S07', captured_at_utc:'2026-09-17T01:00:00Z', date_persian:'26 شهریور 1405', time_iran:'04:00', type:'delta-report', members:47, capacity:50 });
const s05Rows = rows('S05');
const s06Rows = s05Rows.map(row => ({ ...row }));
const s07Rows = s05Rows.map((row, index) => index === 0 ? ({ ...row, clan_medals: row.clan_medals + 100, total_kills: row.total_kills + 7 }) : ({ ...row }));
const syntheticCurrent = { snapshots: { S06: s06Rows, S07: s07Rows } };
const synthetic = performance.computeAll(syntheticSnapshots, [history, historyS05, current, syntheticCurrent], leagues);
if (synthetic.S06.league_week !== '2026-09-17') fail('league reset date was not recognized');
if (synthetic.S06.weekly_clan_medals_earned !== 0 || synthetic.S06.weekly_kills_earned !== 0) fail('weekly metrics did not reset at league boundary');
if (synthetic.S07.weekly_clan_medals_earned !== 100 || synthetic.S07.weekly_kills_earned !== 7) fail('new-week accumulation did not restart from zero');
console.log('PERFORMANCE TEST PASS: weekly reset, S01-S05 accumulation, and player-level weekly baselines are structurally valid.');
