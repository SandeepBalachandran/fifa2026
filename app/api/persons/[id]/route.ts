import type { PersonDetail } from '@/lib/football-data/person-types';

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
    const res = await fetch(`https://api.football-data.org/v4/persons/${id}`, {
      headers: { 'X-Auth-Token': getApiKey() },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Football Data API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as PersonDetail;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
