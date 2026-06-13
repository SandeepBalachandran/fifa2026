import { readStore, writeStore } from '../store';
import { fetchFixtures } from '../football-data/client';
import { detectBattle } from '../battles/detect';
import { updateBattleStatus } from '../battles/update';
import { getBattleByMatchId, upsertBattle } from '../battles/store';
import { calculateMatchPoints, calculateStageBonus } from '../scoring/calculate';
import { buildLeaderboard, snapshotRanks } from '../leaderboard/calculate';
import {
  generateMatchNotifications,
  generateBattleNotification,
  generateRankChangeNotifications,
} from '../notifications/generate';
import { addNotifications } from '../notifications/store';
import { markEliminated } from '../draft/store';
import type { Fixture } from '../football-data/types';

export async function runSync(): Promise<{ synced: number; error?: string }> {
  let fixtures: Fixture[];
  try {
    fixtures = await fetchFixtures();
  } catch (err) {
    return { synced: 0, error: String(err) };
  }

  const store = readStore();
  store.fixtures = fixtures;
  writeStore(store);

  await processFixtures(fixtures);
  return { synced: fixtures.length };
}

export async function processFixtures(fixtures: Fixture[]): Promise<void> {
  const store = readStore();
  const { ownership, eliminated, scoringRules, previousRanks } = store;

  for (const fixture of fixtures) {
    // Battle detection
    try {
      const existing = getBattleByMatchId(fixture.id);
      if (!existing) {
        const battle = detectBattle(fixture, ownership);
        if (battle) upsertBattle(battle);
      } else {
        updateBattleStatus(fixture);
      }
    } catch (err) {
      console.error(`[battles] failed for match ${fixture.id}:`, err);
    }

    // Scoring + notifications for finished matches
    if (fixture.status === 'FINISHED') {
      try {
        const matchPts = calculateMatchPoints(fixture, ownership, scoringRules, eliminated);
        const stagePts = calculateStageBonus(fixture, ownership, scoringRules);

        const fresh = readStore();
        for (const { ownerName, points } of [...matchPts, ...stagePts]) {
          fresh.scores[ownerName] = (fresh.scores[ownerName] ?? 0) + points;
        }

        // Detect eliminations for knockout losers
        if (fixture.stage !== 'GROUP_STAGE' && fixture.stage !== 'THIRD_PLACE') {
          const { home, away } = fixture.score.fullTime;
          if (home !== null && away !== null) {
            const loser = home < away ? fixture.homeTeam.name : fixture.awayTeam.name;
            if (home !== away && !fresh.eliminated.includes(loser)) {
              fresh.eliminated.push(loser);
              markEliminated(loser);
            }
          }
        }

        writeStore(fresh);

        const notifs = generateMatchNotifications(
          matchPts,
          fixture.homeTeam.name,
          fixture.awayTeam.name
        );
        await addNotifications(notifs);

        // Battle outcome notifications
        const battle = getBattleByMatchId(fixture.id);
        if (battle && battle.outcome !== null) {
          await addNotifications(generateBattleNotification(battle));
        }
      } catch (err) {
        console.error(`[scoring] failed for match ${fixture.id}:`, err);
      }
    }
  }

  // Leaderboard rank change notifications
  try {
    const updatedStore = readStore();
    const entries = buildLeaderboard(updatedStore);
    const rankNotes = generateRankChangeNotifications(previousRanks, entries);
    await addNotifications(rankNotes);

    updatedStore.previousRanks = snapshotRanks(entries);
    writeStore(updatedStore);
  } catch (err) {
    console.error('[leaderboard] rank update failed:', err);
  }
}
