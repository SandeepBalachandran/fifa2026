'use client';

import { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import type { SquadMember, SquadPosition } from '@/lib/football-data/team-types';

const POSITION_GROUPS: { key: SquadPosition; label: string }[] = [
  { key: 'Goalkeeper', label: 'Goalkeepers' },
  { key: 'Defence',    label: 'Defenders'   },
  { key: 'Midfield',   label: 'Midfielders' },
  { key: 'Offence',    label: 'Forwards'    },
];

const FILTER_OPTIONS: { value: SquadPosition | 'ALL'; label: string }[] = [
  { value: 'ALL',        label: 'All'         },
  { value: 'Goalkeeper', label: 'Goalkeepers' },
  { value: 'Defence',    label: 'Defenders'   },
  { value: 'Midfield',   label: 'Midfielders' },
  { value: 'Offence',    label: 'Forwards'    },
];

interface SquadSectionProps {
  squad: SquadMember[];
}

export function SquadSection({ squad }: SquadSectionProps) {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<SquadPosition | 'ALL'>('ALL');
  const [collapsed, setCollapsed] = useState<Set<SquadPosition>>(new Set());

  if (squad.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">No squad data available.</p>
    );
  }

  const term = search.trim().toLowerCase();

  const filtered = squad.filter((p) => {
    if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
    if (term) {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.nationality ?? '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const toggleCollapsed = (key: SquadPosition) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      {/* Search */}
      <input
        type="search"
        placeholder="Search by name or nationality…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search squad"
        className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600"
      />

      {/* Position filter */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by position">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPositionFilter(opt.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              positionFilter === opt.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Position groups */}
      <div className="flex flex-col gap-3">
        {POSITION_GROUPS.map(({ key, label }) => {
          const players = filtered.filter((p) => p.position === key);
          if (players.length === 0) return null;

          const isOpen = !collapsed.has(key);

          return (
            <section key={key}>
              <button
                onClick={() => toggleCollapsed(key)}
                aria-expanded={isOpen}
                aria-controls={`squad-group-${key}`}
                className="flex w-full items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-left font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
                <span>
                  {label}
                  <span className="ml-1.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    {players.length}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div id={`squad-group-${key}`} className="mt-1.5 flex flex-col gap-1.5">
                  {players.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No players match your search.</p>
        )}
      </div>
    </div>
  );
}
