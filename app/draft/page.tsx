import { readStore } from '@/lib/store';

export default function DraftPage() {
  const store = readStore();
  const { participants, ownership, eliminated } = store;

  // Invert: ownerName -> [teamName]
  const teamsByOwner: Record<string, string[]> = {};
  for (const [team, owner] of Object.entries(ownership)) {
    if (!teamsByOwner[owner]) teamsByOwner[owner] = [];
    teamsByOwner[owner].push(team);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Draft
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Team ownership assignments for this tournament.
      </p>

      {participants.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No participants yet. Add them in the{' '}
          <a href="/admin" className="text-blue-600 hover:underline">
            admin panel
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {participants.map((owner) => {
            const teams = teamsByOwner[owner] ?? [];
            return (
              <div
                key={owner}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">{owner}</h2>
                {teams.length === 0 ? (
                  <p className="text-xs text-zinc-400">No teams assigned</p>
                ) : (
                  <ul className="space-y-1">
                    {teams.map((team) => (
                      <li key={team} className="flex items-center gap-2 text-sm">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            eliminated.includes(team) ? 'bg-red-400' : 'bg-green-400'
                          }`}
                        />
                        <span
                          className={
                            eliminated.includes(team)
                              ? 'text-zinc-400 line-through'
                              : 'text-zinc-700 dark:text-zinc-200'
                          }
                        >
                          {team}
                        </span>
                        {eliminated.includes(team) && (
                          <span className="text-xs text-red-400">out</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
