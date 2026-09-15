#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const tmpS04 = path.join(os.tmpdir(), `war-drone-report-s04-${process.pid}.html`);
const tmpS05 = path.join(os.tmpdir(), `war-drone-report-s05-${process.pid}.html`);
function run(snapshotId, output) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'generate-report.js'), snapshotId, output], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${snapshotId} report generator failed`);
  return fs.readFileSync(output, 'utf8');
}
try {
  const s04 = run('S04', tmpS04);
  for (const needle of [
    'PERSIA · Clan Leaderboard · 22 شهریور 1405 · 23:00',
    'تمام 47 عضو بررسی و ثبت شده‌اند.',
    'مدال کل کلن بر اساس مجموع رکورد اعضا: 22,889,047',
    'حسین +6,106',
    'Ardalan +45,700',
    'تغییر مدال کلن',
    'بیشترین افزایش مدال کلن',
    '<td>1 (-)</td><td>Commander</td>',
    '<td>3 (↑ 1)</td><td>Eren</td>',
    '<td>33 (↑ 11)</td><td>ایرانی باوقار</td>'
  ]) if (!s04.includes(needle)) throw new Error(`S04 missing generated content: ${needle}`);
  const s04Rows = (s04.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr>/g) || []).length;
  if (s04Rows !== 47) throw new Error(`S04 expected 47 rows, got ${s04Rows}`);

  const s05 = run('S05', tmpS05);
  for (const needle of [
    'PERSIA · Clan Leaderboard · 23 شهریور 1405 · 23:00',
    'تمام 47 عضو بررسی و ثبت شده‌اند.',
    'مدال کل کلن بر اساس مجموع رکورد اعضا: 23,742,781',
    'تغییر مدال کلن',
    '<td>1 (-)</td><td>Commander</td>',
    '<td>47 (-)</td><td>n8</td>'
  ]) if (!s05.includes(needle)) throw new Error(`S05 missing generated content: ${needle}`);
  const s05Rows = (s05.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr>/g) || []).length;
  if (s05Rows !== 47) throw new Error(`S05 expected 47 rows, got ${s05Rows}`);

  if (s04.includes('تغییر مدال لیگ') || s05.includes('تغییر مدال لیگ')) throw new Error('legacy public label still generated');
  console.log('REPORT GENERATOR TEST PASS: S04 and S05 generated from canonical/history sources with 47 rows and public performance labels.');
} finally {
  fs.rmSync(tmpS04, { force: true });
  fs.rmSync(tmpS05, { force: true });
}
