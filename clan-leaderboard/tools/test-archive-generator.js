#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const temp = path.join(os.tmpdir(), `war-drone-archive-${Date.now()}.html`);

try {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'generate-archive.js'), temp], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || 'archive generator failed\n');
    process.exit(result.status || 1);
  }
  const html = fs.readFileSync(temp, 'utf8');
  const cards = (html.match(/class="report"/g) || []).length;
  if (cards !== 4) throw new Error(`expected 4 archive entries, found ${cards}`);
  for (const id of ['2026-09-13-2300', '2026-09-13-1130', '2026-09-12-1900']) {
    if (!html.includes(`reports/${id}.html`)) throw new Error(`missing archive link for ${id}`);
  }
  if (!html.includes('clan-leaderboard.html')) throw new Error('missing S02 archive link');
  if (!html.includes('دوره 4')) throw new Error('missing newest period label');
  console.log('ARCHIVE GENERATOR TEST PASS: index.json -> deterministic archive with all current reports.');
} finally {
  fs.rmSync(temp, { force: true });
}
