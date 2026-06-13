## Context

The `direct-battles` capability has a complete spec (`openspec/specs/direct-battles/spec.md`) with no corresponding implementation. The application already has a match-sync pipeline (`lib/match-sync/`) that imports fixtures and results from the Football Data API, and a draft store that holds ownership data. This change wires battles detection into that pipeline and adds the battles UI.

Currently the war-room spec references a "direct battles section" that cannot render any data because no battles module exists.

## Goals / Non-Goals

**Goals:**
- Implement battle detection as a side effect of the match-sync pipeline
- Persist detected battles and their outcomes in the draft store
- Expose a `/battles` route showing all battles (upcoming, live, resolved)
- Distinguish battle-flagged matches visually on the fixtures list
- Surface upcoming/recent battles in the war-room's existing battles section

**Non-Goals:**
- Real-time battle push notifications (polling via page refresh is sufficient for v1)
- Battle-specific scoring bonuses (scoring rules live in the scoring module)
- Player-level battle breakdowns (team-level only)

## Decisions

### Detection runs synchronously in match-sync, not lazily on render

Battle detection executes immediately after each fixture is imported or updated by the sync pipeline. The alternative — detecting battles at render time by cross-referencing ownership data — would scatter detection logic into the UI layer and make outcomes impossible to record persistently.

**Rationale**: Recording an outcome (who won a Direct Battle) requires a write to persistent state; that cannot happen during a server-component render. Detection must live in the mutation path.

### Battle state lives in the draft store alongside ownership

A battle record contains: `matchId`, `homeOwner`, `awayOwner`, `homeTeam`, `awayTeam`, `status` (`SCHEDULED | LIVE | FINISHED`), `outcome` (`null | HOME_WIN | AWAY_WIN | DRAW`). This is stored as a `battles` map in the draft store, keyed by `matchId`.

**Alternative considered**: Deriving battles on demand from the fixture cache + ownership data. Rejected because it makes outcome recording impossible without an additional persistent store.

### `/battles` page is a server component

All battle data is loaded at render time from the draft store. No client-side state is needed for the list view. The page is structured as: upcoming battles → live battles → completed battles.

**Alternative considered**: Client-side polling for live battle updates. Deferred — a page refresh is acceptable for the v1 scope given match cadence.

### Fixture list battle flag is a UI-only decoration

The fixture list already receives match data from match-sync. Battle status is added by joining fixture data against the battles store at render time — no schema changes to match-tracking are needed.

## Risks / Trade-offs

- **Sync pipeline blast radius** → Detection failure must not break the sync pipeline. Wrap detection in a try/catch; log errors, do not rethrow.
- **Stale battle status after team ownership changes** → If a team's owner changes after battle detection, the stored owner names become stale. For v1, this is acceptable: draft lock prevents ownership changes once the tournament starts.
- **Draft store contention** → The battles map is written during sync and read by multiple server components. The store implementation must handle concurrent reads safely.

## Migration Plan

No data migration is required — the draft store battles map starts empty and is populated incrementally as fixtures are synced. Deploying the change on an active tournament will detect battles for all future fixture syncs; historical battles from prior syncs will not be back-filled (acceptable for v1).
