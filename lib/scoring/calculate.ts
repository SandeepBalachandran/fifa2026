import type { Fixture, OwnershipMap } from '../football-data/types';
import type { ScoringRules } from './types';

export interface MatchPointsResult {
  ownerName: string;
  points: number;
  teamName: string;
}

export function calculateMatchPoints(
  fixture: Fixture,
  ownership: OwnershipMap,
  rules: ScoringRules,
  eliminated: string[]
): MatchPointsResult[] {
  if (fixture.status !== 'FINISHED') return [];

  const { home, away } = fixture.score.fullTime;
  if (home === null || away === null) return [];

  const results: MatchPointsResult[] = [];

  const homeTeam = fixture.homeTeam.name;
  const awayTeam = fixture.awayTeam.name;
  const homeOwner = ownership[homeTeam];
  const awayOwner = ownership[awayTeam];

  if (homeOwner && !eliminated.includes(homeTeam)) {
    let pts = 0;
    if (home > away) pts = rules.win;
    else if (home === away) pts = rules.draw;
    else pts = rules.loss;
    if (away === 0) pts += rules.cleanSheet;
    results.push({ ownerName: homeOwner, points: pts, teamName: homeTeam });
  }

  if (awayOwner && !eliminated.includes(awayTeam)) {
    let pts = 0;
    if (away > home) pts = rules.win;
    else if (away === home) pts = rules.draw;
    else pts = rules.loss;
    if (home === 0) pts += rules.cleanSheet;
    results.push({ ownerName: awayOwner, points: pts, teamName: awayTeam });
  }

  return results;
}

const STAGE_BONUS: Record<string, keyof ScoringRules> = {
  LAST_16: 'roundOf16',
  QUARTER_FINALS: 'quarterFinal',
  SEMI_FINALS: 'semiFinal',
  FINAL: 'champion',
};

export function calculateStageBonus(
  fixture: Fixture,
  ownership: OwnershipMap,
  rules: ScoringRules
): MatchPointsResult[] {
  if (fixture.status !== 'FINISHED') return [];
  const { home, away } = fixture.score.fullTime;
  if (home === null || away === null) return [];
  if (fixture.stage === 'GROUP_STAGE' || fixture.stage === 'THIRD_PLACE') return [];

  const bonusKey = STAGE_BONUS[fixture.stage];
  if (!bonusKey) return [];

  const results: MatchPointsResult[] = [];
  const homeTeam = fixture.homeTeam.name;
  const awayTeam = fixture.awayTeam.name;

  if (home > away) {
    const owner = ownership[homeTeam];
    if (owner) {
      const bonus = fixture.stage === 'FINAL' ? rules.champion : (rules[bonusKey] as number);
      results.push({ ownerName: owner, points: bonus, teamName: homeTeam });
    }
  } else if (away > home) {
    const owner = ownership[awayTeam];
    if (owner) {
      const bonus = fixture.stage === 'FINAL' ? rules.champion : (rules[bonusKey] as number);
      results.push({ ownerName: owner, points: bonus, teamName: awayTeam });
    }
  }

  return results;
}
