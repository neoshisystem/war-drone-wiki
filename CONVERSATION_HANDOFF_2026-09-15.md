# TEMPORARY CONVERSATION HANDOFF — War Drone Wiki

> **Status: TEMPORARY TRANSFER CHECKPOINT.** This file exists only because the current ChatGPT conversation has reached its practical context limit. After the next conversation/agent confirms takeover and continuity is established elsewhere, this file MUST be deleted from the public repository. Do not treat it as permanent project documentation.

## Live repository anchor
- Repository: `neoshisystem/war-drone-wiki`
- Branch: `main`
- Current main at checkpoint creation: `8491d7a91d2fe1bae84e1fefc90ee3dddb01aebc` (this checkpoint commit itself)
- Previous product head before checkpoint files: `31af616b01d55671bf70bae73acfe8b6e98ae345`
- GitHub Pages is enabled; repository is public.

## Product architecture / scope
- Static War Drone Wiki hosted on GitHub Pages.
- No backend/login/account system is part of the current product direction.
- Player-related inputs should remain data-driven and should not become one-static-page-per-player.
- Keep mobile usability and existing visual language intact.
- Avoid overengineering or broadening the phase without explicit user approval.

## Current Player Context feature
The intended phase is to automate the existing player-related input source without changing Advisor/Clan algorithms.

Existing input set:
- Stage
- 25mm Gun
- Hydra-70
- Hellfire

Two input modes:
1. Player search/autocomplete from canonical `players.json`, with explicit selection required. Typing a name alone must NOT silently select a player.
2. Manual mode allowing Stage + three weapon levels without selecting a player.

Requirements:
- Selected player can be changed.
- Selecting a player populates fields from the latest canonical snapshot.
- Manual edits remain usable as normal form values.
- Username can be shown where useful, but do not add broader profile/account functionality.
- Styling must stay scoped to the component; avoid generic selector collisions.

## Confirmed UI bug and fix
A live Advisor UI test showed repeated Player Context cards/blank inputs. Root cause was duplicate mounting in `assets/js/player-context.js` because the previous mount lookup used `input.closest(...)`, which could not find the sibling mount.

Fix commit:
- `2585b8c1b37a2c6ba05befb2625bfd8e57c57c58`
- Message: `Fix player context duplicate mounting on advisor/clan/arsenal`
- The user explicitly tested the live UI and confirmed the repeated-card bug was completely fixed.

Do not modify this fix unless a new regression is demonstrated.

## Current relevant implementation files
- `advisor.html`
- `assets/js/player-context.js`
- `assets/css/player-context.css`
- `assets/js/advisor-page.js`
- `assets/js/clan-planner.js`
- `assets/js/common.js`
- `assets/js/config.js`
- `arsenal.html`
- related shared CSS only when required

## Current phase constraint
The user has explicitly rejected broad expansion of this feature. Do not add:
- login/account synchronization
- backend services
- automatic identity-matching/fingerprinting engine
- large override/profile system
- autonomous content/assets behavior

The current objective is simply to automate input population from canonical player data while preserving existing Advisor/Clan logic.

## Related current Leaderboard state in this same repository
`clan-leaderboard/` is a separate project area in the same repo. Its current canonical state is S05 and it has a temporary handoff checkpoint at:
- `clan-leaderboard/CONVERSATION_HANDOFF_2026-09-15.md`

The Leaderboard handoff contains the detailed S01–S05 state, weekly league reset rules, and the pending Performance enhancement. Treat that file as the authoritative transfer source for the Leaderboard subsystem during this conversation shift.

## Other project/media context carried by this conversation
- PERSIA / UNITY branding uses a dark realistic purple/gold military-sci-fi visual language.
- User has worked on recruiting/trailer/media assets for UNITY and PERSIA.
- Public-facing copy should avoid internal implementation terminology when not necessary.
- The internal term `Snapshot` should not appear in ordinary public-facing publication copy unless technically required.

## Conversation-transfer instruction
This checkpoint is read-only continuity evidence, not implementation permission. The next agent must inspect the live `main` branch and reconcile this file with current code before acting.

After takeover is confirmed and the new conversation has extracted/relocated the necessary durable continuity, DELETE THIS FILE because the repository is public.
