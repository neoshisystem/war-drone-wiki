# Conversation Handoff — 2026-09-22

این فایل برای بازیابی کامل یک Conversation/Agent جدید پس از رسیدن به سقف Context تهیه شده است.
این سند راهنمای عملیاتی و انتقال دانش است؛ GitHub current state همچنان operational truth است.
هیچ UNKNOWN را با حدس پر نکن.

## 1. ورودی Conversation بعدی

Repositoryها:

- PERSIA: neoshisystem/war-drone-wiki
- GOLDENCROWN: neoshisystem/WD-C-Golden

مرز غیرقابل‌مذاکره:

PERSIA و GOLDENCROWN دو dataset، دو history، دو identity space و دو canonical project مستقل هستند.
PERSIA فقط reference/template برای Golden است؛ player_id، snapshot data، membership history یا historical identity از PERSIA هرگز وارد Golden نشود.

برای Golden این Continuity Pack در repo PERSIA نگهداری می‌شود:

- agent/GOLDEN_CONVERSATION_BOOTSTRAP.md
- agent/README.md
- agent/GOLDEN_AGENT_MANUAL.md
- agent/GOLDEN_CURRENT_STATE.md
- agent/GOLDEN_CONVERSATION_KNOWLEDGE.md
- agent/GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md
- agent/GOLDEN_DATA_MODEL_AND_RULES.md
- agent/GOLDEN_IDENTITY_FINGERPRINT.md
- agent/GOLDEN_SNAPSHOT_WORKFLOW.md
- agent/GOLDEN_GITHUB_AND_UI.md
- agent/GOLDEN_PROMPT_PACK.md

اصل ترتیب اعتماد:

GitHub live main > continuity documents > conversation memory > assumptions

---

# 2. وضعیت موردی که همین Conversation انجام داد

Project Authority درخواست کرد:

1. اطلاعات ورود و خروج اعضا در Archive داخل اطلاعات هر Snapshot نمایش داده شود.
2. در خود Snapshot نیز در انتهای Snapshot نمایش داده شود.
3. این panel دقیقاً قبل از navigation قبلی/آرشیو/بعدی باشد.
4. نام اعضا تا حد ممکن قابل کلیک و متصل به Profile باشند.
5. ابتدا معماری در PERSIA پیاده شود و سپس به Golden منتقل شود.

این Feature اکنون در هر دو پروژه انجام و Merge شده است.

## PERSIA

- PR #18: feat: show member entry and exit details in archive and snapshots
- PR #19: fix: restore PERSIA leaderboard rendering
- هر دو merged
- current main: 17d759dee1fe2cc0077b719af82881a1b0a7ca23

## GOLDENCROWN

- PR #14: feat: show member entry and exit details in archive and snapshots
- merged
- current main: c0619ae8482e952fd1def95a41ec8150ec1b061d

نتیجه: Feature در هر دو پروژه complete است.

---

# 3. PERSIA — Member Change Architecture

فایل derived فعلی:

clan-leaderboard/data/member-changes.json

SHA فعلی:

b56a0e75c0cbe59ee7f704b1ca3924e85e8cfa1c

Source این فایل:

- player observations
- players.json
- memberships.json
- snapshots.json

Transition schema:

- snapshot_id
- from_snapshot
- to_snapshot
- member_count_from
- member_count_to
- new_members[]
- departed_members[]

هر member change شامل:

- player_id
- display_name
- event

مثال S09 → S10:

New:
- PERSIA-P-0055 = kaveh.2
- PERSIA-P-0056 = ali

Departed:
- 18 previous PERSIA identities

S10:
- 46 → 30
- 2 new
- 18 departed

## Event semantics

Event خروج از memberships.json گرفته می‌شود.

نمونه:
- left_or_kicked
- kicked_by_hisystem

هرگز از کم شدن member count به‌تنهایی «kick» یا «left» استنتاج نکن.
اگر فقط left_or_kicked موجود است، همان سطح precision را حفظ کن.

---

# 4. PERSIA — Archive

Generator:

clan-leaderboard/tools/generate-archive.js

