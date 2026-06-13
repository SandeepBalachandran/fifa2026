import { readStore, writeStore } from '../store';
import { calculateMatchPoints, calculateStageBonus } from './calculate';
import type { ScoringRules } from './types';

export function getScores(): Record<string, number> {
  return readStore().scores;
}

export function addPoints(ownerName: string, points: number): void {
  const store = readStore();
  store.scores[ownerName] = (store.scores[ownerName] ?? 0) + points;
  writeStore(store);
}

export function getScoringRules() {
  return readStore().scoringRules;
}

export function updateScoringRules(rules: ScoringRules): void {
  const store = readStore();
  store.scoringRules = rules;
  writeStore(store);
}

export function recalculateAllScores(): void {
  const store = readStore();
  const { fixtures, ownership, eliminated, scoringRules } = store;

  store.scores = {};
  for (const fixture of fixtures) {
    const matchPts = calculateMatchPoints(fixture, ownership, scoringRules, eliminated);
    const stagePts = calculateStageBonus(fixture, ownership, scoringRules);
    for (const { ownerName, points } of [...matchPts, ...stagePts]) {
      store.scores[ownerName] = (store.scores[ownerName] ?? 0) + points;
    }
  }

  writeStore(store);
}
