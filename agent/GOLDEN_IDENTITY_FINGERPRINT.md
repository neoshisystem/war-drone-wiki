# GOLDENCROWN Identity Fingerprint Manual

## 1. Fingerprint چیست؟

Fingerprint در این پروژه یک **مجموعهٔ Evidence برای کمک به تطبیق Identity** است، نه یک ID و نه یک موتور خودکار.

ساختار عملی:

**Screenshot/Profile Evidence → Technical Review → Fingerprint Comparison → Identity Decision → Canonical Observation**

در حال حاضر هیچ automatic fingerprint engine در Golden وجود ندارد.

## 2. چه چیزهایی برای Fingerprint مفیدند؟

ویژگی‌ها را با اولویت Evidence بررسی کن:

### Strong / high-value clues

- ترکیب Weapon Levels:
  - 25mm
  - Hydra
  - Hellfire
- Honor Medals:
  - gold
  - silver
  - bronze
- Total Kills
- Clan Medals Total
- Stage / Level
- Role
- profile layout / unique visual cues
- Last Online به‌عنوان context زمانی

### Weak / dangerous clues

- Rank
- جایگاه در leaderboard
- صرفاً اسم مشابه
- پرچم یا decorative symbol
- موقعیت تقریبی در Grid

Rank فقط snapshot-local است.

## 3. قانون Rename

اگر Evidence فنی نشان دهد که همان بازیکن با نام جدید دیده شده:

Rename != New Identity.

Name history در مدل، به‌تنهایی Identity key نیست.

## 4. Duplicate names

اسم یکسان می‌تواند متعلق به چند Identity باشد.

نمونهٔ Golden:

- ALI
- ali

این دو نباید به‌خاطر similarity یکی شوند.

در صورت multiple candidates:

**AMBIGUOUS → STOP → Project Authority**

## 5. New identity

`confirmed_new_identity=true` فقط برای هویتی است که بعد از review روشن است واقعاً جدید است.

این flag جایگزین identity uncertainty نیست.

## 6. Returning player

Player missing in intermediate Snapshot:

- حذف Identity نمی‌شود.
- Historical cumulative state حفظ می‌شود.
- در بازگشت، همان player_id در صورت match قطعی ادامه پیدا می‌کند.
- Period بعد از gap طبق semantics baseline می‌شود، ولی Lifetime history حفظ می‌شود.

## 7. Reza_Gh / G-S02 special ruling

در G-S02 دو Profile Screenshot پشت‌سرهم برای:

**Reza_Gh**

گرفته شده بود.

Authority ruling:

- دو Screenshot = یک Identity
- دو بازیکن جدا نیستند.
- آخرین Screenshot که اعداد بالاتری را نشان می‌دهد، برای مقدار Canonical ملاک است.
- Screenshot قبلی برای همان مقدار نادیده گرفته می‌شود.
- هر دو تصویر فقط Evidenceهای متوالی داخل G-S02 هستند.

Canonical G-S02 result:

- rank 33
- Clan Medals = 325,411
- Clan Medal Delta = 14,600
- Total Kills = 83,027
- Current League Medals = 45,629

## 8. ALI / ali invariant

در G-S01:

- ALI = rank 17
- ali = rank 43

در G-S02:

- ALI = rank 32
- ali = rank 41

این جابه‌جایی Rank هیچ‌گاه نباید باعث merge شود.

## 9. Fingerprint worksheet

برای هر ambiguous/interesting case این جدول ذهنی را بساز:

| Evidence | Previous candidate | Current candidate | Result |
|---|---|---|---|
| Name | ... | ... | unchanged/rename/new |
| Stage | ... | ... | consistent/change |
| 25mm | ... | ... | consistent/change |
| Hydra | ... | ... | consistent/change |
| Hellfire | ... | ... | consistent/change |
| Kills | ... | ... | consistent/change |
| Clan Medals | ... | ... | consistent/change |
| Honor | ... | ... | consistent/change |
| Role | ... | ... | context |
| Last Online | ... | ... | temporal context |

## 10. What must never happen

- Rank-based identity assignment
- Guessing a match because the name looks similar
- Treating identical display names as one identity
- Creating a new identity to avoid ambiguity
- Reusing another project's player_id
- Rewriting historical Identity assignments silently

## 11. Provenance limitation

Golden currently stores final normalized mapping much better than it stores a formal machine-readable explanation of *why* the mapping was chosen.

بنابراین اگر case حساس است، در Evidence Report یا continuity note دلیل human-reviewed match را ثبت کن؛ اما schema جدید provenance را بدون Authority اضافه نکن.

## 12. Screenshot evidence

Raw G-S02 ZIP is not the ordinary canonical data store. برای workday operations از:

- `data/snapshots/G-S02.json`
- `data/canonical/G-S02.json`
- `docs/G-S02_EVIDENCE_REPORT.md`

استفاده کن.

اگر یک dispute یا forensic review واقعاً به تصویر اصلی نیاز دارد، ZIP اصلی باید دوباره در دسترس قرار گیرد.

## 13. Decision principle

Fingerprint does not produce truth automatically.

It produces a **reasoned evidence basis** for a Project Authority identity decision.
