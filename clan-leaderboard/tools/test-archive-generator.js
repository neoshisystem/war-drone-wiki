#!/usr/bin/env node
'use strict';
const fs=require('fs');const os=require('os');const path=require('path');const ROOT=path.resolve(__dirname,'..');const temp=path.join(os.tmpdir(),`war-drone-archive-${Date.now()}.html`);
try{
 const result=require('child_process').spawnSync(process.execPath,[path.join(__dirname,'generate-archive.js'),temp],{cwd:ROOT,encoding:'utf8'});
 if(result.status!==0){process.stderr.write(result.stderr||result.stdout||'archive generator failed\n');process.exit(result.status||1);}
 const html=fs.readFileSync(temp,'utf8');const cards=(html.match(/class="report"/g)||[]).length;
 if(cards!==6)throw new Error(`expected 6 archive entries, found ${cards}`);
 for(const id of ['2026-09-15-2400','2026-09-14-2300','2026-09-13-2300','2026-09-13-1130','2026-09-12-1900'])if(!html.includes(`reports/${id}.html`))throw new Error(`missing archive link for ${id}`);
 if(!html.includes('clan-leaderboard.html'))throw new Error('missing S02 archive link');if(!html.includes('دوره 6'))throw new Error('missing newest period label');
 const aggregateCount=(html.match(/جمع این دوره/g)||[]).length;if(aggregateCount!==6)throw new Error(`expected session aggregate on all 6 archive entries, found ${aggregateCount}`);
 if(!html.includes('— / baseline'))throw new Error('missing S01 baseline presentation');
 if(!html.includes('تغییر مدال کلن: +'))throw new Error('missing aggregated clan-medal delta');
 if(!html.includes('افزایش کیل: +'))throw new Error('missing aggregated kill delta');
 console.log('ARCHIVE GENERATOR TEST PASS: index.json -> deterministic archive with per-session aggregate clan medals and kills.');
}finally{fs.rmSync(temp,{force:true});}
