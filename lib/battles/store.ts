import { readStore, writeStore } from '../store';
import type { DirectBattle } from './types';

export function getBattles(): DirectBattle[] {
  const store = readStore();
  return Object.values(store.battles);
}

export function getBattleByMatchId(matchId: string): DirectBattle | null {
  const store = readStore();
  return store.battles[matchId] ?? null;
}

export function upsertBattle(battle: DirectBattle): void {
  const store = readStore();
  store.battles[battle.matchId] = battle;
  writeStore(store);
}
