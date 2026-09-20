# GOLDENCROWN Data Model & Rules

## 1. Identity model

### player_id

`player_id` باید در آینده stable identity key باشد.

اما در G-S01 و G-S02:

- همهٔ permanent player_idها هنوز `null` هستند.
- بنابراین فعلاً Identity Continuity به تصمیم انسانی و Evidence mapping وابسته است.

### snapshot_member_key

فرمت:

`G-SNN-Rxxx`

این کلید:

- Snapshot-local است.
- Identity نیست.
- برای لینک Profile و ارجاع داخلی همان Snapshot مناسب است.
- بین Snapshotها نباید به‌عنوان stable identity استفاده شود.

### rank

Rank فقط جایگاه بازیکن در همان Snapshot است.

**Rank هرگز Identity نیست.**

### display_name

نام فعلی قابل تغییر است.

Rename != New Identity.

دو نام کاملاً مشابه نیز لزوماً یک Identity نیستند.

نمونهٔ حساس Golden:

- G-S01 rank 17 = `ALI`
- G-S01 rank 43 = `ali`

و در G-S02:

- `ALI` در rank 32
- `ali` در rank 41

آن‌ها دو Identity مستقل‌اند.

## 2. Membership

عضویت باید از Identity جدا باشد.

- خروج بازیکن = حذف Identity نیست.
- Current observation نداشتن = Zero current contribution.
- بازگشت بازیکن = همان Identity در صورت match معتبر.
- بازگشت می‌تواند membership interval جدید بسازد.
- Lifetime/Cumulative history نباید با gap پاک شود.

## 3. Period Delta

Period Delta برای یک Identity بر اساس Observation قبلی معتبر تعریف می‌شود.

برای بازیکن جدید:

- Period Delta باید baseline باشد، نه اینکه current total را به‌عنوان earned period جعل کنیم.

برای بازیکن برگشتی با gap:

- period در صورت نبود immediate previous observation باید baseline باشد.
- lifetime/cumulative باید تاریخچهٔ قبلی Identity را حفظ کند.

این دو semantics عمداً یکی نیستند.

## 4. Lifetime/Cumulative

Total Kills و Clan Medals در Golden در طول Identity continuity cumulative/lifetime تلقی می‌شوند.

اما «Current League Medals» مفهوم مستقلی دارد و با league boundary reset می‌شود.

این سه مورد را با هم قاطی نکن:

- Current League Medals
- Period Delta
- Lifetime/Cumulative Total

## 5. G-S01 baseline

G-S01 opening snapshot است.

در G-S01:

- Total Kills = baseline
- Clan Medals = baseline
- Kill Delta = null
- Clan Medal Delta = null
- Current League Medals = مستقل از baseline lifetime است.

G-S01 reference totals:

- Current League Medals: 2,002,752
- Total Kills: 8,539,364
- Clan Medals Total: 11,908,775

## 6. G-S02 totals

G-S02 totals:

- Current League Medals: 3,467,069
- Total Kills: 8,746,252
- Clan Medals Total: 12,531,232

45 identities با نام/continuity معتبر از G-S01 ادامه پیدا کرده‌اند.

5 نام/identity جدید:

- Eren
- حسين
- Mehrad_Persion
- ایرانی باوقار
- تکاور

6 هویت G-S01 که در G-S02 حاضر نیستند:

- Elvin
- SOMMER
- 007
- khoozestan212
- gilacecombat3

## 7. Verified G-S01 → G-S02 continuing-member deltas

برای 45 continuing identities:

- Total Kills Delta: +128,098
- Clan Medals Delta: +1,451,196

این aggregate فقط برای continuing matched identities است و نباید با کل snapshot-to-snapshot sum بدون توضیح یکی تلقی شود.

## 8. Negative totals / negative deltas

قانون clamp یا automatic invalidation برای cumulative decrease به‌صورت رسمی تعریف نشده است.

در آینده اگر مقدار cumulative کاهش پیدا کند:

- حدس نزن.
- آن را silently clamp نکن.
- آن را silently invalidate نکن.
- طبق Authority تصمیم بگیر.

## 9. Last Seen

برای هر current player در آینده این invariant را مدنظر داشته باش:

> active/current player → last_seen_snapshot = current snapshot id

اما قبل از اصلاح historical data، وضعیت واقعی repository را verify کن و mutation را بدون approval انجام نده.

## 10. Profile extras

سه فیلد اصلی Profile در Golden canonical data نگهداری می‌شوند:

- Honor Medals = gold / silver / bronze
- Weapon Levels = 25mm / hydra / hellfire
- Last Online

این‌ها بخش evidence normalization هستند، نه صرفاً تزئین UI.

## 11. Schema caution

GOLDENCROWN schema وجود دارد، اما هنوز نباید هر نیاز جدید را با افزودن field ad hoc حل کرد.

خصوصاً provenance:

- direct observation
- reconstructed observation
- manually confirmed observation

فعلاً structured provenance رسمی و کامل ندارند.

## 12. Historical immutability

Historical source/report را برای یکسان‌سازی یا پاک‌سازی بازنویسی نکن.

اگر correction لازم بود:

- identify exact scope
- record reason
- obtain Authority
- make controlled correction
- preserve evidence trail

## 13. Common Core semantics

Golden از رفتارهای تثبیت‌شده PERSIA برای این semantics استفاده می‌کند:

- Rank snapshot-local
- stable identity by player_id once assigned
- rename continuity
- membership intervals
- period vs cumulative separation
- league-boundary reset for current league medals
- last_seen invariant

اما Golden data/history مستقل باقی می‌ماند.
