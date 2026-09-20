# GOLDENCROWN Snapshot Workflow

## A. Intake

When a new Snapshot arrives:

1. Record Snapshot ID.
2. Record official date/time from Authority.
3. Compute ZIP SHA-256.
4. Inventory all images.
5. Separate ranking/profile evidence.
6. Check resolution consistency.
7. Detect duplicate/near-duplicate evidence.
8. Never assume each screenshot = separate player or separate snapshot.

## B. Evidence normalization

Normalize all required fields:

- rank
- display_name
- role
- stage
- current league medals
- total kills
- clan medals total
- honor medals
- weapon levels
- last online

Keep raw source meanings separate from display transformations.

## C. Cross-Snapshot reconciliation

Compare the new Snapshot with the previous canonical Snapshot by Identity, never by rank.

Check:

- continuing identities
- missing identities
- returning identities
- new identities
- renames
- rank movement
- stage changes
- role changes
- weapon changes
- honor changes
- cumulative totals
- current league medals

## D. Membership

Classify:

- continuing
- departed
- new
- returned

Do not delete historical Identity when missing.

## E. Delta calculation

For matched continuing identities:

- Total Kills delta = current - previous
- Clan Medals delta = current - previous

For new identities:

- do not manufacture prior contribution.

For returning identities after a gap:

- period baseline where immediate previous observation is absent;
- lifetime continuity preserved.

## F. League boundary

Use the canonical timestamp/reset semantics.

Do not infer a new league solely because:

- the HTML title says it;
- rank positions changed;
- current league medals increased;
- the report visually looks different.

## G. Validation before publication

Minimum checks:

- member count expected
- ranks unique
- ranks contiguous
- totals recalculate
- required fields present
- ALI/ali remain distinct
- no duplicate identity
- no ambiguous match unresolved
- new identities are intentional
- departed identities are not silently deleted from history
- current extras exist
- Reza_Gh-like intra-snapshot duplicates handled explicitly
- manifest points to intended snapshot

## H. Publication boundary

Before mutation, report:

- what will be added
- what will change
- what remains unknown
- whether identity mapping is safe
- whether any reconstructed values exist

Only after explicit approval should publication occur, unless the user has already granted explicit publication authority for that exact Snapshot.

## I. Post-publication verification

Verify:

- main HEAD
- current_snapshot_id
- canonical file SHA
- source file SHA
- evidence report SHA
- archive/index state
- current UI references
- relevant GitHub Actions

Distinguish:

- CI success
- Pages deployment success
- content correctness

These are separate evidence domains.

## J. Current G-S02 publication state

G-S02 has already passed this publication boundary.

Known current values:

- canonical SHA: `c06887c502a6adf168854e4d79b62d465b295694`
- source snapshot SHA: `fdf72505d99a7098067fb4c9b1fa60e6c35085a3`
- evidence report SHA: `4ee7d09fd745d6318a4c14e340a198a29c9c018d`
- manifest SHA: `b8903bc1bd99937c1a7a6be8c939b351a962b572`
- current Golden main HEAD: `9a91895370050f3b8654e0070038819f80e44c5d`

## K. G-S02 evidence facts

- Source ZIP SHA-256:
  `15d192fe04455798572b51d3944192d360bc7ed9f76fd539520d597d17e0bd5a`
- 59 images
- 8 ranking
- 51 profile
- 2340×1080
- 50 members
- Current League Medals total 3,467,069
- Total Kills total 8,746,252
- Clan Medals total 12,531,232
- continuing identities 45
- new identities 5
- departed identities 6
- Reza_Gh duplicate screenshots resolved as one identity using later/higher-value frame

## L. Do not reopen the ZIP routinely

Once a Snapshot is published and its normalized data/report are verified, normal operations should read the GitHub normalized artifacts.

Raw ZIP reopening is reserved for:

- disputed field
- identity forensic check
- evidence correction
- provenance audit
- missing field verification

