#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

function faNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function signed(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  if (number === 0) return '0';
  return number > 0 ? `+${faNumber(number)}` : `-${faNumber(Math.abs(number))}`;
}

function viewerHref(page) {
  const raw = String(page || '');
  const source = raw === '../clan-leaderboard.html'
    ? raw
    : raw.replace(/^\.\.\//, '');
  return `index.html?source=${source}&mode=simple`;
}

function sourceKey(page) {
  const raw = String(page || '');
  if (raw === '../clan-leaderboard.html') return '/clan-leaderboard.html';
  return `/clan-leaderboard/${raw.replace(/^\.\.\//, '')}`;
}

const index = readJson('index.json');
const snapshotsFile = readJson('snapshots.json');
const leaguesFile = readJson('leagues.json');
const observations = [
  readJson('player-observations-history.json'),
  readJson('player-observations-history-s05.json'),
  readJson('player-observations.json')
];
const performance = require('../assets/performance.js');
const metrics = performance.computeAll(snapshotsFile, observations, leaguesFile);
const reports = [...(index.reports || [])];

if (!reports.length) throw new Error('index.json contains no reports');

const cards = reports.map((report, index) => {
  const label = report.period === 1 ? 'ثبت اولیه / Baseline' : 'گزارش تغییرات';
  const latest = index === 0 ? ' · آخرین گزارش' : '';
  const page = viewerHref(report.page);
  const snapshot = (snapshotsFile.snapshots || []).find(
    item => item.source_report === sourceKey(report.page)
  );
  if (!snapshot) throw new Error(`missing snapshot for report ${report.id}`);

  const periodMetrics = metrics[snapshot.snapshot_id];
  if (!periodMetrics) throw new Error(`missing performance metrics for ${snapshot.snapshot_id}`);

  const baseline = periodMetrics.baseline_snapshot_id === snapshot.snapshot_id;
  const periodClan = baseline ? '— / baseline' : signed(periodMetrics.period_clan_medals_change);
  const periodKills = baseline ? '— / baseline' : signed(periodMetrics.period_kills_change);

  return `<a class="report report--period-${esc(report.period)}" href="${esc(page)}" aria-label="دوره ${esc(report.period)} — ${esc(report.date_persian)} ${esc(report.time)}"><span class="report-index" aria-hidden="true">${faNumber(report.period)}</span><div class="report-main"><div class="report-heading"><h2>دوره ${esc(report.period)} · ${esc(report.date_persian)} · ساعت ${esc(report.time)}</h2><span class="report-status">${index === 0 ? 'آخرین' : 'آرشیو'}</span></div><p>${faNumber(report.members)}/${faNumber(String(report.capacity).split('/').pop())} عضو · ${esc(label)}${latest} · دو نمایش ساده و گرافیکی · جست‌وجوی مشترک</p><div class="report-aggregate"><div class="aggregate-heading"><strong>جمع تغییرات این دوره</strong><span>Period Delta · ${esc(snapshot.snapshot_id)}</span></div><div class="aggregate-item"><span>تغییر مدال کلن</span><b>${esc(periodClan)}</b></div><div class="aggregate-item"><span>افزایش کیل</span><b>${esc(periodKills)}</b></div></div></div><span class="arrow" aria-hidden="true">←</span></a>`;
}).join('\n');

const archive = `<!doctype html><html lang="fa" dir="rtl" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#050b14"><title>PERSIA · Clan Leaderboard Archive</title><link rel="stylesheet" href="../assets/css/app.css"><link rel="stylesheet" href="../assets/css/site.css"><style>.archive{padding:34px 0 50px}.hero{padding:24px 0;border-bottom:1px solid var(--line)}.badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 11px;color:var(--cyan);font-size:.78rem;font-weight:900}.hero h1{font-size:clamp(2rem,6vw,3.6rem);margin:10px 0}.hero p{color:var(--muted);max-width:850px}.report-list{display:grid;gap:14px;margin-top:20px}.report{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;overflow:hidden;text-decoration:none;color:var(--text);border:1px solid var(--line);border-radius:20px;padding:17px 18px;background:linear-gradient(145deg,var(--panel),var(--panel2));box-shadow:var(--shadow);transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease}.report:nth-child(even){background:linear-gradient(145deg,var(--panel2),var(--panel));border-color:color-mix(in srgb,var(--line) 72%,var(--cyan) 28%)}.report:nth-child(odd){border-right:3px solid color-mix(in srgb,var(--cyan) 55%,var(--line))}.report:nth-child(even){border-right:3px solid color-mix(in srgb,var(--cyan) 25%,var(--line))}.report:hover{transform:translateY(-2px);border-color:var(--cyan);box-shadow:var(--shadow),0 0 0 1px color-mix(in srgb,var(--cyan) 22%,transparent)}.report:active{transform:scale(.99);border-color:var(--cyan)}.report-index{display:grid;place-items:center;min-width:42px;height:42px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--muted);font-weight:900}.report:nth-child(even) .report-index{background:rgba(255,255,255,.045);color:var(--text)}.report-main{min-width:0}.report-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.report h2{font-size:1.05rem;margin:0 0 4px}.report p{margin:0;color:var(--muted);font-size:.82rem}.report-status{flex:0 0 auto;border:1px solid var(--line);border-radius:999px;padding:4px 8px;color:var(--muted);font-size:.7rem;font-weight:800}.report:first-child .report-status{color:var(--cyan);border-color:var(--cyan)}.report-aggregate{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}.aggregate-heading{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px}.aggregate-heading strong{color:var(--cyan);font-size:.84rem}.aggregate-heading span{color:var(--muted);font-size:.68rem}.aggregate-item{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:11px;padding:8px 10px;background:rgba(0,0,0,.08)}.aggregate-item span{color:var(--muted);font-size:.75rem}.aggregate-item b{font-size:.82rem;font-variant-numeric:tabular-nums}.arrow{font-size:1.4rem;color:var(--cyan)}.note{margin-top:18px;padding:14px;border:1px dashed var(--line);border-radius:15px;color:var(--muted);background:var(--panel)}@media(max-width:620px){.shell{width:min(94vw,620px)}.report{grid-template-columns:auto 1fr;gap:10px;padding:15px}.report-index{min-width:36px;height:36px;border-radius:11px}.report-heading{display:block}.report-status{display:inline-block;margin-top:5px}.report p{line-height:1.7}.report-aggregate{grid-template-columns:1fr;gap:6px}.aggregate-heading{display:block}.aggregate-heading span{display:block;margin-top:2px}.aggregate-item{padding:8px}.arrow{display:none}}@media(prefers-reduced-motion:reduce){.report{transition:none}}</style></head><body><header class="topbar"><div class="shell"><a class="brand" href="../index.html"><span class="brand-mark">◆</span><span><b>PERSIA</b> · War Drone</span></a><nav class="nav"><a class="btn" href="index.html">Leaderboard</a><a class="btn" href="players.html">اعضای کلن</a><a class="btn" href="member-history.html">تاریخچه عضویت</a><a class="btn active" href="archive.html">آرشیو</a></nav><button class="theme-toggle" data-theme-toggle>☀️</button></div></header><main><section class="hero"><div class="shell"><span class="badge">PERSIA · CLAN LEADERBOARD</span><h1>آرشیو دوره‌های کلن</h1><p>گزارش‌های دوره‌ای کلن در تاریخ و ساعت ثبت‌شده نگهداری می‌شوند. داده‌های هر دوره مستقل هستند و با دوره‌های دیگر ادغام یا جایگزین نمی‌شوند.</p></div></section><section class="archive"><div class="shell"><div class="report-list">${cards}</div><div class="note">آرشیو از جدیدترین دوره به قدیمی‌ترین دوره مرتب شده است. «جمع تغییرات این دوره» از محاسبه رسمی Period Delta و بر اساس هویت پایدار Player ID ساخته می‌شود؛ بازیکنان جدید و حذف‌شده در سهم دوره‌ای صفر هستند.</div></div></section></main><footer class="footer"><div class="shell"><span>PERSIA · War Drone</span><span>Clan Leaderboard Archive</span></div></footer><script src="../assets/js/app.js"></script></body></html>`;

const output = process.argv[2] || path.join(ROOT, 'archive.html');
fs.writeFileSync(output, `${archive}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, reports: reports.length, output }, null, 2));
