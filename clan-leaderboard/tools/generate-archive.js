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
    .replace(/"/g, '&quot;');
}

function faNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function hrefFromIndexPage(page) {
  const normalized = String(page || '').replace(/^\.\//, '');
  return normalized.replace(/^\.\.\//, '');
}

const index = readJson('index.json');
const reports = [...(index.reports || [])];
if (!reports.length) throw new Error('index.json contains no reports');

const cards = reports.map((report) => {
  const label = report.period === 1 ? 'ثبت اولیه / Baseline' : 'گزارش تغییرات';
  const latest = report === reports[0] ? ' · آخرین گزارش' : '';
  const page = hrefFromIndexPage(report.page);
  return `<a class="report" href="${esc(page)}"><div><h2>دوره ${esc(report.period)} · ${esc(report.date_persian)} · ساعت ${esc(report.time)}</h2><p>${faNumber(report.members)}/${faNumber(String(report.capacity).split('/').pop())} عضو · ${esc(label)}${latest} · دو نمایش ساده و گرافیکی · جست‌وجوی مشترک</p></div><span class="arrow">←</span></a>`;
}).join('\n');

const archive = `<!doctype html><html lang="fa" dir="rtl" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#050b14"><title>PERSIA · Clan Leaderboard Archive</title><link rel="stylesheet" href="../assets/css/app.css"><link rel="stylesheet" href="../assets/css/site.css"><style>.archive{padding:34px 0 50px}.hero{padding:24px 0;border-bottom:1px solid var(--line)}.badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:6px 11px;color:var(--cyan);font-size:.78rem;font-weight:900}.hero h1{font-size:clamp(2rem,6vw,3.6rem);margin:10px 0}.hero p{color:var(--muted);max-width:850px}.report-list{display:grid;gap:12px;margin-top:20px}.report{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;text-decoration:none;color:var(--text);border:1px solid var(--line);border-radius:20px;padding:18px;background:linear-gradient(145deg,var(--panel),var(--panel2));box-shadow:var(--shadow);transition:.18s transform,.18s border-color}.report:hover{transform:translateY(-2px);border-color:var(--cyan)}.report h2{font-size:1.05rem;margin:0 0 4px}.report p{margin:0;color:var(--muted);font-size:.82rem}.arrow{font-size:1.4rem;color:var(--cyan)}.note{margin-top:18px;padding:14px;border:1px dashed var(--line);border-radius:15px;color:var(--muted);background:var(--panel)}@media(max-width:620px){.shell{width:min(94vw,620px)}.report{grid-template-columns:1fr}.arrow{display:none}}</style></head><body><header class="topbar"><div class="shell"><a class="brand" href="../index.html"><span class="brand-mark">◆</span><span><b>PERSIA</b> · War Drone</span></a><nav class="nav"><a class="btn" href="index.html">Leaderboard</a><a class="btn" href="players.html">اعضای کلن</a><a class="btn" href="member-history.html">تاریخچه عضویت</a><a class="btn active" href="archive.html">آرشیو</a></nav><button class="theme-toggle" data-theme-toggle>☀️</button></div></header><main><section class="hero"><div class="shell"><span class="badge">PERSIA · CLAN LEADERBOARD</span><h1>آرشیو دوره‌های کلن</h1><p>هر گزارش یک Snapshot مستقل از وضعیت کلن در یک تاریخ و ساعت مشخص است. داده‌های هر دوره مستقل نگهداری می‌شوند و با دوره‌های دیگر ادغام یا جایگزین نمی‌شوند.</p></div></section><section class="archive"><div class="shell"><div class="report-list">${cards}</div><div class="note">آرشیو از جدیدترین دوره به قدیمی‌ترین دوره مرتب شده است. فهرست این صفحه از <code>data/index.json</code> تولید می‌شود و برای دوره‌های جدید نیاز به افزودن دستی لینک ندارد.</div></div></section></main><footer class="footer"><div class="shell"><span>PERSIA · War Drone</span><span>Clan Leaderboard Archive</span></div></footer><script src="../assets/js/app.js"></script></body></html>`;

const output = process.argv[2] || path.join(ROOT, 'archive.html');
fs.writeFileSync(output, `${archive}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, reports: reports.length, output }, null, 2));