SHA فعلی:

5f79ece169809a6f2b4aa49078f945ccef3540f3

Generator این کارها را انجام می‌دهد:

- history shards را می‌خواند.
- players registry را می‌خواند.
- memberships را می‌خواند.
- member changes را از adjacent snapshot observations derive می‌کند.
- member-changes.json را regenerate می‌کند.
- named changes را داخل Archive card قرار می‌دهد.
- نام‌ها را به player.html?id=<PERSIA player_id> متصل می‌کند.
- aggregate period delta فعلی را حفظ می‌کند.

ساختار card فعلی:

- title/link
- status
- member count
- transition
- 🟢 اعضای جدید
- 🔴 خروج / حذف
- aggregate delta
- open snapshot link

نکته مهم:
کارت Archive دیگر یک anchor واحد برای کل card نیست؛ title، profile chips و open link مستقل‌اند.
هر modification بعدی باید nested link model را حفظ کند.

---

# 5. PERSIA — Snapshot Viewer

فایل:

clan-leaderboard/assets/viewer.js

Viewer داده‌های زیر را می‌خواند:

- player-observations.json
- player-observations-history.json
- player-observations-history-s05.json
- player-observations-history-s06.json
- players.json
- snapshots.json
- leagues.json
- member-changes.json

Panel:

- transition مربوط به target snapshot را پیدا می‌کند.
- names را با stable PERSIA player_id به player.html لینک می‌کند.
- baseline را بدون fake join/leave نمایش می‌دهد.
- no-change transition را صریح نمایش می‌دهد.

جایگاه فعلی:

Results
→ Member Changes
→ دوره قبل | آرشیو | دوره بعد

این جایگاه تصمیم UX همین پروژه است و نباید بدون درخواست Authority تغییر کند.

## Regression مهم

بعد از integration اولیه، PERSIA viewer blank شد.
علت: member-change rendering block در scope اشتباه قرار گرفته بود.
PR #19 آن را اصلاح کرد و cache-buster نیز update شد.

قاعده آینده:
هر تغییر viewer.js باید با syntax/test و بازبینی render scope انجام شود.
یک block خارج از render() می‌تواند کل viewer را blank کند.

---

# 6. PERSIA — Viewer CSS

فایل:

clan-leaderboard/assets/viewer.css

SHA:

4d3be4b2b5d5f63189e96a7e9ba7ceaf362757cf

کلاس‌های مرتبط:

- member-changes-card
- member-change-grid
- member-change-group
- member-change-group--left
- member-change-player
- member-change-empty

Mobile styling نیز دارد.

---

# 7. GOLDEN — Member Change Architecture

Golden permanent player_id هنوز assigned نشده است.

Source اصلی:

data/derived/player-history-index.json

این فایل:
- derived-noncanonical-ui-index است.
- canonical identity registry نیست.
- adjacent_reconciliation دارد.
- groups و key_map دارد.
- continuity status را ثبت می‌کند.

Transitionهای فعلی:

G-S01 → G-S02
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

G-S02 → G-S03
New:
- saied

Departed:
- JoseGregorio
- Extreme

G-S03 → G-S04
New:
- مصطفی

Departed:
- none

---

# 8. Golden — Profile Link Semantics

Golden viewer برای member-change link از name به observation همان snapshot می‌رسد و سپس snapshot_member_key را پیدا می‌کند.

Link فعلی:

player.html?id=<snapshot_member_key>&snapshot=<target_snapshot>

این لینک permanent identity نیست.

اگر mapping موجود نباشد:
- نام به plain chip تبدیل می‌شود.
- agent نباید برای ساخت link جعلی identity ایجاد کند.

Wording فعلی UI:

لینک‌ها به Evidence Continuity پروفایل همان بازیکن می‌روند؛ هویت canonical دائمی از این داده استنتاج نمی‌شود.

این wording را تا زمان فعال شدن permanent player_id حفظ کن.

---

# 9. Golden — Archive

Archive فعلی:

clan-leaderboard/archive.html

