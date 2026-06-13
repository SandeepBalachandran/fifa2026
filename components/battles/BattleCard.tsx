import type { DirectBattle } from '@/lib/battles/types';

const OUTCOME_LABEL: Record<string, string> = {
  HOME_WIN: 'Home Win',
  AWAY_WIN: 'Away Win',
  DRAW: 'Draw',
};

const STATUS_STYLE: Record<string, { card: string; badge: string; badgeText: string }> = {
  LIVE: {
    card: 'border-red-300 bg-linear-to-br from-red-50 to-rose-50 dark:border-red-700 dark:from-red-950/60 dark:to-rose-950/60',
    badge: 'bg-red-500 text-white',
    badgeText: '● LIVE',
  },
  SCHEDULED: {
    card: 'border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/40 dark:to-indigo-950/40',
    badge: 'bg-blue-500 text-white',
    badgeText: 'UPCOMING',
  },
  FINISHED: {
    card: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
    badge: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    badgeText: 'FT',
  },
};

export function BattleCard({ battle }: { battle: DirectBattle }) {
  const formattedDate = new Date(battle.matchDate).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const style = STATUS_STYLE[battle.status] ?? STATUS_STYLE.FINISHED;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${style.card}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.badge}`}>
          {style.badgeText}
        </span>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <p className="font-bold text-gray-900 dark:text-white">{battle.homeTeam}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {battle.homeOwner}
          </p>
        </div>

        <div className="shrink-0 text-center">
          {battle.status === 'FINISHED' && battle.outcome ? (
            <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
              {OUTCOME_LABEL[battle.outcome]}
            </span>
          ) : (
            <span className="text-lg font-black text-gray-300 dark:text-gray-600">⚔</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className="font-bold text-gray-900 dark:text-white">{battle.awayTeam}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {battle.awayOwner}
          </p>
        </div>
      </div>
    </div>
  );
}
