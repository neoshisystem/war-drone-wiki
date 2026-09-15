# TEMPORARY CONVERSATION HANDOFF — PERSIA Leaderboard

> **Status: TEMPORARY TRANSFER CHECKPOINT.** This file exists only because the current ChatGPT conversation has reached its practical context limit. When the next conversation/agent has confirmed that it has read and understood this checkpoint, this file MUST be deleted from the public repository. Do not treat its existence as a permanent product feature.

## Live repository anchor
- Repository: `neoshisystem/war-drone-wiki`
- Branch: `main`
- Current main at checkpoint creation: `31af616b01d55671bf70bae73acfe8b6e98ae345`
- Leaderboard root: `clan-leaderboard/`

## Product state at handoff
- S01–S05 are confirmed/preserved.
- Current canonical snapshot: **S05**.
- S05: 23 شهریور 1405, 23:00 Iran, 47/50 members.
- S05 totals: league-medal total `4,053,261`; clan-medal total `23,742,781`; total kills `5,373,064`.
- Historical raw reports are immutable evidence and must not be rewritten.
- Player identity history and membership history are retained.
- The unified Leaderboard Viewer supports simple/graphic modes and archive navigation.

## Important completed fixes
- Leaderboard default was corrected to S05 in `assets/viewer.js`: commit `8e09df7126c44e5a581a19f391ad16892e24a8b5`.
- Archive entries were moved to the unified Viewer so historical S02–S05 pages use consistent styling; final S01 source-path correction commit: `d710d9b5016a7c356ea5e220446bb457890e3356`.
- S05 canonical ingestion/history shard and validation pipeline are already in place and CI had passed for the S05 data state before subsequent UI-only fixes.

## Current requested work — NOT YET IMPLEMENTED
The next task is a controlled **Performance UI/data enhancement**. Do not broaden scope.

Two existing report-grid metrics are the focus:
1. Rename the public label `تغییر مدال لیگ` to **`تغییر مدال کلن`** everywhere in Leaderboard UI/report/archive presentation.
2. Keep **`افزایش کیل`** as the second metric.

These two metrics must be available per report period and must be computed from canonical player history, not manually entered.

### Required semantic distinction
There are two related but distinct concepts:
- **Per-period delta:** change from the immediately previous confirmed report to the current report.
- **Weekly league aggregate:** cumulative change within the current weekly league period. This aggregate must reset at the weekly league reset and must not carry over from the previous league week.

### League-week reset rule already recorded in project data
The canonical schema already records:
- Iran league-week start: **Thursday 03:30**
- UTC league-week start: **Thursday 00:00**
- `leagues.json` already records weekly league periods with `league_week` keys.

All Performance calculations must bind to `league_week` so that weekly aggregates reset cleanly at the league boundary.

### Correct calculation policy
For `تغییر مدال کلن` and `افزایش کیل`, do not blindly subtract whole-clan totals when membership changes can contaminate the result.
For per-period earned values, calculate only over players present in both consecutive observations:
- `clan_medals_current - clan_medals_previous`
- `total_kills_current - total_kills_previous`
Then aggregate those player-level differences.
New/removed members must not create artificial earned totals.

For weekly cumulative totals, accumulate the valid per-period earned values only within the same `league_week`; on the first report after a league reset, the weekly baseline is zero.

## Proposed implementation shape
Prefer a small derived data artifact (for example `data/performance.json`) rather than duplicating raw player observations. It should store deterministic derived values keyed by snapshot and league week, enough for both Report/Viewer and Player Profile to consume.

Suggested conceptual fields:
- `snapshot_id`
- `previous_snapshot_id`
- `league_week`
- `period_clan_medals_earned`
- `period_kills_earned`
- `weekly_clan_medals_earned`
- `weekly_kills_earned`

For Player Profile, a separate cumulative-from-first-seen view may be shown, but it must not be confused with the weekly league aggregate.

## Likely files to inspect/modify during execution
- `clan-leaderboard/data/snapshots.json`
- `clan-leaderboard/data/leagues.json`
- `clan-leaderboard/data/player-observations.json`
- `clan-leaderboard/data/player-observations-history.json`
- `clan-leaderboard/data/player-observations-history-s05.json`
- `clan-leaderboard/data/schema.json`
- `clan-leaderboard/tools/ingest-snapshot-v4.js`
- `clan-leaderboard/tools/generate-report.js`
- `clan-leaderboard/assets/viewer.js`
- `clan-leaderboard/assets/viewer.css` only if required for the existing grid/card styling
- `clan-leaderboard/assets/player-profile.js`
- `clan-leaderboard/assets/players.css` only if required for profile presentation
- `clan-leaderboard/archive.html`
- related validation/test tools and CI workflow

Do NOT change all of these automatically. First inspect current usage and modify the minimum necessary set.

## Required verification before declaring complete
1. Validate S01→S05 derived values.
2. Explicitly test membership changes (S02 has 46 members while adjacent snapshots can have 47).
3. Verify the weekly league boundary at Thursday 03:30 Iran / 00:00 UTC.
4. Verify a first report of a new league week starts its weekly aggregate at zero.
5. Verify cumulative values inside one league week continue adding correctly.
6. Verify `تغییر مدال کلن` label appears consistently in main Leaderboard and all archive reports.
7. Verify `افزایش کیل` remains correct.
8. Verify simple/graphic modes, Player Profile, archive navigation and mobile layout are not regressed.
9. Run the existing validation/CI suite and report exact evidence; do not claim PASS without evidence.

## Conversation-transfer instruction
This handoff is not permission to implement. The next agent must first read this file, inspect the live repository, reconcile it against the current main branch, and then ask/await the user's execution approval if the user has not already explicitly approved implementation.

After the new conversation confirms takeover and has durable continuity elsewhere, DELETE THIS FILE because the repository is public.
