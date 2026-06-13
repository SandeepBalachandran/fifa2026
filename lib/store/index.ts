import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { DirectBattle } from '../battles/types';
import type { AppNotification } from '../notifications/types';
import type { ScoringRules } from '../scoring/types';
import type { Fixture } from '../football-data/types';
import { DEFAULT_SCORING_RULES } from '../scoring/types';

export interface DraftStore {
  participants: string[];
  ownership: Record<string, string>;
  eliminated: string[];
  scores: Record<string, number>;
  previousRanks: Record<string, number>;
  notifications: AppNotification[];
  battles: Record<string, DirectBattle>;
  scoringRules: ScoringRules;
  fixtures: Fixture[];
}

const STORE_PATH = join(process.cwd(), 'data', 'draft-store.json');

const EMPTY_STORE: DraftStore = {
  participants: [],
  ownership: {},
  eliminated: [],
  scores: {},
  previousRanks: {},
  notifications: [],
  battles: {},
  scoringRules: DEFAULT_SCORING_RULES,
  fixtures: [],
};

function ensureStoreFile() {
  const dir = join(process.cwd(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(STORE_PATH)) {
    writeFileSync(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2), 'utf-8');
  }
}

export function readStore(): DraftStore {
  ensureStoreFile();
  try {
    const raw = JSON.parse(readFileSync(STORE_PATH, 'utf-8')) as Partial<DraftStore>;
    return { ...EMPTY_STORE, ...raw };
  } catch {
    return { ...EMPTY_STORE };
  }
}

export function writeStore(store: DraftStore): void {
  ensureStoreFile();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}
