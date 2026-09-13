#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const args=process.argv.slice(2);const input=args.find(x=>!x.startsWith('--'));const write=args.includes('--write');
require('./ingest-snapshot-v2.js');
if(!write)return;
const ROOT=path.resolve(__dirname,'..'),DATA=path.join(ROOT,'data');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));const save=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n','utf8');
const payload=read(path.resolve(input));const playersPath=path.join(DATA,'players.json'),membershipsPath=path.join(DATA,'memberships.json');
const players=read(playersPath),memberships=read(membershipsPath),active=new Set((memberships.memberships||[]).filter(m=>m.status==='active').map(m=>m.player_id));
players.players=players.players.map(p=>active.has(p.player_id)?{...p,status:'active'}:{...p,status:'former'});save(playersPath,players);
fs.mkdirSync(path.join(DATA,'incoming'),{recursive:true});const name=payload.snapshot.input_archive||`${String(payload.snapshot.captured_at_utc).replace(/[:]/g,'').replace(/[-]/g,'').replace(/Z$/,'Z')}.json`;const archive=path.join(DATA,'incoming',name);if(!fs.existsSync(archive))fs.copyFileSync(path.resolve(input),archive);
console.log(`INGESTION FINALIZED: ${read(path.join(DATA,'snapshots.json')).current_snapshot_id}`);
