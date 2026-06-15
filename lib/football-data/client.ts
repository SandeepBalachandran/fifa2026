import type { Fixture, GroupStanding, MatchStage, MatchStatus, StandingEntry } from './types';
import type { TopScorer } from './scorer-types';

const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';

function getApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY environment variable is not set');
  return key;
}

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

interface ApiMatch {
  id: number;
  matchday: number | null;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
  } | null;
}

function mapMatch(m: ApiMatch): Fixture {
  return {
    id: String(m.id),
    matchday: m.matchday ?? null,
    homeTeam: { id: String(m.homeTeam.id), name: m.homeTeam.name, crest: m.homeTeam.crest ?? null },
    awayTeam: { id: String(m.awayTeam.id), name: m.awayTeam.name, crest: m.awayTeam.crest ?? null },
    utcDate: m.utcDate,
    status: m.status as MatchStatus,
    stage: m.stage as MatchStage,
    score: { fullTime: m.score?.fullTime ?? { home: null, away: null } },
  };
}

export async function fetchFixtures(matchday?: number): Promise<Fixture[]> {
  const url = new URL(`${BASE_URL}/competitions/${COMPETITION}/matches`);
  if (matchday !== undefined) url.searchParams.set('matchday', String(matchday));

  const res = await fetch(url.toString(), {
    headers: { 'X-Auth-Token': getApiKey() },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Football Data API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { matches: ApiMatch[] };
  return data.matches.map(mapMatch);
}

interface ApiStandingTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

interface ApiStandingEntry {
  position: number;
  team: ApiStandingTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface ApiGroupStanding {
  stage: string;
  type: string;
  group: string | null;
  table: ApiStandingEntry[];
}

function mapStandingEntry(e: ApiStandingEntry): StandingEntry {
  return {
    position: e.position,
    team: {
      id: String(e.team.id),
      name: e.team.name,
      shortName: e.team.shortName,
      tla: e.team.tla,
      crest: e.team.crest ?? null,
    },
    playedGames: e.playedGames,
    won: e.won,
    draw: e.draw,
    lost: e.lost,
    points: e.points,
    goalsFor: e.goalsFor,
    goalsAgainst: e.goalsAgainst,
    goalDifference: e.goalDifference,
  };
}

export async function fetchStandings(season?: number, matchday?: number): Promise<GroupStanding[]> {
  const url = new URL(`${BASE_URL}/competitions/${COMPETITION}/standings`);
  if (season !== undefined) url.searchParams.set('season', String(season));
  if (matchday !== undefined) url.searchParams.set('matchday', String(matchday));

  const res = await fetch(url.toString(), {
    headers: { 'X-Auth-Token': getApiKey() },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Football Data API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { standings: ApiGroupStanding[] };
  return data.standings
    .filter((s) => s.type === 'TOTAL')
    .map((s) => ({
      group: s.group ?? 'OVERALL',
      table: s.table.map(mapStandingEntry),
    }));
}

export async function fetchScorers(limit = 50): Promise<TopScorer[]> {
  const url = new URL(`${BASE_URL}/competitions/${COMPETITION}/scorers`);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: { 'X-Auth-Token': getApiKey() },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Football Data API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { scorers: TopScorer[] };
  return data.scorers;
}

export { mapMatch };
export type { ApiMatch };
