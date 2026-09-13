#!/usr/bin/env node
'use strict';
const fs=require('fs');const path=require('path');const https=require('https');
const ROOT=path.resolve(__dirname,'..');const DATA=path.join(ROOT,'data');
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),'utf8'));
const save=(n,v)=>fs.writeFileSync(path.join(DATA,n),JSON.stringify(v,null,2)+'\n','utf8');
const fail=m=>{throw new Error('RECONCILIATION FAILED: '+m)};
function get(url){return new Promise((resolve,reject)=>https.get(url,res=>{let b='';res.setEncoding('utf8');res.on('data',c=>b+=c);res.on('end',()=>res.statusCode===200?resolve(b):reject(new Error('HTTP '+res.statusCode)));}).on('error',reject));}
(async()=>{
 const history=read('player-observations-history.json');const current=read('player-observations.json');const players=read('players.json');const snapshots=read('snapshots.json');
 if(!history.snapshots?.S01||!history.snapshots?.S02)fail('S01/S02 history missing');
 if(history.snapshots.S01.length!==47||history.snapshots.S02.length!==46)fail('S01/S02 count mismatch');
 const url='https://raw.githubusercontent.com/neoshisystem/war-drone-wiki/5a072553d4606946804b7418254a44dd1e67f58f/clan-leaderboard/data/player-observations.json';
 const s03=JSON.parse(await get(url));const s03Rows=s03.snapshots?.S03;const s04Rows=current.snapshots?.S04;
 if(!Array.isArray(s03Rows)||s03Rows.length!==47)fail('verified S03 source invalid');if(!Array.isArray(s04Rows)||s04Rows.length!==47)fail('S04 source invalid');
 history.description='Historical normalized player observations for S01, S02, S03 and S04, preserved from verified source snapshots.';
 history.source_snapshots={S01:{date_persian:'21 شهریور 1405',time_iran:'19:00',type:'baseline',members:47},S02:{date_persian:'21 شهریور 1405',time_iran:'23:30',type:'delta-report',members:46},S03:{date_persian:'22 شهریور 1405',time_iran:'11:30',type:'delta-report',members:47},S04:{date_persian:'22 شهریور 1405',time_iran:'23:00',type:'delta-report',members:47}};
 history.snapshots.S03=s03Rows;history.snapshots.S04=s04Rows;
 history.source_reports={S01:'/clan-leaderboard/reports/2026-09-12-1900.html',S02:'/clan-leaderboard.html',S03:'/clan-leaderboard/reports/2026-09-13-1130.html',S04:'/clan-leaderboard/reports/2026-09-13-2300.html'};
 const latest=new Set(s04Rows.map(r=>r.player_id));for(const p of players.players){if(latest.has(p.player_id)){p.status='active';p.last_seen_snapshot='S04';}else if(p.player_id==='PERSIA-P-0043'){p.status='former';p.last_seen_snapshot='S01';}}
 if(!snapshots.current_snapshot_id||snapshots.current_snapshot_id!=='S04')fail('snapshots.current_snapshot_id is not S04');
 save('player-observations-history.json',history);save('players.json',players);
 console.log(JSON.stringify({ok:true,S01:history.snapshots.S01.length,S02:history.snapshots.S02.length,S03:history.snapshots.S03.length,S04:history.snapshots.S04.length,current:snapshots.current_snapshot_id},null,2));
})().catch(e=>{console.error(e.message);process.exit(1)});
