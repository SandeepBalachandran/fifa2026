import type { Coach, SquadMember } from '@/lib/football-data/team-types';

interface SquadSummaryProps {
  squad: SquadMember[];
  coach: Coach;
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-gray-900">
      <span className="text-lg font-black text-gray-900 dark:text-white">{value}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
}

export function SquadSummary({ squad, coach }: SquadSummaryProps) {
  const byPosition = {
    Goalkeeper: squad.filter((p) => p.position === 'Goalkeeper').length,
    Defence:    squad.filter((p) => p.position === 'Defence').length,
    Midfield:   squad.filter((p) => p.position === 'Midfield').length,
    Offence:    squad.filter((p) => p.position === 'Offence').length,
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Squad Summary
      </p>
      <div className="grid grid-cols-5 gap-2">
        <StatPill label="Total"  value={squad.length} />
        <StatPill label="GK"     value={byPosition.Goalkeeper} />
        <StatPill label="DEF"    value={byPosition.Defence} />
        <StatPill label="MID"    value={byPosition.Midfield} />
        <StatPill label="FWD"    value={byPosition.Offence} />
      </div>
      {coach.name && (
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Coach: <span className="font-semibold text-gray-600 dark:text-gray-300">{coach.name}</span>
        </p>
      )}
    </div>
  );
}
