import type { Fixture } from '../football-data/types';
import type { BattleOutcome, BattleStatus, DirectBattle } from './types';
import { getBattleByMatchId, upsertBattle } from './store';

function resolveOutcome(fixture: Fixture): BattleOutcome {
  const { home, away } = fixture.score.fullTime;
  if (home === null || away === null) return null;
  if (home > away) return 'HOME_WIN';
  if (away > home) return 'AWAY_WIN';
  return 'DRAW';
}

function resolveStatus(fixture: Fixture): BattleStatus {
  if (fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED') return 'LIVE';
  if (fixture.status === 'FINISHED') return 'FINISHED';
  return 'SCHEDULED';
}

export function updateBattleStatus(fixture: Fixture): void {
  const existing = getBattleByMatchId(fixture.id);
  if (!existing) return;

  const status = resolveStatus(fixture);
  const outcome = status === 'FINISHED' ? resolveOutcome(fixture) : existing.outcome;

  const updated: DirectBattle = { ...existing, status, outcome };
  upsertBattle(updated);
}
