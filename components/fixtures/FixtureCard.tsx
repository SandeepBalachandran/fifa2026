import Image from 'next/image';
import type { Fixture } from '@/lib/football-data/types';
import type { DirectBattle } from '@/lib/battles/types';
import { getBetLabel } from '@/lib/bet-tracker/config';

function TeamCrest({ crest, name, size = 28 }: { crest: string | null; name: string; size?: number }) {
  if (!crest) return <span className="inline-block shrink-0 rounded-full bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={crest} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

interface FixtureCardProps {
  fixture: Fixture;
  battle?: DirectBattle | null;
  ownership?: Record<string, string>;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  IN_PLAY: { label: '● Live',  className: 'bg-red-500 text-white animate-pulse' },
  PAUSED:  { label: 'HT',      className: 'bg-orange-400 text-white' },
  FINISHED:{ label: 'FT',      className: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  TIMED:   { label: 'Soon',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
};

export function FixtureCard({ fixture, battle, ownership = {} }: Readonly<FixtureCardProps>) {
  const formattedDate = new Date(fixture.utcDate).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isFinished = fixture.status === 'FINISHED';
  const isLive     = fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED';
  const badge      = STATUS_BADGE[fixture.status];

  const homeOwner = battle?.homeOwner ?? ownership[fixture.homeTeam.name] ?? null;
  const awayOwner = battle?.awayOwner ?? ownership[fixture.awayTeam.name] ?? null;
  const homeBetLabel = getBetLabel(fixture.homeTeam.name);
  const awayBetLabel = getBetLabel(fixture.awayTeam.name);
  const { home, away } = fixture.score.fullTime;

  const cardClass = battle
    ? 'border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/40 dark:to-orange-950/40'
    : isLive
    ? 'border-red-300 bg-linear-to-r from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/40 dark:to-rose-950/40'
    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900';

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${cardClass}`}>
      {/* Badges */}
      <div className="mb-3 flex items-center gap-2">
        {battle && (
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
            ⚔ Direct Battle
          </span>
        )}
        {badge && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.className}`}>
            {badge.label}
          </span>
        )}
        {fixture.matchday != null && (
          <span className="ml-auto text-xs text-gray-400">MD {fixture.matchday}</span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamCrest crest={fixture.homeTeam.crest} name={fixture.homeTeam.name} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-1">
              <p className={`truncate font-bold leading-tight ${isLive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {fixture.homeTeam.name}
              </p>
              {homeBetLabel && <span className="shrink-0 text-xs font-medium text-amber-500 dark:text-amber-400">{homeBetLabel}</span>}
            </div>
            {homeOwner && (
              <p className="truncate text-xs font-medium text-blue-600 dark:text-blue-400">{homeOwner}</p>
            )}
          </div>
        </div>

        {/* Score / vs */}
        <div className="shrink-0 text-center">
          {(isFinished || isLive) && home !== null && away !== null ? (
            <span className={`text-xl font-black tabular-nums ${isLive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {home} – {away}
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-300 dark:text-gray-600">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="min-w-0 text-right">
            <div className="flex min-w-0 items-baseline justify-end gap-1">
              {awayBetLabel && <span className="shrink-0 text-xs font-medium text-amber-500 dark:text-amber-400">{awayBetLabel}</span>}
              <p className={`truncate font-bold leading-tight ${isLive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {fixture.awayTeam.name}
              </p>
            </div>
            {awayOwner && (
              <p className="truncate text-xs font-medium text-blue-600 dark:text-blue-400">{awayOwner}</p>
            )}
          </div>
          <TeamCrest crest={fixture.awayTeam.crest} name={fixture.awayTeam.name} />
        </div>
      </div>

      <p className="mt-2.5 text-xs text-gray-400">{formattedDate}</p>
    </div>
  );
}
