# PERSIA Identity Fingerprint Rules

**Status: CANONICAL PROJECT RULES**

این سند روش استاندارد و تکرارپذیر تطبیق هویت بازیکنان بین Snapshotها را تعریف می‌کند.

## 1. Fingerprint واقعی چیست؟

Fingerprint اصلی بازیکن از این شش مقدار ساخته می‌شود:

1. Player Stage / Level
2. Total Kills
3. Clan Medals Total
4. 25mm weapon level
5. Hydra-70 weapon level
6. Hellfire weapon level

`display_name` فقط یک سیگنال کمکی است و هرگز به‌تنهایی هویت نیست.

### فیلدهایی که نباید به‌عنوان Fingerprint اصلی استفاده شوند

- Rank — در هر Snapshot محلی است.
- League Medals — با شروع League جدید reset می‌شود.
- Last Online — با زمان تغییر می‌کند و ذاتاً identity-stable نیست.
- Honor medals — فقط سیگنال کمکی/تأییدی است، نه ستون اصلی تصمیم.

## 2. قانون Monotonicity

در یک identity واحد:

- Stage نباید کاهش پیدا کند.
- Total Kills نباید کاهش پیدا کند.
- هر سه Weapon Level (**25mm / Hydra / Hellfire**) همیشه فقط افزایش یا ثابت می‌مانند و **هرگز کاهش پیدا نمی‌کنند**.
- Clan Medals Total در یک membership پیوسته نباید کاهش پیدا کند.

بنابراین هر کاهش در Stage، Total Kills یا هر Weapon Level یک **identity/membership contradiction** است و نباید با حدس نادیده گرفته شود.

کاهش Clan Medals Total نیز باید به‌عنوان هشدار جدی بررسی شود؛ اگر player از clan خارج شده و بعد برگشته باشد، reset/rebaseline عضویت می‌تواند توضیح‌دهنده کاهش باشد. در این حالت بدون بررسی membership history نباید identity جدید یا قدیمی فرض شود.

## 3. ترتیب تصمیم‌گیری

### مرحله A — player_id

اگر identity قبلاً با `player_id` قطعی شناخته شده است، همان identity مرجع است.

### مرحله B — Fingerprint

اگر `player_id` در ورودی نیست، Snapshot جدید با آخرین observation معتبر identityهای همان clan مقایسه می‌شود.

ترتیب اهمیت:

1. Stage
2. Total Kills
3. Clan Medals Total
4. 25mm
5. Hydra
6. Hellfire
7. Display name به‌عنوان تأیید کمکی

هدف، پیدا کردن **ترکیب چندبعدی سازگار** است، نه نزدیک‌ترین نام یا نزدیک‌ترین یک عدد.

### مرحله C — Monotonicity filter

هر candidate که بدون توضیح معتبر یکی از مقادیر غیرقابل‌کاهش را پایین ببرد، candidate معتبر محسوب نمی‌شود.

### مرحله D — تصمیم

فقط سه خروجی مجاز است:

- **SAME IDENTITY** — شواهد fingerprint به‌طور قوی به یک identity موجود وصل می‌شود.
- **NEW / UNMATCHED PROJECT IDENTITY** — هیچ identity موجود با fingerprint سازگار وجود ندارد؛ نباید به identity قدیمی merge شود.
- **AMBIGUOUS / HUMAN REVIEW** — دو یا چند identity واقعاً قابل‌دفاع باقی مانده‌اند.

اگر ambiguity واقعی باقی ماند، باید متوقف شد و Project Authority تصمیم بدهد. حدس زدن ممنوع است.

## 4. معنی 99% confidence

عبارت‌هایی مثل «99% same» در گزارش‌ها **confidence تصمیم بر اساس شواهد موجود** هستند، نه احتمال آماری محاسبه‌شده.

وقتی fingerprint چندبعدی، monotonicity و history یک identity را به‌طور قوی پشتیبانی کنند، می‌توان گفت:

> بیش از 99% confidence برای SAME IDENTITY

وقتی هیچ candidate معتبر وجود نداشته باشد:

