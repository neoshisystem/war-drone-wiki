#!/usr/bin/env node
'use strict';
const fs=require('fs');const path=require('path');
const DATA=path.resolve(__dirname,'../data');
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),'utf8'));
const fail=(m)=>{console.error(`VALIDATION FAILED: ${m}`);process.exitCode=1};
const players=read('players.json'),snapshots=read('snapshots.json'),history=read('player-observations-history.json'),current=read('player-observations.json'),memberships=read('memberships.json');
const ids=new Set(players.players.map(p=>p.player_id));if(ids.size!==players.players.length)fail('duplicate player_id');
const ordered=[...snapshots.snapshots].sort((a,b)=>a.captured_at_utc.localeCompare(b.captured_at_utc));if(!ordered.length)fail('no snapshots');
const seenSnapshots=new Set();
for(const s of ordered){if(seenSnapshots.has(s.snapshot_id))fail(`duplicate snapshot_id ${s.snapshot_id}`);seenSnapshots.add(s.snapshot_id);const rows=history.snapshots?.[s.snapshot_id];if(!Array.isArray(rows))fail(`${s.snapshot_id}: missing history observations`);if(rows.length!==s.members)fail(`${s.snapshot_id}: members=${s.members}, observations=${rows.length}`);const ranks=new Set(),rowIds=new Set();for(const r of rows){if(!ids.has(r.player_id))fail(`${s.snapshot_id}: unknown player ${r.player_id}`);if(rowIds.has(r.player_id))fail(`${s.snapshot_id}: duplicate player ${r.player_id}`);rowIds.add(r.player_id);if(!Number.isInteger(r.rank)||r.rank<1)fail(`${s.snapshot_id}: invalid rank`);if(ranks.has(r.rank))fail(`${s.snapshot_id}: duplicate rank ${r.rank}`);ranks.add(r.rank)}if(ranks.size!==rows.length)fail(`${s.snapshot_id}: rank coverage mismatch`)}
if(!seenSnapshots.has(snapshots.current_snapshot_id))fail(`current_snapshot_id ${snapshots.current_snapshot_id} does not exist`);
const currentRows=current.snapshots?.[snapshots.current_snapshot_id];if(!Array.isArray(currentRows))fail('current observations missing for current_snapshot_id');
const activeMemberships=new Set();for(const m of memberships.memberships||[]){if(!ids.has(m.player_id))fail(`membership references unknown player ${m.player_id}`);if(m.status==='active'){if(activeMemberships.has(m.player_id))fail(`duplicate active membership ${m.player_id}`);activeMemberships.add(m.player_id)}}
const latestSet=new Set(currentRows.map(r=>r.player_id));for(const id of latestSet)if(!activeMemberships.has(id))fail(`current player ${id} lacks active membership`);
if(currentRows.length!==ordered.at(-1).members)fail('current observation count does not match latest snapshot');
const former=players.players.filter(p=>p.status==='former');for(const p of former){if(activeMemberships.has(p.player_id))fail(`former player is still active: ${p.player_id}`)}
if(!process.exitCode)console.log(`VALIDATION PASS: ${ordered.length} snapshots, ${players.players.length} player identities, current=${snapshots.current_snapshot_id}`);
