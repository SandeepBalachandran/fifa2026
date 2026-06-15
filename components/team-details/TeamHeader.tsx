import Image from 'next/image';
import type { TeamDetails } from '@/lib/football-data/team-types';

interface TeamHeaderProps {
  team: TeamDetails;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-5">
      {team.crest ? (
        <Image
          src={team.crest}
          alt={team.name}
          width={72}
          height={72}
          className="shrink-0 object-contain"
          unoptimized
        />
      ) : (
        <span className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
          ⚽
        </span>
      )}

      <div className="min-w-0">
        <h2 className="text-2xl font-black leading-tight text-gray-900 dark:text-white">
          {team.name}
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {team.tla && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {team.tla}
            </span>
          )}
          {team.shortName && team.shortName !== team.name && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{team.shortName}</span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
          {team.area.name && <span>{team.area.name}</span>}
          {team.founded && <span>Est. {team.founded}</span>}
          {team.clubColors && <span>{team.clubColors}</span>}
        </div>
      </div>
    </div>
  );
}
