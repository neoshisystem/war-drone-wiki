# GOLDENCROWN Evidence Extraction Manual

## Purpose

این سند دانش عملیاتی‌ای را ثبت می‌کند که در طول کار واقعی با Snapshotهای GOLDENCROWN از طریق ZIP و Screenshot به‌دست آمده است. هدف آن این است که Fresh-Agent بدون تکیه بر آموزش دوباره در Conversation بتواند یک Snapshot خام را به یک Observation قابل‌اعتبارسنجی تبدیل کند.

این سند **روش کار** را ثبت می‌کند، نه مجوز mutation.

---

## 1. ZIP ورودی چیست؟

ZIP ورودی یک **evidence package** است، نه Canonical Data.

معمولاً شامل Screenshotهای خام بازی است و می‌تواند دو نوع Evidence داشته باشد:

1. **Ranking / Leaderboard screenshots**
2. **Player Profile screenshots**

در G-S01 و G-S02:

- Resolution: `2340×1080`
- Ranking evidence: `8`
- Profile evidence: `50` در ساختار منطقی Snapshot
- در G-S02 به‌دلیل وجود یک Profile Screenshot اضافی برای Reza_Gh، تعداد فایل‌ها `59` شد:
  - `8` ranking
  - `51` profile evidence
- بنابراین **تعداد فایل‌ها به‌تنهایی نباید تعداد بازیکنان را تعیین کند.**

برای Snapshotهای آینده این اعداد فرض ثابت نیستند؛ Agent باید inventory واقعی را از ZIP استخراج کند.

### اصل مهم

> یک Screenshot اضافی لزوماً به معنی یک Player اضافی یا Snapshot اضافی نیست.

---

## 2. اولین کار پس از دریافت ZIP

قبل از تفسیر داده:

1. SHA-256 کل ZIP را محاسبه کن.
2. تعداد فایل‌ها را ثبت کن.
3. نام فایل‌ها را ثبت کن.
4. نوع Evidence را تشخیص بده.
5. Resolution را کنترل کن.
6. duplicate / near-duplicate را شناسایی کن.
7. official Snapshot timestamp را از Project Authority بگیر.
8. Screenshot filename timestamp را فقط Evidence timestamp بدان.

برای G-S02:

- Snapshot: `G-S02`
- Official timestamp: `1405-06-28 24:00`
- ZIP SHA-256:
  `15d192fe04455798572b51d3944192d360bc7ed9f76fd539520d597d17e0bd5a`

نام فایل مانند `Screenshot_20260920_014842_War Drone.jpg` هرگز جای official Snapshot timestamp را نمی‌گیرد.

---

## 3. تشخیص Ranking و Profile

### Ranking evidence معمولاً برای این موارد مرجع اصلی است

- Rank
- Display Name
- Role
- Stage / Level
- Current League Medals

Ranking باید در مجموع پوشش `1..N` را بدهد.

### Profile evidence معمولاً برای این موارد مرجع اصلی است

- Display Name
- Role
- Total Kills
- Clan Medals Total
- Honor Medals
- Weapon Levels:
  - 25mm
  - Hydra
  - Hellfire
- Last Online

Name و Role را می‌توان بین Ranking و Profile cross-check کرد.

### مهم

هیچ‌کدام از این‌ها به‌تنهایی Identity نیستند.

---

## 4. Profile field normalization

فیلدهای Canonical فعلی Golden:

- `rank`
- `display_name`
- `role`
- `stage`
- `league_medals`
- `total_kills`
- `clan_medals`
- `honor_medals`
- `weapons`
- `last_online_display`

Honor:

```json
{
  "gold": 0,
  "silver": 0,
  "bronze": 0
}
```

Weapons:

```json
{
  "25mm": 0,
  "hydra": 0,
  "hellfire": 0
}
```

در استخراج باید **معنای دادهٔ خام** حفظ شود. Formatting نمایشی UI نباید به‌عنوان Raw Evidence ذخیره شود.

---

## 5. Screenshot reading rule

Screenshot خام Evidence است.

Agent باید تا حد امکان:

- تصویر را مستقیماً بررسی کند.
- Ranking و Profile را با هم تطبیق دهد.
- فیلدها را visually cross-check کند.
- در موارد مبهم از حدس عددی پرهیز کند.

OCR یا parsing ماشینی می‌تواند ابزار کمکی باشد، اما **خروجی ماشینی به‌خودی‌خود Canonical truth نیست**.

---

## 6. Duplicate / near-duplicate handling

وقتی دو Screenshot پشت‌سرهم از یک بازیکن وجود دارد:

اول سؤال این است:

> آیا این دو Evidence متعلق به یک Player در همان Snapshot هستند؟

نه اینکه:

> آیا باید دو Player بسازیم؟

برای تصمیم از این موارد استفاده کن:

- Name
- Profile identity clues
- Stage
- Weapon Levels
- Honor Medals
- Total Kills
- Clan Medals
- Role
- timing proximity

Rank در این تصمیم Identity key نیست.

### G-S02 / Reza_Gh

این مورد توسط Project Authority صریحاً تعیین شده:

- دو Screenshot = یک Player
- دو Player ساخته نمی‌شود.
- Evidence دیرتر که عدد بالاتری دارد، برای مقدار Canonical ملاک است.
- Evidence قبلی برای همان مقدار نادیده گرفته می‌شود.
- هر دو تصویر Evidenceهای متوالی داخل همان G-S02 هستند.

