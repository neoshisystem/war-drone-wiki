#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REPORTS = path.join(ROOT, 'reports');

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

function movement(value) {
  if (value === null || value === undefined || value === 0) return '-';
  return value > 0 ? `↑ ${value}` : `↓ ${Math.abs(value)}`;
}

function signed(value) {
  if (value === null || value === undefined) return '—';
  if (value === 0) return '0';
  return value > 0 ? `+${faNumber(value)}` : `-${faNumber(Math.abs(value))}`;
}

function weapon(level, delta) {
  if (delta === null || delta === undefined || delta === 0) return faNumber(level);
  return `${faNumber(level)} (${signed(delta)})`;
}

function reportId(snapshot) {
  return snapshot.source_report
    ? path.basename(snapshot.source_report, '.html')
    : `${snapshot.captured_at_utc.slice(0, 10)}-${snapshot.time_iran.replace(':', '')}`;
}

function relativeReportPage(currentPath, targetPath) {
  if (!targetPath) return '#';
  const currentDir = path.posix.dirname(currentPath);
  return path.posix.relative(currentDir, targetPath.replace(/^\//, '')) || path.posix.basename(targetPath);
}

const snapshotsFile = readJson('snapshots.json');
const historyFile = readJson('player-observations-history.json');
const playersFile = readJson('players.json');
const indexFile = readJson('index.json');

const snapshotId = process.argv[2] || snapshotsFile.current_snapshot_id;
const target = (snapshotsFile.snapshots || []).find((s) => s.snapshot_id === snapshotId);
if (!target) throw new Error(`Unknown snapshot_id: ${snapshotId}`);

const ordered = [...snapshotsFile.snapshots].sort((a, b) => a.captured_at_utc.localeCompare(b.captured_at_utc));
const index = ordered.findIndex((s) => s.snapshot_id === snapshotId);
const previous = index > 0 ? ordered[index - 1] : null;
const next = index < ordered.length - 1 ? ordered[index + 1] : null;
const rows = historyFile.snapshots?.[snapshotId];
if (!Array.isArray(rows)) throw new Error(`Missing normalized rows for ${snapshotId}`);
if (rows.length !== target.members) throw new Error(`${snapshotId}: rows ${rows.length} != members ${target.members}`);

const registry = new Map((playersFile.players || []).map((p) => [p.player_id, p]));
const previousIds = new Set(previous ? (historyFile.snapshots?.[previous.snapshot_id] || []).map((r) => r.player_id) : []);
const currentIds = new Set(rows.map((r) => r.player_id));
const added = [...currentIds].filter((id) => !previousIds.has(id));
const removed = [...previousIds].filter((id) => !currentIds.has(id));
const retained = rows.filter((r) => previousIds.has(r.player_id)).length;
const totalClanMedals = rows.reduce((sum, row) => sum + row.clan_medals, 0);
const previousRowMap = new Map(previous ? (historyFile.snapshots?.[previous.snapshot_id] || []).map((r) => [r.player_id, r]) : []);

const topKills = [...rows].filter((r) => Number.isInteger(r.kills_delta)).sort((a, b) => b.kills_delta - a.kills_delta).slice(0, 5);
const topLeague = [...rows].filter((r) => Number.isInteger(r.league_medals_delta)).sort((a, b) => b.league_medals_delta - a.league_medals_delta).slice(0, 5);

const getName = (row) => registry.get(row.player_id)?.display_name || row.display_name || row.player_id;
const getRole = (row) => registry.get(row.player_id)?.role || row.role || 'Member';
const sourcePath = target.source_report || `/clan-leaderboard/reports/${reportId(target)}.html`;
const currentReportPath = `clan-leaderboard/reports/${reportId(target)}.html`;
const reportsById = new Map((indexFile.reports || []).map((r) => [r.id, r.page]));

let rowsHtml = '';
for (const row of [...rows].sort((a, b) => a.rank - b.rank)) {
  const role = esc(getRole(row));
  const name = esc(getName(row));
  const label = row.rank_movement === null || row.rank_movement === undefined
    ? String(row.rank)
    : `${row.rank} (${movement(row.rank_movement)})`;
  const medals = row.honor_medals || { gold: 0, silver: 0, bronze: 0 };
  const upgrades = row.weapons?.upgrade_deltas || {};
  const weaponText = `${weapon(row.weapons?.['25mm'] ?? 0, upgrades['25mm'])} / ${weapon(row.weapons?.hydra ?? 0, upgrades.hydra)} / ${weapon(row.weapons?.hellfire ?? 0, upgrades.hellfire)}`;
  rowsHtml += `\n<tr><td>${esc(label)}</td><td>${name}</td><td>${role}</td><td>${faNumber(row.stage)}</td><td>${faNumber(row.league_medals)}</td><td>${signed(row.league_medals_delta)}</td><td>${faNumber(row.clan_medals)}</td><td>${medals.gold} / ${medals.silver} / ${medals.bronze}</td><td>${faNumber(row.total_kills)}</td><td>${signed(row.kills_delta)}</td><td>${weaponText}</td><td>${esc(row.last_online_display)}</td></tr>`;
}

const prevPage = previous ? reportsById.get(reportId(previous)) || `../reports/${reportId(previous)}.html` : null;
const nextPage = next ? reportsById.get(reportId(next)) || `../reports/${reportId(next)}.html` : null;
const archiveLink = '../archive.html';
const nav = `\n<nav class="report-nav" aria-label="گزارش‌های کلن"><a href="${archiveLink}">آرشیو</a>${prevPage ? `<a href="${prevPage}">قبلی</a>` : '<span class="muted">قبلی</span>'}${nextPage ? `<a href="${nextPage}">بعدی</a>` : '<span class="muted">بعدی</span>'}</nav>`;

const report = `<!doctype html>\n<html lang="fa" dir="rtl" data-theme="dark">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>PERSIA · Clan Leaderboard · ${esc(target.date_persian)} · ${esc(target.time_iran)}</title><link rel="stylesheet" href="../../assets/css/app.css"><link rel="stylesheet" href="../../assets/css/site.css"></head>\n<body><header class="topbar"><div class="shell"><a class="brand" href="../../index.html"><span class="brand-mark">◆</span><span><b>PERSIA</b> · War Drone</span></a></div></header><main>\n<section class="hero"><div class="shell"><span class="badge">PERSIA · DORE ${esc(String(target.snapshot_id).replace(/^S/, ''))}</span><h1>جدول جامع عملکرد و تغییرات اعضای کلن</h1><p>${esc(target.date_persian)} · ساعت ${esc(target.time_iran)} · تمام ${faNumber(target.members)} عضو بررسی و ثبت شده‌اند.</p>${nav}</div></section>\n<section class="section"><div class="shell"><h2>وضعیت کلی و شاخص‌های کلیدی کلن</h2><p>ظرفیت اعضا: ${faNumber(target.members)} از ${faNumber(target.capacity)} نفر${previous ? ` · Snapshot قبلی: ${esc(previous.time_iran)}` : ''}.</p><ul><li>اعضای مشترک با Snapshot قبلی: ${faNumber(retained)} نفر</li><li>بازیکنان حذف‌شده: ${faNumber(removed.length)} · بازیکنان اضافه‌شده: ${faNumber(added.length)}</li><li>مدال کل کلن بر اساس مجموع رکورد اعضا: ${faNumber(totalClanMedals)}</li><li>بیشترین افزایش کیل: ${topKills.map((r) => `${esc(getName(r))} ${signed(r.kills_delta)}`).join(' · ')}</li><li>بیشترین افزایش مدال لیگ جاری: ${topLeague.map((r) => `${esc(getName(r))} ${signed(r.league_medals_delta)}`).join(' · ')}</li></ul>\n<h2>جدول کامل رتبه‌بندی و تغییرات عملکرد اعضا</h2><div class="table-wrap"><table><thead><tr><th>رتبه</th><th>نام کاربری</th><th>سمت</th><th>استیج</th><th>مدال لیگ جاری</th><th>تغییر مدال لیگ</th><th>مدال کل کلن</th><th>مدال افتخار (طلا / نقره / برنز)</th><th>مجموع کیل 💀</th><th>افزایش کیل 💀</th><th>لول سلاح‌ها (توپ / هیدرا / هل‌فایر)</th><th>آخرین آنلاین</th></tr></thead><tbody>${rowsHtml}\n</tbody></table></div>${nav}</div></section>\n</main><footer class="site-footer"><div class="shell">Generated deterministically from canonical snapshot ${esc(target.snapshot_id)} · source: ${esc(sourcePath)}</div></footer></body></html>\n`;

const outputArg = process.argv[3] || path.join(REPORTS, `${reportId(target)}.html`);
fs.mkdirSync(path.dirname(outputArg), { recursive: true });
fs.writeFileSync(outputArg, report, 'utf8');
console.log(JSON.stringify({ ok: true, snapshot_id: snapshotId, output: outputArg, members: target.members, total_clan_medals: totalClanMedals, added: added.length, removed: removed.length }, null, 2));
