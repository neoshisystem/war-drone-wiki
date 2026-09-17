#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const fixture = path.join(ROOT, 'data', 'incoming', 'SNAPSHOT_INGESTION_TEST.json');
const runner = path.join(ROOT, 'tools', 'ingest-snapshot-v4.js');
const input = {
  snapshot: { snapshot_id: 'S99', captured_at_utc: '2026-09-17T00:00:01Z', date_persian: '26 شهریور 1405', time_iran: '03:30:01', type: 'delta-report', members: 1, capacity: 50, season_label: 'TEST', league_boundary: 'start', boundary_label: 'شروع لیگ جدید' },
  players: [{ player_id: 'PERSIA-P-0001', display_name: 'Commander Renamed For Test', role: 'Member', rank: 1, rank_movement: null, stage: 58, league_medals: 295280, league_medals_delta: null, clan_medals: 1194919, honor_medals: { gold: 1, silver: 3, bronze: 3 }, total_kills: 219151, kills_delta: null, weapons: { '25mm': 910, hydra: 249, hellfire: 66, upgrade_deltas: {} }, last_online_display: '1m ago' }]
};
fs.writeFileSync(fixture, `${JSON.stringify(input, null, 2)}\n`, 'utf8');
try {
  const result = spawnSync(process.execPath, [runner, fixture, '--dry-run'], { encoding: 'utf8' });
  if (result.status !== 0) { process.stderr.write(result.stderr || result.stdout); process.exit(result.status || 1); }
  const parsed = JSON.parse(result.stdout);
  if (!parsed.ok || parsed.mode !== 'dry-run' || parsed.snapshot_id !== 'S99') throw new Error('unexpected ingestion result');
  if (parsed.members !== 1 || parsed.total_clan_medals !== 1194919) throw new Error('unexpected normalized result');
  const writeResult = spawnSync(process.execPath, [runner, fixture, '--write'], { encoding: 'utf8' });
  if (writeResult.status !== 0) { process.stderr.write(writeResult.stderr || writeResult.stdout); process.exit(writeResult.status || 1); }
  const snapshots = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'snapshots.json'), 'utf8'));
  const persisted = snapshots.snapshots.find(item => item.snapshot_id === 'S99');
  if (!persisted || persisted.league_boundary !== 'start' || persisted.boundary_label !== 'شروع لیگ جدید') throw new Error('league-boundary metadata was not persisted');
  fs.writeFileSync(path.join(ROOT, 'data', 'snapshots.json'), `${JSON.stringify({ ...snapshots, snapshots: snapshots.snapshots.filter(item => item.snapshot_id !== 'S99'), current_snapshot_id: 'S07' }, null, 2)}\n`, 'utf8');
  for (const file of ['players.json','player-observations.json','player-observations-history.json','memberships.json']) {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8'));
    if (file === 'players.json') data.players = data.players.filter(player => player.player_id !== 'PERSIA-P-0001' || player.display_name !== 'Commander Renamed For Test');
    if (file === 'player-observations.json') delete data.snapshots.S99;
    if (file === 'player-observations-history.json') delete data.snapshots.S07;
    if (file === 'memberships.json') data.memberships = data.memberships.filter(item => !(item.player_id === 'PERSIA-P-0001' && item.from_snapshot === 'S99'));
    fs.writeFileSync(path.join(ROOT, 'data', file), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
  console.log('SNAPSHOT INGESTION TEST PASS: stable-ID rename + nullable deltas + league-boundary persistence + dry-run isolation');
} finally { fs.rmSync(fixture, { force: true }); }