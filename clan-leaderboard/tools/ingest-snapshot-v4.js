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

function fail(message) { console.error(`INGESTION FAILED: ${message}`); process.exit(1); }
if (!inputArg) fail('usage: node tools/ingest-snapshot-v4.js <snapshot.json> [--dry-run|--write]');
if (args.includes('--dry-run') && write) fail('choose exactly one mode');
function readJson(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(error){fail(`cannot read ${path.relative(ROOT,file)}: ${error.message}`);}}
function clone(value){return JSON.parse(JSON.stringify(value));}
function required(value,field){if(value===undefined||value===null||value==='')fail(`${field} is required`);}
function nonNegativeInteger(value,field){if(!Number.isInteger(value)||value<0)fail(`${field} must be a non-negative integer`);}
function deltaIntegerOrNull(value,field){if(value!==null&&value!==undefined&&(!Number.isInteger(value)||value<0))fail(`${field} must be a non-negative integer or null`);}
function isoUtc(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value))fail('snapshot.captured_at_utc must be an ISO UTC timestamp');if(Number.isNaN(Date.parse(value)))fail('snapshot.captured_at_utc is invalid');}
function snapshotNumber(snapshotId){const m=/^S(\d+)$/.exec(String(snapshotId||''));return m?Number(m[1]):NaN;}

const input=readJson(path.resolve(inputArg));
const playersFile=readJson(path.join(DATA,'players.json'));
const snapshotsFile=readJson(path.join(DATA,'snapshots.json'));
const historyFile=readJson(path.join(DATA,'player-observations-history.json'));
const currentFile=readJson(path.join(DATA,'player-observations.json'));
const membershipsFile=readJson(path.join(DATA,'memberships.json'));
if(!input.snapshot||!Array.isArray(input.players))fail('input must contain snapshot and players[]');
const snapshot=input.snapshot;
['captured_at_utc','date_persian','time_iran','type','members','capacity'].forEach((field)=>required(snapshot[field],`snapshot.${field}`));
if(snapshot.league_boundary!==undefined&&snapshot.league_boundary!==null&&typeof snapshot.league_boundary!=='string')fail('snapshot.league_boundary must be a string when provided');
if(snapshot.boundary_label!==undefined&&snapshot.boundary_label!==null&&typeof snapshot.boundary_label!=='string')fail('snapshot.boundary_label must be a string when provided');
isoUtc(snapshot.captured_at_utc);nonNegativeInteger(snapshot.members,'snapshot.members');nonNegativeInteger(snapshot.capacity,'snapshot.capacity');
if(snapshot.members!==input.players.length)fail('snapshot.members does not equal players.length');
if(snapshot.members>snapshot.capacity)fail('snapshot.members exceeds snapshot.capacity');
const snapshots=Array.isArray(snapshotsFile.snapshots)?snapshotsFile.snapshots:[];
if(snapshots.some((item)=>item.captured_at_utc===snapshot.captured_at_utc))fail('snapshot timestamp already exists');
const highestExisting=Math.max(0,...snapshots.map((item)=>snapshotNumber(item.snapshot_id)).filter(Number.isFinite));
const snapshotId=snapshot.snapshot_id||`S${String(highestExisting+1).padStart(2,'0')}`;
if(!/^S\d+$/.test(snapshotId))fail(`invalid snapshot_id ${snapshotId}`);
if(snapshots.some((item)=>item.snapshot_id===snapshotId))fail(`${snapshotId} already exists`);
if(snapshotNumber(snapshotId)<=highestExisting)fail(`${snapshotId} is not newer than existing snapshots`);

