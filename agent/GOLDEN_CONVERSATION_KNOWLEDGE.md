# GOLDENCROWN Conversation-Derived Project Knowledge

## Purpose

این سند تصمیم‌ها و آموخته‌های مهمی را ثبت می‌کند که در طول Conversationهای واقعی Project Authority شکل گرفته‌اند و ممکن است در کد یا schema به‌تنهایی قابل کشف نباشند.

این سند باید همراه با `GOLDEN_AGENT_MANUAL.md` و `GOLDEN_SNAPSHOT_WORKFLOW.md` خوانده شود.

---

## 1. Project Authority intent

هدف Golden فقط ساخت یک leaderboard ساده نیست.

هدف، ساخت یک **Snapshot-based historical system** است که بتواند:

- Screenshot evidence را دریافت کند.
- یک Snapshot منسجم بسازد.
- Identity continuity را حفظ کند.
- Membership را مستقل از Identity نگه دارد.
- Current League Medals را از cumulative metrics جدا کند.
- Deltaهای معتبر محاسبه کند.
- UI کامل Leaderboard / Profile / Archive / History ارائه دهد.

Fresh-Agent نباید کار را صرفاً به «ثبت جدول 50 نفره» تقلیل دهد.

---

## 2. Golden vs PERSIA

PERSIA برای Golden یک **reference/template** است.

Golden باید از PERSIA در این موارد الگو بگیرد:

- architecture semantics
- UI behavior
- interaction details
- page structure
- proven calculation semantics

اما موارد زیر مستقل‌اند:

- Identity
- player history
- Snapshot data
- Membership history
- player_id
- Evidence
- Golden archive
- Golden period results

قاعده:

> Shared semantics are allowed; shared historical identity is not.

---

## 3. Golden UI requirement

Golden ابتدا نباید بازطراحی شود.

هدف:

> **near-exact practical clone of the PERSIA Leaderboard UI**

مواردی که باید حفظ شوند:

- click-through player name
- player profile page
- sorting
- search
- two grid modes
- Archive
- Member History
- Player Directory
- snapshot-aware profile behavior
- theme behavior
- fine-grained UI details

فقط branding و project-specific references باید از PERSIA به GOLDENCROWN تبدیل شوند.

---

## 4. Public repository / secrecy boundary

Golden repository توسط Project Authority Public شده است.

این پروژه **research/project data** است و قرار نیست با فرض «hidden implementation» طراحی شود.

در وضعیت فعلی:

- API key / secret برای Golden مطرح نیست.
- HTML/JS copyability یک threat model ممنوع محسوب نمی‌شود.
- انرژی پروژه باید صرف correctness و continuity شود، نه secrecy بی‌مورد.

---

## 5. Snapshot intake is a learned operational skill

Agent جدید باید بداند وقتی User یک ZIP می‌فرستد:

> ZIP = raw evidence package

نه:

> ZIP = ready-to-publish database

چرخه:

`ZIP → Hash → Inventory → Ranking/Profile Classification → Visual Extraction → Cross-check → Normalization → Identity Review → Delta → Validation → Publication`

---

## 6. Ranking vs Profile extraction

در عمل دو Evidence source وجود دارد.

### Ranking

برای:

- rank
- name
- role
- stage / level
- current league medals

### Profile

برای:

- name / role cross-check
- total kills
- clan medals total
- honor medals
- weapon levels
- last online

این division of evidence باید حفظ شود مگر source format در آینده تغییر کند.

---

## 7. Profile extras are canonical evidence

سه فیلد زیر فقط decorative UI نیستند:

- Honor Medals
- Weapon Levels
- Last Online

در Golden canonical normalized snapshot وجود دارند و باید در ingestion آینده نیز extraction شوند.

---

## 8. Official timestamp rule

Official Snapshot timestamp را User/Project Authority تعیین می‌کند.

Screenshot filename timestamp فقط Evidence timestamp است.

مثلاً G-S02:

- official: `1405-06-28 24:00`

