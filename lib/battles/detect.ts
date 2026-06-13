import type { Fixture, OwnershipMap } from '../football-data/types';
import type { DirectBattle } from './types';

export function detectBattle(fixture: Fixture, ownership: OwnershipMap): DirectBattle | null {
  const homeOwner = ownership[fixture.homeTeam.name];
  const awayOwner = ownership[fixture.awayTeam.name];

  if (!homeOwner || !awayOwner) return null;
  if (homeOwner === awayOwner) return null;

  return {
    matchId: fixture.id,
    homeTeam: fixture.homeTeam.name,
    awayTeam: fixture.awayTeam.name,
    homeCrest: fixture.homeTeam.crest,
    awayCrest: fixture.awayTeam.crest,
    homeOwner,
    awayOwner,
    status: 'SCHEDULED',
    outcome: null,
    matchDate: fixture.utcDate,
  };
}
