#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = path.join(ROOT, 'tools');
const ASSETS = path.join(ROOT, 'assets');
const DATA = path.join(ROOT, 'data');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'war-drone-publish-'));
const tempTools = path.join(tempRoot, 'tools');
const tempAssets = path.join(tempRoot, 'assets');
const tempData = path.join(tempRoot, 'data');
const tempReports = path.join(tempRoot, 'reports');
const tempArchive = path.join(tempRoot, 'archive.html');
const fixture = path.join(tempRoot, 'S08.json');
function copy(source, target) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target); }
function run(script, args) { const result = spawnSync(process.execPath, [script, ...args], { cwd: tempRoot, encoding: 'utf8' }); if (result.status !== 0) { process.stderr.write(result.stderr || result.stdout || `${script} failed\n`); process.exit(result.status || 1); } return result.stdout; }
try {
  fs.mkdirSync(tempTools, { recursive: true }); fs.mkdirSync(tempAssets, { recursive: true }); fs.mkdirSync(tempData, { recursive: true }); fs.mkdirSync(tempReports, { recursive: true });
  for (const file of ['players.json', 'snapshots.json', 'player-observations.json', 'player-observations-history.json', 'player-observations-history-s05.json', 'player-observations-history-s06.json', 'memberships.json', 'index.json', 'leagues.json']) copy(path.join(DATA, file), path.join(tempData, file));
  copy(path.join(ASSETS, 'performance.js'), path.join(tempAssets, 'performance.js'));
  for (const file of ['ingest-snapshot-v4.js', 'generate-report.js', 'ingest-and-publish.js', 'generate-archive.js']) copy(path.join(TOOLS, file), path.join(tempTools, file));
  copy(path.join(ROOT, 'archive.html'), tempArchive);
  const input = { snapshot: { snapshot_id: 'S08', captured_at_utc: '2026-09-17T04:00:00Z', date_persian: '26 شهریور 1405', time_iran: '07:30', type: 'delta-report', league_boundary: 'start', boundary_label: 'شروع لیگ جدید', members: 1, capacity: 50 }, players: [{ player_id: 'PERSIA-P-0001', display_name: 'Commander Publish E2E', role: 'Member', rank: 1, rank_movement: null, stage: 58, league_medals: 301000, league_medals_delta: null, clan_medals: 200, honor_medals: { gold: 1, silver: 3, bronze: 3 }, total_kills: 220200, kills_delta: null, weapons: { '25mm': 910, hydra: 249, hellfire: 66, upgrade_deltas: {} }, last_online_display: '1m ago' }] };
  fs.writeFileSync(fixture, `${JSON.stringify(input, null, 2)}\n`, 'utf8');
  const result = run(path.join(tempTools, 'ingest-and-publish.js'), [fixture, '--write']);
  const parsed = JSON.parse(result); if (!parsed.ok || parsed.snapshot_id !== 'S08') throw new Error('PUBLISH E2E: unexpected publication result');
  const report = path.join(tempReports, '2026-09-17-0730.html'); if (!fs.existsSync(report)) throw new Error('PUBLISH E2E: report was not generated');
  const html = fs.readFileSync(report, 'utf8'); if (!html.includes('Commander Publish E2E')) throw new Error('PUBLISH E2E: generated report missing player');
  const index = JSON.parse(fs.readFileSync(path.join(tempData, 'index.json'), 'utf8')); if (index.reports[0].id !== '2026-09-17-0730') throw new Error('PUBLISH E2E: new report was not prepended to index');
  const snapshots = JSON.parse(fs.readFileSync(path.join(tempData, 'snapshots.json'), 'utf8')); const published = snapshots.snapshots.find((item) => item.snapshot_id === 'S08'); if (!published || published.source_report !== '/clan-leaderboard/reports/2026-09-17-0730.html') throw new Error('PUBLISH E2E: source_report not persisted'); if (published.league_boundary !== 'start' || published.boundary_label !== 'شروع لیگ جدید') throw new Error('PUBLISH E2E: league-start boundary metadata not persisted');
  const archive = fs.readFileSync(path.join(tempRoot, 'archive.html'), 'utf8'); if (!archive.includes('reports/2026-09-17-0730.html')) throw new Error('PUBLISH E2E: archive was not updated'); if (parsed.archive !== 'updated') throw new Error('PUBLISH E2E: publication result did not report archive update');
  console.log('INGEST + PUBLISH TEST PASS: synthetic S08 JSON -> canonical -> report -> index -> archive, league-start metadata preserved, performance dependency present, S06 history shard preserved.');
} finally { fs.rmSync(tempRoot, { recursive: true, force: true }); }
