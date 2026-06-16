'use client';

import { useState, useEffect } from 'react';
import type { PersonDetail } from '@/lib/football-data/person-types';

export interface PersonDetailsState {
  data: PersonDetail | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, PersonDetail>();

export function usePersonDetails(personId: number | null): PersonDetailsState & { retry: () => void } {
  const [state, setState] = useState<PersonDetailsState>({
    data: null,
    loading: false,
    error: null,
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (personId === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const key = String(personId);

    if (cache.has(key)) {
      setState({ data: cache.get(key)!, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(`/api/persons/${personId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PersonDetail>;
      })
      .then((data) => {
        if (!cancelled) {
          cache.set(key, data);
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: String(err) });
      });

    return () => { cancelled = true; };
  }, [personId, retryCount]);

  const retry = () => {
    if (personId !== null) cache.delete(String(personId));
    setRetryCount((c) => c + 1);
  };

  return { ...state, retry };
}
