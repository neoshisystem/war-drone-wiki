#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const performance = require('../assets/performance.js');
const ROOT = path.resolve(__dirname, '..');
const tmpS04 = path.join(os.tmpdir(), `war-drone-report-s04-${process.pid}.html`);
const tmpS05 = path.join(os.tmpdir(), `war-drone-report-s05-${process.pid}.html`);
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', name), 'utf8'));
const snapshots = read('snapshots.json');
const history = read('player-observations-history.json');
const historyS05 = read('player-observations-history-s05.json');
const current = read('player-observations.json');
const leagues = read('leagues.json');
const sets = [history, historyS05, current];
const results = performance.computeAll(snapshots, sets, leagues);
const rows = id => { const merged = sets.reduce((all, source) => ({ ...all, ...(source.snapshots || {}) }), {}); return merged[id] || []; };
function run(snapshotId, output) {
  const result = require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'generate-report.js'), snapshotId, output], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${snapshotId} report generator failed`);
  return fs.readFileSync(output, 'utf8');
}
function expectedDelta(snapshotId, rank, field) {
  const row = rows(snapshotId).find(item => item.rank === rank);
  if (!row) throw new Error(`${snapshotId} rank ${rank} not found`);
  const metric = results[snapshotId];
  if (metric.baseline_snapshot_id === snapshotId) return '— / baseline';
  const value = metric.period_players?.[row.player_id]?.[field];
  return value == null ? '—' : (value > 0 ? `+${Number(value).toLocaleString('en-US')}` : Number(value).toLocaleString('en-US'));
}
try {
  const s04 = run('S04', tmpS04);
  for (const needle of [
    'PERSIA · Clan Leaderboard · 22 شهریور 1405 · 23:00',
    'تمام 47 عضو بررسی و ثبت شده‌اند.',
    'مدال کل کلن بر اساس مجموع رکورد اعضا: 22,889,047',
    'تغییر مدال کلن',
    'بیشترین افزایش مدال کلن',
    '<td>1 (-)</td><td>Commander</td>',
    '<td>3 (↑ 1)</td><td>Eren</td>',
    '<td>33 (↑ 11)</td><td>ایرانی باوقار</td>'
  ]) if (!s04.includes(needle)) throw new Error(`S04 missing generated content: ${needle}`);
  const s04Rows = (s04.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr(?: |\>)/g) || []).length;
  if (s04Rows !== 47) throw new Error(`S04 expected 47 rows, got ${s04Rows}`);

  const s05 = run('S05', tmpS05);
  for (const needle of [
    'PERSIA · Clan Leaderboard · 23 شهریور 1405 · 23:00',
    'تمام 47 عضو بررسی و ثبت شده‌اند.',
    'مدال کل کلن بر اساس مجموع رکورد اعضا: 23,742,781',
    'تغییر مدال کلن',
    '<td>1 (-)</td><td>Commander</td>',
    '<td>47 (-)</td><td>n8</td>'
  ]) if (!s05.includes(needle)) throw new Error(`S05 missing generated content: ${needle}`);
  const s05Rows = (s05.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr(?: |\>)/g) || []).length;
  if (s05Rows !== 47) throw new Error(`S05 expected 47 rows, got ${s05Rows}`);

  for (const snapshotId of ['S04', 'S05']) {
    const html = snapshotId === 'S04' ? s04 : s05;
    const row = rows(snapshotId).find(item => item.rank === 1);
    const expectedClan = expectedDelta(snapshotId, 1, 'clan_medals');
    const expectedKills = expectedDelta(snapshotId, 1, 'kills');
    const playerMarker = `<tr data-player-id="${row.player_id}"><td>1 (-)</td>`;
    const start = html.indexOf(playerMarker);
    if (start < 0) throw new Error(`${snapshotId} rank-1 player id marker missing`);
    const end = html.indexOf('</tr>', start);
    const generatedRow = html.slice(start, end);
    const cells = generatedRow.match(/<td[^>]*>(.*?)<\/td>/g) || [];
    if (cells[5] !== `<td>${expectedClan}</td>`) throw new Error(`${snapshotId} rank-1 clan delta not derived from performance.js`);
    if (cells[9] !== `<td>${expectedKills}</td>`) throw new Error(`${snapshotId} rank-1 kill delta not derived from performance.js`);
  }

  if (s04.includes('تغییر مدال لیگ') || s05.includes('تغییر مدال لیگ')) throw new Error('legacy public label still generated');
  console.log('REPORT GENERATOR TEST PASS: S04 and S05 use canonical player-level period deltas and stable player ids with public performance labels.');
} finally {
  fs.rmSync(tmpS04, { force: true });
  fs.rmSync(tmpS05, { force: true });
}
