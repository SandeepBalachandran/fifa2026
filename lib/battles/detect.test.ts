import { describe, it, expect } from 'vitest';
import { detectBattle } from './detect';
import type { Fixture } from '../football-data/types';

const fixture: Fixture = {
  id: 'match-1',
  matchday: 1,
  homeTeam: { id: 'team-bra', name: 'Brazil', crest: null },
  awayTeam: { id: 'team-arg', name: 'Argentina', crest: null },
  utcDate: '2026-06-15T18:00:00Z',
  status: 'SCHEDULED',
  stage: 'GROUP_STAGE',
  score: { fullTime: { home: null, away: null } },
};

describe('detectBattle', () => {
  it('returns a battle when both teams have different owners', () => {
    const ownership = { Brazil: 'Alice', Argentina: 'Bob' };
    const result = detectBattle(fixture, ownership);
    expect(result).not.toBeNull();
    expect(result?.matchId).toBe('match-1');
    expect(result?.homeOwner).toBe('Alice');
    expect(result?.awayOwner).toBe('Bob');
  });

  it('returns null when the home team is unowned', () => {
    const ownership = { Argentina: 'Bob' };
    expect(detectBattle(fixture, ownership)).toBeNull();
  });

  it('returns null when the away team is unowned', () => {
    const ownership = { Brazil: 'Alice' };
    expect(detectBattle(fixture, ownership)).toBeNull();
  });

  it('returns null when neither team is owned', () => {
    expect(detectBattle(fixture, {})).toBeNull();
  });

  it('returns null when both teams are owned by the same participant', () => {
    const ownership = { Brazil: 'Alice', Argentina: 'Alice' };
    expect(detectBattle(fixture, ownership)).toBeNull();
  });
});
