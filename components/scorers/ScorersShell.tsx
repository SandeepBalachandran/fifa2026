'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PlayerDrawer } from '@/components/PlayerDrawer';
import { getBetLabel } from '@/lib/bet-tracker/config';
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

interface ScorersShellProps {
  scorers: TopScorer[];
}

export function ScorersShell({ scorers }: ScorersShellProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {/* Table header */}
        <div className="grid grid-cols-[32px_1fr_56px] items-center border-b border-gray-100 bg-gray-50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/60 sm:grid-cols-[36px_1fr_64px_64px_64px_64px] sm:px-4">
          <span>#</span>
          <span>Player</span>
          <span className="text-center">Goals</span>
          <span className="hidden text-center sm:block">Ast</span>
          <span className="hidden text-center sm:block">Pen</span>
          <span className="hidden text-center sm:block">MP</span>
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
            <button
              key={`${s.player.id}-${i}`}
              onClick={() => setSelectedPlayerId(s.player.id)}
              className={`grid w-full grid-cols-[32px_1fr_56px] items-center border-b border-gray-50 px-3 py-3 text-left last:border-0 dark:border-gray-800 sm:grid-cols-[36px_1fr_64px_64px_64px_64px] sm:px-4 ${rowBg}`}
            >
              {/* Rank */}
              <div className="flex items-center">
                <RankBadge rank={rank} />
              </div>

              {/* Player + team */}
              <div className="min-w-0">
                <p className="truncate font-bold text-green-700 underline underline-offset-2 decoration-dotted dark:text-green-400">
                  {s.player.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
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
                    <span className="hidden shrink-0 text-xs text-gray-400 dark:text-gray-500 sm:inline">
                      · {s.player.nationality}
                    </span>
                  )}
                </div>
              </div>

              <StatCell value={s.goals} label="Goals" />
              <div className="hidden sm:block"><StatCell value={s.assists} label="Ast" /></div>
              <div className="hidden sm:block"><StatCell value={s.penalties} label="Pen" /></div>
              <div className="hidden sm:block"><StatCell value={s.playedMatches} label="MP" /></div>
            </button>
          );
        })}
      </div>

      <PlayerDrawer
        personId={selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
      />
    </>
  );
}
