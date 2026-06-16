'use client';

import { useEffect, useRef, useState } from 'react';
import { useTeamDetails } from '@/hooks/useTeamDetails';
import { useTeamMatches } from '@/hooks/useTeamMatches';
import { TeamHeader } from './TeamHeader';
import { TeamInfoCard } from './TeamInfoCard';
import { CompetitionList } from './CompetitionList';
import { CoachCard } from './CoachCard';
import { SquadSummary } from './SquadSummary';
import { SquadSection } from './SquadSection';
import { TeamMatchesList } from './TeamMatchesList';
import { PersonDrawer } from '@/components/person/PersonDrawer';
import type { SquadMember } from '@/lib/football-data/team-types';

interface TeamDetailsDrawerProps {
  teamId: string | null;
  onClose: () => void;
}

// ── Skeleton helpers ───────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className ?? ''}`}
    />
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-[72px] w-[72px] rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonBlock className="h-6 w-2/3" />
          <SkeletonBlock className="h-4 w-1/3" />
        </div>
      </div>
      {/* Info card */}
      <SkeletonBlock className="h-24" />
      {/* Competitions */}
      <div className="flex gap-3">
        <SkeletonBlock className="h-24 w-28 rounded-xl" />
        <SkeletonBlock className="h-24 w-28 rounded-xl" />
      </div>
      {/* Coach */}
      <SkeletonBlock className="h-16" />
      {/* Squad summary */}
      <SkeletonBlock className="h-20" />
      {/* Squad rows */}
      {[...Array(5)].map((_, i) => (
        <SkeletonBlock key={i} className="h-14" />
      ))}
    </div>
  );
}

// ── Main drawer ────────────────────────────────────────────────────────────────

export function TeamDetailsDrawer({ teamId, onClose }: TeamDetailsDrawerProps) {
  // Two-phase animation: mount first, then apply open classes on next frame
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<SquadMember | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Reset selected player whenever the team drawer closes
  useEffect(() => {
    if (!teamId) setSelectedPlayer(null);
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [teamId]);

  // Focus close button when drawer becomes visible
  useEffect(() => {
    if (visible) {
      closeButtonRef.current?.focus();
    } else if (!visible && !teamId) {
      previousFocusRef.current?.focus();
    }
  }, [visible, teamId]);

  // Prevent body scroll and handle Escape
  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel — mobile: bottom sheet · desktop: right drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Team Details"
        className={`
          fixed bottom-0 left-0 right-0 z-50 flex flex-col
          h-[88vh] rounded-t-2xl bg-gray-50 shadow-2xl dark:bg-gray-950
          transition-transform duration-300 ease-out
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:w-[480px] sm:rounded-none sm:rounded-l-2xl
          ${visible
            ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0'
            : 'translate-y-full sm:translate-x-full sm:translate-y-0'
          }
        `}
      >
        {/* Sticky header bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Team Details
          </p>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close team details"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <DrawerContent teamId={teamId} onClose={onClose} onPlayerClick={setSelectedPlayer} />
        </div>
      </div>

      {/* Player profile — nested drawer on top */}
      <PersonDrawer
        personId={selectedPlayer?.id ?? null}
        personName={selectedPlayer?.name}
        onClose={() => setSelectedPlayer(null)}
      />
    </>
  );
}

type DrawerTab = 'overview' | 'fixtures';

// ── Content (fetches data) ─────────────────────────────────────────────────────

function DrawerContent({
  teamId,
  onClose,
  onPlayerClick,
}: {
  teamId: string | null;
  onClose: () => void;
  onPlayerClick: (player: SquadMember) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>('overview');
  const { data, loading, error, retry } = useTeamDetails(teamId);
  const { data: matchFixtures, loading: matchLoading, error: matchError, retry: matchRetry } = useTeamMatches(
    tab === 'fixtures' ? teamId : null
  );

  // Reset tab when a different team is opened
  useEffect(() => { setTab('overview'); }, [teamId]);

  if (loading) return <DrawerSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Unable to load team details.
        </p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={retry} className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
          Retry
        </button>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          Close
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasCoachInfo = data.coach?.name;

  return (
    <div className="flex flex-col">
      {/* Compact team name + tabs */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 pb-0 pt-3 dark:border-gray-800 dark:bg-gray-950">
        <p className="mb-2 truncate text-sm font-bold text-gray-700 dark:text-gray-300">
          {data.name}
        </p>
        <div className="flex gap-0">
          {(['overview', 'fixtures'] as DrawerTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                tab === t
                  ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {t === 'overview' ? 'Overview' : 'Fixtures'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-col gap-5 p-4">
        {tab === 'overview' && (
          <>
            {/* Header: crest, name, country, founded, colors */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <TeamHeader team={data} />
            </div>

            {/* Additional info: venue, address, website */}
            <TeamInfoCard team={data} />

            {/* Running competitions */}
            {data.runningCompetitions.length > 0 && (
              <section>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Running Competitions
                </h3>
                <CompetitionList competitions={data.runningCompetitions} />
              </section>
            )}

            {/* Coach */}
            {hasCoachInfo && (
              <section>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Head Coach
                </h3>
                <CoachCard coach={data.coach} />
              </section>
            )}

            {/* Squad summary stats */}
            {data.squad.length > 0 && (
              <SquadSummary squad={data.squad} coach={data.coach} />
            )}

            {/* Squad with search + collapsible groups */}
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Squad
              </h3>
              <SquadSection squad={data.squad} onPlayerClick={onPlayerClick} />
            </section>

            {/* Last updated */}
            <p className="pb-2 text-center text-xs text-gray-300 dark:text-gray-700">
              Last updated: {new Date(data.lastUpdated).toLocaleString('en-GB')}
            </p>
          </>
        )}

        {tab === 'fixtures' && (
          <TeamMatchesList
            fixtures={matchFixtures ?? []}
            teamName={data.name}
            loading={matchLoading}
            error={matchError}
            retry={matchRetry}
          />
        )}
      </div>
    </div>
  );
}
