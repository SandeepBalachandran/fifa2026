'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TeamDetailsDrawer } from '@/components/team-details/TeamDetailsDrawer';
import { CompetitionSwitcher } from '@/components/CompetitionSwitcher';
import { SeasonSwitcher } from '@/components/SeasonSwitcher';
import { PlanUpgradeBanner } from '@/components/PlanUpgradeBanner';
import { getBetLabel } from '@/lib/bet-tracker/config';
import type { LeaderboardEntry } from '@/lib/leaderboard/calculate';
import type { GroupStanding, StandingEntry } from '@/lib/football-data/types';

// ── Shared helpers ─────────────────────────────────────────────────────────────

function Crest({ src, name, size = 22 }: { src: string | null; name: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 object-contain"
      unoptimized
    />
  );
}

function gdLabel(gd: number) {
  return gd > 0 ? `+${gd}` : String(gd);
}

function groupLabel(group: string) {
  if (group === 'OVERALL') return 'Overall Standings';
  return group.replace('GROUP_', 'Group ');
}

// ── Rank indicators ────────────────────────────────────────────────────────────

const RANK_ICON: Record<string, string> = { UP: '▲', DOWN: '▼', UNCHANGED: '–' };
const RANK_COLOR: Record<string, string> = {
  UP: 'text-emerald-500',
  DOWN: 'text-red-500',
  UNCHANGED: 'text-gray-400',
};
const MEDAL: Record<number, { row: string; pts: string; badge: string }> = {
  1: { row: 'bg-amber-50 dark:bg-amber-950/40',    pts: 'text-amber-600 dark:text-amber-400',   badge: '🥇' },
  2: { row: 'bg-slate-50 dark:bg-slate-800/40',    pts: 'text-slate-500 dark:text-slate-400',   badge: '🥈' },
  3: { row: 'bg-orange-50 dark:bg-orange-950/40',  pts: 'text-orange-600 dark:text-orange-400', badge: '🥉' },
};

// ── WC Standings table (full) ──────────────────────────────────────────────────

