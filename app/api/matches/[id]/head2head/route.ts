import type { Head2HeadResult } from '@/lib/football-data/match-types';

function getApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY environment variable is not set');
  return key;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches/${id}/head2head?limit=5`,
      {
        headers: { 'X-Auth-Token': getApiKey() },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return Response.json(
        { error: `Football Data API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as Head2HeadResult;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