Published canonical result:

- rank: `33`
- Current League Medals: `45,629`
- Total Kills: `83,027`
- Clan Medals: `325,411`
- Clan Medal Delta: `14,600`

این یک **special ruling** است، نه blanket rule برای تمام آینده.

---

## 7. Snapshot boundary

تمام Screenshotهای متعلق به یک Capture Window و یک official timestamp، یک Snapshot هستند مگر Project Authority خلاف آن را تعیین کند.

درون یک Snapshot می‌توانیم داشته باشیم:

- multiple screenshots of one player
- activity drift
- slightly different cumulative values
- different Last Online values

این اختلاف‌ها نباید خودکار به Snapshot جدید تبدیل شوند.

---

## 8. Cross-snapshot extraction order

پس از normalization Snapshot جدید:

1. Member count
2. Rank integrity
3. Total sums
4. Identity candidates
5. New / continuing / departed / returning
6. Rename detection
7. Rank movement
8. Current League Medals
9. Total Kills
10. Clan Medals
11. Honor / Weapons / Last Online changes
12. Delta calculation
13. Ambiguity review
14. Publication decision

---

## 9. Identity reconciliation

این ترتیب را رعایت کن:

**Evidence → Technical Review → Fingerprint Comparison → Identity Decision → Canonical Observation**

### Strong clues

- Weapon Levels combination
- Honor Medals combination
- Total Kills
- Clan Medals Total
- Stage
- Role
- consistent profile characteristics

### Weak clues

- Rank
- leaderboard position
- approximate location in Grid
- decorative flags/symbols
- name similarity by itself

### ممنوع

- Rank-based identity
- Same-name auto-merge
- Guessing rename
- Guessing returning player
- creating a new identity فقط برای حل ambiguity

---

## 10. Duplicate names

وجود نام مشابه یا یکسان به معنی Identity مشترک نیست.

Golden invariant:

- `ALI`
- `ali`

دو Identity مستقل‌اند.

این قاعده حتی وقتی یکی rank بالاتر یا پایین‌تر دارد ثابت است.

---

## 11. Delta semantics

### Current League Medals

یک metric مستقل است که با league boundary reset می‌شود.

### Total Kills / Clan Medals

در Golden به‌عنوان cumulative/lifetime values در continuity identity تفسیر می‌شوند.

### Period Delta

برای matched continuing identity:

`current - previous valid observation`

برای new identity نباید contribution قبلی را جعل کرد.

برای returning identity پس از gap:

- period comparison طبق immediate previous observation semantics می‌تواند baseline شود.
- Lifetime/Cumulative history نباید حذف شود.

---

## 12. Negative cumulative movement

اگر Total Kills یا Clan Medals نسبت به Observation قبلی کاهش پیدا کرد:

- silently clamp نکن.
- silently invalidate نکن.
- صفرش نکن.
- دلیل را حدس نزن.

آن را به‌عنوان case نیازمند بررسی Authority ثبت کن، مگر اینکه evidence روشن و rule صریح برای correction وجود داشته باشد.

---

## 13. Pre-publication validation

حداقل:

- Snapshot ID درست
- official timestamp درست
- rankها unique و contiguous
- member count درست
- totals با member rows می‌خواند
- required profile fields موجود
- `ALI` و `ali` merge نشده‌اند
- duplicates داخل Snapshot حل شده‌اند
- new identities عمدی و مستندند
- departed identities از history حذف نشده‌اند
- ambiguity unresolved باقی نمانده
- source و canonical از یک extraction مشتق شده‌اند

---

## 14. Do not reopen ZIP routinely

بعد از publication معتبر:

**normal runtime / analysis source = GitHub normalized artifacts**

به طور معمول از:

- `data/snapshots/G-Sxx.json`
- `data/canonical/G-Sxx.json`
- `docs/G-Sxx_EVIDENCE_REPORT.md`
- `data/manifest.json`

استفاده کن.

ZIP اصلی فقط زمانی دوباره باز شود که:

- dispute
- forensic identity review
- source correction
- missing field verification
- provenance audit

لازم باشد.

---

## 15. Evidence vs Canonical

چهار لایه را با هم قاطی نکن:

1. Raw screenshot evidence
2. Normalized source snapshot
3. Canonical snapshot
4. Derived UI/report state

یک UI درست به‌تنهایی ثابت نمی‌کند extraction صحیح بوده است.

---

## 16. Project-specific known cases

### G-S01

Opening / Baseline Snapshot:

- official timestamp: `1405-06-27 24:00`
- Current League Medals: `2,002,752`
- Total Kills: `8,539,364`
- Clan Medals: `11,908,775`

### G-S02

Published Snapshot:

- official timestamp: `1405-06-28 24:00`
- 50 members
- Current League Medals: `3,467,069`
- Total Kills: `8,746,252`
- Clan Medals: `12,531,232`

---

## 17. Final operational principle

هر Snapshot را ابتدا به‌عنوان **Evidence collection** ببین، سپس Observation بساز.

هر Observation را ابتدا validate کن، سپس Identity reconciliation انجام بده.

و فقط پس از روشن شدن این دو، وارد Delta / Membership / Publication شو.

**هیچ مرحله‌ای را به‌خاطر سرعت حذف نکن.**
