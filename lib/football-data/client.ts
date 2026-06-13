import type { Fixture, GroupStanding, MatchStage, MatchStatus, StandingEntry } from './types';

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
  };
}

function mapMatch(m: ApiMatch): Fixture {
  return {
    id: String(m.id),
    matchday: m.matchday ?? null,
    homeTeam: { id: String(m.homeTeam.id), name: m.homeTeam.name },
    awayTeam: { id: String(m.awayTeam.id), name: m.awayTeam.name },
    utcDate: m.utcDate,
    status: m.status as MatchStatus,
    stage: m.stage as MatchStage,
    score: { fullTime: m.score.fullTime },
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
