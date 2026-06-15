import { PlayerAvatar } from './PlayerAvatar';
import type { Coach } from '@/lib/football-data/team-types';

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

interface CoachCardProps {
  coach: Coach;
}

export function CoachCard({ coach }: CoachCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <PlayerAvatar name={coach.name} size={52} />

      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 dark:text-white">{coach.name}</p>
        {coach.nationality && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{coach.nationality}</p>
        )}
        {coach.dateOfBirth && (
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            DOB: {formatDOB(coach.dateOfBirth)} · Age {calculateAge(coach.dateOfBirth)}
          </p>
        )}
      </div>

      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        Coach
      </span>
    </div>
  );
}