function StandingsTable({
  rows,
  ownership,
  onTeamClick,
}: {
  rows: StandingEntry[];
  ownership: Record<string, string>;
  onTeamClick: (teamId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-gray-800">
            <th className="px-2 py-3 text-left sm:px-4">#</th>
            <th className="px-2 py-3 text-left sm:px-4">Team</th>
            <th className="hidden px-2 py-3 sm:table-cell sm:px-3">P</th>
            <th className="px-2 py-3 sm:px-3">W</th>
            <th className="hidden px-2 py-3 sm:table-cell sm:px-3">D</th>
            <th className="hidden px-2 py-3 sm:table-cell sm:px-3">L</th>
            <th className="hidden px-2 py-3 md:table-cell md:px-3">GF</th>
            <th className="hidden px-2 py-3 md:table-cell md:px-3">GA</th>
            <th className="px-2 py-3 sm:px-3">GD</th>
            <th className="px-2 py-3 pr-3 sm:px-3 sm:pr-4">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const owner = ownership[row.team.name];
            const isOwned = Boolean(owner);
            return (
              <tr
                key={row.team.id}
                className={`border-b border-gray-50 last:border-0 transition-colors dark:border-gray-800 ${
                  isOwned
                    ? 'bg-blue-50 dark:bg-blue-950/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <td className="px-2 py-2.5 font-bold text-gray-400 sm:px-4">{row.position}</td>
                <td className="px-2 py-2.5 sm:px-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Crest src={row.team.crest} name={row.team.name} />
                    <button
                      onClick={() => onTeamClick(row.team.id)}
                      className="font-semibold text-gray-900 hover:text-green-700 hover:underline dark:text-white dark:hover:text-green-400"
                    >
                      {row.team.shortName || row.team.name}
                    </button>
                    {getBetLabel(row.team.name) && (
                      <span className="text-xs font-medium text-amber-500 dark:text-amber-400">
                        {getBetLabel(row.team.name)}
                      </span>
                    )}
                    {isOwned && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {owner}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-2 py-2.5 text-right text-gray-500 sm:table-cell sm:px-3">{row.playedGames}</td>
                <td className="px-2 py-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400 sm:px-3">{row.won}</td>
                <td className="hidden px-2 py-2.5 text-right text-gray-500 sm:table-cell sm:px-3">{row.draw}</td>
                <td className="hidden px-2 py-2.5 text-right text-red-500 sm:table-cell sm:px-3">{row.lost}</td>
                <td className="hidden px-2 py-2.5 text-right text-gray-500 md:table-cell md:px-3">{row.goalsFor}</td>
                <td className="hidden px-2 py-2.5 text-right text-gray-500 md:table-cell md:px-3">{row.goalsAgainst}</td>
                <td className="px-2 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400 sm:px-3">
                  {gdLabel(row.goalDifference)}
                </td>
                <td className="px-2 py-2.5 pr-3 text-right font-black text-gray-900 dark:text-white sm:px-3 sm:pr-4">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Group card (compact per-group standings) ───────────────────────────────────

function GroupCard({
  standing,
  ownership,
  onTeamClick,
}: {
  standing: GroupStanding;
  ownership: Record<string, string>;
  onTeamClick: (teamId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-4 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">
          {groupLabel(standing.group)}
        </h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-right text-gray-400 dark:border-gray-800">
            <th className="px-3 py-2 text-left font-semibold">Team</th>
            <th className="hidden px-2 py-2 font-semibold min-[400px]:table-cell">P</th>
            <th className="px-2 py-2 font-semibold">W</th>
            <th className="hidden px-2 py-2 font-semibold min-[400px]:table-cell">D</th>
            <th className="hidden px-2 py-2 font-semibold min-[400px]:table-cell">L</th>
            <th className="px-2 py-2 font-semibold">GD</th>
            <th className="px-2 py-2 pr-3 font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standing.table.map((row) => {
            const owner = ownership[row.team.name];
            const isOwned = Boolean(owner);
            return (
              <tr
                key={row.team.id}
                className={`border-b border-gray-50 last:border-0 dark:border-gray-800 ${
                  isOwned ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <Crest src={row.team.crest} name={row.team.name} size={16} />
                    <button
                      onClick={() => onTeamClick(row.team.id)}
                      className="font-semibold text-gray-900 hover:text-green-700 hover:underline dark:text-white dark:hover:text-green-400"
                    >
                      {row.position}. {row.team.shortName || row.team.name}
                    </button>
                    {getBetLabel(row.team.name) && (
                      <span className="text-xs font-medium text-amber-500 dark:text-amber-400">
                        {getBetLabel(row.team.name)}
                      </span>
                    )}
                    {isOwned && (
                      <span className="text-blue-600 dark:text-blue-400">({owner})</span>
                    )}
                  </div>
                </td>
                <td className="hidden px-2 py-2 text-right text-gray-500 min-[400px]:table-cell">{row.playedGames}</td>
                <td className="px-2 py-2 text-right font-medium text-emerald-600">{row.won}</td>
                <td className="hidden px-2 py-2 text-right text-gray-500 min-[400px]:table-cell">{row.draw}</td>
                <td className="hidden px-2 py-2 text-right text-red-500 min-[400px]:table-cell">{row.lost}</td>
                <td className="px-2 py-2 text-right text-gray-500">{gdLabel(row.goalDifference)}</td>
                <td className="px-2 py-2 pr-3 text-right font-black text-gray-900 dark:text-white">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────────

interface LeaderboardShellProps {
  entries: LeaderboardEntry[];
  standings: GroupStanding[];
  ownership: Record<string, string>;
  standingsError: string | null;
}

export function LeaderboardShell({
  entries,
  standings,
  ownership,
  standingsError,
}: LeaderboardShellProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const isOverall = standings.length === 1 && standings[0].group === 'OVERALL';

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        🏆 Leaderboard
      </h1>

      {/* ── Draft Standings ── */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
          Draft Standings
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400">No participants yet. Add some in the admin panel.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-linear-to-r from-blue-600 to-indigo-600 text-left text-xs font-bold uppercase tracking-wider text-blue-100">
                    <th className="px-3 py-3 sm:px-5">Rank</th>
                    <th className="px-3 py-3 sm:px-4">Participant</th>
                    <th className="px-3 py-3 text-right sm:px-4">Points</th>
                    <th className="hidden px-3 py-3 text-right sm:table-cell sm:px-4">Gap</th>
                    <th className="px-3 py-3 text-right sm:px-4">Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const medal = MEDAL[e.rank];
                    return (
                      <tr
                        key={e.participantName}
                        className={`border-b border-gray-50 last:border-0 dark:border-gray-800 ${medal?.row ?? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      >
                        <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                          <span className="mr-1">{medal?.badge ?? ''}</span>
                          <span className="font-black text-gray-700 dark:text-gray-200">{e.rank}</span>{' '}
                          <span className={`text-xs ${RANK_COLOR[e.rankChange]}`}>
                            {RANK_ICON[e.rankChange]}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white sm:px-4 sm:py-3.5">
                          {e.participantName}
                        </td>
                        <td className={`px-3 py-3 text-right text-lg font-black sm:px-4 sm:py-3.5 ${medal?.pts ?? 'text-gray-700 dark:text-gray-200'}`}>
                          {e.totalPoints}
                        </td>
                        <td className="hidden px-3 py-3 text-right text-gray-400 sm:table-cell sm:px-4 sm:py-3.5">
                          {e.rank === 1 ? '—' : `-${e.scoreDelta}`}
                        </td>
                        <td className="px-3 py-3 text-right sm:px-4 sm:py-3.5">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            {e.teamsRemaining}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── League / Competition Standings ── */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
            🌍 Standings
            <span className="text-sm font-normal text-gray-400">— click a team to view details</span>
          </h2>
          <div className="flex items-center gap-2">
            <CompetitionSwitcher />
            <SeasonSwitcher />
          </div>
        </div>

        {standingsError && <div className="mb-4"><PlanUpgradeBanner /></div>}

        {!standingsError && standings.length === 0 && (
          <p className="text-sm text-gray-400">No standings available yet.</p>
        )}

        {isOverall ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="bg-linear-to-r from-green-700 to-emerald-600 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/90">
                Overall Standings
              </p>
            </div>
            <StandingsTable
              rows={standings[0].table}
              ownership={ownership}
              onTeamClick={setSelectedTeamId}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
            {standings.map((group) => (
              <GroupCard
                key={group.group}
                standing={group}
                ownership={ownership}
                onTeamClick={setSelectedTeamId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Team details drawer */}
      <TeamDetailsDrawer
        teamId={selectedTeamId}
        onClose={() => setSelectedTeamId(null)}
      />
    </main>
  );
}
