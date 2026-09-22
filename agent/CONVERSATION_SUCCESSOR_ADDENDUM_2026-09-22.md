# Conversation Successor Addendum — 2026-09-22

این فایل برای Agent/Conversation بعدی است. هدف آن تثبیت **Reality فعلی GitHub** پس از بسته‌شدن Conversation قبلی و جلوگیری از برگشت به SHAها/Continuityهای قدیمی است.

## 0. Authority / Operating Rule

- Project Authority تصمیم‌گیر نهایی mutation و identity است.
- GitHub live `main` مرجع operational truth است.
- ترتیب اعتماد:
  **live main > current manifest/canonical artifacts > continuity documents > conversation memory > assumptions**
- UNKNOWN هرگز با حدس پر نشود.
- PERSIA و GOLDENCROWN کاملاً مستقل‌اند.
- هیچ `player_id`، Snapshot، Membership، History یا Identity از PERSIA وارد Golden نشود.
- ZIP خام در Golden «evidence package» است، نه database آماده انتشار.

---

## 1. Current Reality — PERSIA

Repository:
`neoshisystem/war-drone-wiki`

Live main HEAD:
`a2beddf1d94993a9449f4661b793ea1443ddf837`

آخرین commit:
`docs: add 2026-09-22 conversation handoff`

نکته: feature مربوط به Member Changes در commitهای قبلی merge شده و handoff فعلی نیز روی main ثبت شده است.

Current Snapshot:
- `S10`
- `30/50`
- Official timestamp: `28 شهریور 1405 · 24:00`

### Member Change feature — وضعیت
**COMPLETE / MERGED**

فایل‌های اصلی:
- `clan-leaderboard/data/member-changes.json`
- `clan-leaderboard/tools/generate-archive.js`
- `clan-leaderboard/assets/viewer.js`
- `clan-leaderboard/assets/viewer.css`
- `clan-leaderboard/archive.html`

Current file SHAs:
- member-changes.json → `b56a0e75c0cbe59ee7f704b1ca3924e85e8cfa1c`
- generate-archive.js → `5f79ece169809a6f2b4aa49078f945ccef3540f3`
- viewer.js → `f32103d3d54094e72a67cfa0725fbd4296070f7a`
- viewer.css → `6c15b94ded6e649e405090bd01c9dd6ef1a47615`
- archive.html → `dee4e019eb8c5d7b79b8f1e3502f8080b5d5b04c`

### S10 Member Change
New:
- `PERSIA-P-0055` = `kaveh.2`
- `PERSIA-P-0056` = `ali`

Departed:
- 18 identities

Source semantics خروج:
- از `memberships.json`
- نمونه‌ها: `left_or_kicked`, `kicked_by_hisystem`

**ممنوع:** استنتاج kick/leave فقط از member-count delta.

---

## 2. PERSIA — Archive UX

Archive هر Snapshot اکنون named changes را داخل همان card نمایش می‌دهد:

- transition بین Snapshotها
- 🟢 اعضای جدید
- 🔴 خروج / حذف
- نام هر فرد clickable
- لینک profile بر اساس stable `player_id`
- aggregate period delta حفظ شده است

Architecture مهم:
کارت Archive دیگر یک anchor واحد برای کل card نیست؛ title/open link و profile chips لینک‌های مستقل دارند. در تغییرات آینده nested-link structure خراب نشود.

Generator:
`clan-leaderboard/tools/generate-archive.js`

این generator:
1. history shards را می‌خواند.
2. `players.json` را می‌خواند.
3. `memberships.json` را می‌خواند.
4. transition را از adjacent observations derive می‌کند.
5. `member-changes.json` را regenerate می‌کند.
6. Archive را تولید می‌کند.

**Derived data را hand-edit نکن.** اگر transition اشتباه است source semantics را اصلاح کن.

---

## 3. PERSIA — Snapshot Viewer UX

`clan-leaderboard/assets/viewer.js`

Viewer داده‌های Member Changes را می‌خواند و panel را بعد از results و **قبل از navigation** قرار می‌دهد:

**Results → Member Changes → دوره قبل | آرشیو | دوره بعد**

Panel:
- transition
- new members
- departed members
- clickable profile links
- baseline بدون fake join/leave
- no-change transition به‌صورت صریح

### Regression تاریخی مهم
در integration اولیه viewer blank شد؛ علت scope اشتباه rendering block بود.
سپس با PR مربوط به restore rendering اصلاح شد.

بنابراین در هر future edit روی `viewer.js`:
- syntax را check کن.
- scope تابع `render()` را کنترل کن.
- قبل از report «PASS»، artifact و behavior را validate کن.

---

## 4. PERSIA — Identity / Membership / Delta invariants

### Identity
- Stable `player_id`
- Rank = snapshot-local
- Name alone ≠ identity
- `ALI` / `ali` distinct unless explicit identity evidence says otherwise
- Ambiguous = unresolved / STOP

### Membership
فایل:
`clan-leaderboard/data/memberships.json`

