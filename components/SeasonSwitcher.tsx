'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { CompetitionSeason } from '@/lib/football-data/client';

export function SeasonSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const competition = searchParams.get('competition') ?? 'WC';
  const currentSeason = searchParams.get('season');

  const [seasons, setSeasons] = useState<CompetitionSeason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSeasons([]);
    fetch(`/api/competitions/${competition}/seasons`)
      .then((r) => r.json())
      .then((data: CompetitionSeason[]) => setSeasons(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [competition]);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete('season');
    } else {
      params.set('season', value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  if (loading) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-lg bg-green-100 dark:bg-green-900/30" />
    );
  }

  if (seasons.length <= 1) return null;

  const selected = currentSeason ?? String(seasons[0]?.year ?? '');

  return (
    <select
      value={selected}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="w-24 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 shadow-sm transition-opacity disabled:opacity-50 dark:border-green-800 dark:bg-gray-900 dark:text-green-100 sm:w-auto"
    >
      {seasons.map((s) => (
        <option key={s.id} value={String(s.year)}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
