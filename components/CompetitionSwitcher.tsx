'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Competition } from '@/lib/football-data/client';

export function CompetitionSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get('competition') ?? 'WC';
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/competitions')
      .then((r) => r.json())
      .then((data: Competition[]) => setCompetitions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('competition', code);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  if (loading) {
    return (
      <div className="h-9 w-48 animate-pulse rounded-lg bg-green-100 dark:bg-green-900/30" />
    );
  }

  if (competitions.length === 0) return null;

  const selected = competitions.find((c) => c.code === current);

  return (
    <div className="flex items-center gap-2">
      {selected?.area.flag && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={selected.area.flag} alt="" className="h-5 w-5 object-contain" />
      )}
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 shadow-sm transition-opacity disabled:opacity-50 dark:border-green-800 dark:bg-gray-900 dark:text-green-100"
      >
        {competitions.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
