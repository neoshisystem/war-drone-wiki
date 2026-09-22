# Snapshot Extraction Fields

**Status: CANONICAL EXTRACTION CHECKLIST**

هر profile در Snapshot باید تا حد امکان از روی Screenshot/Source به‌صورت کامل استخراج شود.

## Required player fields

- `display_name`
- `rank`
- `stage`
- `league_medals`
- `clan_medals` — Clan Medals Total
- `honor_medals.gold`
- `honor_medals.silver`
- `honor_medals.bronze`
- `total_kills`
- `weapons.25mm`
- `weapons.hydra`
- `weapons.hellfire`
- `last_online_display`

## Identity/Fingerprint fields

برای fingerprint اصلی:

- Stage
- Total Kills
- Clan Medals Total
- 25mm
- Hydra
- Hellfire

برای تأیید کمکی:

- Display Name
- Honor Medals

برای identity matching استفاده نشود:

- Rank
- League Medals
- Last Online

## Last Online — mandatory capture

`Last Online` یک فیلد فراموش‌شدنی نیست و باید از هر profile card استخراج شود.

مقدار باید تا حد امکان **raw** و مطابق متن/نمایش بازی ثبت شود، مثلاً:

- `<1m`
- `3m`
- `1h`
- `2d`

تبدیل یا تفسیر این مقدار برای identity matching لازم نیست.

## Leaderboard vs Profile

از Leaderboard معمولاً می‌توان گرفت:

- Rank
- Display Name
- Role
- Stage
- League Medals

از Profile Card معمولاً باید گرفت:

- Total Kills
- Clan Medals Total
- Honor Medals
- Stage
- Weapon Levels
- Last Online

اگر یک فیلد در یکی از منابع دیده نمی‌شود، نباید مقدار آن حدس زده شود؛ profile/screenshot مربوطه باید بررسی شود یا مورد به‌عنوان missing evidence ثبت شود.

## Extraction completeness rule

قبل از ingest باید بررسی شود:

- آیا تمام leaderboard rows دیده شده‌اند؟
- آیا برای تمام identityهای مورد نیاز profile card موجود است؟
- آیا هیچ profile duplicate یا unreadable وجود ندارد؟
- آیا Last Online برای profileهای قابل‌خواندن ثبت شده است؟
- آیا شش فیلد Fingerprint کامل هستند؟

اگر یکی از فیلدهای اصلی Fingerprint missing باشد، identity mapping قطعی نباید بر اساس حدس انجام شود.

## Important distinction

- `league_medals` = current league/week value؛ reset می‌شود.
- `clan_medals` = Clan Medals Total؛ cumulative است.
- `total_kills` = lifetime/cumulative.
- `last_online_display` = زمان نسبی مشاهده‌شده در بازی؛ identity anchor نیست.

این distinction باید در تمام Snapshotهای آینده حفظ شود.