نمونه G-S04:
- 50/50
- 1 new: مصطفی
- 0 departed
- Clan Medals delta: +1,367,305
- Kills delta: +114,488

G-S03:
- 1 new: saied
- 2 departed: JoseGregorio, Extreme

G-S02:
- 5 new
- 5 departed

G-S01:
- baseline
- no previous snapshot
- no fake member change

---

# 10. Current State — PERSIA

Current main:

17d759dee1fe2cc0077b719af82881a1b0a7ca23

Current snapshot:
S10

Current members:
30/50

Official timestamp:
28 شهریور 1405 · 24:00

S10 new:
- PERSIA-P-0055 = kaveh.2
- PERSIA-P-0056 = ali

S10 departed:
18 previous identities

Current-state invariant verified:
- S10 observation rows = 30
- stale current last_seen_snapshot = 0
- every current observed PERSIA ID has last_seen_snapshot = S10

---

# 11. Current State — GOLDENCROWN

Current main:

c0619ae8482e952fd1def95a41ec8150ec1b061d

Manifest:
data/manifest.json

Current:
- status = current-published
- current_snapshot_id = G-S04
- published snapshots = G-S01..G-S04

G-S04:
- 50 members
- official timestamp = 30 شهریور 1405 · 24:00
- canonical = data/canonical/G-S04.json
- normalized source = data/snapshots/G-S04.json
- evidence report = docs/G-S04_EVIDENCE_REPORT.md

Permanent Golden player_id:
- still null by design

---

# 12. New Snapshot Intake — Golden

ZIP خام = evidence package، نه ready-to-publish database.

Workflow:

ZIP
→ SHA-256
→ Inventory
→ Ranking/Profile Classification
→ Resolution Review
→ Duplicate/Near-Duplicate Review
→ Visual Extraction
→ Cross-check
→ Normalization
→ Identity/Fingerprint Review
→ Membership
→ Delta
→ Validation
→ Publication

## Ranking fields

- rank
- display_name
- role
- stage
- current league medals

## Profile fields

- display_name
- role
- total kills
- clan medals
- honor medals
- weapons:
  - 25mm
  - Hydra
  - Hellfire
- last online

تعداد screenshot = تعداد player نیست.

G-S02 example:
- 59 images
- 8 ranking
- 51 profile evidence
- 50 members

علت 51 profile: duplicate evidence برای Reza_Gh.

---

# 13. Golden Fingerprint Rules

Automatic fingerprint engine وجود ندارد.

Fingerprint یک evidence workflow است:

Screenshot/Profile Evidence
→ Technical Review
→ Fingerprint Comparison
→ Identity Decision
→ Canonical Observation

Strong clues:
- 25mm
- Hydra
- Hellfire
- Honor medals
- Total Kills
- Clan Medals
- Stage
- Role
- profile continuity
- Last Online as temporal context

Weak:
- Rank
- grid position
- same-looking name
- decorative symbols

Rules:
- Rank NEVER identity
- Same name != same identity
- Rename != new identity
- Missing != deleted
- Returning != automatic match
- Ambiguous = STOP
- PERSIA player_id NEVER copied to Golden

## ALI / ali

ALI و ali دو identity مستقل‌اند.

## Reza_Gh

دو screenshot پشت‌سرهم در G-S02:
- یک player
- یک snapshot
- later frame with higher numeric values = canonical
- earlier frame = evidence only

این special ruling blanket rule آینده نیست.

---

# 14. PERSIA Identity/Fingerprint Reference

PERSIA automated Fingerprint Engine ندارد.

PR #13 در PERSIA یک draft/open documentation PR برای identity fingerprint بوده است:

Document canonical identity fingerprint and snapshot extraction rules

اما چون هنوز draft/open بوده، آن docs را canonical main فرض نکن.
فقط به‌عنوان reference استفاده کن تا زمان merge.

تصمیم‌های recorded در PR #13:
- Stage / Total Kills / Weapon Levels monotonic upward-only
- Clan Medals Total monotonic within continuous membership
- leave/rejoin requires membership review
- Last Online mandatory snapshot field ولی identity fingerprint نیست
- Rank و League Medals identity anchor نیستند
- PERSIA و Golden identity datasets isolated هستند

