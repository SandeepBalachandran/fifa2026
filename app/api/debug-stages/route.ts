import { fetchFixtures } from '@/lib/football-data/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const fixtures = await fetchFixtures().catch(() => []);
  const stages = [...new Set(fixtures.map((f) => f.stage))].sort();
  const finished = fixtures
    .filter((f) => f.status === 'FINISHED')
    .map((f) => ({ stage: f.stage, home: f.homeTeam.name, away: f.awayTeam.name }));
  return NextResponse.json({ stages, finished });
}
