#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const repoTools = path.join(ROOT, 'tools');
const repoAssets = path.join(ROOT, 'assets');
const repoData = path.join(ROOT, 'data');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'war-drone-e2e-'));
const tempTools = path.join(tempRoot, 'tools');
const tempAssets = path.join(tempRoot, 'assets');
const tempData = path.join(tempRoot, 'data');
const tempReports = path.join(tempRoot, 'reports');
const fixture = path.join(tempRoot, 'S07.json');
function copy(name, from, to) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }
function runNode(script, args) { const result = spawnSync(process.execPath, [script, ...args], { cwd: tempRoot, encoding: 'utf8' }); if (result.status !== 0) { process.stderr.write(result.stderr || result.stdout || `${script} failed`); process.exit(result.status || 1); } return result.stdout; }
function sha256(file) { return require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
try {
  fs.mkdirSync(tempTools, { recursive: true }); fs.mkdirSync(tempAssets, { recursive: true }); fs.mkdirSync(tempData, { recursive: true }); fs.mkdirSync(tempReports, { recursive: true });
  for (const file of ['players.json','snapshots.json','player-observations.json','player-observations-history.json','player-observations-history-s05.json','memberships.json','index.json','leagues.json']) copy(file, path.join(repoData, file), path.join(tempData, file));
  copy('performance.js', path.join(repoAssets, 'performance.js'), path.join(tempAssets, 'performance.js'));
  for (const file of ['ingest-snapshot-v4.js','generate-report.js','validate-ingestion.js']) copy(file, path.join(repoTools, file), path.join(tempTools, file));
  const productionFiles=[path.join(repoData,'players.json'),path.join(repoData,'snapshots.json'),path.join(repoData,'player-observations.json'),path.join(repoData,'player-observations-history.json'),path.join(repoData,'player-observations-history-s05.json'),path.join(repoData,'memberships.json'),path.join(repoData,'index.json')];
  const before=new Map(productionFiles.map(file=>[file,sha256(file)]));
  const input={snapshot:{snapshot_id:'S07',captured_at_utc:'2026-09-16T03:30:00Z',date_persian:'25 شهریور 1405',time_iran:'07:00',type:'delta-report',members:1,capacity:50,season_label:'TEST'},players:[{player_id:'PERSIA-P-0001',display_name:'Commander E2E',role:'Member',rank:1,rank_movement:null,stage:58,league_medals:300000,league_medals_delta:null,clan_medals:1200000,honor_medals:{gold:1,silver:3,bronze:3},total_kills:220000,kills_delta:null,weapons:{'25mm':910,hydra:249,hellfire:66,upgrade_deltas:{}},last_online_display:'1m ago'}]};
  fs.writeFileSync(fixture,`${JSON.stringify(input,null,2)}\n`,'utf8');
  const ingestOutput=runNode(path.join(tempTools,'ingest-snapshot-v4.js'),[fixture,'--write']);const jsonPart=ingestOutput.replace(/\nWRITE COMPLETE:\s*S07\s*$/u,'').trim();const ingest=JSON.parse(jsonPart);if(!ingest.ok||ingest.snapshot_id!=='S07')throw new Error('E2E: S07 ingestion failed');
  const reportPath=path.join(tempReports,'2026-09-16-0700.html');runNode(path.join(tempTools,'generate-report.js'),['S07',reportPath]);const html=fs.readFileSync(reportPath,'utf8');if(!html.includes('Commander E2E'))throw new Error('E2E: generated report missing renamed player');if((html.match(/<tbody>\s*<tr(?: |>)/gu)||[]).length!==1)throw new Error('E2E: generated report data row count mismatch');
  runNode(path.join(tempTools,'validate-ingestion.js'),[]);for(const file of productionFiles)if(sha256(file)!==before.get(file))throw new Error(`E2E: production file changed: ${path.basename(file)}`);
  console.log('END-TO-END TEST PASS: staged JSON -> canonical -> generated report, performance dependency present, production data and S05 history shard unchanged.');
} finally { fs.rmSync(tempRoot,{recursive:true,force:true}); }
