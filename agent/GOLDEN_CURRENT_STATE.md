# GOLDENCROWN Current State

## Capture purpose

این فایل وضعیت واقعی GitHub را برای Fresh-Agent continuity ثبت می‌کند تا Agent بعدی بداند چه چیزی واقعاً در repository وجود دارد، نه اینکه از پایان مکالمه حدس بزند.

## Golden repository

`neoshisystem/WD-C-Golden`

### Current main

`9a91895370050f3b8654e0070038819f80e44c5d`

Commit title:

`Support snapshot-aware GOLDENCROWN player profiles`

## Current manifest

`data/manifest.json`

- status: `current-published`
- current_snapshot_id: `G-S02`

Manifest SHA:

`b8903bc1bd99937c1a7a6be8c939b351a962b572`

## G-S01

Official timestamp:

`1405-06-27 24:00`

Baseline totals:

- Current League Medals: 2,002,752
- Total Kills: 8,539,364
- Clan Medals: 11,908,775

## G-S02

Official timestamp:

`1405-06-28 24:00`

Source ZIP SHA-256:

`15d192fe04455798572b51d3944192d360bc7ed9f76fd539520d597d17e0bd5a`

Evidence:

- 59 images
- 8 ranking
- 51 profile
- 2340×1080

G-S02 totals:

- Current League Medals: 3,467,069
- Total Kills: 8,746,252
- Clan Medals: 12,531,232

Files:

- `data/snapshots/G-S02.json`
  - SHA: `fdf72505d99a7098067fb4c9b1fa60e6c35085a3`
- `data/canonical/G-S02.json`
  - SHA: `c06887c502a6adf168854e4d79b62d465b295694`
- `docs/G-S02_EVIDENCE_REPORT.md`
  - SHA: `4ee7d09fd745d6318a4c14e340a198a29c9c018d`

## G-S02 identity transition

Continuing: 45

New:

1. Eren
2. حسين
3. Mehrad_Persion
4. ایرانی باوقار
5. تکاور

Departed:

1. Elvin
2. SOMMER
3. 007
4. khoozestan212
5. gilacecombat3

## ALI / ali

G-S01:

- ALI rank 17
- ali rank 43

G-S02:

- ALI rank 32
- ali rank 41

They remain distinct.

## Reza_Gh

G-S02 contains two consecutive profile screenshots for the same player.

Final ruling:

- one player
- later screenshot wins for canonical numeric values
- earlier screenshot is ignored for those duplicated values

Published G-S02 state:

- rank 33
- current league medals 45,629
- total kills 83,027
- clan medals 325,411
- clan medal delta 14,600

## Continuing-member aggregate

Across the 45 matched/continuing identities:

- Total Kills Delta: +128,098
- Clan Medals Delta: +1,451,196

## Golden Identity IDs

Permanent `player_id` values:

- G-S01: null
- G-S02: null

Therefore the system is still intentionally in a pre-permanent-ID identity phase.

## Evidence and persistence rule

The Golden repository persists the normalized Snapshot and Evidence Report.

The original G-S02 ZIP is not the normal canonical runtime input and is not needed for routine browsing or calculations.

Reopen raw ZIP only for forensic evidence review.

## Publication status

G-S02 is **not pending**.

It was:

- written to source data
- written to canonical data
- added to archive
- activated in viewer
- activated in player profiles
- activated in player directory
- activated in member history
- promoted as current
- documented with evidence report

## Important caution

The fact that G-S02 is current does not mean all future Identity mappings are automatically safe. Permanent player IDs have not yet been assigned and future snapshots still require human-reviewed continuity.
