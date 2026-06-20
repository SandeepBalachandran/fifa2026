import { fetchFixtures } from '@/lib/football-data/client';
import { getBattles } from '@/lib/battles/store';
import { readStore } from '@/lib/store';
import { FixturesShell } from '@/components/fixtures/FixturesShell';
import { PlanUpgradeBanner } from '@/components/PlanUpgradeBanner';
import type { Fixture } from '@/lib/football-data/types';

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; season?: string }>;
}) {
  const { competition = 'WC', season } = await searchParams;
  const seasonYear = season ? parseInt(season, 10) : undefined;
  let fixtures: Fixture[] = [];
  let fetchError: string | null = null;

  try {
    fixtures = await fetchFixtures(competition, undefined, seasonYear);
  } catch (err) {
    fetchError = String(err);
  }

  const battles = getBattles();
  const { ownership } = readStore();

  if (fetchError) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
          📅 Fixtures
        </h1>
        <PlanUpgradeBanner />
      </main>
    );
  }

  return (
    <FixturesShell
      fixtures={fixtures}
      battles={battles}
      ownership={ownership}
      fetchError={fetchError}
    />
  );
}
