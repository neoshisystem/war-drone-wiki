#!/usr/bin/env node
'use strict';
const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'..');const DATA=path.join(ROOT,'data');
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),'utf8'));
const save=(n,v)=>fs.writeFileSync(path.join(DATA,n),JSON.stringify(v,null,2)+'\n','utf8');
const fail=m=>{throw new Error('RECONCILIATION FAILED: '+m)};
(async()=>{
 const history=read('player-observations-history.json');const current=read('player-observations.json');const historyS05=(()=>{try{return read('player-observations-history-s05.json')}catch{return {snapshots:{}}}})();const players=read('players.json');const snapshots=read('snapshots.json');
 if(history.snapshots?.S01?.length!==47||history.snapshots?.S02?.length!==46)fail('S01/S02 history count mismatch');
 const verifiedS03=history.snapshots?.S03;
 if(!Array.isArray(verifiedS03)||verifiedS03.length!==47)fail('S03 history invalid');
 const getRows=sid=>history.snapshots?.[sid]||historyS05.snapshots?.[sid]||current.snapshots?.[sid];
 const s04Rows=getRows('S04');if(!Array.isArray(s04Rows)||s04Rows.length!==47)fail('S04 source invalid');
 const currentSnapshotId=snapshots.current_snapshot_id;const latestRows=getRows(currentSnapshotId);if(!Array.isArray(latestRows)||latestRows.length!==snapshots.snapshots.find(s=>s.snapshot_id===currentSnapshotId)?.members)fail(`${currentSnapshotId}: current source invalid`);
 history.description='Historical normalized player observations for verified source snapshots. S05 is preserved in a dedicated immutable shard.';
 history.source_snapshots={S01:{date_persian:'21 شهریور 1405',time_iran:'19:00',type:'baseline',members:47},S02:{date_persian:'21 شهریور 1405',time_iran:'23:30',type:'delta-report',members:46},S03:{date_persian:'22 شهریور 1405',time_iran:'11:30',type:'delta-report',members:47},S04:{date_persian:'22 شهریور 1405',time_iran:'23:00',type:'delta-report',members:47}};
 history.source_reports={S01:'/clan-leaderboard/reports/2026-09-12-1900.html',S02:'/clan-leaderboard.html',S03:'/clan-leaderboard/reports/2026-09-13-1130.html',S04:'/clan-leaderboard/reports/2026-09-13-2300.html'};
 const latest=new Set(latestRows.map(r=>r.player_id));for(const p of players.players){if(latest.has(p.player_id)){p.status='active';p.last_seen_snapshot=currentSnapshotId}else if(p.player_id==='PERSIA-P-0043'){p.status='former';p.last_seen_snapshot='S01'}}
 if(!currentSnapshotId||!snapshots.snapshots.some(s=>s.snapshot_id===currentSnapshotId))fail('current_snapshot_id is not registered');
 save('player-observations-history.json',history);save('players.json',players);
 console.log(JSON.stringify({ok:true,S01:history.snapshots.S01.length,S02:history.snapshots.S02.length,S03:history.snapshots.S03.length,S04:s04Rows.length,current:currentSnapshotId,current_rows:latestRows.length},null,2));
})().catch(e=>{console.error(e.message);process.exit(1)});
