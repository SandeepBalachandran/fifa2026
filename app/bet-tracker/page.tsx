import Image from 'next/image';
import { fetchFixtures } from '@/lib/football-data/client';
import { calculateBetStats } from '@/lib/bet-tracker/calculate';
import { SANDY_TEAMS, RAHUL_TEAMS, AMOUNT_PER_WIN } from '@/lib/bet-tracker/config';
import type { BetMatchRecord } from '@/lib/bet-tracker/types';

function Crest({ src, name, size = 20 }: { src: string | null | undefined; name: string; size?: number }) {
  if (!src) return <span className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={src} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

function ScoreCard({
  name,
  wins,
  amount,
  isLeading,
  accent,
}: {
  name: string;
  wins: number;
  amount: number;
  isLeading: boolean;
  accent: 'green' | 'blue';
}) {
  const gradients = {
    green: 'bg-linear-to-br from-emerald-500 to-green-700',
    blue: 'bg-linear-to-br from-blue-500 to-indigo-700',
  };
  return (
    <div className="overflow-hidden rounded-2xl shadow-lg">
      <div className={`px-6 py-5 text-white ${gradients[accent]}`}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80">{name}</p>
          {isLeading && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
              Leading 🏆
            </span>
          )}
        </div>
        <p className="text-5xl font-black tabular-nums">{wins}</p>
        <p className="mt-1 text-sm opacity-70">wins</p>
      </div>
      <div className="bg-white px-6 py-4 dark:bg-gray-900">
        <p className="text-2xl font-black text-gray-900 dark:text-white">
          ₹{amount}
        </p>
        <p className="text-xs text-gray-400">₹{AMOUNT_PER_WIN} × {wins} wins</p>
      </div>
    </div>
  );
}

function TeamList({
  teams,
  crests,
  label,
}: {
  teams: string[];
  crests: Record<string, string | null>;
  label: 'S' | 'R';
}) {
  const accent = label === 'S' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400';
  return (
    <ul className="space-y-1.5">
      {teams.map((team) => (
        <li key={team} className="flex items-center gap-2">
          <Crest src={crests[team]} name={team} size={18} />
          <span className="text-sm text-gray-800 dark:text-gray-200">{team}</span>
          <span className={`text-xs font-bold ${accent}`}>({label})</span>
        </li>
      ))}
    </ul>
  );
}

function OwnerTag({ owner }: { owner: string | undefined }) {
  if (!owner) return null;
  const cls = owner === 'Sandy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400';
  return <span className={`shrink-0 text-xs font-bold ${cls}`}>({owner === 'Sandy' ? 'S' : 'R'})</span>;
}

function HistoryRow({ record }: { record: BetMatchRecord }) {
  const homeBetOwner = record.homeOwner ?? undefined;
  const awayBetOwner = record.awayOwner ?? undefined;
  const winnerCrest = record.winner === record.homeTeam ? record.homeCrest : record.awayCrest;

  const formattedDate = new Date(record.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <tr className="border-b border-gray-50 last:border-0 dark:border-gray-800">
      <td className="hidden px-3 py-3 text-xs text-gray-400 whitespace-nowrap sm:table-cell sm:px-4">{formattedDate}</td>
      <td className="px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <div className="flex min-w-0 items-center gap-1.5">
            <Crest src={record.homeCrest} name={record.homeTeam} size={14} />
            <span className="min-w-0 truncate font-medium text-gray-800 dark:text-gray-200">{record.homeTeam}</span>
            <OwnerTag owner={homeBetOwner} />
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Crest src={record.awayCrest} name={record.awayTeam} size={14} />
            <span className="min-w-0 truncate font-medium text-gray-800 dark:text-gray-200">{record.awayTeam}</span>
            <OwnerTag owner={awayBetOwner} />
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
        {record.winner ? (
          <div className="flex items-center gap-1">
            <Crest src={winnerCrest} name={record.winner} size={13} />
            <span className="hidden font-semibold text-gray-900 dark:text-white sm:inline">{record.winner}</span>
            <span className="font-semibold text-gray-900 dark:text-white sm:hidden">W</span>
          </div>
        ) : (
          <span className="text-gray-400">Draw</span>
        )}
      </td>
      <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
        {record.nobet ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400 dark:bg-gray-800">—</span>
        ) : record.winnerOwner ? (
          <span className={`font-bold ${record.winnerOwner === 'Sandy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {record.winnerOwner}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
        {record.nobet ? (
          <span className="text-gray-300 dark:text-gray-600">—</span>
        ) : record.amount > 0 ? (
          <span className="font-bold text-amber-600 dark:text-amber-400">+₹{record.amount}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}

export default async function BetTrackerPage() {
  let fixtures = await fetchFixtures().catch(() => []);

  const { sandy, rahul, history, teamCrests } = calculateBetStats(fixtures);

  const sandyLeading = sandy.wins > rahul.wins;
  const rahulLeading = rahul.wins > sandy.wins;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        🎯 Bet Tracker
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        Sandy vs Rahul — ₹{AMOUNT_PER_WIN} per win · World Cup 2026
      </p>

      {/* ── Scoreboard ── */}
      <section className="mb-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ScoreCard
            name="Sandy"
            wins={sandy.wins}
            amount={sandy.amount}
            isLeading={sandyLeading}
            accent="green"
          />
          <ScoreCard
            name="Rahul"
            wins={rahul.wins}
            amount={rahul.amount}
            isLeading={rahulLeading}
            accent="blue"
          />
        </div>
        {sandy.wins === rahul.wins && sandy.wins > 0 && (
          <p className="mt-3 text-center text-sm font-semibold text-gray-500">
            It&apos;s a tie! 🤝
          </p>
        )}
      </section>

      {/* ── Team Ownership ── */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">
          Team Ownership
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="bg-linear-to-r from-emerald-600 to-green-600 px-4 py-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                Sandy — {SANDY_TEAMS.length} teams
              </h3>
            </div>
            <div className="px-4 py-4">
              <TeamList teams={SANDY_TEAMS} crests={teamCrests} label="S" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                Rahul — {RAHUL_TEAMS.length} teams
              </h3>
            </div>
            <div className="px-4 py-4">
              <TeamList teams={RAHUL_TEAMS} crests={teamCrests} label="R" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Match History ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">
          Match History
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No completed matches yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                    <th className="hidden px-3 py-3 text-left sm:table-cell sm:px-4">Date</th>
                    <th className="px-3 py-3 text-left sm:px-4">Match</th>
                    <th className="px-2 py-3 text-left sm:px-4">Winner</th>
                    <th className="px-2 py-3 text-left sm:px-4">Owner</th>
                    <th className="px-2 py-3 text-left sm:px-4">₹</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <HistoryRow key={record.matchId} record={record} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
