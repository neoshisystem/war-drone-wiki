# GOLDENCROWN Continuity Pack

این پوشه «لایهٔ تداوم عامل» برای پروژهٔ مستقل **GOLDENCROWN / WD-C-Golden** است. این اسناد در ریپازیتوری Canonical پروژهٔ PERSIA نگهداری می‌شوند فقط چون Project Authority محل ذخیرهٔ تداوم بین‌مکالمه‌ای را اینجا تعیین کرده است؛ این موضوع به‌هیچ‌وجه به معنی ادغام تاریخچه، هویت، داده یا Canonical Data دو پروژه نیست.

## ترتیب مطالعه برای Agent جدید

### Phase 0 — New Conversation entry point

0. `agent/GOLDEN_CONVERSATION_BOOTSTRAP.md`

### Phase 1 — Identity and current reality

1. `agent/README.md`
2. `agent/GOLDEN_AGENT_MANUAL.md`
3. `agent/GOLDEN_CURRENT_STATE.md`

### Phase 2 — Conversation-derived operating knowledge

4. `agent/GOLDEN_CONVERSATION_KNOWLEDGE.md`
5. `agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md`

### Phase 3 — Data semantics and identity

6. `agent/GOLDEN_DATA_MODEL_AND_RULES.md`
7. `agent/GOLDEN_IDENTITY_FINGERPRINT.md`

### Phase 4 — Workflow and UI

8. `agent/GOLDEN_SNAPSHOT_WORKFLOW.md`
9. `agent/GOLDEN_GITHUB_AND_UI.md`

### Phase 5 — Execution prompts

10. `agent/GOLDEN_PROMPT_PACK.md`

## اصل راهنما

**GitHub truth > continuity documents > conversation memory > assumptions.**

Continuity documents برای انتقال دانش و تصمیم‌های Project Authority هستند؛ current repository state برای Truth عملیاتی استفاده می‌شود.

## Canonical repositories

- Golden: `neoshisystem/WD-C-Golden`
- PERSIA: `neoshisystem/war-drone-wiki`

PERSIA برای Golden reference/template است و continuity pack را میزبانی می‌کند. Golden باید Identity, Snapshot history, Membership history, Evidence و Canonical Data مستقل داشته باشد.

## Snapshot intake is a first-class workflow

Fresh-Agent باید بداند:

`ZIP → Hash → Inventory → Ranking/Profile Classification → Visual Extraction → Cross-check → Normalization → Identity Review → Delta → Validation → Publication`

ZIP خام database آماده انتشار نیست.

## Important learned cases

- official Snapshot timestamp از Project Authority می‌آید؛ filename timestamp فقط evidence timestamp است.
- Screenshot اضافی به‌خودی‌خود Player اضافی نیست.
- Profile extras یعنی Honor Medals / Weapon Levels / Last Online بخشی از evidence normalization هستند.
- Rank هرگز Identity نیست.
- `ALI` و `ali` دو identity مستقل‌اند.
- Reza_Gh در G-S02 دو screenshot پشت‌سرهم اما یک identity است و frame دیرتر با اعداد بالاتر برای canonical value ملاک است.
- PERSIA history و player IDs هرگز به Golden منتقل نمی‌شوند.
- Golden UI باید رفتار و جزئیات PERSIA را تا حد امکان mirror کند، نه اینکه بی‌دلیل redesign شود.

## Current registered Golden state

آخرین state ثبت‌شده در این package:

- Current snapshot: **G-S02**
- Official timestamp: **1405-06-28 24:00**
- G-S02 published/current
- 50 current members
- 45 continuing identities
- 5 new identities
- permanent `player_id` هنوز null
- ALI / ali distinct
- Reza_Gh special ruling recorded

برای current truth همیشه repository Golden و `data/manifest.json` را دوباره verify کن.

## Mutation boundary

این اسناد مجوز mutation نیستند.

Fresh-Agent باید:

1. continuity را بخواند.
2. GitHub reality را verify کند.
3. analysis report بدهد.
4. explicit publication authority را داشته باشد.
5. scoped mutation انجام دهد.
6. post-mutation evidence بدهد.
