'use client';

import Image from 'next/image';
import { usePersonDetail } from '@/hooks/usePersonDetail';

const POSITION_LABEL: Record<string, string> = {
  GOALKEEPER:  'Goalkeeper',
  DEFENDER:    'Defender',
  MIDFIELDER:  'Midfielder',
  OFFENCE:     'Forward',
  COACH:       'Coach',
};

function age(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

interface PlayerPanelProps {
  personId: number | null;
  onBack: () => void;
  hideBackButton?: boolean;
}

export function PlayerPanel({ personId, onBack, hideBackButton = false }: PlayerPanelProps) {
  const { data, loading, error } = usePersonDetail(personId);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-5">
        {!hideBackButton && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-fit">
            ← Back
          </button>
        )}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-gray-700 dark:text-gray-300">Could not load player details.</p>
        {!hideBackButton && (
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ← Back
          </button>
        )}
      </div>
    );
  }

  const positionLabel = data.position ? (POSITION_LABEL[data.position] ?? data.position) : null;
  const ageYears = data.dateOfBirth ? age(data.dateOfBirth) : null;
  const dob = data.dateOfBirth
    ? new Date(data.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col gap-5 p-4">
      {!hideBackButton && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-fit"
        >
          ← Back to match
        </button>
      )}

      {/* Player card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-600 text-2xl font-black text-white">
            {data.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              {data.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {positionLabel && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                  {positionLabel}
                </span>
              )}
              {data.shirtNumber != null && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  #{data.shirtNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.nationality && (
          <StatCard label="Nationality" value={data.nationality} />
        )}
        {dob && (
          <StatCard label="Date of Birth" value={`${dob}${ageYears != null ? ` (${ageYears})` : ''}`} />
        )}
      </div>

      {/* Current team */}
      {data.currentTeam && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Current Team
          </p>
          <div className="flex items-center gap-3">
            {data.currentTeam.crest ? (
              <Image
                src={data.currentTeam.crest}
                alt={data.currentTeam.name}
                width={32}
                height={32}
                className="shrink-0 object-contain"
                unoptimized
              />
            ) : (
              <span className="inline-block h-8 w-8 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700" />
            )}
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{data.currentTeam.name}</p>
              <p className="text-xs text-gray-400">{data.currentTeam.tla}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
