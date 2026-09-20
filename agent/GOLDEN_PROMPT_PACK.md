# GOLDENCROWN Fresh-Agent Prompt Pack v2

این Prompt Pack برای Conversation جدید طراحی شده تا Agent بتواند از GitHub continuity به‌صورت مرحله‌ای وارد پروژه شود و دانش عملیاتی منتقل‌شده از Conversationهای قبلی را دوباره از User مطالبه نکند.

## Common preamble

این متن را می‌توان قبل از هر Prompt زیر قرار داد:

> نقش تو: Fresh-Agent / successor agent پروژهٔ GOLDENCROWN.
>
> هیچ دانش inherited یا permission از Conversation قبلی فرض نکن.
>
> ابتدا GitHub را Reality-Check کن.
>
> Repository مستقل Golden:
> `neoshisystem/WD-C-Golden`
>
> Continuity Pack در:
> `neoshisystem/war-drone-wiki/agent/`
>
> قبل از mutation، اسناد continuity را بخوان.
>
> در صورت اختلاف بین Memory و GitHub، ابتدا evidence را verify کن و current GitHub state را مبنای operational truth قرار بده.
>
> UNKNOWN را صریح گزارش کن؛ gap را با حدس پر نکن.

---

# PROMPT 1 — BOOTSTRAP / MENTAL MODEL

نقش تو: Fresh-Agent GOLDENCROWN.

قبل از هر اقدام این فایل‌ها را در همین ترتیب بخوان:

1. `agent/README.md`
2. `agent/GOLDEN_AGENT_MANUAL.md`
3. `agent/GOLDEN_CONVERSATION_KNOWLEDGE.md`
4. `agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md`
5. `agent/GOLDEN_CURRENT_STATE.md`
6. `agent/GOLDEN_DATA_MODEL_AND_RULES.md`
7. `agent/GOLDEN_IDENTITY_FINGERPRINT.md`
8. `agent/GOLDEN_SNAPSHOT_WORKFLOW.md`
9. `agent/GOLDEN_GITHUB_AND_UI.md`
10. `agent/GOLDEN_PROMPT_PACK.md`

سپس در `neoshisystem/WD-C-Golden` این موارد را verify کن:

- main HEAD
- `data/manifest.json`
- current snapshot
- canonical snapshot
- source snapshot
- evidence report
- archive / viewer / profile references

خروجی فقط یک **State Report** باشد:

- Current Golden snapshot
- Current HEAD
- Snapshot totals
- Identity state
- PERSIA/Golden boundary
- Known special rulings
- Pending / UNKNOWN

هیچ mutation انجام نده.

---

# PROMPT 2 — NEW ZIP / SNAPSHOT INTAKE

یک ZIP جدید از Screenshotهای Golden دریافت کرده‌ام.

این ZIP را database آماده انتشار فرض نکن.

چرخه را دقیق اجرا کن:

`ZIP → SHA-256 → Inventory → Evidence Classification → Visual Extraction → Cross-check → Normalization → Validation`

بررسی کن:

1. ZIP SHA-256
2. تعداد فایل‌ها
3. filename inventory
4. resolution consistency
5. ranking/profile split
6. coverage of ranks
7. duplicate / near-duplicate evidence
8. official timestamp provided by Project Authority
9. filename timestamps as evidence-only
10. all canonical fields

Ranking evidence را برای:

- rank
- name
- role
- stage
- current league medals

و Profile evidence را برای:

- name / role cross-check
- total kills
- clan medals total
- honor medals
- weapon levels
- last online

استفاده کن.

هیچ Screenshot اضافی را خودکار به‌عنوان Player جدید حساب نکن.

قبل از publication یک intake report بده.

---

# PROMPT 3 — IDENTITY / FINGERPRINT RECONCILIATION

بین Snapshot جدید و Snapshot قبلی Identity reconciliation انجام بده.

فرآیند:

`Evidence → Technical Review → Fingerprint Comparison → Identity Decision → Canonical Observation`

برای هر candidate این موارد را بررسی کن:

- display_name
- stage
- 25mm
- Hydra
- Hellfire
- Total Kills
- Clan Medals
- Honor Medals
- Role
- Last Online

Rules:

