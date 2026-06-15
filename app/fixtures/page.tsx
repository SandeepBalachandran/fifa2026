import { fetchFixtures } from '@/lib/football-data/client';
import { getBattles } from '@/lib/battles/store';
import { readStore } from '@/lib/store';
import { FixturesShell } from '@/components/fixtures/FixturesShell';
import type { Fixture } from '@/lib/football-data/types';

export default async function FixturesPage() {
  let fixtures: Fixture[] = [];
  let fetchError: string | null = null;

  try {
    fixtures = await fetchFixtures();
  } catch (err) {
    fetchError = String(err);
  }

  const battles = getBattles();
  const { ownership } = readStore();

  return (
    <FixturesShell
      fixtures={fixtures}
      battles={battles}
      ownership={ownership}
      fetchError={fetchError}
    />
  );
}
