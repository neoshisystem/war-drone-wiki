#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REPORTS = path.join(ROOT, 'reports');
const INGEST = path.join(__dirname, 'ingest-snapshot-v4.js');
const GENERATE = path.join(__dirname, 'generate-report.js');

const args = process.argv.slice(2);
const inputArg = args.find((arg) => !arg.startsWith('--'));
const write = args.includes('--write');

function fail(message) { console.error(`PUBLICATION FAILED: ${message}`); process.exit(1); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail(`cannot read ${path.relative(ROOT, file)}: ${error.message}`); } }
function save(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
function runNode(script, runArgs) {
  const result = spawnSync(process.execPath, [script, ...runArgs], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) { process.stderr.write(result.stderr || result.stdout || `${path.basename(script)} failed\n`); process.exit(result.status || 1); }
  return result.stdout;
}

if (!inputArg) fail('usage: node tools/ingest-and-publish.js <snapshot.json> [--dry-run|--write]');
if (args.includes('--dry-run') && write) fail('choose exactly one mode');
const inputPath = path.resolve(inputArg);
if (!fs.existsSync(inputPath)) fail(`input does not exist: ${inputArg}`);
const input = readJson(inputPath);
if (!input.snapshot || !Array.isArray(input.players)) fail('input must contain snapshot and players[]');

const indexFile = readJson(path.join(DATA, 'index.json'));
const snapshot = input.snapshot;
const futureReportId = snapshot.source_report ? path.basename(snapshot.source_report, '.html') : `${snapshot.captured_at_utc.slice(0, 10)}-${snapshot.time_iran.replace(':', '')}`;
const futureReportPath = path.join(REPORTS, `${futureReportId}.html`);
if (fs.existsSync(futureReportPath)) fail(`report already exists: ${path.relative(ROOT, futureReportPath)}`);
if ((indexFile.reports || []).some((item) => item.id === futureReportId)) fail(`index already contains report ${futureReportId}`);

if (!write) {
  const parsed = JSON.parse(runNode(INGEST, [inputPath, '--dry-run']).trim());
  console.log(JSON.stringify({ ok: true, mode: 'dry-run', snapshot_id: parsed.snapshot_id, report_id: futureReportId, report_path: path.relative(ROOT, futureReportPath), publication: 'not written' }, null, 2));
  process.exit(0);
}

const ingestOutput = runNode(INGEST, [inputPath, '--write']);
const jsonPart = ingestOutput.replace(/\nWRITE COMPLETE:\s*S\d+\s*$/u, '').trim();
const ingest = JSON.parse(jsonPart);
if (!ingest.ok || !ingest.snapshot_id) fail('ingestion did not return a valid snapshot_id');
const snapshotId = ingest.snapshot_id;
const latestSnapshots = readJson(path.join(DATA, 'snapshots.json'));
const target = (latestSnapshots.snapshots || []).find((item) => item.snapshot_id === snapshotId);
if (!target) fail(`ingested ${snapshotId} but canonical snapshots.json has no matching record`);
if (fs.existsSync(futureReportPath)) fail(`report unexpectedly exists after ingestion: ${path.relative(ROOT, futureReportPath)}`);

runNode(GENERATE, [snapshotId, futureReportPath]);
if (!fs.existsSync(futureReportPath)) fail('report generator returned successfully but report file is missing');
const html = fs.readFileSync(futureReportPath, 'utf8');
if (!html.includes(target.date_persian) || !html.includes('<table') || !html.includes(`PERSIA · DORE ${String(snapshotId).replace(/^S/, '')}`)) fail('generated report failed publication sanity checks');

const nextSnapshots = readJson(path.join(DATA, 'snapshots.json'));
const snapshotRecord = nextSnapshots.snapshots.find((item) => item.snapshot_id === snapshotId);
if (!snapshotRecord) fail(`cannot locate published snapshot ${snapshotId}`);
snapshotRecord.source_report = `/clan-leaderboard/reports/${futureReportId}.html`;
snapshotRecord.normalized_observations = true;
snapshotRecord.observation_source = 'player-observations-history.json';
save(path.join(DATA, 'snapshots.json'), nextSnapshots);

const nextIndex = readJson(path.join(DATA, 'index.json'));
const entry = { id: futureReportId, period: Number(snapshotId.replace(/^S/, '')), date_persian: target.date_persian, time: target.time_iran, type: target.type, members: target.members, capacity: `${target.members}/${target.capacity}`, page: `../reports/${futureReportId}.html` };
nextIndex.reports = [entry, ...(nextIndex.reports || [])];
save(path.join(DATA, 'index.json'), nextIndex);
console.log(JSON.stringify({ ok: true, mode: 'write', snapshot_id: snapshotId, report: `clan-leaderboard/reports/${futureReportId}.html`, index_entry: entry, members: target.members, publication: 'complete' }, null, 2));
