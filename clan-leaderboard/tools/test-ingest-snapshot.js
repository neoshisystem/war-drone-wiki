#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const fixture = path.join(ROOT, 'data', 'incoming', 'SNAPSHOT_INGESTION_TEST.json');
const runner = path.join(ROOT, 'tools', 'ingest-snapshot.js');

const input = {
  snapshot: {
    captured_at_utc: '2026-09-14T00:00:00Z',
    date_persian: '23 شهریور 1405',
    time_iran: '03:30',
    type: 'delta-report',
    members: 1,
    capacity: 50,
    season_label: 'TEST'
  },
  players: [{
    player_id: 'PERSIA-P-0001',
    display_name: 'Commander Renamed For Test',
    role: 'Member',
    rank: 1,
    rank_movement: null,
    stage: 58,
    league_medals: 295280,
    league_medals_delta: null,
    clan_medals: 1194919,
    honor_medals: { gold: 1, silver: 3, bronze: 3 },
    total_kills: 219151,
    kills_delta: null,
    weapons: { '25mm': 910, hydra: 249, hellfire: 66, upgrade_deltas: {} },
    last_online_display: '1m ago'
  }]
};

fs.writeFileSync(fixture, `${JSON.stringify(input, null, 2)}\n`, 'utf8');
try {
  const result = spawnSync(process.execPath, [runner, fixture, '--dry-run'], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  const parsed = JSON.parse(result.stdout);
  if (!parsed.ok || parsed.mode !== 'dry-run' || parsed.snapshot_id !== 'S05') {
    throw new Error('unexpected ingestion result');
  }
  if (parsed.members !== 1 || parsed.total_clan_medals !== 1194919) {
    throw new Error('unexpected normalized result');
  }
  console.log('SNAPSHOT INGESTION TEST PASS: stable-ID rename + nullable deltas + dry-run isolation');
} finally {
  fs.rmSync(fixture, { force: true });
}
