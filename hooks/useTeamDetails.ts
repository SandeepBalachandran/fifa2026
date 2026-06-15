'use client';

import { useState, useEffect } from 'react';
import type { TeamDetails } from '@/lib/football-data/team-types';

export interface TeamDetailsState {
  data: TeamDetails | null;
  loading: boolean;
  error: string | null;
}

// Session-scoped in-memory cache — avoids refetching the same team within a visit.
const cache = new Map<string, TeamDetails>();

export function useTeamDetails(teamId: string | null): TeamDetailsState & { retry: () => void } {
  const [state, setState] = useState<TeamDetailsState>({
    data: null,
    loading: false,
    error: null,
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!teamId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (cache.has(teamId)) {
      setState({ data: cache.get(teamId)!, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(`/api/teams/${teamId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<TeamDetails>;
      })
      .then((data) => {
        if (!cancelled) {
          cache.set(teamId, data);
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [teamId, retryCount]);

  const retry = () => {
    if (teamId) cache.delete(teamId); // clear stale cache entry before retrying
    setRetryCount((c) => c + 1);
  };

  return { ...state, retry };
}
