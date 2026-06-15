import Image from 'next/image';
import type { RunningCompetition } from '@/lib/football-data/team-types';

interface CompetitionListProps {
  competitions: RunningCompetition[];
}

function CompetitionChip({ competition }: { competition: RunningCompetition }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {competition.emblem ? (
        <Image
          src={competition.emblem}
          alt={competition.name}
          width={36}
          height={36}
          className="object-contain"
          unoptimized
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-gray-800">
          🏆
        </span>
      )}
      <p className="text-center text-xs font-semibold text-gray-800 dark:text-gray-200">
        {competition.name}
      </p>
      <div className="flex gap-1.5">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {competition.code}
        </span>
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {competition.type}
        </span>
      </div>
    </div>
  );
}

export function CompetitionList({ competitions }: CompetitionListProps) {
  if (competitions.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {competitions.map((c) => (
        <CompetitionChip key={c.id} competition={c} />
      ))}
    </div>
  );
}
