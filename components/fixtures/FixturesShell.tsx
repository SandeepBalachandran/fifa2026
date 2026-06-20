'use client';

import { useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { MatchDetailsDrawer } from '@/components/match-details/MatchDetailsDrawer';
import { CompetitionSwitcher } from '@/components/CompetitionSwitcher';
import { SeasonSwitcher } from '@/components/SeasonSwitcher';
import type { Fixture } from '@/lib/football-data/types';
import type { DirectBattle } from '@/lib/battles/types';

const STAGE_PREFERRED_ORDER = [
  'REGULAR_SEASON',
  'GROUP_STAGE',
  'LAST_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const STAGE_LABELS: Record<string, string> = {
  REGULAR_SEASON: 'Regular Season',
  GROUP_STAGE:    'Group Stage',
  LAST_16:        'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS:    'Semi-Finals',
  THIRD_PLACE:    'Third Place',
  FINAL:          'Final',
};

function formatStageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupByStage(fixtures: Fixture[]): [string, Fixture[]][] {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const group = map.get(f.stage) ?? [];
    group.push(f);
    map.set(f.stage, group);
  }
  // Sort groups by preferred order; unknown stages go to end alphabetically
  const entries = Array.from(map.entries()).sort(([a], [b]) => {
    const ai = STAGE_PREFERRED_ORDER.indexOf(a);
    const bi = STAGE_PREFERRED_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  // Sort fixtures within each group by date
  return entries.map(([stage, group]) => [
    stage,
    group.sort((a, b) => a.utcDate.localeCompare(b.utcDate)),
  ]);
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
          📅 Fixtures
        </h1>
        <div className="flex items-center gap-2">
          <CompetitionSwitcher />
          <SeasonSwitcher />
        </div>
      </div>

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
              {formatStageLabel(stage)}
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
