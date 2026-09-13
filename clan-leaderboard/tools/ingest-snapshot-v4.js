#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith('--'));
const write = args.includes('--write');
const dryRun = args.includes('--dry-run') || !write;

function fail(message) {
  console.error(`INGESTION FAILED: ${message}`);
  process.exit(1);
}

if (!inputArg) fail('usage: node tools/ingest-snapshot.js <snapshot.json> [--dry-run|--write]');
if (args.includes('--dry-run') && write) fail('choose exactly one mode');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`cannot read ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function required(value, field) {
  if (value === undefined || value === null || value === '') fail(`${field} is required`);
}

function integer(value, field) {
  if (!Number.isInteger(value) || value < 0) fail(`${field} must be a non-negative integer`);
}

function isoUtc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    fail('snapshot.captured_at_utc must be an ISO UTC timestamp');
  }
  if (Number.isNaN(Date.parse(value))) fail('snapshot.captured_at_utc is invalid');
}

const input = readJson(path.resolve(inputArg));
const playersFile = readJson(path.join(DATA, 'players.json'));
const snapshotsFile = readJson(path.join(DATA, 'snapshots.json'));
const historyFile = readJson(path.join(DATA, 'player-observations-history.json'));
const currentFile = readJson(path.join(DATA, 'player-observations.json'));
const membershipsFile = readJson(path.join(DATA, 'memberships.json'));
const indexFile = readJson(path.join(DATA, 'index.json'));

if (!input.snapshot || !Array.isArray(input.players)) fail('input must contain snapshot and players[]');
const snapshot = input.snapshot;
['captured_at_utc', 'date_persian', 'time_iran', 'type', 'members', 'capacity'].forEach((field) => required(snapshot[field], `snapshot.${field}`));
isoUtc(snapshot.captured_at_utc);
integer(snapshot.members, 'snapshot.members');
integer(snapshot.capacity, 'snapshot.capacity');
if (snapshot.members !== input.players.length) fail('snapshot.members does not equal players.length');
if (snapshot.members > snapshot.capacity) fail('snapshot.members exceeds snapshot.capacity');

const snapshots = Array.isArray(snapshotsFile.snapshots) ? snapshotsFile.snapshots : [];
if (snapshots.some((item) => item.captured_at_utc === snapshot.captured_at_utc)) fail('snapshot timestamp already exists');
const numericIds = snapshots.map((item) => Number(String(item.snapshot_id || '').replace(/^S/, ''))).filter(Number.isFinite);
const nextSequence = Math.max(0, ...numericIds) + 1;
const snapshotId = snapshot.snapshot_id || `S${String(nextSequence).padStart(2, '0')}`;
if (snapshots.some((item) => item.snapshot_id === snapshotId)) fail(`${snapshotId} already exists`);

const registry = new Map((playersFile.players || []).map((player) => [player.player_id, player]));
const names = new Map();
for (const player of playersFile.players || []) {
  const list = names.get(player.display_name) || [];
  list.push(player);
  names.set(player.display_name, list);
}

const seenIds = new Set();
const seenRanks = new Set();
const rows = [];
let nextPlayerNumber = Math.max(0, ...(playersFile.players || []).map((player) => Number(String(player.player_id || '').replace('PERSIA-P-', ''))).filter(Number.isFinite));

for (const source of input.players) {
  required(source.display_name, 'player.display_name');
  if (!Number.isInteger(source.rank) || source.rank < 1 || source.rank > snapshot.capacity) fail(`${source.display_name}: invalid rank`);
  if (seenRanks.has(source.rank)) fail(`${snapshotId}: duplicate rank ${source.rank}`);
  seenRanks.add(source.rank);

  let player = source.player_id ? registry.get(source.player_id) : null;
  if (source.player_id && !player) fail(`${source.display_name}: unknown player_id ${source.player_id}`);
  if (!player) {
    const matches = names.get(source.display_name) || [];
    if (matches.length > 1) fail(`ambiguous identity: ${source.display_name}; supply player_id`);
    if (matches.length === 1) player = matches[0];
  }
  if (player && player.display_name !== source.display_name) fail(`identity mismatch: ${player.player_id} is ${player.display_name}, input says ${source.display_name}`);
  if (!player) {
    if (source.confirmed_new_identity !== true) fail(`new identity ${source.display_name} requires confirmed_new_identity=true`);
    nextPlayerNumber += 1;
    player = { player_id: `PERSIA-P-${String(nextPlayerNumber).padStart(4, '0')}`, display_name: source.display_name, status: 'active', role: source.role || 'Member', first_seen_snapshot: snapshotId, last_seen_snapshot: snapshotId };
    registry.set(player.player_id, player);
    const list = names.get(player.display_name) || [];
    list.push(player);
    names.set(player.display_name, list);
  }

  if (seenIds.has(player.player_id)) fail(`${snapshotId}: duplicate player ${player.player_id}`);
  seenIds.add(player.player_id);
  integer(source.stage, `${source.display_name}.stage`);
  integer(source.league_medals, `${source.display_name}.league_medals`);
  integer(source.league_medals_delta, `${source.display_name}.league_medals_delta`);
  integer(source.clan_medals, `${source.display_name}.clan_medals`);
  integer(source.total_kills, `${source.display_name}.total_kills`);
  integer(source.kills_delta, `${source.display_name}.kills_delta`);
  for (const medal of ['gold', 'silver', 'bronze']) integer(source.honor_medals?.[medal], `${source.display_name}.honor_medals.${medal}`);
  for (const weapon of ['25mm', 'hydra', 'hellfire']) integer(source.weapons?.[weapon], `${source.display_name}.weapons.${weapon}`);
  required(source.last_online_display, `${source.display_name}.last_online_display`);

  rows.push({
    player_id: player.player_id,
    rank: source.rank,
    rank_movement: source.rank_movement ?? 0,
    stage: source.stage,
    league_medals: source.league_medals,
    league_medals_delta: source.league_medals_delta,
    clan_medals: source.clan_medals,
    honor_medals: source.honor_medals,
    total_kills: source.total_kills,
    kills_delta: source.kills_delta,
    weapons: source.weapons,
    last_online_display: source.last_online_display
  });
}

if (rows.length !== snapshot.members) fail(`${snapshotId}: normalized row count mismatch`);
if (seenRanks.size !== snapshot.members) fail(`${snapshotId}: rank coverage mismatch`);
if (seenIds.size !== snapshot.members) fail(`${snapshotId}: identity coverage mismatch`);

const chronological = [...snapshots].sort((a, b) => a.captured_at_utc.localeCompare(b.captured_at_utc));
const previous = chronological.at(-1) || null;
if (previous && !historyFile.snapshots?.[previous.snapshot_id]) {
  fail(`canonical history is incomplete before ${snapshotId}: missing ${previous.snapshot_id}; run reconciliation first`);
}

const previousRows = previous ? historyFile.snapshots[previous.snapshot_id] : [];
const previousIds = new Set(previousRows.map((row) => row.player_id));
const currentIds = new Set(rows.map((row) => row.player_id));
const added = [...currentIds].filter((id) => !previousIds.has(id));
const removed = [...previousIds].filter((id) => !currentIds.has(id));
const retained = currentIds.size - added.length;

const nextPlayers = clone(playersFile);
nextPlayers.players = nextPlayers.players.map((player) => {
  const row = rows.find((item) => item.player_id === player.player_id);
  return row ? { ...player, display_name: player.display_name, role: player.role, status: 'active', last_seen_snapshot: snapshotId } : player;
});
for (const row of rows) {
  if (!nextPlayers.players.some((player) => player.player_id === row.player_id)) {
    nextPlayers.players.push({ player_id: row.player_id, display_name: registry.get(row.player_id).display_name, status: 'active', role: registry.get(row.player_id).role || 'Member', first_seen_snapshot: snapshotId, last_seen_snapshot: snapshotId });
  }
}
for (const player of nextPlayers.players) {
  if (!currentIds.has(player.player_id) && previousIds.has(player.player_id)) player.status = 'former';
}

const nextMemberships = clone(membershipsFile);
const membershipRows = nextMemberships.memberships || [];
for (const membership of membershipRows) {
  if (membership.status === 'active' && currentIds.has(membership.player_id)) membership.through_snapshot = snapshotId;
}
for (const id of added) {
  membershipRows.push({ player_id: id, from_snapshot: snapshotId, through_snapshot: snapshotId, status: 'active', start_event: previous ? `joined_between_${previous.snapshot_id}_and_${snapshotId}` : 'joined_with_initial_snapshot' });
}
for (const id of removed) {
  const membership = membershipRows.find((item) => item.status === 'active' && item.player_id === id);
  if (membership) {
    membership.through_snapshot = previous?.snapshot_id || membership.through_snapshot;
    membership.status = 'ended';
    membership.end_precision = 'between_snapshots';
    membership.end_event = 'left_or_kicked';
  }
}
nextMemberships.memberships = membershipRows;

const nextSnapshots = clone(snapshotsFile);
nextSnapshots.current_snapshot_id = snapshotId;
nextSnapshots.snapshots = [...snapshots, {
  snapshot_id: snapshotId,
  captured_at_utc: snapshot.captured_at_utc,
  date_persian: snapshot.date_persian,
  time_iran: snapshot.time_iran,
  type: snapshot.type,
  members: snapshot.members,
  capacity: snapshot.capacity,
  source_report: snapshot.source_report || null,
  normalized_observations: true,
  observation_source: 'player-observations-history.json'
}];

const nextHistory = clone(historyFile);
nextHistory.snapshots = { ...(nextHistory.snapshots || {}), [snapshotId]: rows };
const nextCurrent = clone(currentFile);
nextCurrent.snapshots = { [snapshotId]: rows };

const nextIndex = clone(indexFile);
const reports = Array.isArray(nextIndex.reports) ? nextIndex.reports : [];
if (snapshot.report_filename) {
  nextIndex.reports = [{ id: snapshot.report_filename.replace(/\.html$/i, ''), period: reports.length ? Math.max(...reports.map((item) => Number(item.period) || 0)) + 1 : 1, date_persian: snapshot.date_persian, time: snapshot.time_iran, type: snapshot.type, members: snapshot.members, capacity: `${snapshot.members}/${snapshot.capacity}`, page: `../reports/${snapshot.report_filename}` }, ...reports];
}

const totalClanMedals = rows.reduce((sum, row) => sum + row.clan_medals, 0);
const result = { ok: true, mode: dryRun ? 'dry-run' : 'write', snapshot_id: snapshotId, previous_snapshot_id: previous?.snapshot_id || null, members: snapshot.members, added, removed, retained, total_clan_medals: totalClanMedals, report_generation: 'not-yet-generated' };
console.log(JSON.stringify(result, null, 2));

if (dryRun) process.exit(0);

// Write only after every validation above has passed. The report itself is deliberately not generated here yet;
// presentation parity is a separate acceptance gate and must not be replaced by a low-fidelity HTML generator.
function save(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
save(path.join(DATA, 'players.json'), nextPlayers);
save(path.join(DATA, 'snapshots.json'), nextSnapshots);
save(path.join(DATA, 'player-observations.json'), nextCurrent);
save(path.join(DATA, 'player-observations-history.json'), nextHistory);
save(path.join(DATA, 'memberships.json'), nextMemberships);
save(path.join(DATA, 'index.json'), nextIndex);
fs.mkdirSync(path.join(DATA, 'incoming'), { recursive: true });
const archiveName = snapshot.input_archive || `${snapshot.captured_at_utc.replace(/[-:]/g, '').replace(/\.000Z$/, 'Z').replace(/Z$/, 'Z')}.json`;
const archivePath = path.join(DATA, 'incoming', archiveName);
if (!fs.existsSync(archivePath)) fs.copyFileSync(path.resolve(inputArg), archivePath);
console.log(`WRITE COMPLETE: ${snapshotId}`);
