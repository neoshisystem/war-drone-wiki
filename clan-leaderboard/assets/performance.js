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
    const cumulativePrevious = new Map();
    let previousSnapshot = null;
    let previousRows = [];

    for (const snapshot of snapshots) {
      const weekId = leagueWeekId(snapshot.captured_at_utc, reset);
      let state = weeklyState.get(weekId);
      if (!state) {
        state = { clan_medals: 0, kills: 0, players: {} };
        weeklyState.set(weekId, state);
      }

      const currentRows = getRows(snapshot.snapshot_id, observationSets);
      const previousWeekId = previousSnapshot ? leagueWeekId(previousSnapshot.captured_at_utc, reset) : null;
      const sameWeek = Boolean(previousSnapshot && previousWeekId === weekId);
      const hasPreviousSnapshot = Boolean(previousSnapshot);
      const previousById = new Map(sameWeek ? previousRows.map(row => [row.player_id, row]) : []);
      const previousKillById = new Map(hasPreviousSnapshot ? previousRows.map(row => [row.player_id, row]) : []);
      let periodClan = 0;
      let periodKills = 0;
      const periodPlayers = {};

      for (const row of currentRows) {
        const previous = previousById.get(row.player_id);
        const previousKill = previousKillById.get(row.player_id);
        const clanValue = Number(row.clan_medals || 0);
        const killValue = Number(row.total_kills || 0);

        // S01 is the historical baseline. Every later league starts Clan Medals
        // from an explicit zero, while snapshots inside the same league use a delta.
        let clanDelta = 0;
        if (!hasPreviousSnapshot) clanDelta = 0;
        else if (!sameWeek) clanDelta = clanValue;
        else if (previous) clanDelta = clanValue - Number(previous.clan_medals || 0);

        // Kills are continuous across league boundaries and compare with the
        // immediately preceding observation when the player exists there.
        const hasKillBaseline = Boolean(previousKill);
        const killDelta = hasKillBaseline ? killValue - Number(previousKill.total_kills || 0) : 0;

        const baseline = !hasPreviousSnapshot || (!sameWeek && !previousKill);
        periodClan += clanDelta;
        periodKills += killDelta;
        const currentPlayer = state.players[row.player_id] || { clan_medals: 0, kills: 0 };
        currentPlayer.clan_medals += clanDelta;
        currentPlayer.kills += killDelta;
        state.players[row.player_id] = currentPlayer;
        periodPlayers[row.player_id] = { clan_medals: clanDelta, kills: killDelta, baseline };

        // Lifetime totals preserve player identity across league resets and
        // membership gaps. Clan Medals use the league-start zero baseline;
        // Kills use the previous observation, even across a league boundary.
        if (!cumulativeState[row.player_id]) cumulativeState[row.player_id] = { clan_medals: 0, kills: 0 };
        const previousCumulative = cumulativePrevious.get(row.player_id);
        if (!previousCumulative) {
          // S01 is a baseline, but a first-ever observation in a later league
          // is already progress from that league's known zero Clan Medal start.
          cumulativeState[row.player_id].clan_medals += hasPreviousSnapshot ? clanValue : 0;
          cumulativeState[row.player_id].kills += 0;
        } else {
          const previousCumulativeWeek = leagueWeekId(previousCumulative.captured_at_utc || snapshot.captured_at_utc, reset);
          const clanContribution = previousCumulativeWeek === weekId
            ? clanValue - Number(previousCumulative.clan_medals || 0)
            : clanValue;
          cumulativeState[row.player_id].clan_medals += clanContribution;
          cumulativeState[row.player_id].kills += killValue - Number(previousCumulative.total_kills || 0);
        }
        cumulativePrevious.set(row.player_id, { ...row, captured_at_utc: snapshot.captured_at_utc });
      }

      results[snapshot.snapshot_id] = {
        snapshot_id: snapshot.snapshot_id,
        league_week: weekId,
        baseline_snapshot_id: previousSnapshot ? previousSnapshot.snapshot_id : snapshot.snapshot_id,
        period_clan_medals_change: periodClan,
        period_kills_change: periodKills,
        weekly_clan_medals_earned: state.clan_medals += periodClan,
        weekly_kills_earned: state.kills += periodKills,
        period_players: clonePeriodPlayers(periodPlayers),
        players: clonePlayerTotals(state.players),
        cumulative_players: cloneCumulativePlayers(cumulativeState)
      };
      previousSnapshot = snapshot;
      previousRows = currentRows;
    }
    return results;
  }

  return { leagueWeekId, getRows, computeAll };
});