حتی اگر Screenshotها در چند دقیقه قبل/بعد از آن گرفته شده باشند.

---

## 9. G-S02 duplicate evidence learning

Reza_Gh یک case آموزشی مهم است.

دو Profile screenshot پشت‌سرهم:

- یک Player
- یک Snapshot
- نه دو Player
- نه Snapshot دوم

Project Authority تصمیم گرفت:

> Last / later frame with higher numeric value is canonical for the duplicated values.

این تصمیم باید در آینده به‌عنوان precedent خوانده شود، ولی blanket automation نشود.

---

## 10. Identity examples

### Same name does not imply same identity

`ALI` و `ali` دو Identity مستقل‌اند.

### Rank does not imply identity

Rank فقط Snapshot-local است.

### Rename does not imply new identity

اگر fingerprint evidence continuity را پشتیبانی کند، نام جدید همان identity است.

### Missing does not imply deletion

بازیکنی که در Snapshot جاری نیست از history حذف نمی‌شود.

---

## 11. G-S01 baseline

G-S01 opening baseline بود:

- Total Kills = baseline
- Clan Medals = baseline
- Kill Delta = null
- Clan Medal Delta = null
- Current League Medals is separate

Reference totals:

- League: `2,002,752`
- Kills: `8,539,364`
- Clan: `11,908,775`

---

## 12. G-S02 state

G-S02 became the next published Snapshot:

- official timestamp: `1405-06-28 24:00`
- 50 current members
- 45 continuing identities
- 5 new identities
- 6 identities from G-S01 absent in G-S02
- permanent `player_id` values remain null
- ALI and ali remain distinct

Current new identities:

- Eren
- حسين
- Mehrad_Persion
- ایرانی باوقار
- تکاور

Current departed identities:

- Elvin
- SOMMER
- 007
- khoozestan212
- gilacecombat3

---

## 13. G-S02 verified aggregates

Snapshot totals:

- Current League Medals: `3,467,069`
- Total Kills: `8,746,252`
- Clan Medals: `12,531,232`

For the 45 continuing matched identities:

- Total Kills Delta: `+128,098`
- Clan Medals Delta: `+1,451,196`

These aggregates must not be confused with raw snapshot-to-snapshot aggregate difference without context.

---

## 14. Permanent IDs are intentionally deferred

G-S01 and G-S02 currently use:

- `player_id = null`
- `snapshot_member_key` for snapshot-local identity reference

This is intentional.

Do not invent player IDs merely because a UI route wants an identifier.

---

## 15. Conversation memory vs GitHub

The conversation contains valuable Project Authority decisions, but GitHub is the durable truth.

Therefore:

- Conversation memory is a knowledge source.
- Continuity docs are the durable transfer layer.
- GitHub repository state is the current operational authority.
- If conversation memory conflicts with current GitHub state, verify and treat GitHub current state as canonical unless Project Authority explicitly orders a correction.

---

## 16. Mutation boundary

Reading documents does not grant mutation permission.

Fresh-Agent should:

1. Read continuity pack.
2. Inspect current GitHub.
3. Analyze.
4. Report.
5. Obtain/confirm publication authority.
6. Mutate only scoped paths.
7. Verify post-mutation state.

---

## 17. What the next Agent must NOT ask the User to reteach unnecessarily

Do not ask the User to re-explain:

- what a Golden Snapshot is
- that Rank is not Identity
- that ALI and ali are separate
- what G-S01 means
- why Profile extras matter
- why Reza_Gh has two screenshots but one identity
- why PERSIA data cannot become Golden history
- why Golden UI mirrors PERSIA
- why the official timestamp is not the Screenshot filename timestamp
- why a ZIP must be hashed and inventoried first

Instead, read this continuity package and perform the GitHub reality check.

---

## 18. Core principle

The valuable knowledge accumulated in Conversation is not “training data” in the abstract.

It is a set of **operational decisions, precedents, constraints, and extraction procedures**.

Therefore this knowledge belongs in version-controlled continuity documents, not only in transient chat memory.
