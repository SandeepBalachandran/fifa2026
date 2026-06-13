import { readStore } from '@/lib/store';
import {
  actionAddParticipant,
  actionAssignTeam,
  actionUpdateScoringRules,
  actionRecalculate,
  actionRunSync,
} from './actions';

export default function AdminPage() {
  const store = readStore();
  const { participants, ownership, scoringRules } = store;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Admin
      </h1>

      <div className="flex flex-col gap-8">
        {/* Add participant */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Add Participant</h2>
          <form action={actionAddParticipant} className="flex gap-2">
            <input
              name="name"
              required
              placeholder="Participant name"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Add
            </button>
          </form>
          {participants.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li key={p} className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Assign team */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Assign Team</h2>
          <form action={actionAssignTeam} className="flex flex-col gap-2 sm:flex-row">
            <input
              name="team"
              required
              placeholder="Team name (e.g. Brazil)"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <select
              name="owner"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">— Unassign —</option>
              {participants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Save
            </button>
          </form>
          {Object.keys(ownership).length > 0 && (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-400 dark:border-zinc-800">
                  <th className="pb-2">Team</th>
                  <th className="pb-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ownership).map(([team, owner]) => (
                  <tr key={team} className="border-b border-zinc-50 dark:border-zinc-800">
                    <td className="py-1 text-zinc-700 dark:text-zinc-300">{team}</td>
                    <td className="py-1 text-zinc-700 dark:text-zinc-300">{owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Scoring rules */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Scoring Rules</h2>
          <form action={actionUpdateScoringRules} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ['win', 'Win'],
                ['draw', 'Draw'],
                ['loss', 'Loss'],
                ['cleanSheet', 'Clean Sheet'],
                ['groupStageQualification', 'Group Qual.'],
                ['roundOf16', 'Round of 16'],
                ['quarterFinal', 'Quarter-Final'],
                ['semiFinal', 'Semi-Final'],
                ['runnerUp', 'Runner-Up'],
                ['champion', 'Champion'],
              ] as [keyof typeof scoringRules, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">{label}</span>
                <input
                  name={key}
                  type="number"
                  defaultValue={scoringRules[key]}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </label>
            ))}
            <div className="col-span-2 flex gap-2 sm:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Update Rules
              </button>
            </div>
          </form>
        </section>

        {/* Actions */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <form action={actionRunSync}>
              <button
                type="submit"
                className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Sync Match Data
              </button>
            </form>
            <form action={actionRecalculate}>
              <button
                type="submit"
                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
              >
                Recalculate Scores
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
