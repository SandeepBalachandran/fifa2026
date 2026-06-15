'use client';

import { useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { MatchDetailsDrawer } from '@/components/match-details/MatchDetailsDrawer';
import type { Fixture } from '@/lib/football-data/types';
import type { DirectBattle } from '@/lib/battles/types';

const STAGE_ORDER = [
  'GROUP_STAGE',
  'LAST_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
] as const;

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE:    'Group Stage',
  LAST_16:        'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS:    'Semi-Finals',
  THIRD_PLACE:    'Third Place',
  FINAL:          'Final',
};

function groupByStage(fixtures: Fixture[]): [string, Fixture[]][] {
  const map = new Map<string, Fixture[]>();
  for (const stage of STAGE_ORDER) {
    const group = fixtures
      .filter((f) => f.stage === stage)
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    if (group.length > 0) map.set(stage, group);
  }
  return Array.from(map.entries());
}

interface FixturesShellProps {
  fixtures: Fixture[];
  battles: DirectBattle[];
  ownership: Record<string, string>;
  fetchError: string | null;
}

export function FixturesShell({ fixtures, battles, ownership, fetchError }: FixturesShellProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const battleIndex: Record<string, DirectBattle> = Object.fromEntries(
    battles.map((b) => [b.matchId, b])
  );
  const grouped = groupByStage(fixtures);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        📅 Fixtures
      </h1>

      {fetchError && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Failed to load fixtures: {fetchError}
        </p>
      )}

      {!fetchError && fixtures.length === 0 && (
        <p className="text-sm text-zinc-500">No fixtures available.</p>
      )}

      <div className="flex flex-col gap-10">
        {grouped.map(([stage, stageFixtures]) => (
          <section key={stage}>
            <h2 className="mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">
              {STAGE_LABELS[stage] ?? stage}
            </h2>
            <div className="flex flex-col gap-3">
              {stageFixtures.map((fixture) => (
                <button
                  key={fixture.id}
                  onClick={() => setSelectedMatchId(fixture.id)}
                  className="w-full text-left"
                  aria-label={`View details for ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`}
                >
                  <FixtureCard
                    fixture={fixture}
                    battle={battleIndex[fixture.id] ?? null}
                    ownership={ownership}
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <MatchDetailsDrawer
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </main>
  );
}
