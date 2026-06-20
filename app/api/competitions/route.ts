import { NextResponse } from 'next/server';
import { fetchCompetitions } from '@/lib/football-data/client';

export async function GET() {
  try {
    const competitions = await fetchCompetitions();
    return NextResponse.json(competitions);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