const registry=new Map((playersFile.players||[]).map((player)=>[player.player_id,player]));
const names=new Map();for(const player of playersFile.players||[]){const list=names.get(player.display_name)||[];list.push(player);names.set(player.display_name,list);}
const seenIds=new Set();const seenRanks=new Set();const rows=[];const incomingPlayers=[];
let nextPlayerNumber=Math.max(0,...(playersFile.players||[]).map((player)=>Number(String(player.player_id||'').replace('PERSIA-P-',''))).filter(Number.isFinite));
for(const source of input.players){
  required(source.display_name,'player.display_name');
  if(!Number.isInteger(source.rank)||source.rank<1||source.rank>snapshot.members)fail(`${source.display_name}: invalid rank ${source.rank}`);
  if(seenRanks.has(source.rank))fail(`${snapshotId}: duplicate rank ${source.rank}`);seenRanks.add(source.rank);
  let player=source.player_id?registry.get(source.player_id):null;if(source.player_id&&!player)fail(`${source.display_name}: unknown player_id ${source.player_id}`);
  if(!player){const matches=names.get(source.display_name)||[];if(matches.length>1)fail(`ambiguous identity: ${source.display_name}; supply player_id`);if(matches.length===1)player=matches[0];}
  if(!player){if(source.confirmed_new_identity!==true)fail(`new identity ${source.display_name} requires confirmed_new_identity=true`);nextPlayerNumber+=1;player={player_id:`PERSIA-P-${String(nextPlayerNumber).padStart(4,'0')}`,display_name:source.display_name,status:'active',role:source.role||'Member',first_seen_snapshot:snapshotId,last_seen_snapshot:snapshotId};registry.set(player.player_id,player);incomingPlayers.push(player);}
  if(seenIds.has(player.player_id))fail(`${snapshotId}: duplicate player ${player.player_id}`);seenIds.add(player.player_id);
  nonNegativeInteger(source.stage,`${source.display_name}.stage`);nonNegativeInteger(source.league_medals,`${source.display_name}.league_medals`);deltaIntegerOrNull(source.league_medals_delta,`${source.display_name}.league_medals_delta`);nonNegativeInteger(source.clan_medals,`${source.display_name}.clan_medals`);nonNegativeInteger(source.total_kills,`${source.display_name}.total_kills`);deltaIntegerOrNull(source.kills_delta,`${source.display_name}.kills_delta`);
  for(const medal of ['gold','silver','bronze'])nonNegativeInteger(source.honor_medals?.[medal],`${source.display_name}.honor_medals.${medal}`);
  for(const weapon of ['25mm','hydra','hellfire'])nonNegativeInteger(source.weapons?.[weapon],`${source.display_name}.weapons.${weapon}`);
  required(source.last_online_display,`${source.display_name}.last_online_display`);
  rows.push({player_id:player.player_id,rank:source.rank,rank_movement:source.rank_movement===undefined?null:source.rank_movement,stage:source.stage,league_medals:source.league_medals,league_medals_delta:source.league_medals_delta===undefined?null:source.league_medals_delta,clan_medals:source.clan_medals,honor_medals:source.honor_medals,total_kills:source.total_kills,kills_delta:source.kills_delta===undefined?null:source.kills_delta,weapons:source.weapons,last_online_display:source.last_online_display});
}
if(rows.length!==snapshot.members)fail(`${snapshotId}: normalized row count mismatch`);if(seenRanks.size!==snapshot.members)fail(`${snapshotId}: rank coverage mismatch`);for(let rank=1;rank<=snapshot.members;rank+=1)if(!seenRanks.has(rank))fail(`${snapshotId}: missing rank ${rank}`);if(seenIds.size!==snapshot.members)fail(`${snapshotId}: identity coverage mismatch`);
const chronological=[...snapshots].sort((a,b)=>a.captured_at_utc.localeCompare(b.captured_at_utc));const previous=chronological.at(-1)||null;
if(previous&&previous.captured_at_utc>=snapshot.captured_at_utc)fail('new snapshot timestamp must be later than current latest snapshot');
const previousRows=previous?(historyFile.snapshots?.[previous.snapshot_id]||currentFile.snapshots?.[previous.snapshot_id]||[]):[];
if(previous&&previousRows.length!==previous.members)fail(`canonical observations are incomplete before ${snapshotId}: missing ${previous.snapshot_id}`);
const previousIds=new Set(previousRows.map((row)=>row.player_id));const currentIds=new Set(rows.map((row)=>row.player_id));const added=[...currentIds].filter((id)=>!previousIds.has(id));const removed=[...previousIds].filter((id)=>!currentIds.has(id));const retained=currentIds.size-added.length;
const nextPlayers=clone(playersFile);const rowsById=new Map(rows.map((row)=>[row.player_id,row]));const sourceById=new Map(input.players.filter((p)=>p.player_id).map((p)=>[p.player_id,p]));
nextPlayers.players=nextPlayers.players.map((existing)=>{const row=rowsById.get(existing.player_id);if(!row)return previousIds.has(existing.player_id)?{...existing,status:'former',last_seen_snapshot:previous.snapshot_id}:existing;const source=sourceById.get(existing.player_id)||input.players.find((p)=>p.display_name===existing.display_name);return {...existing,display_name:source.display_name,role:source.role||existing.role||'Member',status:'active',last_seen_snapshot:snapshotId};});
for(const player of incomingPlayers)nextPlayers.players.push(player);
const nextMemberships=clone(membershipsFile);const membershipRows=nextMemberships.memberships||[];
for(const membership of membershipRows)if(membership.status==='active'&&currentIds.has(membership.player_id))membership.through_snapshot=snapshotId;
for(const id of added)membershipRows.push({player_id:id,from_snapshot:snapshotId,through_snapshot:snapshotId,status:'active',start_event:previous?`joined_between_${previous.snapshot_id}_and_${snapshotId}`:'joined_with_initial_snapshot'});
for(const id of removed){const membership=membershipRows.find((item)=>item.status==='active'&&item.player_id===id);if(membership){membership.through_snapshot=previous?.snapshot_id||membership.through_snapshot;membership.status='ended';membership.end_precision='between_snapshots';membership.end_event='left_or_kicked';}}
nextMemberships.memberships=membershipRows;
const nextSnapshots=clone(snapshotsFile);nextSnapshots.current_snapshot_id=snapshotId;nextSnapshots.snapshots=[...snapshots,{snapshot_id:snapshotId,captured_at_utc:snapshot.captured_at_utc,date_persian:snapshot.date_persian,time_iran:snapshot.time_iran,type:snapshot.type,members:snapshot.members,capacity:snapshot.capacity,source_report:snapshot.source_report||null,league_boundary:snapshot.league_boundary||null,boundary_label:snapshot.boundary_label||null,normalized_observations:true,observation_source:'player-observations.json'}];
const nextHistory=clone(historyFile);
if(previous&&!nextHistory.snapshots?.[previous.snapshot_id])nextHistory.snapshots={...(nextHistory.snapshots||{}),[previous.snapshot_id]:previousRows};
const nextCurrent=clone(currentFile);nextCurrent.snapshots={[snapshotId]:rows};
const totalClanMedals=rows.reduce((sum,row)=>sum+row.clan_medals,0);
console.log(JSON.stringify({ok:true,mode:dryRun?'dry-run':'write',snapshot_id:snapshotId,previous_snapshot_id:previous?.snapshot_id||null,members:snapshot.members,added,removed,retained,total_clan_medals:totalClanMedals,history_current_policy:'current snapshot stays in player-observations.json until the next ingestion promotes it to history',report_generation:'delegated-to-report-generator'},null,2));
if(dryRun)process.exit(0);
function save(file,value){fs.writeFileSync(file,`${JSON.stringify(value,null,2)}\n`,'utf8');}
save(path.join(DATA,'players.json'),nextPlayers);save(path.join(DATA,'snapshots.json'),nextSnapshots);save(path.join(DATA,'player-observations.json'),nextCurrent);save(path.join(DATA,'player-observations-history.json'),nextHistory);save(path.join(DATA,'memberships.json'),nextMemberships);
fs.mkdirSync(path.join(DATA,'incoming'),{recursive:true});const archiveName=snapshot.input_archive||`${snapshot.captured_at_utc.replace(/[-:]/g,'').replace(/\.000Z$/,'Z')}.json`;const archivePath=path.join(DATA,'incoming',archiveName);if(!fs.existsSync(archivePath))fs.copyFileSync(path.resolve(inputArg),archivePath);console.log(`WRITE COMPLETE: ${snapshotId}`);