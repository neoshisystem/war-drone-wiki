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
for (const id of ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07']) if (!results[id]) fail(`missing ${id}`);
if (results.S01.weekly_clan_medals_earned !== 0 || results.S01.weekly_kills_earned !== 0) fail('baseline internal aggregate must start at zero');
if (results.S01.baseline_snapshot_id !== 'S01') fail('S01 must identify itself as baseline');
if (!rows('S01').every(row => results.S01.period_players?.[row.player_id]?.baseline === true)) fail('S01 players must be marked baseline');
if (![results.S01, results.S02, results.S03, results.S04, results.S05, results.S06, results.S07].every(item => item.league_week === '2026-09-10')) fail('S01-S07 must belong to the 2026-09-10 league week');
if (snapshots.snapshots.find(item => item.snapshot_id === 'S07')?.league_boundary !== 'end') fail('S07 must be explicitly marked as league end');
if (snapshots.snapshots.find(item => item.snapshot_id === 'S07')?.boundary_label !== 'پایان لیگ جاری') fail('S07 boundary label must identify league end');
for (const id of ['S02', 'S03', 'S04', 'S05', 'S06', 'S07']) {
  if (results[id].period_clan_medals_change !== aggregatePeriod(id, 'clan_medals')) fail(`${id} clan period aggregate mismatch`);
  if (results[id].period_kills_change !== aggregatePeriod(id, 'kills')) fail(`${id} kill period aggregate mismatch`);
  if (rows(id).some(row => results[id].period_players?.[row.player_id] == null)) fail(`${id} missing player period metric`);
}
if (results.S07.period_clan_medals_change !== 374282) fail('S07 period clan-medal delta must be +374,282');
if (results.S07.period_kills_change !== 58932) fail('S07 period kill delta must be +58,932');
if (results.S07.weekly_clan_medals_earned !== 969620) fail('S07 weekly clan-medal accumulation mismatch');
if (results.S07.weekly_kills_earned !== 154665) fail('S07 weekly-kill accumulation mismatch');
const s02Ids = new Set(rows('S02').map(row => row.player_id));
const s03Added = rows('S03').filter(row => !s02Ids.has(row.player_id));
if (s03Added.length > 0) {
  for (const row of s03Added) {
    const metric = results.S03.period_players?.[row.player_id];
    if (!metric || metric.clan_medals !== 0 || metric.kills !== 0) fail(`new player ${row.player_id} must have zero S03 contribution`);
  }
}
const s06Ids = new Set(rows('S06').map(row => row.player_id));
const s07Added = rows('S07').filter(row => !s06Ids.has(row.player_id));
if (s07Added.length !== 1 || s07Added[0].player_id !== 'PERSIA-P-0051') fail('S07 must contain exactly one new player: hisystemX');
if (results.S07.period_players?.['PERSIA-P-0051']?.clan_medals !== 0 || results.S07.period_players?.['PERSIA-P-0051']?.kills !== 0 || results.S07.period_players?.['PERSIA-P-0051']?.baseline !== true) fail('hisystemX must be S07 baseline');
for (const id of ['PERSIA-P-0049','PERSIA-P-0050','PERSIA-P-0045','PERSIA-P-0046']) if (results.S07.period_players?.[id] != null) fail(`${id} must not appear in S07 current period players`);
if (rows('S07').find(row => row.player_id === 'PERSIA-P-0019') == null) fail('active saeid identity PERSIA-P-0019 must remain in S07');
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

// Synthetic league transition: S08 starts a new league. Clan Medals are reset to 0,
// while Kills continue from S07. S09 then continues both within the same league.
const syntheticSnapshots = JSON.parse(JSON.stringify(snapshots));
syntheticSnapshots.snapshots.push({ snapshot_id:'S08', captured_at_utc:'2026-09-17T00:00:00Z', date_persian:'26 شهریور 1405', time_iran:'03:30', type:'delta-report', league_boundary:'start', boundary_label:'شروع لیگ جدید', members:42, capacity:50 });
syntheticSnapshots.snapshots.push({ snapshot_id:'S09', captured_at_utc:'2026-09-17T01:00:00Z', date_persian:'26 شهریور 1405', time_iran:'04:00', type:'delta-report', members:42, capacity:50 });
syntheticSnapshots.snapshots.push({ snapshot_id:'S10', captured_at_utc:'2026-09-17T02:00:00Z', date_persian:'26 شهریور 1405', time_iran:'05:30', type:'delta-report', members:41, capacity:50 });
syntheticSnapshots.snapshots.push({ snapshot_id:'S11', captured_at_utc:'2026-09-17T03:00:00Z', date_persian:'26 شهریور 1405', time_iran:'06:30', type:'delta-report', members:42, capacity:50 });
const s07Rows = rows('S07');
const s08Rows = s07Rows.map(row => ({ ...row, clan_medals: 100, total_kills: Number(row.total_kills || 0) + 10 }));
const s09Rows = s08Rows.map((row, index) => index === 0 ? ({ ...row, clan_medals: row.clan_medals + 100, total_kills: row.total_kills + 7 }) : ({ ...row }));
const gapPlayerId = s07Rows[0].player_id;
const s10Rows = s09Rows.filter(row => row.player_id !== gapPlayerId);
const s11Rows = s10Rows.concat([{ ...s09Rows[0], clan_medals: s09Rows[0].clan_medals + 500, total_kills: s09Rows[0].total_kills + 50 }]);
const syntheticCurrent = { snapshots: { S08: s08Rows, S09: s09Rows, S10: s10Rows, S11: s11Rows } };
const synthetic = performance.computeAll(syntheticSnapshots, [...sets, syntheticCurrent], leagues);
if (synthetic.S08.league_week !== '2026-09-17') fail('league reset date was not recognized');
const expectedS08Clan = s08Rows.reduce((sum, row) => sum + Number(row.clan_medals || 0), 0);
const expectedS08Kills = s08Rows.reduce((sum, row, index) => sum + (Number(row.total_kills || 0) - Number(s07Rows[index].total_kills || 0)), 0);
if (synthetic.S08.weekly_clan_medals_earned !== expectedS08Clan) fail('S08 Clan Medal total must start from zero and equal observed league progress');
if (synthetic.S08.weekly_kills_earned !== expectedS08Kills) fail('S08 Kill total must continue from S07');
if (synthetic.S08.period_clan_medals_change !== expectedS08Clan) fail('S08 period Clan Medal delta must equal observed values from zero baseline');
if (synthetic.S08.period_kills_change !== expectedS08Kills) fail('S08 period Kill delta must equal S08 minus S07');
if (synthetic.S08.baseline_snapshot_id !== 'S07') fail('S08 period baseline reference must remain S07 for continuous comparison');
if (synthetic.S09.weekly_clan_medals_earned !== expectedS08Clan + 100) fail('S09 Clan Medal accumulation did not continue from S08');
if (synthetic.S09.weekly_kills_earned !== expectedS08Kills + 7) fail('S09 Kill accumulation did not continue from S08');
if (synthetic.S09.period_players?.[s07Rows[0].player_id]?.clan_medals !== 100) fail('S09 period Clan Medal delta mismatch');
if (synthetic.S09.period_players?.[s07Rows[0].player_id]?.kills !== 7) fail('S09 period Kill delta mismatch');
if (synthetic.S11.period_players?.[gapPlayerId]?.clan_medals !== 0 || synthetic.S11.period_players?.[gapPlayerId]?.kills !== 0 || synthetic.S11.period_players?.[gapPlayerId]?.baseline !== true) fail('re-added player must restart as a period baseline after an observation gap');
if (synthetic.S11.cumulative_players?.[gapPlayerId]?.clan_medals !== synthetic.S09.cumulative_players?.[gapPlayerId]?.clan_medals + 500) fail('cumulative Clan Medals must preserve history and add post-return activity');
if (synthetic.S11.cumulative_players?.[gapPlayerId]?.kills !== synthetic.S09.cumulative_players?.[gapPlayerId]?.kills + 50) fail('cumulative Kills must preserve history and add post-return activity');
console.log('PERFORMANCE TEST PASS: S01 baseline, S07 league-end semantics, S08 Clan Medal reset, continuous Kills, cumulative history, and membership-gap handling are valid.');
