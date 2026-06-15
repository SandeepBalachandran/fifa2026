'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMatchDetails } from '@/hooks/useMatchDetails';
import { GoalsList } from './GoalsList';
import { BookingsList } from './BookingsList';
import { getBetLabel } from '@/lib/bet-tracker/config';
import type { MatchDetail, MatchDuration } from '@/lib/football-data/match-types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className ?? ''}`} />;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-10 w-1/3 mx-auto" />
      <SkeletonBlock className="h-40" />
      <SkeletonBlock className="h-32" />
    </div>
  );
}

const DURATION_LABEL: Record<MatchDuration, string> = {
  REGULAR: '',
  EXTRA_TIME: 'After Extra Time',
  PENALTY_SHOOTOUT: 'After Penalties',
};

function TeamCrest({ src, name, size = 56 }: { src: string | null; name: string; size?: number }) {
  if (!src) return <span className="inline-block shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" style={{ width: size, height: size }} />;
  return <Image src={src} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

// ── Score header ───────────────────────────────────────────────────────────────

function ScoreHeader({ match }: { match: MatchDetail }) {
  const { home, away } = match.score.fullTime;
  const { home: htHome, away: htAway } = match.score.halfTime;
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const duration = match.score.duration;
  const durationLabel = duration && duration !== 'REGULAR' ? DURATION_LABEL[duration] : null;

  const homeBet = getBetLabel(match.homeTeam.name);
  const awayBet = getBetLabel(match.awayTeam.name);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamCrest src={match.homeTeam.crest} name={match.homeTeam.name} />
          <p className="text-center text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {match.homeTeam.shortName || match.homeTeam.name}
          </p>
          {homeBet && <span className="text-xs font-bold text-amber-500">{homeBet}</span>}
        </div>

        {/* Score */}
        <div className="shrink-0 text-center">
          {(isFinished || isLive) && home !== null && away !== null ? (
            <>
              <span className={`text-4xl font-black tabular-nums ${isLive ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {home} – {away}
              </span>
              {isFinished && htHome !== null && htAway !== null && (
                <p className="mt-1 text-xs text-gray-400">(HT {htHome}–{htAway})</p>
              )}
              {durationLabel && (
                <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {durationLabel}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-black text-gray-300 dark:text-gray-600">vs</span>
              <span className="text-xs text-gray-400">
                {new Date(match.utcDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamCrest src={match.awayTeam.crest} name={match.awayTeam.name} />
          <p className="text-center text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {match.awayTeam.shortName || match.awayTeam.name}
          </p>
          {awayBet && <span className="text-xs font-bold text-amber-500">{awayBet}</span>}
        </div>
      </div>

      {/* Stage / matchday */}
      <div className="mt-3 flex justify-center gap-2 text-xs text-gray-400">
        {match.matchday && <span>MD {match.matchday}</span>}
        {match.group && <span>· {match.group.replace('GROUP_', 'Group ')}</span>}
      </div>
    </div>
  );
}

// ── Content ────────────────────────────────────────────────────────────────────

function DrawerContent({ matchId, onClose }: { matchId: string | null; onClose: () => void }) {
  const { data, loading, error, retry } = useMatchDetails(matchId);

  if (loading) return <DrawerSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-gray-700 dark:text-gray-300">Unable to load match details.</p>
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

  const goals = data.goals ?? [];
  const bookings = data.bookings ?? [];
  const referees = data.referees ?? [];
  const hasGoals = goals.length > 0;
  const hasBookings = bookings.length > 0;
  const hasReferees = referees.length > 0;

  return (
    <div className="flex flex-col gap-5 p-4">
      <ScoreHeader match={data} />

      {/* Goals */}
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Goals
        </h3>
        <GoalsList goals={goals} homeTeamId={data.homeTeam.id} />
      </section>

      {/* Cards */}
      {hasBookings && (
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Bookings
          </h3>
          <BookingsList bookings={bookings} />
        </section>
      )}

      {/* Referees */}
      {hasReferees && (
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Officials
          </h3>
          <ul className="flex flex-col gap-1.5">
            {referees.map((ref) => (
              <li key={ref.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-base">🟡</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{ref.name}</p>
                  {ref.nationality && (
                    <p className="text-xs text-gray-400">{ref.nationality}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {ref.type.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasGoals && !hasBookings && !hasReferees && data.status !== 'FINISHED' && (
        <p className="py-4 text-center text-sm text-gray-400">
          Match details will appear once the game kicks off.
        </p>
      )}
    </div>
  );
}

// ── Drawer shell ───────────────────────────────────────────────────────────────

interface MatchDetailsDrawerProps {
  matchId: string | null;
  onClose: () => void;
}

export function MatchDetailsDrawer({ matchId, onClose }: MatchDetailsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (matchId) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [matchId]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus();
    else if (!visible && !matchId) previousFocusRef.current?.focus();
  }, [visible, matchId]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div aria-hidden="true" onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog" aria-modal="true" aria-label="Match Details"
        className={`
          fixed bottom-0 left-0 right-0 z-50 flex flex-col
          h-[88vh] rounded-t-2xl bg-gray-50 shadow-2xl dark:bg-gray-950
          transition-transform duration-300 ease-out
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:w-[480px] sm:rounded-none sm:rounded-l-2xl
          ${visible ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}
        `}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Match Details
          </p>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Close match details"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DrawerContent matchId={matchId} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