فیلدها:
- `player_id`
- `from_snapshot`
- `through_snapshot`
- `status`
- `start_event`
- `end_precision`
- `end_event`

یک Identity می‌تواند چند membership interval داشته باشد.

### Delta
سه مفهوم را جدا نگه دار:
- Current League Medals
- Clan Medals Total
- Period Delta

Total Kills lifetime metric است.

League reset:
- Thursday 00:00 UTC
- Thursday 03:30 Iran

S07 = league end
S08 = new league start

Negative delta:
- final result نیست
- previous/last-valid observation و leave/rejoin scenario را بررسی کن
- silently clamp/invalidate نکن

---

## 5. PERSIA — Snapshot ingestion / publication

Canonical sources:
- `clan-leaderboard/data/players.json`
- `clan-leaderboard/data/snapshots.json`
- `clan-leaderboard/data/memberships.json`
- `clan-leaderboard/data/player-observations.json`
- `clan-leaderboard/data/player-observations-history.json`
- `clan-leaderboard/data/player-observations-history-s05.json`
- `clan-leaderboard/data/player-observations-history-s06.json`
- `clan-leaderboard/data/index.json`
- `clan-leaderboard/data/leagues.json`

Derived:
- `clan-leaderboard/data/member-changes.json`

Pipeline:
`clan-leaderboard/tools/ingest-and-publish.js`

Dry run:
`node clan-leaderboard/tools/ingest-and-publish.js <input.json>`

Mutation only after explicit authority:
`node clan-leaderboard/tools/ingest-and-publish.js <input.json> --write`

Pre-mutation:
- re-check current main HEAD
- inspect lineage
- identity review
- anomalies
- unknowns

Post-mutation:
- commit SHA
- changed file SHAs
- validation
- Actions
- deployment/content verification

---

## 6. Current Reality — GOLDENCROWN

Repository:
`neoshisystem/WD-C-Golden`

Live main HEAD:
`c0619ae8482e952fd1def95a41ec8150ec1b061d`

Latest main commit:
Merge PR #14 — `feat: show member entry and exit details in archive and snapshots`

Manifest:
`data/manifest.json`

Current:
- status = `current-published`
- current_snapshot_id = `G-S04`
- published = G-S01, G-S02, G-S03, G-S04

Current Golden file SHAs:
- archive.html → `44b987d99bad0fb9836647d6cd55e4dfe1145b07`
- viewer.js → `1eb89a3834be900bfcabe0499b0561a29cd0bcd5`
- viewer.css → `97b2b1f3d536bccc0bd6dd409ad498025f55255d`
- manifest.json → `326de0005f865d813cd0cef084c3329d6e403261`
- player-history-index.json → `ae00a93251fafaa92d4384d164f74ef867769511`

G-S04:
- Official timestamp: `1405-06-30 24:00`
- UTC capture: `2026-09-21T20:30:00Z`
- 50 members
- canonical: `data/canonical/G-S04.json`
- normalized source: `data/snapshots/G-S04.json`
- evidence report: `docs/G-S04_EVIDENCE_REPORT.md`

Permanent Golden `player_id` هنوز **NULL by design** است.

---

## 7. Golden Member Changes

Current architecture:
**COMPLETE / MERGED / PR #14**

Transition facts:

### G-S01 → G-S02
New:
- Eren
- حسين
- Mehrad_Persion
- ایرانی باوقار
- تکاور

Departed:
- Elvin
- SOMMER
- 007
- khoozestan212
- gilacecombat3

### G-S02 → G-S03
New:
- saied

Departed:
- JoseGregorio
- Extreme

### G-S03 → G-S04
New:
- مصطفی

Departed:
- none

Golden UI:
- Archive named changes
- Snapshot member-change panel
- profile/evidence continuity links
- panel before previous/archive/next navigation

---

## 8. Golden Identity boundary

Source:
`data/derived/player-history-index.json`

این فایل:
- derived-noncanonical-ui-index است.
- canonical identity registry نیست.
- groups دارد.
- key_map دارد.
- adjacent_reconciliation دارد.

Rules:
- Rank NEVER identity
- Name alone NEVER identity
- `ALI` و `ali` مستقل
- Missing ≠ Deleted
- Returning ≠ automatic match
- Rename ≠ automatic new identity
- Ambiguous = STOP
- PERSIA player_id → Golden ممنوع

Profile links بر اساس snapshot-local evidence continuity هستند؛ تا زمان formal شدن permanent player_id، identity دائمی جعل نشود.

---

## 9. Golden Snapshot Intake

ZIP:
**evidence package**، نه publish-ready database.

Workflow:
ZIP
→ SHA-256
→ Inventory
→ Ranking/Profile classification
→ Resolution review
→ Duplicate review
→ Visual extraction
→ Cross-check
→ Normalization
→ Identity/Fingerprint review
→ Membership
→ Delta
→ Validation
→ Publication

Ranking:
- rank
- display_name
- role
- stage
- current league medals

