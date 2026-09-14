#!/usr/bin/env node
'use strict';
const fs=require('fs');const path=require('path');const DATA=path.resolve(__dirname,'../data');
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),'utf8'));
const readOptional=n=>{try{return read(n)}catch{return {snapshots:{}}}};
const errors=[];const fail=m=>errors.push(m);
const players=read('players.json'),snapshots=read('snapshots.json'),history=read('player-observations-history.json'),current=read('player-observations.json'),historyS05=readOptional('player-observations-history-s05.json');
const latest=snapshots.snapshots.at(-1);const currentId=snapshots.current_snapshot_id;
if(!latest||latest.snapshot_id!==currentId)fail(`current snapshot ${currentId} is not latest ${latest?.snapshot_id}`);
if(!history.snapshots?.S01||history.snapshots.S01.length!==47)fail('S01 history invalid');
if(!history.snapshots?.S02||history.snapshots.S02.length!==46)fail('S02 history invalid');
for(const sid of ['S03','S04']){const rows=history.snapshots?.[sid]||current.snapshots?.[sid];const meta=snapshots.snapshots.find(s=>s.snapshot_id===sid);if(meta&&(!Array.isArray(rows)||rows.length!==meta.members))fail(`${sid} observations invalid`);}
const currentRows=current.snapshots?.[currentId]||[];if(currentRows.length!==latest?.members)fail(`${currentId} current row count mismatch`);
if(currentId==='S05'){const shardRows=historyS05.snapshots?.S05;if(!Array.isArray(shardRows)||shardRows.length!==latest.members)fail('S05 history shard invalid');else if(JSON.stringify(currentRows)!==JSON.stringify(shardRows))fail('S05 current observations differ from history shard');}
const ids=new Set(players.players.map(p=>p.player_id));for(const row of currentRows)if(!ids.has(row.player_id))fail(`${currentId} references unknown player ${row.player_id}`);
if(errors.length){console.error(`RECONCILIATION FAILED (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log(JSON.stringify({ok:true,current_snapshot_id:currentId,historical_snapshots:[...Object.keys(history.snapshots||{}),...(currentId==='S05'?['S05-shard']:[])],current_rows:currentRows.length},null,2));
