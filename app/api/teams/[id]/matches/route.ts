import { mapMatch, type ApiMatch } from '@/lib/football-data/client';
import type { Fixture } from '@/lib/football-data/types';

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
    const url = new URL(`https://api.football-data.org/v4/teams/${id}/matches`);
    url.searchParams.set('competitions', 'WC');

    const res = await fetch(url.toString(), {
      headers: { 'X-Auth-Token': getApiKey() },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Football Data API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { matches: ApiMatch[] };
    const fixtures: Fixture[] = data.matches.map(mapMatch);
    return Response.json(fixtures);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