- Rank = never Identity
- Same name != same identity
- Rename != new identity
- Missing != deleted
- Return != automatic match
- ambiguous = STOP
- confirmed_new_identity فقط پس از review
- PERSIA player_id هرگز وارد Golden نشود

موارد خاص را جدا کن:

- `ALI` و `ali` دو Identity مستقل
- Reza_Gh / multiple evidence داخل یک Snapshot را طبق ruling مستندشده تحلیل کن

برای همهٔ cases ambiguous جدول fingerprint بده و قبل از publication unresolved cases را مشخص کن.

---

# PROMPT 4 — DELTA / MEMBERSHIP / PERIOD

بین Snapshot قبلی و جدید این مفاهیم را جداگانه تحلیل کن:

- Rank Movement
- Current League Medals
- Period Delta
- Lifetime/Cumulative
- Membership
- New
- Continuing
- Departed
- Returning

Rules:

- Current League Medals مستقل است.
- Rank snapshot-local است.
- Total Kills و Clan Medals در identity continuity cumulative/lifetime هستند.
- New identity نباید prior contribution ساختگی بگیرد.
- Returning بعد از gap، در صورت نبود immediate previous observation برای period baseline می‌شود.
- Cumulative history across gaps حفظ می‌شود.
- Negative cumulative movement silently clamp یا invalidate نشود.

خروجی:

1. reconciliation table
2. aggregate totals
3. identity transitions
4. anomalies
5. cases requiring Authority

هنوز mutation نکن.

---

# PROMPT 5 — PUBLICATION / MUTATION

تحلیل و Identity mapping تأیید شده و Project Authority اجازهٔ انتشار Snapshot را داده است.

قبل از mutation current main HEAD را دوباره verify کن.

سپس فقط تغییرات scoped و minimal انجام بده:

1. source snapshot
2. canonical snapshot
3. manifest/current pointer
4. evidence report
5. archive
6. leaderboard viewer
7. player profile behavior
8. player directory
9. member history
10. required validation/tests

Historical snapshots را overwrite نکن.

Golden را به PERSIA data وصل نکن.

بعد از mutation گزارش بده:

- commit SHA
- file SHAs
- current_snapshot_id
- totals
- identity summary
- validation result
- Actions result
- Pages deployment result

CI PASS، deployment PASS و content correctness را یک مفهوم فرض نکن.

---

# PROMPT 6 — SESSION-CAP / RECOVERY

این Conversation ممکن است به سقف ظرفیت برسد.

اگر context ناقص شد:

1. از GitHub continuity pack بازیابی کن.
2. ابتدا `agent/README.md` و `agent/GOLDEN_CURRENT_STATE.md` را بخوان.
3. سپس `agent/GOLDEN_CONVERSATION_KNOWLEDGE.md` و `agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md` را بخوان.
4. current Golden main را verify کن.
5. manifest را verify کن.
6. current snapshot را verify کن.
7. UNKNOWNها را explicitly report کن.

هرگز برای پر کردن context gap از حدس استفاده نکن.

Fresh-Agent نباید از User دوباره بخواهد توضیح دهد:

- Golden Snapshot چیست
- Rank چرا Identity نیست
- ALI و ali چرا جدا هستند
- Reza_Gh چرا دو screenshot ولی یک identity دارد
- Profile extras چرا canonical evidence هستند
- official timestamp چرا از filename timestamp جداست
- ZIP چگونه intake می‌شود
- PERSIA چه نقشی دارد
- چرا Golden باید UI PERSIA را mirror کند ولی history مستقل بماند

---

# PROMPT 7 — FINAL RELEASE GATE

پیش از اینکه بگویی Snapshot published / verified است، این checklist را اجرا کن:

- snapshot_id correct
- official timestamp correct
- member_count correct
- ranks unique and contiguous
- all required fields present
- totals recompute correctly
- source/canonical aligned
- manifest aligned
- ALI/ali distinct
- duplicate evidence handled
- no unresolved ambiguity
- new identities intentional
- departed history preserved
- Reza_Gh ruling preserved where applicable
- archive aligned
- viewer aligned
- player routes aligned
- Actions status known
- Pages status known

اگر یکی از این‌ها UNKNOWN است:

**UNKNOWN را گزارش کن؛ PASS را حدس نزن.**
