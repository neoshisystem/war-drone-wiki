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
const sets = [history, historyS05, current];
const results = performance.computeAll(snapshots, sets, leagues);
function fail(message) { throw new Error(`PERFORMANCE TEST FAILED: ${message}`); }
function rows(id) { const merged = sets.reduce((all, source) => ({ ...all, ...(source.snapshots || {}) }), {}); return merged[id] || []; }
function aggregatePeriod(id, field) { return rows(id).reduce((sum, row) => sum + Number(results[id].period_players?.[row.player_id]?.[field] || 0), 0); }
for (const id of ['S01', 'S02', 'S03', 'S04', 'S05']) if (!results[id]) fail(`missing ${id}`);
if (results.S01.weekly_clan_medals_earned !== 0 || results.S01.weekly_kills_earned !== 0) fail('baseline internal aggregate must start at zero');
if (results.S01.baseline_snapshot_id !== 'S01') fail('S01 must identify itself as baseline');
if (!rows('S01').every(row => results.S01.period_players?.[row.player_id]?.baseline === true)) fail('S01 players must be marked baseline');
if (![results.S01, results.S02, results.S03, results.S04, results.S05].every(item => item.league_week === '2026-09-10')) fail('S01-S05 must belong to the 2026-09-10 league week');
for (const id of ['S02', 'S03', 'S04', 'S05']) {
  if (results[id].period_clan_medals_change !== aggregatePeriod(id, 'clan_medals')) fail(`${id} clan period aggregate mismatch`);
  if (results[id].period_kills_change !== aggregatePeriod(id, 'kills')) fail(`${id} kill period aggregate mismatch`);
  if (rows(id).some(row => results[id].period_players?.[row.player_id] == null)) fail(`${id} missing player period metric`);
}
const s02Ids = new Set(rows('S02').map(row => row.player_id));
const s03Added = rows('S03').filter(row => !s02Ids.has(row.player_id));
if (s03Added.length > 0) {
  for (const row of s03Added) {
    const metric = results.S03.period_players?.[row.player_id];
    if (!metric || metric.clan_medals !== 0 || metric.kills !== 0) fail(`new player ${row.player_id} must have zero S03 contribution`);
  }
}
function transition(prevId, currentId, field) {
  const prev = new Map(rows(prevId).map(row => [row.player_id, row]));
  return rows(currentId).reduce((sum, row) => {
    const before = prev.get(row.player_id);
    return sum + (before ? Number(row[field] || 0) - Number(before[field] || 0) : 0);
  }, 0);
}
const expectedS05Clan = transition('S04', 'S05', 'clan_medals') + results.S04.weekly_clan_medals_earned;
if (results.S05.weekly_clan_medals_earned !== expectedS05Clan) fail('S05 weekly clan-medal accumulation mismatch');
const expectedS05Kills = transition('S04', 'S05', 'total_kills') + results.S04.weekly_kills_earned;
if (results.S05.weekly_kills_earned !== expectedS05Kills) fail('S05 weekly-kill accumulation mismatch');
const commonPlayer = rows('S05').find(row => ['S01', 'S02', 'S03', 'S04'].every(id => rows(id).some(item => item.player_id === row.player_id)));
if (!commonPlayer) fail('could not find a player continuously observed from S01 through S05');
let expectedCumulativeClan = 0;
let expectedCumulativeKills = 0;
for (const [previousId, currentId] of [['S01', 'S02'], ['S02', 'S03'], ['S03', 'S04'], ['S04', 'S05']]) {
  const before = rows(previousId).find(row => row.player_id === commonPlayer.player_id);
  const after = rows(currentId).find(row => row.player_id === commonPlayer.player_id);
  if (before && after) {
    expectedCumulativeClan += Number(after.clan_medals || 0) - Number(before.clan_medals || 0);
    expectedCumulativeKills += Number(after.total_kills || 0) - Number(before.total_kills || 0);
  }
}
if (results.S05.cumulative_players?.[commonPlayer.player_id]?.clan_medals !== expectedCumulativeClan) fail('cumulative clan-medal value mismatch');
if (results.S05.cumulative_players?.[commonPlayer.player_id]?.kills !== expectedCumulativeKills) fail('cumulative kill value mismatch');
const syntheticSnapshots = JSON.parse(JSON.stringify(snapshots));
syntheticSnapshots.snapshots.push({ snapshot_id:'S06', captured_at_utc:'2026-09-17T00:00:00Z', date_persian:'26 شهریور 1405', time_iran:'03:30', type:'delta-report', members:47, capacity:50 });
syntheticSnapshots.snapshots.push({ snapshot_id:'S07', captured_at_utc:'2026-09-17T01:00:00Z', date_persian:'26 شهریور 1405', time_iran:'04:00', type:'delta-report', members:47, capacity:50 });
const s05Rows = rows('S05');
const s06Rows = s05Rows.map(row => ({ ...row }));
const s07Rows = s05Rows.map((row, index) => index === 0 ? ({ ...row, clan_medals: row.clan_medals + 100, total_kills: row.total_kills + 7 }) : ({ ...row }));
const syntheticCurrent = { snapshots: { S06: s06Rows, S07: s07Rows } };
const synthetic = performance.computeAll(syntheticSnapshots, [...sets, syntheticCurrent], leagues);
if (synthetic.S06.league_week !== '2026-09-17') fail('league reset date was not recognized');
if (synthetic.S06.weekly_clan_medals_earned !== 0 || synthetic.S06.weekly_kills_earned !== 0) fail('weekly metrics did not reset at league boundary');
if (synthetic.S07.weekly_clan_medals_earned !== 100 || synthetic.S07.weekly_kills_earned !== 7) fail('new-week accumulation did not restart from zero');
if (synthetic.S07.period_players?.[s05Rows[0].player_id]?.clan_medals !== 100) fail('new-week period clan delta mismatch');
if (synthetic.S07.period_players?.[s05Rows[0].player_id]?.kills !== 7) fail('new-week period kill delta mismatch');
console.log('PERFORMANCE TEST PASS: period deltas, S01 baseline semantics, membership-aware weekly accumulation, league reset, and cumulative player metrics are valid.');
