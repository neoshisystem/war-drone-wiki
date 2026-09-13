#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REPORTS = path.join(ROOT, 'reports');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
}

const playersFile = readJson('players.json');
const snapshotsFile = readJson('snapshots.json');
const historyFile = readJson('player-observations-history.json');
const currentFile = readJson('player-observations.json');
const membershipsFile = readJson('memberships.json');

const errors = [];
const players = Array.isArray(playersFile.players) ? playersFile.players : [];
const snapshots = Array.isArray(snapshotsFile.snapshots) ? snapshotsFile.snapshots : [];
const memberships = Array.isArray(membershipsFile.memberships) ? membershipsFile.memberships : [];
const playerIds = new Set();

function error(message) {
  errors.push(message);
}

function integer(value) {
  return Number.isInteger(value);
}

function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

for (const player of players) {
  if (!player.player_id) error('player without player_id');
  if (playerIds.has(player.player_id)) error(`duplicate player_id: ${player.player_id}`);
  playerIds.add(player.player_id);
  if (!player.first_seen_snapshot) error(`${player.player_id}: missing first_seen_snapshot`);
  if (!player.last_seen_snapshot) error(`${player.player_id}: missing last_seen_snapshot`);
}

const byId = new Map(players.map((player) => [player.player_id, player]));
const ordered = [...snapshots].sort((a, b) => String(a.captured_at_utc).localeCompare(String(b.captured_at_utc)));
const seenSnapshotIds = new Set();
const seenTimes = new Set();

for (const snapshot of ordered) {
  if (!snapshot.snapshot_id) error('snapshot without snapshot_id');
  if (seenSnapshotIds.has(snapshot.snapshot_id)) error(`duplicate snapshot_id: ${snapshot.snapshot_id}`);
  seenSnapshotIds.add(snapshot.snapshot_id);
  if (seenTimes.has(snapshot.captured_at_utc)) error(`duplicate snapshot timestamp: ${snapshot.captured_at_utc}`);
  seenTimes.add(snapshot.captured_at_utc);

  const rows = historyFile.snapshots?.[snapshot.snapshot_id];
  if (!Array.isArray(rows)) {
    error(`${snapshot.snapshot_id}: history observations missing`);
    continue;
  }

  if (rows.length !== snapshot.members) error(`${snapshot.snapshot_id}: row count ${rows.length} != members ${snapshot.members}`);

  const ranks = new Set();
  const rowIds = new Set();
  for (const row of rows) {
    if (!byId.has(row.player_id)) error(`${snapshot.snapshot_id}: unknown player ${row.player_id}`);
    if (rowIds.has(row.player_id)) error(`${snapshot.snapshot_id}: duplicate player ${row.player_id}`);
    rowIds.add(row.player_id);
    if (!integer(row.rank) || row.rank < 1 || row.rank > snapshot.members) {
      error(`${snapshot.snapshot_id}: invalid rank ${row.rank}`);
    } else if (ranks.has(row.rank)) {
      error(`${snapshot.snapshot_id}: duplicate rank ${row.rank}`);
    } else {
      ranks.add(row.rank);
    }
  }

  if (ranks.size !== snapshot.members) {
    error(`${snapshot.snapshot_id}: rank coverage is ${ranks.size}/${snapshot.members}`);
  } else {
    for (let rank = 1; rank <= snapshot.members; rank += 1) {
      if (!ranks.has(rank)) error(`${snapshot.snapshot_id}: missing rank ${rank}`);
    }
  }

  const source = snapshot.source_report;
  if (source) {
    const relative = source.replace(/^\/clan-leaderboard\//, '');
    const absolute = path.join(ROOT, relative.replace(/^clan-leaderboard\//, ''));
    if (!fs.existsSync(absolute)) error(`${snapshot.snapshot_id}: source report missing: ${source}`);
  }
}

const currentId = snapshotsFile.current_snapshot_id;
if (!currentId || !seenSnapshotIds.has(currentId)) {
  error(`current_snapshot_id is not present in snapshots: ${currentId}`);
} else {
  const latest = ordered[ordered.length - 1];
  if (latest.snapshot_id !== currentId) error(`current snapshot ${currentId} is not chronologically latest (${latest.snapshot_id})`);
  const expected = historyFile.snapshots?.[currentId] || [];
  const actual = currentFile.snapshots?.[currentId] || [];
  if (!sameJson(expected, actual)) error(`${currentId}: current observations do not exactly match history`);
  if (actual.length !== latest.members) error(`${currentId}: current observation count mismatch`);
}

const activeMemberships = new Map();
for (const membership of memberships) {
  if (!byId.has(membership.player_id)) error(`membership references unknown player: ${membership.player_id}`);
  if (membership.status === 'active') {
    if (activeMemberships.has(membership.player_id)) error(`multiple active memberships: ${membership.player_id}`);
    activeMemberships.set(membership.player_id, membership);
  }
  if (!membership.from_snapshot) error(`${membership.player_id}: membership missing from_snapshot`);
  if (!membership.through_snapshot) error(`${membership.player_id}: membership missing through_snapshot`);
}

if (currentId && Array.isArray(currentFile.snapshots?.[currentId])) {
  const latestIds = new Set(currentFile.snapshots[currentId].map((row) => row.player_id));
  for (const id of latestIds) {
    if (!activeMemberships.has(id)) error(`${id}: latest player has no active membership`);
  }
  for (const [id] of activeMemberships) {
    if (!latestIds.has(id)) error(`${id}: active membership absent from latest snapshot`);
  }
}

for (const player of players) {
  if (player.status === 'former' && activeMemberships.has(player.player_id)) {
    error(`${player.player_id}: former player still has active membership`);
  }
}

if (errors.length) {
  console.error(`INGESTION VALIDATION FAILED (${errors.length} errors)`);
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`INGESTION VALIDATION PASS: ${ordered.length} snapshots, ${players.length} identities, current=${currentId}`);
