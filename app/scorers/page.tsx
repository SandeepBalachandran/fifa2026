import Image from 'next/image';
import { fetchScorers } from '@/lib/football-data/client';
import { getBetLabel, BET_OWNERSHIP } from '@/lib/bet-tracker/config';
import type { TopScorer } from '@/lib/football-data/scorer-types';

function Crest({ src, name, size = 24 }: { src: string | null; name: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Image src={src} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="w-7 text-center text-sm font-bold text-gray-400">{rank}</span>;
}

function StatCell({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-black text-gray-900 dark:text-white">
        {value ?? '—'}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
}

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

export default async function ScorersPage() {
  let scorers: TopScorer[] = [];
  let fetchError: string | null = null;

  try {
    scorers = await fetchScorers(50);
  } catch (err) {
    fetchError = String(err);
  }

  const tally = buildOwnerTally(scorers);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        ⚽ Top Scorers
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        Golden Boot — World Cup 2026
      </p>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Failed to load scorers: {fetchError}
        </div>
      )}

      {!fetchError && scorers.length === 0 && (
        <p className="text-sm text-gray-400">No scorers available yet — check back once matches begin.</p>
      )}

      {scorers.length > 0 && (
        <>
          <OwnerTallyBar {...tally} />

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] items-center border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/60">
              <span>#</span>
              <span>Player</span>
              <span className="text-center">Goals</span>
              <span className="text-center">Ast</span>
              <span className="text-center">Pen</span>
              <span className="text-center">MP</span>
            </div>

            {scorers.map((s, i) => {
              const rank = i + 1;
              const betLabel = getBetLabel(s.team.name);
              const rowBg =
                rank === 1 ? 'bg-amber-50 dark:bg-amber-950/30' :
                rank === 2 ? 'bg-slate-50 dark:bg-slate-800/30' :
                rank === 3 ? 'bg-orange-50 dark:bg-orange-950/20' :
                'hover:bg-gray-50 dark:hover:bg-gray-800/40';

              return (
                <div
                  key={`${s.player.id}-${i}`}
                  className={`grid grid-cols-[40px_1fr_80px_80px_80px_80px] items-center border-b border-gray-50 px-4 py-3 last:border-0 dark:border-gray-800 ${rowBg}`}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <RankBadge rank={rank} />
                  </div>

                  {/* Player + team */}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900 dark:text-white">
                      {s.player.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Crest src={s.team.crest} name={s.team.name} size={16} />
                      <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {s.team.shortName || s.team.name}
                      </span>
                      {betLabel && (
                        <span className="shrink-0 text-xs font-bold text-amber-500 dark:text-amber-400">
                          {betLabel}
                        </span>
                      )}
                      {s.player.nationality && (
                        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                          · {s.player.nationality}
                        </span>
                      )}
                    </div>
                  </div>

                  <StatCell value={s.goals}     label="Goals" />
                  <StatCell value={s.assists}   label="Ast"   />
                  <StatCell value={s.penalties} label="Pen"   />
                  <StatCell value={s.playedMatches} label="MP" />
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
