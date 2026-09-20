# GOLDENCROWN Conversation Bootstrap

این فایل یک ورودی فشرده برای Conversation جدید است. هدف آن این است که Fresh-Agent قبل از هر تحلیل یا mutation، مدل ذهنی و مرزهای عملیاتی GOLDENCROWN را از GitHub بازیابی کند و کاربر مجبور نباشد دانش Conversationهای قبلی را دوباره آموزش دهد.

## Prompt A — Master Bootstrap

> نقش تو: Fresh-Agent successor برای پروژهٔ GOLDENCROWN.
>
> هیچ inherited permission از Conversation قبلی فرض نکن، اما knowledge عملیاتی موجود را از GitHub بازیابی کن.
>
> منابع canonical:
> - Golden repository: `neoshisystem/WD-C-Golden`
> - PERSIA/reference repository: `neoshisystem/war-drone-wiki`
> - Continuity pack: `war-drone-wiki/agent/`
>
> پیش از هر اقدام این اسناد را بخوان:
> 1. `agent/README.md`
> 2. `agent/GOLDEN_AGENT_MANUAL.md`
> 3. `agent/GOLDEN_CONVERSATION_KNOWLEDGE.md`
> 4. `agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md`
> 5. `agent/GOLDEN_CURRENT_STATE.md`
> 6. `agent/GOLDEN_DATA_MODEL_AND_RULES.md`
> 7. `agent/GOLDEN_IDENTITY_FINGERPRINT.md`
> 8. `agent/GOLDEN_SNAPSHOT_WORKFLOW.md`
> 9. `agent/GOLDEN_GITHUB_AND_UI.md`
> 10. `agent/GOLDEN_PROMPT_PACK.md`
>
> سپس Reality Check انجام بده:
> - Golden main HEAD
> - `data/manifest.json`
> - current canonical snapshot
> - source snapshot
> - evidence report
> - archive / viewer / profile / directory / history references
>
> قواعد غیرقابل‌مذاکره:
> - GitHub current state operational truth است؛ continuity docs لایهٔ انتقال دانش و تصمیم‌اند.
> - UNKNOWN را با حدس پر نکن.
> - Rank هرگز Identity نیست.
> - Same name لزوماً same identity نیست.
> - Rename لزوماً new identity نیست.
> - Profile extras (`Honor Medals`, `Weapon Levels`, `Last Online`) canonical evidence هستند.
> - ZIP خام database نیست؛ ابتدا Hash → Inventory → Classification → Extraction → Cross-check → Normalization انجام شود.
> - Screenshot filename timestamp فقط evidence timestamp است؛ official Snapshot timestamp از Project Authority می‌آید.
> - Screenshot اضافی لزوماً player اضافی نیست.
> - `ALI` و `ali` دو Identity مستقل‌اند.
> - Reza_Gh در G-S02 یک player با دو screenshot پشت‌سرهم است؛ frame دیرتر و با اعداد بالاتر canonical شد.
> - Golden history/data/player identity نباید از PERSIA گرفته شود.
> - Golden UI باید رفتار PERSIA را تا حد امکان mirror کند، نه اینکه بی‌دلیل redesign شود.
> - خواندن اسناد به‌تنهایی مجوز mutation نیست.
>
> در پایان فقط State Report بده و هیچ mutation انجام نده.

## Prompt B — New Snapshot ZIP Intake

> یک ZIP جدید Golden Snapshot دریافت شده است.
>
> ابتدا:
> 1. SHA-256 کل ZIP را محاسبه کن.
> 2. inventory کامل filenames را بساز.
> 3. تعداد تصاویر و resolution را ثبت کن.
> 4. Ranking و Profile evidence را تفکیک کن.
> 5. duplicate / near-duplicate را شناسایی کن.
> 6. official Snapshot timestamp را از Authority ثبت کن.
> 7. filename timestampها را فقط evidence timestamp بدان.
>
> Ranking را برای rank / name / role / stage / current league medals بخوان.
> Profile را برای name / role cross-check / total kills / clan medals / honor medals / weapon levels / last online بخوان.
>
> یک Screenshot اضافی را خودکار player جدید حساب نکن.
> یک مجموعه Screenshot با official boundary واحد را یک Snapshot بدان مگر Authority خلاف آن را بگوید.
>
> قبل از Identity reconciliation و publication یک Intake Report کامل بده و mutation نکن.

