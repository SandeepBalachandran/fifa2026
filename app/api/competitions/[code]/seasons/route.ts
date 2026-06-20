import { NextResponse } from 'next/server';
import { fetchCompetitionSeasons } from '@/lib/football-data/client';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const seasons = await fetchCompetitionSeasons(code);
    return NextResponse.json(seasons);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