---

# 15. PERSIA Delta / League Semantics

این سه را جدا نگه دار:

Current League Medals
Clan Medals Total
Period Delta

Total Kills lifetime metric است.

League reset:
Thursday 00:00 UTC / Thursday 03:30 Iran

S07:
league end

S08:
next league start

League reset نباید cumulative Clan Medals Total را صفر کند.

New identity در league start می‌تواند baseline صریح صفر داشته باشد طبق rules فعلی.
New identity قبلی contribution ساختگی نگیرد.

Negative delta:
- نتیجه نهایی نیست
- prior/last valid observation را چک کن
- leave/rejoin scenario را چک کن
- silently clamp/invalidate نکن

---

# 16. Golden Delta Semantics

Golden نیز جداسازی زیر را حفظ می‌کند:

- Current League Medals
- Period Delta
- Lifetime/Cumulative

New identity:
- previous contribution ساختگی ندارد

Returning:
- immediate previous observation semantics برای period
- lifetime history حفظ می‌شود

Negative cumulative:
- silent clamp ممنوع
- silent invalidation ممنوع
- نیازمند review/Authority

---

# 17. PERSIA Membership Model

فایل:

clan-leaderboard/data/memberships.json

فیلدهای معمول:
- player_id
- from_snapshot
- through_snapshot
- status
- start_event
- end_precision
- end_event

نمونه event:
- left_or_kicked
- kicked_by_hisystem

یک stable PERSIA player_id می‌تواند چند membership interval داشته باشد.
Membership و Identity یکی نیستند.

---

# 18. PERSIA Future Snapshot Files

Canonical data:
- clan-leaderboard/data/players.json
- clan-leaderboard/data/snapshots.json
- clan-leaderboard/data/memberships.json
- clan-leaderboard/data/player-observations.json
- clan-leaderboard/data/player-observations-history.json
- clan-leaderboard/data/player-observations-history-s05.json
- clan-leaderboard/data/player-observations-history-s06.json
- clan-leaderboard/data/index.json
- clan-leaderboard/data/leagues.json

Derived:
- clan-leaderboard/data/member-changes.json

UI:
- clan-leaderboard/archive.html
- clan-leaderboard/index.html
- clan-leaderboard/player.html
- clan-leaderboard/players.html
- clan-leaderboard/member-history.html
- clan-leaderboard/assets/viewer.js
- clan-leaderboard/assets/viewer-data.js
- clan-leaderboard/assets/viewer.css
- clan-leaderboard/assets/player-profile.js
- clan-leaderboard/assets/player-directory.js
- clan-leaderboard/assets/member-history.js

Tools:
- clan-leaderboard/tools/ingest-snapshot-v4.js
- clan-leaderboard/tools/ingest-and-publish.js
- clan-leaderboard/tools/generate-report.js
- clan-leaderboard/tools/generate-archive.js
- clan-leaderboard/tools/validate-ingestion.js
- clan-leaderboard/tools/test-ingest-snapshot.js
- clan-leaderboard/tools/test-ingest-publish.js
- clan-leaderboard/tools/test-report-generator.js
- clan-leaderboard/tools/test-archive-generator.js
- clan-leaderboard/tools/test-viewer-data.js
- clan-leaderboard/tools/test-performance.js

---

# 19. PERSIA Publication Pipeline

Dry run:

node clan-leaderboard/tools/ingest-and-publish.js <input.json>

پس از explicit approval:

node clan-leaderboard/tools/ingest-and-publish.js <input.json> --write

طبق design این pipeline:
- canonical ingestion
- report generation
- archive generation

را به هم متصل می‌کند.

قبل از mutation:
- current main HEAD re-check
- scope
- identity review
- anomalies
- unknowns

بعد از mutation:
- commit SHA
- file SHAs
- validation
- Actions
- deployment/content verification

---

# 20. Golden Future Snapshot Files

Typical scope:

- data/snapshots/G-Sxx.json
- data/canonical/G-Sxx.json
- docs/G-Sxx_EVIDENCE_REPORT.md
- data/manifest.json
- data/derived/player-history-index.json

UI if required:
- clan-leaderboard/archive.html
- clan-leaderboard/assets/viewer.js
- clan-leaderboard/assets/viewer.css
- clan-leaderboard/assets/player-profile.js
- clan-leaderboard/assets/member-history.js
- clan-leaderboard/assets/player-directory.js

Historical Snapshotها overwrite نشوند.

---

# 21. Evidence Layer Separation

این چهار لایه را قاطی نکن:

1. Raw Screenshot evidence
2. Normalized source snapshot
3. Canonical snapshot
4. Derived UI/report state

UI درست، extraction correctness را ثابت نمی‌کند.

---

# 22. Validation Rules

حداقل validation هر Snapshot:

- Snapshot ID درست
- official timestamp درست
- member count درست
- rankها unique و contiguous
- totals recalculate correctly
- required fields موجود
- duplicate evidence handled
- ALI/ali merge نشده‌اند
- new identities intentional
- departed identities history را از دست نداده‌اند
- ambiguity unresolved باقی نمانده
- source و canonical aligned
- manifest/current pointer aligned

PERSIA:
current current-player last_seen_snapshot باید current snapshot باشد.

Golden:
permanent player_id فعلاً null است؛ برای آینده invent نکن.

---

# 23. Historical Safety

Historical reports/source files را برای «تمیز کردن» overwrite نکن.

اگر correction لازم شد:
- exact scope
- reason
- Authority decision
- controlled correction
- evidence trail

ثبت شود.

---

# 24. CI / Deployment / Content Correctness

اینها سه evidence domain مستقل‌اند:

- CI success
- Pages/deployment success
- content correctness

CI PASS به‌تنهایی اثبات deployment یا visual correctness نیست.

---

# 25. Important Historical Warnings

1. connector JSON serialization را با HTML escaping اشتباه نکن.
2. Rank را identity فرض نکن.
3. از count difference، kick یا voluntary leave استنتاج نکن.
4. ZIP filename timestamp را official timestamp فرض نکن.
5. screenshot count را player count فرض نکن.
6. PERSIA player_id را وارد Golden نکن.
7. stale branch SHA را current main فرض نکن.
8. historical data را بدون Authority silently اصلاح نکن.
9. Golden permanent player_id را تا زمان رسمی شدن invent نکن.
10. member-changes.json در PERSIA باید از underlying observations + memberships بازتولید شود؛ UI را با hand-edit کردن derived data repair نکن.

---

# 26. PERSIA Known Automation Detail

generate-archive.js هم archive را می‌سازد و هم member-changes.json را regenerate می‌کند.

بنابراین در تغییرات future:
- member-changes باید deterministic بماند.
- اگر transition غلط است source semantics را اصلاح کن، نه فقط derived UI file را.

Source precedence:
- observation rows
- players registry
- memberships
- snapshots

---

# 27. Current Golden Continuity Caveat

بعضی فایل‌های continuity قدیمی‌تر هنوز G-S02 را current معرفی می‌کنند.

Current GitHub reality جدیدتر است:

- current = G-S04
- main = c0619ae8482e952fd1def95a41ec8150ec1b061d
- manifest.current_snapshot_id = G-S04

پس در mismatch:
GitHub live main و manifest بر continuity state قدیمی اولویت دارند.

---

# 28. Recent PRs — PERSIA

- PR #19 — restore PERSIA leaderboard rendering
- PR #18 — member entry/exit details
- PR #17 — restore valid archive HTML
- PR #16 — archive/player-directory repair؛ وضعیت live باید دوباره query شود
- PR #15 — compact Summary view
- PR #14 — S10 publication
- PR #12 — last_seen invariant
- PR #11 — S09 publication
- PR #10 — S08 delta correction

---

# 29. Recent PRs — GOLDENCROWN

