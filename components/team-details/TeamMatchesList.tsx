import Image from 'next/image';
import type { Fixture } from '@/lib/football-data/types';

function Crest({ src, name, size = 20 }: { src: string | null; name: string; size?: number }) {
  if (!src) return <span className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={src} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  FINISHED:  { label: 'FT',    cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  IN_PLAY:   { label: '● Live', cls: 'bg-red-500 text-white animate-pulse' },
  PAUSED:    { label: 'HT',    cls: 'bg-orange-400 text-white' },
  TIMED:     { label: 'Soon',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
};

function MatchRow({ fixture, teamName }: { fixture: Fixture; teamName: string }) {
  const isHome = fixture.homeTeam.name === teamName;
  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
  const isFinished = fixture.status === 'FINISHED';
  const isLive = fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED';

  const myScore = isHome ? fixture.score.fullTime.home : fixture.score.fullTime.away;
  const oppScore = isHome ? fixture.score.fullTime.away : fixture.score.fullTime.home;

  let resultColor = '';
  if (isFinished && myScore !== null && oppScore !== null) {
    if (myScore > oppScore) resultColor = 'text-emerald-600 dark:text-emerald-400';
    else if (myScore < oppScore) resultColor = 'text-red-500';
    else resultColor = 'text-gray-500';
  }

  const badge = STATUS_BADGE[fixture.status];
  const formattedDate = new Date(fixture.utcDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });
  const formattedTime = new Date(fixture.utcDate).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      {/* Date */}
      <div className="w-12 shrink-0 text-center">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formattedDate}</p>
        <p className="text-[10px] text-gray-400">{formattedTime}</p>
      </div>

      {/* H/A indicator */}
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
        isHome
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
      }`}>
        {isHome ? 'H' : 'A'}
      </span>

      {/* Opponent */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Crest src={opponent.crest} name={opponent.name} size={18} />
        <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
          {opponent.name}
        </span>
      </div>

      {/* Score / status */}
      <div className="shrink-0 text-right">
        {(isFinished || isLive) && myScore !== null && oppScore !== null ? (
          <span className={`text-sm font-black tabular-nums ${resultColor}`}>
            {myScore}–{oppScore}
          </span>
        ) : badge ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
            {badge.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface TeamMatchesListProps {
  fixtures: Fixture[];
  teamName: string;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function TeamMatchesList({ fixtures, teamName, loading, error, retry }: TeamMatchesListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-gray-500">Failed to load fixtures.</p>
        <button onClick={retry} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
          Retry
        </button>
      </div>
    );
  }

  if (!fixtures || fixtures.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-400">No WC fixtures found for this team.</p>;
  }

  const results = fixtures
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate));

  const upcoming = fixtures
    .filter((f) => f.status !== 'FINISHED')
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  return (
    <div className="flex flex-col gap-5">
      {upcoming.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Upcoming
          </p>
          <div className="flex flex-col gap-1.5">
            {upcoming.map((f) => <MatchRow key={f.id} fixture={f} teamName={teamName} />)}
          </div>
        </section>
      )}
      {results.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Results
          </p>
          <div className="flex flex-col gap-1.5">
            {results.map((f) => <MatchRow key={f.id} fixture={f} teamName={teamName} />)}
          </div>
        </section>
      )}
    </div>
  );
}
