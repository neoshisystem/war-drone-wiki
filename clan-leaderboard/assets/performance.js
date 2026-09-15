(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WDPerformance = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

  function pad(value) { return String(value).padStart(2, '0'); }

  function leagueWeekId(capturedAtUtc, reset) {
    const date = new Date(capturedAtUtc);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid captured_at_utc: ${capturedAtUtc}`);
    const weekday = DAY_INDEX[reset?.weekday || 'Thursday'];
    const [hour, minute] = String(reset?.time_utc || '00:00').split(':').map(Number);
    const currentWeekday = date.getUTCDay();
    const daysBack = (currentWeekday - weekday + 7) % 7;
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysBack, hour || 0, minute || 0, 0));
    if (date.getTime() < start.getTime()) start.setUTCDate(start.getUTCDate() - 7);
    return `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  }

  function getRows(snapshotId, observationSets) {
    for (const source of observationSets || []) {
      const rows = source?.snapshots?.[snapshotId];
      if (Array.isArray(rows)) return rows;
    }
    return [];
  }

  function clonePlayerTotals(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, { clan_medals: value.clan_medals, kills: value.kills }]));
  }

  function clonePeriodPlayers(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, {
      clan_medals: value.clan_medals,
      kills: value.kills,
      baseline: Boolean(value.baseline)
    }]));
  }

  function cloneCumulativePlayers(players) {
    return Object.fromEntries(Object.entries(players).map(([id, value]) => [id, {
      clan_medals: value.clan_medals,
      kills: value.kills
    }]));
  }

  function computeAll(snapshotsFile, observationSets, leaguesFile) {
    const snapshots = [...(snapshotsFile?.snapshots || [])].sort((a, b) => a.captured_at_utc.localeCompare(b.captured_at_utc));
    const reset = leaguesFile?.reset || { weekday: 'Thursday', time_utc: '00:00' };
    const results = {};
    const weeklyState = new Map();
    const cumulativeState = {};
    let previousSnapshot = null;

    for (const snapshot of snapshots) {
      const weekId = leagueWeekId(snapshot.captured_at_utc, reset);
      let state = weeklyState.get(weekId);
      if (!state) {
        state = { clan_medals: 0, kills: 0, players: {} };
        weeklyState.set(weekId, state);
      }

      const currentRows = getRows(snapshot.snapshot_id, observationSets);
      const previousRows = previousSnapshot && leagueWeekId(previousSnapshot.captured_at_utc, reset) === weekId
        ? getRows(previousSnapshot.snapshot_id, observationSets)
        : [];
      const previousAllRows = previousSnapshot ? getRows(previousSnapshot.snapshot_id, observationSets) : [];
      const previousById = new Map(previousRows.map(row => [row.player_id, row]));
      const previousAllById = new Map(previousAllRows.map(row => [row.player_id, row]));
      let periodClan = 0;
      let periodKills = 0;
      const periodPlayers = {};

      for (const row of currentRows) {
        const previous = previousById.get(row.player_id);
        if (!previous) {
          state.players[row.player_id] = { clan_medals: 0, kills: 0 };
          periodPlayers[row.player_id] = { clan_medals: 0, kills: 0, baseline: !previousSnapshot || !previousRows.length };
        } else {
          const clanDelta = Number(row.clan_medals || 0) - Number(previous.clan_medals || 0);
          const killDelta = Number(row.total_kills || 0) - Number(previous.total_kills || 0);
          periodClan += clanDelta;
          periodKills += killDelta;
          const currentPlayer = state.players[row.player_id] || { clan_medals: 0, kills: 0 };
          currentPlayer.clan_medals += clanDelta;
          currentPlayer.kills += killDelta;
          state.players[row.player_id] = currentPlayer;
          periodPlayers[row.player_id] = { clan_medals: clanDelta, kills: killDelta, baseline: false };
        }

        const previousAll = previousAllById.get(row.player_id);
        if (!cumulativeState[row.player_id]) cumulativeState[row.player_id] = { clan_medals: 0, kills: 0 };
        if (previousAll) {
          cumulativeState[row.player_id].clan_medals += Number(row.clan_medals || 0) - Number(previousAll.clan_medals || 0);
          cumulativeState[row.player_id].kills += Number(row.total_kills || 0) - Number(previousAll.total_kills || 0);
        }
      }

      const sameWeek = previousRows.length > 0;
      results[snapshot.snapshot_id] = {
        snapshot_id: snapshot.snapshot_id,
        league_week: weekId,
        baseline_snapshot_id: sameWeek ? previousSnapshot.snapshot_id : snapshot.snapshot_id,
        period_clan_medals_change: sameWeek ? periodClan : 0,
        period_kills_change: sameWeek ? periodKills : 0,
        weekly_clan_medals_earned: state.clan_medals += (sameWeek ? periodClan : 0),
        weekly_kills_earned: state.kills += (sameWeek ? periodKills : 0),
        period_players: clonePeriodPlayers(periodPlayers),
        players: clonePlayerTotals(state.players),
        cumulative_players: cloneCumulativePlayers(cumulativeState)
      };
      previousSnapshot = snapshot;
    }
    return results;
  }

  return { leagueWeekId, getRows, computeAll };
});
