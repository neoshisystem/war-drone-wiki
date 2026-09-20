# GOLDENCROWN Agent Manual

## 1. هویت پروژه

**GOLDENCROWN** یک پروژهٔ مستقل در کنار PERSIA است:

- Golden repository: `neoshisystem/WD-C-Golden`
- PERSIA repository: `neoshisystem/war-drone-wiki`

Golden از PERSIA برای **معماری، semantics، UI behavior، naming conventions و تجربهٔ تاریخی** الگو می‌گیرد، اما این موارد را مستقل نگه می‌دارد:

- Identity history
- Snapshot history
- Membership history
- Canonical data
- Golden player IDs
- Golden period calculations
- Golden evidence

Golden نباید تاریخچهٔ PERSIA را به‌عنوان تاریخچهٔ خودش وارد کند.

## 2. رابطهٔ Golden و PERSIA

PERSIA = canonical reference/template.

Golden = independent consumer/project.

قاعدهٔ کلیدی:

> «هم‌معنا بودن» مجاز است؛ «هم‌هویت بودن» یا «هم‌تاریخ بودن» مجاز نیست.

برای UI، هدف Golden نزدیک‌ترین clone عملی از Leaderboard فعلی PERSIA است، نه بازطراحی جدید.

مواردی که باید تا حد امکان حفظ شوند:

- کلیک روی نام بازیکن و رفتن به Profile
- دو حالت نمایش Grid
- sorting روی Headerها
- جست‌وجو
- Archive
- Member History
- Player Directory
- Snapshot-aware profile
- Theme behavior
- layout و جزئیات ریز UI

فقط brandingهای وابسته به PERSIA باید به GOLDENCROWN/Golden تبدیل شوند.

## 3. اصل عدم حدس

هر جا Evidence برای تصمیم کافی نیست:

- حدس نزن.
- Rank را به‌عنوان Identity استفاده نکن.
- Name مشابه را به‌عنوان Identity قطعی تلقی نکن.
- Identity ambiguous را منتشر نکن.
- در صورت نیاز Project Authority را درگیر کن.

## 4. Snapshot boundary

هر مجموعه Screenshot با یک تاریخ رسمی به‌عنوان یک Snapshot واحد تحلیل می‌شود.

برای G-S02:

- Snapshot ID: G-S02
- Official timestamp: 1405-06-28 24:00
- 59 تصاویر
- 8 Ranking
- 51 Profile
- 2340×1080

اگر چند Screenshot پشت‌سرهم از یک بازیکن گرفته شده باشد، به‌صورت خودکار به معنی دو بازیکن یا دو Snapshot نیست.

## 5. Evidence داخلی Snapshot

اختلاف کوچک بین دو Screenshot پشت‌سرهم در حالی که بازیکن فعال بوده، به‌طور پیش‌فرض:

- Snapshot جدید نیست.
- Identity جدید نیست.
- خطای داده تلقی نمی‌شود.
- باید به‌عنوان intra-snapshot evidence drift بررسی شود.

در مورد خاص G-S02 / Reza_Gh، کاربر به‌طور صریح تعیین کرده است:

> دو Screenshot = یک بازیکن واحد؛ Evidence دیرتر و با اعداد بالاتر برای مقدار Canonical معتبر است؛ Evidence قبلی برای همان مقدار نادیده گرفته می‌شود.

این یک **local evidence decision** است، نه یک قانون عمومی برای تمام آینده. در موارد مشابه باید Evidence را بررسی و تصمیم Authority را رعایت کرد.

## 6. دادهٔ خام در برابر دادهٔ مشتق‌شده

Raw Observation:

- rank
- display_name
- role
- stage
- current league medals
- total kills
- total clan medals
- honor medals
- weapons
- last online

Derived:

- rank movement
- period deltas
- weekly aggregates
- membership state
- cumulative/lifetime contribution

هیچ مقدار مشتق‌شده‌ای نباید بدون تصمیم روشن جای Raw Evidence بنشیند.

## 7. تاریخ و زمان

تاریخ رسمی Snapshot از Authority/Evidence اعلام‌شده می‌آید.

نام Screenshot فقط Evidence timestamp است.

برای Performance:

- Time semantics بر اساس UTC / league reset تعیین می‌شود.
- متن نمایشی report به‌تنهایی authority نیست.
- مرز League از metadata و reset rule معتبر است، نه صرفاً عنوان HTML.

## 8. وضعیت و کدهای معنایی

از این Vocabulary برای گزارش تداوم استفاده شود:

- CONFIRMED INVARIANT
- INTENTIONAL DESIGN
- KNOWN ISSUE
- LEGACY / COMPATIBILITY
- UNKNOWN
- REQUIRES USER DECISION

«CI PASS» فقط به معنی گذر تست موجود است؛ deployment proof یا logical completeness را ثابت نمی‌کند.

## 9. قانون mutation

Agent تازه وارد باید ابتدا:

1. GitHub را بررسی کند.
2. continuity pack را بخواند.
3. current snapshot را verify کند.
4. data lineage را مشخص کند.
5. گزارش تحلیل را ارائه دهد.

و بعد از تصمیم Authority وارد mutation شود.

## 10. وضعیت G-S02 در زمان ایجاد این Manual

G-S02 قبلاً در Golden منتشر شده و current شده است. این manual برای این ساخته شده که Agent بعدی آن را به‌اشتباه «pending» تشخیص ندهد.

آخرین Golden main commit شناخته‌شده:

`9a91895370050f3b8654e0070038819f80e44c5d`

این commit مربوط به snapshot-aware GOLDENCROWN player profiles است.

## 11. اصل تاریخی

Raw historical evidence و گزارش‌های قبلی را برای «تمیز کردن» بازنویسی نکن.

اصلاحات تاریخی باید به شکل controlled correction و با تصمیم Authority انجام شوند.

## 12. ابزارها

در حال حاضر **Identity Fingerprint Engine خودکار** در معماری Golden وجود ندارد.

Fingerprint یک workflow تحلیلی است، نه یک موتور inference:

Screenshot/Profile Evidence
→ Technical Review
→ Fingerprint Comparison
→ Identity Decision
→ player_id / snapshot_member_key
→ Canonical Observation

جزئیات در `agent/GOLDEN_IDENTITY_FINGERPRINT.md` آمده است.
