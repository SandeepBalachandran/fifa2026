'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePersonDetails } from '@/hooks/usePersonDetails';
import type { PersonDetail } from '@/lib/football-data/person-types';

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className ?? ''}`} />;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-14 w-14 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonBlock className="h-5 w-1/2" />
          <SkeletonBlock className="h-4 w-1/3" />
        </div>
      </div>
      <SkeletonBlock className="h-20" />
      <SkeletonBlock className="h-16" />
    </div>
  );
}

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Goalkeeper',
  Defence:    'Defender',
  Midfield:   'Midfielder',
  Offence:    'Forward',
};

function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PlayerProfile({ data }: { data: PersonDetail }) {
  const posLabel = data.position ? (POSITION_LABEL[data.position] ?? data.position) : null;

  const dob = data.dateOfBirth
    ? new Date(data.dateOfBirth).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Identity card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Coloured header strip */}
        <div className="bg-linear-to-r from-green-600 to-emerald-500 px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar circle */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-black text-white">
              {data.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black text-white">{data.name}</p>
              {data.nationality && (
                <p className="text-sm font-medium text-white/80">{data.nationality}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800">
          {posLabel && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Position</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{posLabel}</p>
            </div>
          )}
          {data.shirtNumber !== null && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Shirt #</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{data.shirtNumber}</p>
            </div>
          )}
          {dob && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date of Birth</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{dob}</p>
              {age !== null && (
                <p className="text-xs text-gray-400">Age {age}</p>
              )}
            </div>
          )}
          {data.nationality && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Nationality</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{data.nationality}</p>
            </div>
          )}
        </div>
      </div>

      {/* Current club */}
      {data.currentTeam && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Current Club</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            {data.currentTeam.crest ? (
              <Image
                src={data.currentTeam.crest}
                alt={data.currentTeam.name}
                width={36}
                height={36}
                className="shrink-0 object-contain"
                unoptimized
              />
            ) : (
              <span className="inline-block h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700" />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900 dark:text-white">
                {data.currentTeam.name}
              </p>
              {data.currentTeam.tla && (
                <p className="text-xs text-gray-400">{data.currentTeam.tla}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerContent({ personId, onClose }: { personId: number | null; onClose: () => void }) {
  const { data, loading, error, retry } = usePersonDetails(personId);

  if (loading) return <DrawerSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-gray-700 dark:text-gray-300">Unable to load player profile.</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={retry} className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
          Retry
        </button>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
          Close
        </button>
      </div>
    );
  }

  if (!data) return null;

  return <PlayerProfile data={data} />;
}

interface PersonDrawerProps {
  personId: number | null;
  personName?: string;
  onClose: () => void;
}

export function PersonDrawer({ personId, personName, onClose }: PersonDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (personId !== null) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [personId]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player Profile"
        className={`
          fixed bottom-0 left-0 right-0 z-[70] flex flex-col
          h-[80vh] rounded-t-2xl bg-gray-50 shadow-2xl dark:bg-gray-950
          transition-transform duration-300 ease-out
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:w-[400px] sm:rounded-none sm:rounded-l-2xl
          ${visible ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}
        `}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="truncate text-sm font-bold text-gray-700 dark:text-gray-300">
            {personName ?? 'Player Profile'}
          </p>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close player profile"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DrawerContent personId={personId} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