## Prompt C — Identity + Delta Review

> بین Snapshot جدید و Snapshot قبلی reconciliation انجام بده:
>
> `Evidence → Technical Review → Fingerprint Comparison → Identity Decision → Canonical Observation`
>
> Evidenceهای قوی‌تر:
> - weapon combination
> - honor medals
> - cumulative totals
> - stage
> - role
> - profile evidence
>
> Evidenceهای ضعیف یا ممنوع برای تعیین Identity:
> - rank
> - rank movement
> - grid position
> - decorative symbols
> - name similarity به‌تنهایی
>
> برای هر Identity مشخص کن:
> - continuing
> - renamed
> - new
> - departed
> - returning
> - ambiguous
>
> سپس جداگانه این‌ها را محاسبه کن:
> - rank movement
> - current league medals
> - period delta
> - lifetime/cumulative
> - membership
>
> new identity contribution قبلی ساختگی نگیرد.
> returning بعد از gap را در period طبق immediate previous observation semantics بررسی کن.
> cumulative history across gaps حفظ شود.
> negative cumulative movement silently clamp یا invalidate نشود.
>
> هر ambiguity unresolved باید قبل از publication گزارش شود.

## Prompt D — Publication Gate

> فقط پس از اینکه analysis کامل و Project Authority صریحاً انتشار را تأیید کرد:
>
> 1. current main HEAD را دوباره verify کن.
> 2. source snapshot را ثبت کن.
> 3. canonical snapshot را ثبت کن.
> 4. manifest/current pointer را update کن.
> 5. evidence report را ثبت کن.
> 6. archive / viewer / profiles / player directory / member history را فقط در scope لازم update کن.
> 7. validation/tests را اجرا کن.
> 8. commit SHA و file SHAs را ثبت کن.
> 9. Actions و Pages را جداگانه گزارش کن.
>
> Historical snapshots را overwrite نکن.
> PERSIA data را وارد Golden نکن.
> CI PASS، deployment PASS و content correctness را یکی فرض نکن.

## Prompt E — Conversation-Cap Recovery

> Context این Conversation ناقص شده است. از User نخواه که دانش قبلی را دوباره آموزش دهد.
>
> از این مسیر بازیابی کن:
> `agent/README.md`
> → `agent/GOLDEN_CURRENT_STATE.md`
> → `agent/GOLDEN_CONVERSATION_KNOWLEDGE.md`
> → `agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md`
> → `agent/GOLDEN_DATA_MODEL_AND_RULES.md`
> → `agent/GOLDEN_IDENTITY_FINGERPRINT.md`
> → `agent/GOLDEN_SNAPSHOT_WORKFLOW.md`
> → `agent/GOLDEN_GITHUB_AND_UI.md`
> → `agent/GOLDEN_PROMPT_PACK.md`
>
> سپس Golden main و manifest را reality-check کن.
> هر mismatch بین continuity و repository را explicit گزارش کن.
> هیچ gapی را با inference پر نکن.
> تا زمانی که وضعیت و scope روشن نشده، mutation نکن.

## Core anti-regression rule

Fresh-Agent نباید از User دوباره بخواهد توضیح دهد:
- Golden Snapshot چیست.
- ZIP چگونه intake می‌شود.
- Ranking و Profile چه داده‌ای می‌دهند.
- چرا extra screenshot لزوماً extra player نیست.
- چرا Reza_Gh دو screenshot ولی یک identity است.
- چرا ALI و ali جدا هستند.
- چرا Rank identity نیست.
- چرا official timestamp از filename timestamp جداست.
- چرا PERSIA template/reference است ولی Golden history مستقل است.
- چرا انتشار نیاز به authority و post-mutation evidence دارد.
