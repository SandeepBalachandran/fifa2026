import { fetchScorers } from '@/lib/football-data/client';
import { BET_OWNERSHIP } from '@/lib/bet-tracker/config';
import { CompetitionSwitcher } from '@/components/CompetitionSwitcher';
import { SeasonSwitcher } from '@/components/SeasonSwitcher';
import { PlanUpgradeBanner } from '@/components/PlanUpgradeBanner';
import { ScorersShell } from '@/components/scorers/ScorersShell';
import type { TopScorer } from '@/lib/football-data/scorer-types';

// ── Owner goal tally ───────────────────────────────────────────────────────────

function buildOwnerTally(scorers: TopScorer[]): { sandy: number; rahul: number; unowned: number } {
  let sandy = 0, rahul = 0, unowned = 0;
  for (const s of scorers) {
    const owner = BET_OWNERSHIP[s.team.name];
    if (owner === 'Sandy') sandy += s.goals;
    else if (owner === 'Rahul') rahul += s.goals;
    else unowned += s.goals;
  }
  return { sandy, rahul, unowned };
}

function OwnerTallyBar({ sandy, rahul, unowned }: { sandy: number; rahul: number; unowned: number }) {
  const total = sandy + rahul + unowned;
  if (total === 0) return null;

  const sandyPct = Math.round((sandy / total) * 100);
  const rahulPct = Math.round((rahul / total) * 100);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="bg-linear-to-r from-amber-500 to-yellow-600 px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-900/70">
          🎯 Goals by Bet Owner
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{sandy}</p>
            <p className="text-xs font-semibold text-gray-500">Sandy</p>
          </div>
          <div className="flex-1">
            {/* stacked bar */}
            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${sandyPct}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${rahulPct}%` }}
              />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-gray-400">
              <span>{sandyPct}%</span>
              <span className="text-gray-300 dark:text-gray-600">{unowned} unowned</span>
              <span>{rahulPct}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{rahul}</p>
            <p className="text-xs font-semibold text-gray-500">Rahul</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ScorersPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; season?: string }>;
}) {
  const { competition = 'WC', season } = await searchParams;
  const seasonYear = season ? parseInt(season, 10) : undefined;
  let scorers: TopScorer[] = [];
  let fetchError: string | null = null;

  try {
    scorers = await fetchScorers(competition, 50, seasonYear);
  } catch (err) {
    fetchError = String(err);
  }

  const tally = buildOwnerTally(scorers);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
            ⚽ Top Scorers
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Golden Boot ranking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompetitionSwitcher />
          <SeasonSwitcher />
        </div>
      </div>

      {fetchError && <PlanUpgradeBanner />}

      {!fetchError && scorers.length === 0 && (
        <p className="text-sm text-gray-400">No scorers available yet — check back once matches begin.</p>
      )}

      {scorers.length > 0 && (
        <>
          <OwnerTallyBar {...tally} />
          <ScorersShell scorers={scorers} />
        </>
      )}
    </main>
  );
}
