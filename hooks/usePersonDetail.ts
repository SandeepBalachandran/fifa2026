'use client';

import { useState, useEffect } from 'react';
import type { PersonDetail } from '@/lib/football-data/person-types';

export interface PersonDetailState {
  data: PersonDetail | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<number, PersonDetail>();

export function usePersonDetail(personId: number | null): PersonDetailState {
  const [state, setState] = useState<PersonDetailState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (personId === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (cache.has(personId)) {
      setState({ data: cache.get(personId)!, loading: false, error: null });
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
          cache.set(personId, data);
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: String(err) });
      });

    return () => { cancelled = true; };
  }, [personId]);

  return state;
}