> بیش از 99% confidence برای عدم اتصال به identityهای قبلی

اما این عبارت دوم ثابت نمی‌کند که اکانت بازی حتماً تازه ساخته شده؛ فقط ثابت می‌کند که در محدوده Snapshotهای مورد بررسی نباید به identity قبلی لینک شود.

## 5. Rename

تغییر نام بازیکن identity جدید ایجاد نمی‌کند.

نمونه‌های تأییدشده:

- `Dadashi` → `👑Dadashi👑`
- `جهانبانی 1370` → `1370 جهانبانی`

اگر fingerprint سازگار است، همان `player_id` حفظ می‌شود.

## 6. Cross-clan isolation

PERSIA و GOLDENCROWN باید از نظر داده و identity مستقل باشند.

برای Snapshot مربوط به PERSIA:

- فقط history/identityهای PERSIA برای تطبیق استفاده شوند.
- identityهای GOLDENCROWN نباید وارد candidate set شوند.

برای GOLDENCROWN نیز برعکس.

جابجایی بازیکن بین clanها نباید باعث merge خودکار datasetها شود. هر ارتباط بین دو clan نیازمند تصمیم/مدرک صریح Project Authority است.

## 7. S10 verification test

Fingerprint روی داده مرجع S09 و استخراج S10 آزمایش شد:

- S09 = 46 identity
- S10 = 30 player profile
- 28 مورد با fingerprint چندبعدی و monotonicity به identity موجود متصل شدند.
- `ali` به identity قدیمی `PERSIA-P-0028` متصل نشد.
  - Clan Medals Total قدیمی: 163,515
  - S10: 16,327
  - این کاهش با membership پیوسته سازگار نیست و fingerprint کلی نیز match قابل‌قبولی نداشت.
- `kaveh.2` نیز با هیچ identity S09 تطبیق قابل‌دفاعی نداشت و نباید به `kaveh` قدیمی merge شود.
- مورد 50/50 باقی نماند.

نتیجه عملی این تست: **28 SAME + 2 NEW/UNMATCHED PROJECT IDENTITY، بدون ambiguity.**

## 8. Last Online

`last_online_display` باید در هر Snapshot استخراج و ذخیره شود، اما **جزء Fingerprint identity نیست**.

دلیل: مقدار آن تابع زمان مشاهده است و برای یک identity ثابت می‌تواند از `<1m` تا ساعت‌ها/روزها تغییر کند.

بنابراین:

- capture شود؛
- مقدار raw همان‌طور که در بازی دیده شده حفظ شود؛
- برای گزارش/نمایش قابل استفاده است؛
- برای رد یا قبول identity به‌تنهایی استفاده نشود.

## 9. ممنوع‌ها

- تطبیق فقط بر اساس نام ممنوع.
- تطبیق فقط بر اساس Rank ممنوع.
- استفاده از League Medals به‌عنوان identity anchor ممنوع.
- نادیده گرفتن کاهش Weapon Level ممنوع.
- merge خودکار دو identity ممنوع.
- حدس زدن مورد ambiguous ممنوع.
- بازنویسی identity تاریخی برای جور شدن Snapshot جدید ممنوع.

## 10. Rule of thumb برای Agent بعدی

اگر Snapshot جدید رسید، Agent باید اول همین سند را بخواند.

سپس:

1. همه profileها را کامل استخراج کند.
2. شش فیلد اصلی Fingerprint را با آخرین observation معتبر مقایسه کند.
3. monotonicity را کنترل کند.
4. Rank و League Medals را از identity matching کنار بگذارد.
5. Last Online را استخراج کند ولی وارد Fingerprint اصلی نکند.
6. rename را identity جدید حساب نکند.
7. cross-clan data را وارد candidate set نکند.
8. فقط در ambiguity واقعی از Project Authority سؤال کند.
9. قبل از ingest هیچ identity mapping را حدسی ثبت نکند.

این سند مرجع روش است؛ برای Snapshot بعدی لازم نیست Fingerprint methodology از صفر طراحی شود.
