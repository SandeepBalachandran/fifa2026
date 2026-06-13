# Architecture

## Overview

World Cup Draft Manager is a Next.js 16 application (App Router) that integrates live Football Data API data with a fantasy-style team ownership layer. All match data is authoritative from the API — nothing is hardcoded.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / User                           │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────────────┐
│                    Next.js 16 App (App Router)                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Server Pages   │  │  Server Actions  │  │  API Routes   │ │
│  │  (RSC, no JS by  │  │  (mutations,     │  │  (webhooks,   │ │
│  │   default)       │  │   draft ops)     │  │   sync jobs)  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬────────┘ │
│           │                     │                    │          │
│  ┌────────▼─────────────────────▼────────────────────▼────────┐ │
│  │                    Application Layer                        │ │
│  │  scoring • leaderboard • draft • notifications • battles   │ │
│  └────────────────────────────┬────────────────────────────────┘ │
│                               │                                 │
│  ┌────────────────────────────▼────────────────────────────────┐ │
│  │                     Data Layer                              │ │
│  │  ┌──────────────────┐        ┌────────────────────────────┐ │ │
│  │  │  Draft Store     │        │  Football Data API Cache   │ │ │
│  │  │  (ownership,     │        │  (fixtures, results,       │ │ │
│  │  │   participants,  │        │   standings — refreshed    │ │ │
│  │  │   scores,        │        │   on schedule)             │ │ │
│  │  │   notifications) │        └──────────────┬─────────────┘ │ │
│  │  └──────────────────┘                       │               │ │
│  └──────────────────────────────────────────────┼───────────────┘ │
└─────────────────────────────────────────────────┼─────────────────┘
                                                  │ HTTPS
                                    ┌─────────────▼──────────────┐
                                    │    Football Data API       │
                                    │  (live fixtures, results,  │
                                    │   standings, competitions) │
                                    └────────────────────────────┘
```

---

## Key Architectural Decisions

See [docs/adr/](./adr/) for the full decision records. Summary:

| Decision | Choice | Record |
|---|---|---|
| Live data source | Football Data API | ADR-0001 |
| Framework | Next.js 16 App Router | ADR-0002 |
| Ownership model | Team-based (not player-based) | ADR-0003 |

---

## Layer Descriptions

### Presentation Layer (Next.js Pages & Components)

- Server Components by default — data fetched at render time, no client JS unless needed
- Client Components only for interactive elements (real-time polling, interactive bracket)
- Tailwind CSS v4 for styling

### Application Layer

Business logic is organized by capability (mirrors `openspec/specs/` structure):

| Module | Responsibility |
|---|---|
| `draft` | Team ownership assignment, lock management |
| `scoring` | Points calculation after result import |
| `leaderboard` | Participant ranking aggregation |
| `match-sync` | Football Data API fetch, cache, and result import |
| `battles` | Direct battle detection and outcome recording |
| `notifications` | Event-triggered notification generation |
| `war-room` | Dashboard data aggregation |

### Data Layer

Two logical stores:

1. **Draft Store** — persistent: participants, team ownership, scores, notifications, battle history
2. **Match Cache** — refreshed from Football Data API on schedule; treated as a cache (can be re-fetched from source at any time)

### External Integration

- **Football Data API** — all fixture, result, and standings data
- Sync runs on a schedule (e.g., every 5 minutes during live matches, every hour otherwise)
- Rate limits are respected; responses are cached locally

---

## Data Flow: Match Result → Score Update

```
Football Data API
       │
       ▼  (scheduled sync)
match-sync module
  • fetches updated results
  • stores in match cache
       │
       ▼  (for each new FINISHED match)
scoring module
  • looks up team owners from draft store
  • calculates points per scoring rules
  • updates participant scores
       │
       ├──▶ leaderboard module
       │      • recalculates rankings
       │
       ├──▶ battles module
       │      • checks if match was a Direct Battle
       │      • records outcome
       │
       └──▶ notifications module
              • generates event notifications
              • stores in draft store
```

---

## Non-Goals

This architecture deliberately excludes:

- Real-time WebSocket streams (polling is sufficient for match cadence)
- Player-level fantasy management
- Betting, odds, or financial features
- Authentication beyond basic admin/participant identification (v1 scope)
