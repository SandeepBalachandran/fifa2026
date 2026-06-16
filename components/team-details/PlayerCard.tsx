import { PlayerAvatar } from './PlayerAvatar';
import type { SquadMember } from '@/lib/football-data/team-types';

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Goalkeeper',
  Defence:    'Defender',
  Midfield:   'Midfielder',
  Offence:    'Forward',
};

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDOB(dateOfBirth: string): string {
  return new Date(dateOfBirth).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface PlayerCardProps {
  player: SquadMember;
  onClick?: (player: SquadMember) => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(player)}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/60"
    >
      <PlayerAvatar name={player.name} size={40} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 dark:text-white">{player.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
          {player.nationality && <span>{player.nationality}</span>}
          {player.dateOfBirth && (
            <span>
              DOB: {formatDOB(player.dateOfBirth)} · Age {calculateAge(player.dateOfBirth)}
            </span>
          )}
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        {POSITION_LABEL[player.position] ?? player.position}
      </span>
    </button>
  );
}
