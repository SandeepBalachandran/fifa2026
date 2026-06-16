'use client';

import { useState, useEffect } from 'react';
import type { Head2HeadResult } from '@/lib/football-data/match-types';

export interface Head2HeadState {
  data: Head2HeadResult | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, Head2HeadResult>();

export function useHead2Head(matchId: string | null): Head2HeadState {
  const [state, setState] = useState<Head2HeadState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!matchId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (cache.has(matchId)) {
      setState({ data: cache.get(matchId)!, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(`/api/matches/${matchId}/head2head`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Head2HeadResult>;
      })
      .then((data) => {
        if (!cancelled) {
          cache.set(matchId, data);
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: String(err) });
      });

    return () => { cancelled = true; };
  }, [matchId]);

  return state;
}
