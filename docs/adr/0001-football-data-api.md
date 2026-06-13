# ADR-0001: Use Football Data API as the Authoritative Live Data Source

**Status:** Accepted  
**Date:** 2026-06-13

---

## Context

The platform requires real World Cup fixture schedules, live match results, team standings, and competition progression data. This data must be accurate, timely, and cover the full tournament lifecycle (group stage through final).

Options considered:
1. **Football Data API** — well-documented REST API covering major competitions including FIFA World Cup; provides fixtures, results, standings, and competition metadata
2. **Manual data entry** — admins enter results manually after each match
3. **Third-party sports data aggregators** (e.g., SportRadar, API-Football) — broader coverage but higher cost and complexity

## Decision

Use **Football Data API** as the sole authoritative source for all match data.

All fixtures, results, standings, and team information must be fetched from this API. No match data is hardcoded or manually maintained in the application.

## Consequences

**Positive:**
- All match data is automatically accurate and current
- No operational overhead for result entry
- Competition progress (qualification, eliminations) is automatically reflected
- The application remains fully operational throughout a 64-match tournament without manual intervention

**Negative / Risks:**
- API rate limits require careful caching and sync scheduling
- API downtime or data delays affect the platform's accuracy — a mitigation is to cache last-known results and display staleness indicators
- API schema changes require updates to the integration layer (`lib/football-data/`)

**Constraints established:**
- No hardcoded fixture data anywhere in the codebase
- All Football Data API calls route through `lib/football-data/` — no direct API calls from UI components
- Results are cached locally; the cache is the application's read source
