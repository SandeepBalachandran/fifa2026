'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { KnockoutBracket } from './KnockoutBracket';
import { MatchDetailsDrawer } from '@/components/match-details/MatchDetailsDrawer';
import { CompetitionSwitcher } from '@/components/CompetitionSwitcher';
import { SeasonSwitcher } from '@/components/SeasonSwitcher';
import type { Fixture } from '@/lib/football-data/types';
import type { DirectBattle } from '@/lib/battles/types';

const STAGE_PREFERRED_ORDER = [
  'REGULAR_SEASON',
  'GROUP_STAGE',
  'LAST_32',
  'LAST_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const STAGE_LABELS: Record<string, string> = {
  REGULAR_SEASON: 'Regular Season',
  GROUP_STAGE:    'Group Stage',
  LAST_32:        'Round of 32',
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

const KNOCKOUT_STAGES = new Set(['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']);

export function FixturesShell({ fixtures, battles, ownership, fetchError }: FixturesShellProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'bracket'>('list');

  const hasKnockout = fixtures.some((f) => KNOCKOUT_STAGES.has(f.stage));

  const battleIndex: Record<string, DirectBattle> = Object.fromEntries(
    battles.map((b) => [b.matchId, b])
  );
  const grouped = groupByStage(fixtures);

  // Find the first fixture that is live, or within the last 2 hours, or in the future
  const anchorId = useMemo(() => {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    const flat = fixtures
      .slice()
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
    return flat.find(
      (f) =>
        f.status === 'IN_PLAY' ||
        f.status === 'PAUSED' ||
        new Date(f.utcDate).getTime() >= cutoff
    )?.id ?? null;
  }, [fixtures]);

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!anchorRef.current) return;
    // Small delay lets the page paint first before scrolling
    const timer = setTimeout(() => {
      anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
  }, [anchorId]);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
          📅 Fixtures
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <CompetitionSwitcher />
          <SeasonSwitcher />
        </div>
      </div>

      {/* Sticky toggle — always visible while scrolling */}
      {hasKnockout && (
        <div className="sticky top-14 z-20 -mx-4 mb-4 flex justify-center border-b border-gray-100 bg-white/90 px-4 py-2 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-semibold dark:border-gray-700">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('bracket')}
              className={`px-4 py-2 transition-colors ${view === 'bracket' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              Bracket
            </button>
          </div>
        </div>
      )}

      {fetchError && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Failed to load fixtures: {fetchError}
        </p>
      )}

      {!fetchError && fixtures.length === 0 && (
        <p className="text-sm text-zinc-500">No fixtures available.</p>
      )}

      {view === 'bracket' && (
        <KnockoutBracket fixtures={fixtures} />
      )}

      {view === 'list' && (
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
                    ref={fixture.id === anchorId ? anchorRef : null}
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
      )}

      <MatchDetailsDrawer
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </main>
  );
}