- PR #14 — member entry/exit details
- PR #13 — RTL/LTR bdi fix
- PR #12 — archive style parity
- PR #11 — weekly performance aggregation
- PR #10 — profile/archive parity
- PR #9 — local multi-snapshot player history
- PR #8 — G-S04 history continuity
- PR #7 — G-S04 profile fields
- PR #6 — G-S04 publication
- PR #5 — compact summary labels
- PR #4 — compact summary view
- PR #3 — sortable player profile history

---

# 30. Current Member-Change Feature State

PERSIA:
COMPLETE
- PR #18 merged
- PR #19 merged
- data/member-changes.json موجود
- Archive named joins/departures موجود
- Snapshot panel موجود
- profile links موجود
- S10 = 2 new / 18 departed
- blank-viewer regression fixed

Golden:
COMPLETE
- PR #14 merged
- G-S02/G-S03/G-S04 transitions موجود
- Archive named changes موجود
- Snapshot member-change panel موجود
- Profile links use snapshot member keys / Evidence Continuity
- هیچ PERSIA data یا identity وارد Golden نشده

هیچ unfinished item مربوط به درخواست Member Entry/Exit Reporting باقی نمانده است.

---

# 31. Mutation Boundary

Continuity document permission نیست.

Agent جدید:
1. GitHub reality check
2. state report
3. scope
4. explicit authority
5. minimal mutation
6. post-mutation evidence

در صورت UNKNOWN:
UNKNOWN گزارش شود؛ PASS حدس زده نشود.

---

# 32. Minimal Fresh-Agent Prompt

این متن را می‌توان مستقیماً در Conversation بعدی قرار داد:

نقش تو Fresh-Agent successor برای دو پروژه مستقل War Drone هستی.

ابتدا این فایل را بخوان:
agent/CONVERSATION_HANDOFF_2026-09-22.md

سپس live GitHub main را Reality-Check کن:

PERSIA:
neoshisystem/war-drone-wiki

Golden:
neoshisystem/WD-C-Golden

برای Golden Continuity Pack زیر war-drone-wiki/agent/ را نیز بخوان، مخصوصاً:
- GOLDEN_CONVERSATION_BOOTSTRAP.md
- GOLDEN_CURRENT_STATE.md
- GOLDEN_CONVERSATION_KNOWLEDGE.md
- GOLDEN_EVIDENCE_EXTRACTION_MANUAL.md
- GOLDEN_DATA_MODEL_AND_RULES.md
- GOLDEN_IDENTITY_FINGERPRINT.md
- GOLDEN_SNAPSHOT_WORKFLOW.md
- GOLDEN_GITHUB_AND_UI.md
- GOLDEN_PROMPT_PACK.md

Current truth فقط از live main و manifest/canonical data می‌آید.

PERSIA و Golden را مطلقاً merge نکن.

Rank identity نیست.
Name به‌تنهایی identity نیست.
ZIP database آماده انتشار نیست.
UNKNOWN را با حدس پر نکن.

قبل از mutation یک State Report بده.
بعد از mutation commit SHA، file SHAs، validation و deployment evidence بده.

برای Snapshot جدید چرخه را کامل اجرا کن:

Evidence
→ Normalization
→ Identity/Fingerprint
→ Membership
→ Delta
→ Validation
→ Publication

و Member Change architecture فعلی را حفظ کن:

Archive named changes
+ Snapshot member-change panel
+ profile links
+ panel before previous/archive/next navigation

---

# 33. End State

این Conversation با current GitHub state به این نتیجه رسیده است:

- درخواست Member Entry/Exit Reporting در PERSIA اجرا و merged شد.
- regression آن در PR #19 fix و merged شد.
- همان architecture در Golden نیز اجرا و merged شد.
- Archive و Snapshot Viewer هر دو اکنون named membership changes را نمایش می‌دهند.
- PERSIA از stable player_id استفاده می‌کند.
- Golden فعلاً از Snapshot-local member key + Evidence Continuity استفاده می‌کند.
- هیچ PERSIA identity/data به Golden منتقل نشده است.

این handoff برای Conversation بعدی reference است؛ current main و live repository را همیشه دوباره verify کن.
