#!/usr/bin/env node
'use strict';
const fs=require('fs');const os=require('os');const path=require('path');const ROOT=path.resolve(__dirname,'..');const temp=path.join(os.tmpdir(),`war-drone-archive-${Date.now()}.html`);
try{
 const result=require('child_process').spawnSync(process.execPath,[path.join(__dirname,'generate-archive.js'),temp],{cwd:ROOT,encoding:'utf8'});
 if(result.status!==0){process.stderr.write(result.stderr||result.stdout||'archive generator failed\n');process.exit(result.status||1);}
 const html=fs.readFileSync(temp,'utf8');const index=JSON.parse(fs.readFileSync(path.join(ROOT,'data','index.json'),'utf8'));const memberChanges=JSON.parse(fs.readFileSync(path.join(ROOT,'data','member-changes.json'),'utf8'));const expected=index.reports.length;const cards=(html.match(/<article class="report /g)||[]).length;
 if(cards!==expected)throw new Error(`expected ${expected} archive entries, found ${cards}`);
 for(const id of ['2026-09-18-2300','2026-09-17-2400','2026-09-16-2400','2026-09-15-2400','2026-09-14-2300','2026-09-13-2300','2026-09-13-1130','2026-09-12-1900'])if(!html.includes(`reports/${id}.html`))throw new Error(`missing archive link for ${id}`);
 if(!html.includes('clan-leaderboard.html'))throw new Error('missing S02 archive link');
 if(!html.includes('دوره 10'))throw new Error('missing newest period label');
 if(!html.includes('شروع لیگ جدید'))throw new Error('missing S08 league-start marker');
 if(!html.includes('پایان لیگ جاری'))throw new Error('missing S07 league-end marker');
 const aggregateCount=(html.match(/class="report-aggregate"/g)||[]).length;if(aggregateCount!==expected)throw new Error(`expected session aggregate card on all ${expected} archive entries, found ${aggregateCount}`);
 if(!html.includes('— / baseline'))throw new Error('missing S01 baseline presentation');
 const s10=memberChanges.transitions.find(item=>item.snapshot_id==='S10');if(!s10)throw new Error('missing S10 member-change transition');if(s10.new_members.length!==2||s10.departed_members.length!==18)throw new Error(`unexpected S10 member changes: ${s10.new_members.length}/${s10.departed_members.length}`);if(!s10.new_members.some(item=>item.display_name==='kaveh.2')||!s10.new_members.some(item=>item.display_name==='ali'))throw new Error('missing S10 joiner names');if(!s10.departed_members.some(item=>item.display_name==='Cpt. Of Persia')||!s10.departed_members.some(item=>item.display_name==='hisystem'))throw new Error('missing S10 departed names');if(!html.includes('href="player.html?id=PERSIA-P-0055"')||!html.includes('kaveh.2'))throw new Error('missing player profile link in archive');
 if(!html.includes('+374,282')||!html.includes('+58,932'))throw new Error('missing verified S07 period aggregates');
 if(!html.includes('+1,009,626')||!html.includes('+88,364'))throw new Error('missing verified S08 period aggregates');
 if(!html.includes('+647,679')||!html.includes('+70,387'))throw new Error('missing verified S09 period aggregates');
 if(!html.includes('+204,696')||!html.includes('+29,899'))throw new Error('missing verified S10 period aggregates');
 const aggregates=[...html.matchAll(/دوره ([0-9۰-۹]+).*?<div class="aggregate-item"><span>تغییر مدال کلن<\/span><b>([^<]+)<\/b><\/div><div class="aggregate-item"><span>افزایش کیل<\/span><b>([^<]+)<\/b>/gs)].map(match=>({period:match[1],clan_medals:match[2],kills:match[3]}));
 if(aggregates.length!==expected)throw new Error(`expected ${expected} aggregate values, found ${aggregates.length}`);
 console.log(`ARCHIVE AGGREGATES: ${JSON.stringify(aggregates)}`);
 console.log('ARCHIVE GENERATOR TEST PASS: index.json -> deterministic archive with per-session aggregate clan medals and kills, including the S07 league-end entry.');
}finally{fs.rmSync(temp,{force:true});}
