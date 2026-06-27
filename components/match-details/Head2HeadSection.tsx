'use client';

import Image from 'next/image';
import { useHead2Head } from '@/hooks/useHead2Head';
import type { H2HMatch } from '@/lib/football-data/match-types';

function MiniCrest({ src, name }: { src: string | null; name: string }) {
  if (!src) return <span className="inline-block h-4 w-4 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />;
  return <Image src={src} alt={name} width={16} height={16} className="shrink-0 object-contain" unoptimized />;
}

function winnerName(match: H2HMatch): string | null {
  if (!match.score?.winner || match.score.winner === 'DRAW') return null;
  return match.score.winner === 'HOME_TEAM' ? match.homeTeam.name : match.awayTeam.name;
}

function RecordBar({
  homeWins,
  draws,
  awayWins,
  homeName,
  awayName,
}: {
  homeWins: number;
  draws: number;
  awayWins: number;
  homeName: string;
  awayName: string;
}) {
  const total = homeWins + draws + awayWins;
  if (total === 0) return null;

  const homeW = Math.round((homeWins / total) * 100);
  const drawW = Math.round((draws / total) * 100);
  const awayW = 100 - homeW - drawW;

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{homeWins}W</span>
        <span>{draws}D</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">{awayWins}W</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full">
        {homeW > 0 && (
          <div className="bg-emerald-500" style={{ width: `${homeW}%` }} title={`${homeName} wins`} />
        )}
        {drawW > 0 && (
          <div className="bg-gray-300 dark:bg-gray-600" style={{ width: `${drawW}%` }} title="Draws" />
        )}
        {awayW > 0 && (
          <div className="bg-blue-500" style={{ width: `${awayW}%` }} title={`${awayName} wins`} />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-gray-400">
        <span className="truncate max-w-[40%]">{homeName}</span>
        <span className="truncate max-w-[40%] text-right">{awayName}</span>
      </div>
    </div>
  );
}

function RecentMatchRow({ match }: { match: H2HMatch }) {
  const { home, away } = match.score?.fullTime ?? { home: null, away: null };
  const winner = winnerName(match);
  const isHomeWin = winner === match.homeTeam.name;
  const isAwayWin = winner === match.awayTeam.name;

  const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      {/* Home */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <MiniCrest src={match.homeTeam.crest} name={match.homeTeam.name} />
        <span className={`truncate text-xs font-semibold ${isHomeWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {match.homeTeam.name}
        </span>
      </div>

      {/* Score */}
      <div className="shrink-0 text-center">
        {home !== null && away !== null ? (
          <span className="text-sm font-black tabular-nums text-gray-900 dark:text-white">
            {home}–{away}
          </span>
        ) : (
          <span className="text-xs text-gray-400">vs</span>
        )}
        <p className="text-[10px] text-gray-400">{date}</p>
      </div>

      {/* Away */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <span className={`truncate text-xs font-semibold ${isAwayWin ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {match.awayTeam.name}
        </span>
        <MiniCrest src={match.awayTeam.crest} name={match.awayTeam.name} />
      </div>
    </div>
  );
}

interface Head2HeadSectionProps {
  matchId: string;
}

export function Head2HeadSection({ matchId }: Head2HeadSectionProps) {
  const { data, loading, error } = useHead2Head(matchId);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-gray-400">Could not load head-to-head data.</p>;
  }

  if (!data || !data.aggregates || data.aggregates.numberOfMatches === 0) {
    return null;
  }

  const { aggregates: head2head, matches } = data;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Head to Head
      </h3>
      {/* Summary stats */}
      <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex justify-between text-center text-xs text-gray-500 dark:text-gray-400">
          <span>{head2head.numberOfMatches} meetings</span>
          <span>{head2head.totalGoals} goals total</span>
        </div>
        <RecordBar
          homeWins={head2head.homeTeam.wins}
          draws={head2head.homeTeam.draws}
          awayWins={head2head.awayTeam.wins}
          homeName={head2head.homeTeam.name}
          awayName={head2head.awayTeam.name}
        />
      </div>

      {/* Recent matches */}
      {matches.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Recent meetings</p>
          {matches.map((m) => (
            <RecentMatchRow key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
