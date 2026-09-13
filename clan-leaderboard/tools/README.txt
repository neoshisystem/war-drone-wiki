PERSIA Clan Intelligence tools
================================

Purpose
-------
These tools maintain the canonical PERSIA clan snapshot history without rewriting historical raw reports.

Normal future workflow
----------------------
1. Prepare one JSON snapshot using `data/incoming/SNAPSHOT_TEMPLATE.json`.
2. Review identity mappings. Use `player_id` for known players; set `confirmed_new_identity=true` only for a genuinely new identity.
3. Run a dry-run first:
   `node clan-leaderboard/tools/ingest-and-publish.js <input.json>`
4. After the dry-run is correct, publish it:
   `node clan-leaderboard/tools/ingest-and-publish.js <input.json> --write`

Publication pipeline
--------------------
JSON input -> canonical data -> report HTML -> data/index.json -> archive.html

Safety rules
------------
- Existing raw reports are historical evidence and must not be rewritten.
- Duplicate timestamps and duplicate report IDs are rejected.
- Snapshot IDs are assigned sequentially.
- Unknown identities require explicit confirmation.
- Ambiguous display names require an explicit `player_id`; the tool never guesses.
- Dry-run mode writes nothing.
- Report and archive generation are deterministic and covered by CI tests.

Canonical data
--------------
`players.json`                    Stable internal player identities.
`snapshots.json`                  Snapshot metadata and current snapshot pointer.
`player-observations-history.json` Per-snapshot normalized player observations.
`player-observations.json`        Current snapshot observations.
`memberships.json`                Historical membership intervals.
`index.json`                      Published report index consumed by archive generation.

Do not edit generated report HTML to fix canonical data. Correct the source JSON and rerun the pipeline.
