#!/usr/bin/env node
'use strict';
const fs=require('fs');const os=require('os');const path=require('path');const ROOT=path.resolve(__dirname,'..');const temp=path.join(os.tmpdir(),`war-drone-archive-${Date.now()}.html`);
try{
 const result=require('child_process').spawnSync(process.execPath,[path.join(__dirname,'generate-archive.js'),temp],{cwd:ROOT,encoding:'utf8'});
 if(result.status!==0){process.stderr.write(result.stderr||result.stdout||'archive generator failed\n');process.exit(result.status||1);}
 const html=fs.readFileSync(temp,'utf8');const cards=(html.match(/<a class="report /g)||[]).length;
 if(cards!==7)throw new Error(`expected 7 archive entries, found ${cards}`);
 for(const id of ['2026-09-16-2400','2026-09-15-2400','2026-09-14-2300','2026-09-13-2300','2026-09-13-1130','2026-09-12-1900'])if(!html.includes(`reports/${id}.html`))throw new Error(`missing archive link for ${id}`);
 if(!html.includes('clan-leaderboard.html'))throw new Error('missing S02 archive link');
 if(!html.includes('دوره 7'))throw new Error('missing newest period label');
 if(!html.includes('پایان لیگ جاری'))throw new Error('missing S07 league-end marker');
 const aggregateCount=(html.match(/class="report-aggregate"/g)||[]).length;if(aggregateCount!==7)throw new Error(`expected session aggregate card on all 7 archive entries, found ${aggregateCount}`);
 if(!html.includes('— / baseline'))throw new Error('missing S01 baseline presentation');
 if(!html.includes('+374,282')||!html.includes('+58,932'))throw new Error('missing verified S07 period aggregates');
 const aggregates=[...html.matchAll(/دوره ([0-9۰-۹]+).*?<div class="aggregate-item"><span>تغییر مدال کلن<\/span><b>([^<]+)<\/b><\/div><div class="aggregate-item"><span>افزایش کیل<\/span><b>([^<]+)<\/b>/gs)].map(match=>({period:match[1],clan_medals:match[2],kills:match[3]}));
 if(aggregates.length!==7)throw new Error(`expected 7 aggregate values, found ${aggregates.length}`);
 console.log(`ARCHIVE AGGREGATES: ${JSON.stringify(aggregates)}`);
 console.log('ARCHIVE GENERATOR TEST PASS: index.json -> deterministic archive with per-session aggregate clan medals and kills, including the S07 league-end entry.');
}finally{fs.rmSync(temp,{force:true});}
