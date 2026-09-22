# Identity Fingerprint & Snapshot Rules

این پوشه مرجع دائمی قواعد بررسی هویت بازیکنان و استخراج Snapshot است.

## هدف

کانورسیشن/Agent بعدی نباید برای هر Snapshot قواعد Fingerprint را از نو طراحی یا دوباره تفسیر کند. این اسناد، روش استاندارد پروژه را ثبت می‌کنند.

### اسناد

- `FINGERPRINT_RULES.md` — قواعد قطعی تطبیق هویت.
- `SNAPSHOT_FIELDS.md` — فهرست فیلدهای اجباری در استخراج هر Snapshot.

## وضعیت

این قواعد بر اساس بررسی عملی S09 → S10 در PERSIA تثبیت شده‌اند.

آزمایش مرجع:
- S09: 46 identity
- S10: 30 profile
- نتیجه: 28 تطبیق پیوسته، 2 مورد بدون تطبیق قابل قبول در S09 (`ali` و `kaveh.2`)
- مورد 50/50 باقی نماند.

این نتیجه مربوط به **identity matching پروژه** است؛ «new/unmatched» برای `kaveh.2` و `ali` به معنی اثبات قطعیِ جدید بودن خود اکانت بازی نیست، بلکه یعنی نباید به هیچ identity موجود در S09 لینک شوند.

## اصل مهم

این مستندات روش **manual, evidence-based fingerprinting** را استاندارد می‌کنند؛ موتور خودکار identity merge ایجاد نمی‌شود مگر با تأیید صریح Project Authority.
