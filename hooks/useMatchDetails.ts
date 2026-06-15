'use client';

import { useState, useEffect } from 'react';
import type { MatchDetail } from '@/lib/football-data/match-types';

export interface MatchDetailsState {
  data: MatchDetail | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, MatchDetail>();

export function useMatchDetails(matchId: string | null): MatchDetailsState & { retry: () => void } {
  const [state, setState] = useState<MatchDetailsState>({
    data: null,
    loading: false,
    error: null,
  });
  const [retryCount, setRetryCount] = useState(0);

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

    fetch(`/api/matches/${matchId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<MatchDetail>;
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
  }, [matchId, retryCount]);

  const retry = () => {
    if (matchId) cache.delete(matchId);
    setRetryCount((c) => c + 1);
  };

  return { ...state, retry };
}
