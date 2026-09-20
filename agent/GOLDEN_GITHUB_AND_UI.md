# GOLDENCROWN GitHub, UI & PERSIA Parity

## 1. Canonical repository

`neoshisystem/WD-C-Golden` is the canonical repository for Golden.

GitHub is truth.

Conversation transcript is not canonical state.

## 2. Golden Pages

Expected Pages root:

https://neoshisystem.github.io/WD-C-Golden/

Important routes:

- `clan-leaderboard/index.html`
- `clan-leaderboard/player.html?id=...`
- `clan-leaderboard/players.html`
- `clan-leaderboard/member-history.html`
- `clan-leaderboard/archive.html`

The Player page is dynamically parameterized; there is not one HTML file per player.

## 3. UI parity rule

Golden should closely mirror the PERSIA Leaderboard implementation.

Preserve:

- layout
- behavior
- navigation
- sorting
- search
- display modes
- profile interaction
- archive interaction
- membership history
- theme behavior
- CSS details
- small interaction details

Change only what is semantically/visually project-specific:

- PERSIA branding → GOLDENCROWN
- PERSIA snapshot/data references → Golden references
- PERSIA Identity IDs → Golden identity/snapshot keys
- PERSIA historical data → Golden history

Do not redesign while cloning unless the user explicitly requests redesign.

## 4. Shared code vs data

Some common behavior can be structurally similar to PERSIA.

However:

- Golden data files must remain Golden.
- Golden player identity must remain Golden.
- No PERSIA player_id may be copied into Golden.
- No PERSIA historical snapshot may be presented in Golden archive.

## 5. Viewer data

Golden viewer currently reads canonical Golden snapshot data and exposes:

- Stage
- Current League Medals
- Clan Medal Delta
- Clan Medals Total
- Honor Medals
- Total Kills
- Kill Delta
- Weapon Levels
- Last Online

This came from restoring the Profile Evidence fields after they were initially missing from the first Golden UI pass.

## 6. Archive independence

Golden archive must show only Golden Snapshot history.

G-S01 is the Golden opening/baseline snapshot.

G-S02 is the next published Golden snapshot.

PERSIA periods must never appear as Golden historical periods.

## 7. Pages deployment

Golden uses GitHub Actions / GitHub Pages.

Remember:

- Actions success is evidence of deployment workflow success.
- It does not itself prove visual correctness.
- A fresh-agent should still inspect source/state and, where possible, Pages behavior.

## 8. Current G-S02 page-related commits

Recent Golden commits included:

- `428fdc4b9a769843f2c848090a8b894acafb7e95` — Activate G-S02 in leaderboard viewer
- `0b47a67379df5bb049cc231e26c94e17b2fdec9c` — Activate G-S02 in player profiles
- `a3c5e784a14eb725365b3869c77c77ac211191b5` — Activate G-S02 in player directory
- `41b9c7e19e1f35f29f7c1b63a0a23d5237ac622b` — Activate G-S02 in member history
- `41cf77e137b2f0bf5d01ee1819c5c21eff15d9e2` — Add G-S02 to archive
- `150ca452197c1b622ca4628db17ec14193690d3d` — Promote G-S02 as current
- `c80d260745358487363be394dae4df0ec6f0b44b` — Add G-S02 evidence report
- `d280c0d7af1c2608de3064e5d6db9ed8f6523de1` — Allow archive to open selected snapshot
- `9a91895370050f3b8654e0070038819f80e44c5d` — Snapshot-aware GOLDENCROWN player profiles

## 9. Current Golden manifest

At continuity capture time:

- status = `current-published`
- current_snapshot_id = `G-S02`

Manifest SHA:

`b8903bc1bd99937c1a7a6be8c939b351a962b572`

## 10. PERSIA remains reference, not data source

Do not solve a Golden UI/data task by copying a PERSIA data file wholesale.

Use PERSIA code/behavior as a reference and adapt the project-specific data path safely.
