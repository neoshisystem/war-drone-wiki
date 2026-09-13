#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const INCOMING = path.join(DATA, 'incoming');

const args = process.argv.slice(2);
const inputPath = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const writeMode = args.includes('--write');

function die(message) {
  console.error(`INGESTION FAILED: ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    die(`cannot read ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function positiveInt(value, field) {
  if (!Number.isInteger(value) || value < 0) die(`${field} must be a non-negative integer`);
  return value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rankMovementText(movement) {
  if (movement === 0) return '-';
  return movement > 0 ? `↑ ${movement}` : `↓ ${Math.abs(movement)}`;
}

function weaponText(weapons) {
  const values = [
    ['25mm', weapons['25mm']],
    ['hydra', weapons.hydra],
    ['hellfire', weapons.hellfire]
  ];
  return values.map(([key, level]) => {
    const delta = weapons.upgrade_deltas?.[key];
    return delta ? `${level} (+${delta})` : String(level);
  }).join(' / ');
}

function makeReport(snapshot, rows, previousMeta, membershipDelta) {
  const totalClanMedals = rows.reduce((sum, r) => sum + r.clan_medals, 0);
  const topKills = [...rows].sort((a,b) => b.kills_delta - a.kills_delta).slice(0,5)
    .map(r => `${r.display_name} +${r.kills_delta.toLocaleString('en-US')}`).join(' · ');
  const topLeague = [...rows].sort((a,b) => b.league_medals_delta - a.league_medals_delta).slice(0,5)
    .map(r => `${r.display_name} +${r.league_medals_delta.toLocaleString('en-US')}`).join(' · ');

  const bodyRows = rows.map(r => `<tr><td>${r.rank} (${rankMovementText(r.rank_movement)})</td><td>${escapeHtml(r.display_name)}</td><td>${escapeHtml(r.role)}</td><td>${r.stage}</td><td>${r.league_medals.toLocaleString('en-US')}</td><td>${r.league_medals_delta ? '+' : ''}${r.league_medals_delta.toLocaleString('en-US')}</td><td>${r.clan_medals.toLocaleString('en-US')}</td><td>${r.honor_medals.gold} / ${r.honor_medals.silver} / ${r.honor_medals.bronze}</td><td>${r.total_kills.toLocaleString('en-US')}</td><td>${r.kills_delta ? '+' : ''}${r.kills_delta.toLocaleString('en-US')}</td><td>${weaponText(r.weapons)}</td><td>${escapeHtml(r.last_online_display)}</td></tr>`).join('\n');

  const dateLabel = `${snapshot.date_persian} · ${snapshot.time_iran}`;
  const prevText = previousMeta ? `Snapshot ${escapeHtml(previousMeta.snapshot_id)} ساعت ${escapeHtml(previousMeta.time_iran)}.` : 'بدون Snapshot قبلی.';
  const title = `PERSIA · Clan Leaderboard · ${escapeHtml(dateLabel)}`;

  return `<!doctype html>\n<html lang="fa" dir="rtl" data-theme="dark">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${title}</title><link rel="stylesheet" href="../../assets/css/app.css"><link rel="stylesheet" href="../../assets/css/site.css"></head>\n<body><header class="topbar"><div class="shell"><a class="brand" href="../../index.html"><span class="brand-mark">◆</span><span><b>PERSIA</b> · War Drone</span></a></div></header><main>\n<section class="hero"><div class="shell"><span class="badge">PERSIA · ${escapeHtml(snapshot.season_label || 'CLAN')}</span><h1>جدول جامع عملکرد و تغییرات اعضای کلن</h1><p>${escapeHtml(dateLabel)} · تمام ${snapshot.members} عضو بررسی و ثبت شده‌اند.</p></div></section>\n<section class="section"><div class="shell"><h2>وضعیت کلی و شاخص‌های کلیدی کلن</h2><p>ظرفیت اعضا: ${snapshot.members} از ${snapshot.capacity} نفر · ${prevText}</p><ul><li>اعضای مشترک با Snapshot قبلی: ${membershipDelta.retained}</li><li>بازیکنان حذف‌شده: ${membershipDelta.removed.length} · بازیکنان اضافه‌شده: ${membershipDelta.added.length}</li><li>مدال کل کلن بر اساس مجموع رکورد اعضا: ${totalClanMedals.toLocaleString('en-US')}</li><li>بیشترین افزایش کیل: ${escapeHtml(topKills)}</li><li>بیشترین افزایش مدال لیگ جاری: ${escapeHtml(topLeague)}</li></ul>\n<h2>جدول کامل رتبه‌بندی و تغییرات عملکرد اعضا</h2><div class="table-wrap"><table><thead><tr><th>رتبه</th><th>نام کاربری</th><th>سمت</th><th>استیج</th><th>مدال لیگ جاری</th><th>تغییر مدال لیگ</th><th>مدال کل کلن</th><th>مدال افتخار (طلا / نقره / برنز)</th><th>مجموع کیل 💀</th><th>افزایش کیل 💀</th><th>لول سلاح‌ها (توپ / هیدرا / هل‌فایر)</th><th>آخرین آنلاین</th></tr></thead><tbody>${bodyRows}</tbody></table></div></div></section>\n</main></body></html>\n`;
}

if (!inputPath) die('usage: node tools/ingest-snapshot.js <snapshot.json> [--dry-run|--write]');
if (dryRun && writeMode) die('choose either --dry-run or --write');
if (!dryRun && !writeMode) die('explicit mode required: --dry-run or --write');

const input = readJson(path.resolve(inputPath));
const playersFile = readJson(path.join(DATA, 'players.json'));
const snapshotsFile = readJson(path.join(DATA, 'snapshots.json'));
const historyFile = readJson(path.join(DATA, 'player-observations-history.json'));
const membershipsFile = readJson(path.join(DATA, 'memberships.json'));

if (!input.snapshot || !Array.isArray(input.players)) die('input must contain snapshot and players[]');
const s = input.snapshot;
for (const field of ['captured_at_utc','date_persian','time_iran','type','members','capacity']) {
  if (s[field] === undefined) die(`snapshot.${field} is required`);
}
positiveInt(s.members, 'snapshot.members');
positiveInt(s.capacity, 'snapshot.capacity');
if (s.members !== input.players.length) die(`snapshot.members=${s.members} but players.length=${input.players.length}`);

const existingIds = new Set((snapshotsFile.snapshots || []).map(x => x.snapshot_id));
const maxSeq = Math.max(0, ...[...existingIds].map(id => Number(id.replace(/^S/, '')) || 0));
const snapshotId = s.snapshot_id || `S${String(maxSeq + 1).padStart(2,'0')}`;
if (existingIds.has(snapshotId)) die(`${snapshotId} already exists`);

const playersById = new Map(playersFile.players.map(p => [p.player_id, p]));
const playersByName = new Map();
for (const p of playersFile.players) {
  const key = p.display_name;
  const list = playersByName.get(key) || [];
  list.push(p);
  playersByName.set(key, list);
}

const seenIds = new Set();
const seenRanks = new Set();
const normalized = [];
const newPlayerCandidates = [];

for (const row of input.players) {
  positiveInt(row.rank, `player ${row.display_name || '?'} rank`);
  if (seenRanks.has(row.rank)) die(`${snapshotId}: duplicate rank ${row.rank}`);
  seenRanks.add(row.rank);

  let identity = null;
  if (row.player_id) {
    identity = playersById.get(row.player_id) || null;
    if (!identity) die(`${row.display_name || row.player_id}: unknown player_id ${row.player_id}`);
    if (row.display_name !== identity.display_name) die(`identity mismatch: ${row.player_id} is ${identity.display_name}, input says ${row.display_name}`);
  } else {
    const matches = playersByName.get(row.display_name) || [];
    if (matches.length === 1) identity = matches[0];
    else if (matches.length > 1) die(`ambiguous identity for display_name=${row.display_name}; supply player_id`);
    else newPlayerCandidates.push(row);
  }

  if (identity) {
    if (seenIds.has(identity.player_id)) die(`${snapshotId}: duplicate player ${identity.player_id}`);
    seenIds.add(identity.player_id);
  }

  for (const field of ['stage','league_medals','league_medals_delta','clan_medals','total_kills','kills_delta']) positiveInt(row[field], `${row.display_name}.${field}`);
  if (!row.honor_medals || !row.weapons || row.last_online_display === undefined) die(`${row.display_name}: incomplete observation`);
  for (const h of ['gold','silver','bronze']) positiveInt(row.honor_medals[h], `${row.display_name}.honor_medals.${h}`);
  for (const w of ['25mm','hydra','hellfire']) positiveInt(row.weapons[w], `${row.display_name}.weapons.${w}`);

  normalized.push({ ...row, ...(identity ? { player_id: identity.player_id, display_name: identity.display_name, role: row.role ?? identity.role } : {}) });
}

if (newPlayerCandidates.length) {
  const nextId = Math.max(0, ...[...playersById.keys()].map(id => Number(id.replace('PERSIA-P-','')) || 0));
  for (const [i,row] of newPlayerCandidates.entries()) {
    if (!row.confirmed_new_identity) die(`new player ${row.display_name} requires confirmed_new_identity=true and player_id allocation`);
    const id = `PERSIA-P-${String(nextId + i + 1).padStart(4,'0')}`;
    if (playersById.has(id)) die(`generated player_id collision: ${id}`);
    row.player_id = id;
    row.role = row.role || 'Member';
    normalized.push({ ...row });
    seenIds.add(id);
  }
}

if (seenIds.size !== input.players.length) die(`${snapshotId}: identity resolution incomplete`);
if (seenRanks.size !== input.players.length) die(`${snapshotId}: rank coverage incomplete`);

const previous = [...(snapshotsFile.snapshots || [])].sort((a,b) => a.captured_at_utc.localeCompare(b.captured_at_utc)).at(-1);
const previousRows = previous ? (historyFile.snapshots?.[previous.snapshot_id] || []) : [];
const previousSet = new Set(previousRows.map(r => r.player_id));
const currentSet = new Set(normalized.map(r => r.player_id));
const added = [...currentSet].filter(id => !previousSet.has(id));
const removed = [...previousSet].filter(id => !currentSet.has(id));
const retained = currentSet.size - added.length;

const snapshotMeta = {
  snapshot_id: snapshotId,
  captured_at_utc: s.captured_at_utc,
  date_persian: s.date_persian,
  time_iran: s.time_iran,
  type: s.type,
  members: s.members,
  capacity: s.capacity,
  source_report: s.source_report || `/clan-leaderboard/reports/${s.report_filename || snapshotId.toLowerCase()}.html`,
  normalized_observations: true,
  observation_source: 'player-observations-history.json'
};

const nextSnapshots = { ...snapshotsFile, current_snapshot_id: snapshotId, snapshots: [...snapshotsFile.snapshots, snapshotMeta] };
const nextHistory = { ...historyFile, snapshots: { ...(historyFile.snapshots || {}), [snapshotId]: normalized } };
const nextCurrent = { ...readJson(path.join(DATA, 'player-observations.json')), snapshots: { [snapshotId]: normalized } };

const nextPlayers = { ...playersFile, players: playersFile.players.map(p => {
  const row = normalized.find(r => r.player_id === p.player_id);
  return row ? { ...p, display_name: row.display_name, role: row.role || p.role, last_seen_snapshot: snapshotId } : p;
}).concat(normalized.filter(r => !playersById.has(r.player_id)).map(r => ({player_id:r.player_id,display_name:r.display_name,status:'active',role:r.role||'Member',first_seen_snapshot:snapshotId,last_seen_snapshot:snapshotId}))) };

const nextMemberships = JSON.parse(JSON.stringify(membershipsFile));
nextMemberships.snapshot_status = nextMemberships.snapshot_status || {};
nextMemberships.snapshot_status[snapshotId] = { added, removed, retained };

const reportFilename = s.report_filename || `${s.captured_at_utc.slice(0,10)}-${s.time_iran.replace(':','')}.html`;
const reportPath = path.join(ROOT, 'reports', reportFilename);
const reportHtml = makeReport(s, normalized, previous, { added, removed, retained });

const output = { snapshotId, added, removed, retained, totalClanMedals: normalized.reduce((sum,r)=>sum+r.clan_medals,0), files: { snapshots: nextSnapshots, history: nextHistory, current: nextCurrent, players: nextPlayers, memberships: nextMemberships, report: { path: reportPath, content: reportHtml } } };

console.log(JSON.stringify({ ok: true, mode: dryRun ? 'dry-run' : 'write', snapshot_id: snapshotId, members: normalized.length, added, removed, retained, total_clan_medals: output.totalClanMedals, report: path.relative(ROOT, reportPath) }, null, 2));

if (writeMode) {
  writeJson(path.join(DATA, 'snapshots.json'), nextSnapshots);
  writeJson(path.join(DATA, 'player-observations-history.json'), nextHistory);
  writeJson(path.join(DATA, 'player-observations.json'), nextCurrent);
  writeJson(path.join(DATA, 'players.json'), nextPlayers);
  writeJson(path.join(DATA, 'memberships.json'), nextMemberships);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportHtml, 'utf8');
  console.log('WRITE COMPLETE');
}
