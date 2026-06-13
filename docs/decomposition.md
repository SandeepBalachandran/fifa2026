# System Decomposition

This document maps the system into its capabilities, modules, and their dependencies. It is the navigational companion to [architecture.md](./architecture.md) and the capability specs in [openspec/specs/](../openspec/specs/).

---

## Capability Map

```
World Cup Draft Manager
│
├── team-drafting          ← Spec: openspec/specs/team-drafting/spec.md
│   ├── Participant management
│   ├── Team ownership assignment
│   ├── Draft lock / unlock
│   └── Admin override
│
├── match-tracking         ← Spec: openspec/specs/match-tracking/spec.md
│   ├── Football Data API integration
│   ├── Fixture sync (scheduled)
│   ├── Result import
│   └── Competition progress tracking
│
├── scoring                ← Spec: openspec/specs/scoring/spec.md
│   ├── Result-based point calculation
│   ├── Qualification bonuses
│   ├── Configurable scoring rules
│   └── Score history
│
├── leaderboard            ← Spec: openspec/specs/leaderboard/spec.md
│   ├── Participant rankings
│   ├── Score differences
│   ├── Teams-remaining counts
│   └── Rank change tracking
│
├── direct-battles         ← Spec: openspec/specs/direct-battles/spec.md
│   ├── Battle detection (fixture analysis)
│   ├── Battle surfacing (UI, War Room)
│   └── Battle outcome recording
│
├── notifications          ← Spec: openspec/specs/notifications/spec.md
│   ├── Match victory notifications
│   ├── Qualification achievement notifications
│   ├── Elimination notifications
│   ├── Leaderboard change notifications
│   └── Direct battle outcome notifications
│
└── war-room               ← Spec: openspec/specs/war-room/spec.md
    ├── Leader display
    ├── Leaderboard summary
    ├── Upcoming matches panel
    ├── Recent results panel
    ├── Direct battles section
    ├── Knockout bracket preview
    └── Tournament insights
```

---

## Capability Dependencies

```
match-tracking  ─────────────────────────────┐
     │                                       │
     ▼                                       │
  scoring ──────────────────────────┐        │
     │                              │        │
     ▼                              ▼        ▼
leaderboard                notifications  direct-battles
     │                              │        │
     └──────────────────────────────┴────────┘
                                             │
                                             ▼
                                         war-room
                                      (aggregates all)

team-drafting ──────────────────────────────►(provides owner context to all)
```

**Reading the diagram:**
- `match-tracking` is the root data source — everything flows from it
- `team-drafting` provides the ownership context consumed by scoring, battles, and notifications
- `war-room` is a pure aggregator — it reads from all other capabilities, writes nothing
- `notifications` is a side-effect system — triggered by scoring and battles, never primary

---

## Module-to-File Mapping (Planned)

| Capability | Application module path | Spec |
|---|---|---|
| team-drafting | `lib/draft/` | `openspec/specs/team-drafting/spec.md` |
| match-tracking | `lib/match-sync/` | `openspec/specs/match-tracking/spec.md` |
| scoring | `lib/scoring/` | `openspec/specs/scoring/spec.md` |
| leaderboard | `lib/leaderboard/` | `openspec/specs/leaderboard/spec.md` |
| direct-battles | `lib/battles/` | `openspec/specs/direct-battles/spec.md` |
| notifications | `lib/notifications/` | `openspec/specs/notifications/spec.md` |
| war-room | `lib/war-room/` | `openspec/specs/war-room/spec.md` |
| Football Data API client | `lib/football-data/` | — |

UI pages mirror capabilities:

| Page | Route | Primary capability |
|---|---|---|
| War Room | `/` | war-room |
| Leaderboard | `/leaderboard` | leaderboard |
| Fixtures | `/fixtures` | match-tracking |
| Teams / Draft | `/draft` | team-drafting |
| Notifications | `/notifications` | notifications |
| Direct Battles | `/battles` | direct-battles |
| Admin | `/admin` | team-drafting (admin) |

---

## Data Ownership

| Data entity | Owner module | Consumers |
|---|---|---|
| Participants | team-drafting | scoring, leaderboard, notifications, war-room |
| Team ownership | team-drafting | scoring, battles, notifications, war-room |
| Draft lock state | team-drafting | team-drafting (admin), match-tracking (read) |
| Fixtures | match-tracking | battles, war-room, notifications |
| Match results | match-tracking | scoring, battles, notifications |
| Participant scores | scoring | leaderboard, war-room |
| Rankings | leaderboard | war-room, notifications |
| Direct battles | direct-battles | notifications, war-room |
| Notifications | notifications | (read by UI) |
