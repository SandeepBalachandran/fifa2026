import { getNotifications } from '@/lib/notifications/store';

const TYPE_CONFIG: Record<string, { icon: string; card: string; dot: string }> = {
  MATCH_WIN:     { icon: '🏆', card: 'border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',   dot: 'bg-emerald-400' },
  MATCH_DRAW:    { icon: '🤝', card: 'border-l-blue-400    bg-blue-50    dark:bg-blue-950/30',      dot: 'bg-blue-400'    },
  MATCH_LOSS:    { icon: '❌', card: 'border-l-red-400     bg-red-50     dark:bg-red-950/30',       dot: 'bg-red-400'     },
  QUALIFICATION: { icon: '⭐', card: 'border-l-amber-400   bg-amber-50   dark:bg-amber-950/30',     dot: 'bg-amber-400'   },
  ELIMINATION:   { icon: '💔', card: 'border-l-gray-400    bg-gray-50    dark:bg-gray-800/40',      dot: 'bg-gray-400'    },
  BATTLE_RESULT: { icon: '⚔️', card: 'border-l-orange-400  bg-orange-50  dark:bg-orange-950/30',    dot: 'bg-orange-400'  },
  RANK_CHANGE:   { icon: '📊', card: 'border-l-purple-400  bg-purple-50  dark:bg-purple-950/30',    dot: 'bg-purple-400'  },
};

const DEFAULT_CONFIG = { icon: '🔔', card: 'border-l-gray-300 bg-white dark:bg-gray-900', dot: 'bg-gray-400' };

export default function NotificationsPage() {
  const notifications = getNotifications().slice().reverse();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        🔔 Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-4xl">🔕</p>
          <p className="mt-2 text-sm text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
            return (
              <li
                key={n.id}
                className={`rounded-xl border-l-4 p-4 shadow-sm ${cfg.card}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl leading-none">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {n.participantName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  {!n.read && (
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