Profile:
- display_name
- role
- total kills
- clan medals
- honor medals
- 25mm
- Hydra
- Hellfire
- last online

Screenshot count ≠ player count.

---

## 10. Golden Fingerprint workflow

Automatic fingerprint engine وجود ندارد.

`Screenshot Evidence → Technical Review → Fingerprint Comparison → Identity Decision → Canonical Observation`

Strong:
- weapon levels
- honor medals
- total kills
- clan medals
- stage
- role
- continuity characteristics

Weak:
- rank
- position in grid
- decorative symbols
- name alone

Special ruling:
G-S02 / Reza_Gh:
- two screenshots = one player
- later/higher-valued evidence wins for canonical values
- earlier frame = evidence only
- this is NOT a blanket future rule

---

## 11. Golden Evidence / Canonical layers

هرگز این چهار لایه را قاطی نکن:

1. Raw screenshot evidence
2. Normalized source snapshot
3. Canonical snapshot
4. Derived UI/report state

Normal runtime source after publication:
- `data/snapshots/G-Sxx.json`
- `data/canonical/G-Sxx.json`
- `docs/G-Sxx_EVIDENCE_REPORT.md`
- `data/manifest.json`

ZIP را دوباره فقط برای:
- dispute
- forensic identity review
- source correction
- provenance audit
- missing field verification

باز کن.

---

## 12. Golden Delta / League semantics

- Current League Medals
- Period Delta
- Lifetime/Cumulative

New identity:
- prior contribution جعل نشود.

Returning identity:
- lifetime history حفظ شود.
- period comparison بر اساس observation معتبر قبلی انجام شود.

Negative cumulative:
- silently clamp ممنوع
- silently invalidate ممنوع
- نیازمند review/Authority

---

## 13. GOLDEN continuity references

Continuity Pack در:
`neoshisystem/war-drone-wiki/agent/`

حداقل:
- `GOLDEN_CONVERSATION_BOOTSTRAP.md`
- `GOLDEN_AGENT_MANUAL.md`
- `GOLDEN_CONVERSATION_KNOWLEDGE.md`
- `GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md`
- `GOLDEN_CURRENT_STATE.md`
- `GOLDEN_DATA_MODEL_AND_RULES.md`
- `GOLDEN_IDENTITY_FINGERPRINT.md`
- `GOLDEN_SNAPSHOT_WORKFLOW.md`
- `GOLDEN_GITHUB_AND_UI.md`
- `GOLDEN_PROMPT_PACK.md`

در mismatch:
**live main + manifest** بر state قدیمی continuity مقدم‌اند.

---

## 14. Validation boundary

Minimum validation:

- Snapshot ID correct
- official timestamp correct
- member count correct
- ranks unique + contiguous
- totals recalculate
- required fields present
- duplicates handled
- ALI/ali distinct
- new identities intentional
- departed identities preserved
- ambiguity unresolved
- source/canonical aligned
- manifest/current pointer aligned

CI PASS فقط CI PASS است.
Deployment proof و Content correctness evidenceهای مستقل‌اند.

---

## 15. Recommended startup procedure for next Conversation

Agent بعدی ابتدا:

1. این فایل را بخواند.
2. `agent/CONVERSATION_HANDOFF_2026-09-22.md` را بخواند.
3. برای Golden، Continuity Pack را بخواند.
4. live `main` هر دو repo را query کند.
5. current Snapshot را از canonical/manifest verify کند.
6. هیچ state قدیمی را بدون verification به current تبدیل نکند.
7. سپس State Report کوتاه ارائه کند.

اگر task جدید Snapshot باشد:
- ابتدا data lineage را مشخص کند.
- raw evidence را با normalized/canonical قاطی نکند.
- identity تصمیم را از delta calculation جدا نگه دارد.
- mutation را تا approval متوقف نگه دارد، مگر Authority برای همان task صریحاً publish authority داده باشد.

---

## 16. Current unresolved / caution

هیچ feature جدیدی برای Member Changes در این handoff pending نیست.

در Golden یک مورد قدیمی/نیازمند بررسی در صورت درخواست Authority وجود دارد:
در بعضی canonical snapshot metadataها ممکن است `baseline_rule` با delta fields داخل member rows متفاوت به نظر برسد. این را **UNKNOWN** نگه دار تا schema/generator/evidence با هم بررسی شوند؛ خودسرانه اصلاح نکن.

---

## 17. Immediate message to the successor Agent

**Member Change feature در هر دو پروژه complete و merged است.**

PERSIA:
`main = a2beddf...`, current = S10.

Golden:
`main = c0619ae...`, current = G-S04.

قبل از هر mutation جدید، live main را دوباره verify کن.

در Golden هیچ permanent player_id اختراع نکن.

در PERSIA membership و identity را یکی فرض نکن.

همهٔ derived UI stateها باید deterministic و قابل بازتولید از source data باشند.

**GitHub live state بر continuity prose مقدم است.**
