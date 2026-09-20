# GOLDENCROWN Fresh-Agent Prompt Pack

این Promptها برای آغاز یک Conversation جدید طراحی شده‌اند. لازم نیست همه را یک‌جا ارسال کنی. بسته به مرحلهٔ کار، یکی را بفرست.

---

## PROMPT 1 — Bootstrap / Read the Model

نقش تو در این مکالمه: Fresh-Agent پروژهٔ GOLDENCROWN.

پیش از هر اقدام:
1. از GitHub repository مربوط به Golden یعنی `neoshisystem/WD-C-Golden` وضعیت واقعی main را بررسی کن.
2. سپس در همین repository این فایل‌ها را در PERSIA repository بخوان:
   - `agent/README.md`
   - `agent/GOLDEN_AGENT_MANUAL.md`
   - `agent/GOLDEN_CURRENT_STATE.md`
   - `agent/GOLDEN_DATA_MODEL_AND_RULES.md`
   - `agent/GOLDEN_IDENTITY_FINGERPRINT.md`
   - `agent/GOLDEN_SNAPSHOT_WORKFLOW.md`
   - `agent/GOLDEN_GITHUB_AND_UI.md`
3. هیچ چیزی را بر اساس حافظه یا حدس تکمیل نکن.
4. بعد از خواندن، فقط یک State Report بده:
   - current snapshot
   - repository HEAD
   - identity state
   - known boundaries
   - pending/unknown items
5. قبل از آن هیچ mutation انجام نده.

---

## PROMPT 2 — Golden vs PERSIA Boundary

می‌خواهم روی GOLDENCROWN کار کنیم.

این قوانین را رعایت کن:
- PERSIA فقط reference/template است.
- Golden history, identity, snapshot data و player_id مستقل است.
- هیچ PERSIA player_id را به Golden منتقل نکن.
- هیچ PERSIA period را در Golden archive وارد نکن.
- UI behavior را تا حد امکان از PERSIA mirror کن.
- redesign نکن مگر اینکه صریحاً بخواهم.

ابتدا فایل‌های مرتبط Golden و reference PERSIA را بخوان و بگو دقیقاً چه چیزی shared semantic است و چه چیزی project-specific است.
هیچ تغییر GitHubی بدون approval انجام نده.

---

## PROMPT 3 — Snapshot Intake

Snapshot جدید را دریافت کرده‌ام.

قبل از publication:
1. ZIP SHA-256
2. image inventory
3. ranking/profile split
4. duplicate/near-duplicate evidence
5. official timestamp
6. full normalized fields
7. totals
8. G-S(previous) continuity
9. new/departed/returning identities
10. rename cases
11. ALI/ali and other ambiguous identities
12. intra-snapshot duplicate evidence

را بررسی کن.

هر جا ambiguity هست STOP کن.
Rank را Identity ندان.
تا قبل از approval هیچ Canonical Data را تغییر نده.

---

## PROMPT 4 — Fingerprint / Identity Review

می‌خواهم Identity reconciliation یک Snapshot را انجام دهی.

برای هر candidate:
- نام
- Stage
- 25mm
- Hydra
- Hellfire
- Total Kills
- Clan Medals
- Honor Medals
- Role
- Last Online

را مقایسه کن.

Rules:
- Rank = never Identity
- Rename != New Identity
- Same name != Same Identity
- Missing player != Deleted Identity
- Returning player = same identity only if evidence supports it
- ambiguous identity = DO NOT GUESS
- confirmed_new_identity فقط برای واقعاً new identity

برای cases مهم یک fingerprint table بساز و قبل از publication موارد ambiguous را جدا کن.

---

## PROMPT 5 — Delta / Membership Review

بین Snapshot قبلی و جدید:

- Period Delta
- Lifetime/Cumulative
- Current League Medals
- Membership
- rank movement

را جداگانه محاسبه کن.

Rules:
- Current League Medals مستقل است.
- Rank movement snapshot-local است.
- New identity از current total به‌عنوان period earned شروع نمی‌شود مگر semantics صریح اجازه دهد.
- Return after membership gap = period baseline where immediate previous observation is absent.
- Cumulative history across gaps preserved.
- Negative cumulative movement را silently clamp نکن.

بعد یک reconciliation table بده و فقط موارد نیازمند تصمیم Authority را علامت بزن.

---

## PROMPT 6 — GitHub Publication

با فرض اینکه تحلیل و Identity mapping تایید شده است:

1. current main HEAD را دوباره verify کن.
2. تغییرات موردنیاز را minimal و scoped نگه دار.
3. source snapshot را ثبت کن.
4. canonical snapshot را ثبت کن.
5. manifest/current snapshot را update کن.
6. archive/viewer/profile/member-history references را update کن.
7. evidence report را ثبت کن.
8. validation/test را اجرا کن.
9. GitHub SHAهای نهایی را گزارش کن.
10. CI و Pages deployment را جداگانه report کن.

تاریخچهٔ قبلی را overwrite نکن.
هیچ PERSIA data را وارد Golden نکن.

---

## PROMPT 7 — Recovery / UNKNOWN First

این مکالمه ممکن است به سقف ظرفیت برسد.

اگر بخشی از وضعیت را نمی‌دانی:
- UNKNOWN را صریح بنویس.
- از GitHub evidence بازیابی کن.
- از continuity pack استفاده کن.
- از حدس برای پر کردن gap استفاده نکن.

اگر بین conversation memory و GitHub اختلاف بود:
**GitHub current state را authority قرار بده.**

اگر data یا identity ambiguity باقی ماند:
mutation نکن و سؤال/گزارش لازم را بده.

---

## PROMPT 8 — Final Verification

قبل از اینکه بگویی Snapshot «published/verified» است:

- snapshot_id درست؟
- official timestamp درست؟
- 1..N ranks unique؟
- member count درست؟
- sums درست؟
- all required fields موجود؟
- ALI/ali distinct؟
- new identities intentionally new؟
- departures plausible و historical preservation برقرار؟
- no ambiguity unresolved؟
- source/canonical/manifest aligned؟
- archive aligned؟
- viewer aligned؟
- profile routes aligned؟
- CI result known؟
- deployment result known؟

اگر یکی از این‌ها UNKNOWN است، آن را UNKNOWN گزارش کن؛ PASS را حدس نزن.
