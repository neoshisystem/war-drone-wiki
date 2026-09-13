#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const tmp = path.join(os.tmpdir(), `war-drone-report-${process.pid}.html`);
try {
  const run = spawnSync(process.execPath, [path.join(__dirname, 'generate-report.js'), 'S04', tmp], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (run.status !== 0) throw new Error(run.stderr || run.stdout || 'report generator failed');
  const html = fs.readFileSync(tmp, 'utf8');

  const required = [
    'PERSIA · Clan Leaderboard · 22 شهریور 1405 · 23:00',
    'تمام ۴۷ عضو بررسی و ثبت شده‌اند.',
    'مدال کل کلن بر اساس مجموع رکورد اعضا: 22,889,047',
    'حسین +6,106',
    'Ardalan +45,700',
    '<td>1 (-)</td><td>Commander</td>',
    '<td>3 (↑ 1)</td><td>Eren</td>',
    '<td>33 (↑ 11)</td><td>ایرانی باوقار</td>'
  ];
  for (const needle of required) {
    if (!html.includes(needle)) throw new Error(`missing generated content: ${needle}`);
  }

  const bodyRows = (html.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr>/g) || []).length;
  if (bodyRows !== 47) throw new Error(`expected 47 rows, got ${bodyRows}`);

  console.log('REPORT GENERATOR TEST PASS: S04 generated with 47 rows and expected key metrics.');
} finally {
  fs.rmSync(tmp, { force: true });
}
