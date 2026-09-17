#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'war-drone-ingest-test-'));
const tempData = path.join(tempRoot, 'data');
const tempRunner = path.join(tempRoot, 'ingest-snapshot-v4.js');
const fixture = path.join(tempRoot, 'SNAPSHOT_INGESTION_TEST.json');
function copy(name) { fs.copyFileSync(path.join(ROOT, 'data', name), path.join(tempData, name)); }
const input = {
  snapshot: { snapshot_id: 'S99', captured_at_utc: '2026-09-17T00:00:01Z', date_persian: '26 شهریور 1405', time_iran: '03:30:01', type: 'delta-report', members: 1, capacity: 50, season_label: 'TEST', league_boundary: 'start', boundary_label: 'شروع لیگ جدید' },
  players: [{ player_id: 'PERSIA-P-0001', display_name: 'Commander Renamed For Test', role: 'Member', rank: 1, rank_movement: null, stage: 58, league_medals: 295280, league_medals_delta: null, clan_medals: 1194919, honor_medals: { gold: 1, silver: 3, bronze: 3 }, total_kills: 219151, kills_delta: null, weapons: { '25mm': 910, hydra: 249, hellfire: 66, upgrade_deltas: {} }, last_online_display: '1m ago' }]
};
try {
  fs.mkdirSync(tempData, { recursive: true });
  for (const file of ['players.json', 'snapshots.json', 'player-observations.json', 'player-observations-history.json', 'memberships.json']) copy(file);
  fs.copyFileSync(path.join(ROOT, 'tools', 'ingest-snapshot-v4.js'), tempRunner);
  fs.writeFileSync(fixture, `${JSON.stringify(input, null, 2)}\n`, 'utf8');
  const run = args => spawnSync(process.execPath, [tempRunner, fixture, ...args], { cwd: tempRoot, encoding: 'utf8' });
  const dry = run(['--dry-run']);
  if (dry.status !== 0) { process.stderr.write(dry.stderr || dry.stdout); process.exit(dry.status || 1); }
  const parsed = JSON.parse(dry.stdout);
  if (!parsed.ok || parsed.mode !== 'dry-run' || parsed.snapshot_id !== 'S99') throw new Error('unexpected ingestion result');
  if (parsed.members !== 1 || parsed.total_clan_medals !== 1194919) throw new Error('unexpected normalized result');
  const write = run(['--write']);
  if (write.status !== 0) { process.stderr.write(write.stderr || write.stdout); process.exit(write.status || 1); }
  const snapshots = JSON.parse(fs.readFileSync(path.join(tempData, 'snapshots.json'), 'utf8'));
  const persisted = snapshots.snapshots.find(item => item.snapshot_id === 'S99');
  if (!persisted || persisted.league_boundary !== 'start' || persisted.boundary_label !== 'شروع لیگ جدید') throw new Error('league-boundary metadata was not persisted');
  console.log('SNAPSHOT INGESTION TEST PASS: stable-ID rename + nullable deltas + league-boundary persistence + isolated write regression');
} finally { fs.rmSync(tempRoot, { recursive: true, force: true }); }
