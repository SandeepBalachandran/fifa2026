# Feature: Team Details Drawer

A reusable slide-in drawer (desktop) / bottom sheet (mobile) that shows full team information and squad details fetched from the Football Data API when a user clicks a team name.

---

## 1. Purpose

Give users instant access to team information — squad, coach, competitions, and metadata — without leaving the current page. The drawer is lazy-loaded (data fetched only on first click) and cached within the browser session to avoid redundant API calls.

---

## 2. User Flow

```
Leaderboard page
  → User clicks a team name in the WC Standings table
    → Drawer slides in (right on desktop, up on mobile)
      → Skeleton shown while data loads
        → Full team details rendered
          → User closes via ✕ button, Escape key, or backdrop click
```

The drawer is reusable: to add it to another page, render `<TeamDetailsDrawer teamId={id} onClose={...} />` and pass a team ID on click.

---

## 3. API Contract

### Endpoint

```
GET /api/teams/{id}
```

This is an internal Next.js Route Handler that proxies to the Football Data API. The API key is kept server-side and never exposed to the browser.

### Upstream API

```
GET https://api.football-data.org/v4/teams/{teamId}
Authorization: X-Auth-Token: <FOOTBALL_DATA_API_KEY>
Cache: next: { revalidate: 3600 }   ← cached for 1 hour on the server
```

### Request

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Football Data API team ID (from standings response) |

### Response (success)

Returns the full `TeamDetails` object (see §4).

### Response (error)

```json
{ "error": "Football Data API error: 404 Not Found" }
```

---

## 4. Data Mapping

All fields from the API response are surfaced in the UI. Fields that are `null` are hidden — no empty placeholder is shown.

### Team

| API field | Used in |
|-----------|---------|
| `area.name` | TeamHeader — country |
| `area.code` | TeamHeader |
| `area.flag` | (available, not currently displayed — future flag icon) |
| `id` | Route parameter, cache key |
| `name` | TeamHeader — full name |
| `shortName` | TeamHeader — secondary name |
| `tla` | TeamHeader — code badge |
| `crest` | TeamHeader — crest image |
| `address` | TeamInfoCard |
| `website` | TeamInfoCard — clickable link |
| `founded` | TeamHeader — "Est. YYYY" |
| `clubColors` | TeamHeader — color string |
| `venue` | TeamInfoCard |
| `lastUpdated` | Footer of drawer |

### Running Competitions

| API field | Used in |
|-----------|---------|
| `runningCompetitions[].id` | React key |
| `runningCompetitions[].name` | CompetitionList chip |
| `runningCompetitions[].code` | CompetitionList chip badge |
| `runningCompetitions[].type` | CompetitionList chip badge |
| `runningCompetitions[].emblem` | CompetitionList chip image |

### Coach

| API field | Used in |
|-----------|---------|
| `coach.name` | CoachCard — full name |
| `coach.nationality` | CoachCard |
| `coach.dateOfBirth` | CoachCard — formatted DOB + calculated age |

### Squad

| API field | Used in |
|-----------|---------|
| `squad[].id` | React key |
| `squad[].name` | PlayerCard — name + PlayerAvatar initials |
| `squad[].position` | PlayerCard badge, SquadSection group |
| `squad[].nationality` | PlayerCard, search filter |
| `squad[].dateOfBirth` | PlayerCard — formatted DOB + calculated age |

---

## 5. UI Structure

```
TeamDetailsDrawer
├── Overlay backdrop (click to close)
└── Panel
    ├── Sticky header bar
    │   ├── "Team Details" label
    │   └── Close button (✕)
    └── Scrollable content
        ├── TeamHeader          ← crest, name, TLA, country, founded, colors
        ├── TeamInfoCard        ← venue, address, website (hidden if all null)
        ├── CompetitionList     ← horizontal scroll of competition chips
        ├── CoachCard           ← coach avatar, name, nationality, DOB/age
        ├── SquadSummary        ← stat pills: total/GK/DEF/MID/FWD + coach name
        ├── SquadSection        ← search input + position filter + collapsible groups
        │   ├── Goalkeepers (N) ← collapsible
        │   ├── Defenders (N)   ← collapsible
        │   ├── Midfielders (N) ← collapsible
        │   └── Forwards (N)    ← collapsible
        └── "Last updated" footer
```

---

## 6. Component Hierarchy

```
components/
├── team-details/
│   ├── TeamDetailsDrawer.tsx   'use client' — drawer shell, animation, focus
│   ├── TeamHeader.tsx          server-compatible display component
│   ├── TeamInfoCard.tsx        server-compatible display component
│   ├── CompetitionList.tsx     server-compatible display component
│   ├── CoachCard.tsx           server-compatible display component
│   ├── SquadSummary.tsx        server-compatible display component
│   ├── SquadSection.tsx        'use client' — search, filter, collapse state
│   ├── PlayerCard.tsx          server-compatible display component
│   └── PlayerAvatar.tsx        server-compatible, image-ready placeholder
└── leaderboard/
    └── LeaderboardShell.tsx    'use client' — manages selectedTeamId state,
                                 renders StandingsTable + GroupCard + drawer

hooks/
└── useTeamDetails.ts           'use client' — fetch + in-memory cache

app/api/teams/[id]/
└── route.ts                    Route Handler — proxies to Football Data API

lib/football-data/
└── team-types.ts               TypeScript interfaces for all API fields
```

### Why the leaderboard is split into page + shell

`app/leaderboard/page.tsx` remains a **Server Component** — it fetches the store and standings data on the server before the page reaches the browser. All that data is passed as props to `LeaderboardShell`, which is a **Client Component** and manages the interactive drawer state. This pattern keeps server-side data fetching separate from client-side interactivity.

---

## 7. Loading States

When a team is clicked and data hasn't been fetched yet, a skeleton loader is displayed:

- Header area: circular crest placeholder + two text bars
- Info card: solid rectangular block
- Competition chips: two rectangular blocks side by side
- Coach card: rectangular block
- Squad summary: rectangular block
- 5 squad row blocks

All skeleton elements use `animate-pulse` (Tailwind) to indicate activity without layout shift.

---

## 8. Error Handling

If the API call fails (network error, API key missing, 429 rate limit, etc.):

- "Unable to load team details." message is shown
- The error string from the fetch is displayed below
- **Retry** button clears the cache entry and re-fetches
- **Close** button dismisses the drawer
- A loading state is shown immediately on retry

---

## 9. Empty States

| Condition | Behaviour |
|-----------|-----------|
| `coach` object has no name | Coach section is hidden entirely |
| `squad` is empty | "No squad data available." message replaces the list |
| `runningCompetitions` is empty | Competitions section is hidden entirely |
| All `TeamInfoCard` fields are null | Card is not rendered |
| Squad search returns no results | "No players match your search." message shown |

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| `role="dialog"` | On the panel element |
| `aria-modal="true"` | On the panel element |
| `aria-label="Team Details"` | On the panel element |
| Close button label | `aria-label="Close team details"` |
| Escape key closes drawer | `keydown` listener added while drawer is mounted |
| Focus on open | `autoFocus` moves to close button via `ref.current?.focus()` |
| Focus restored on close | `previousFocusRef` captures the trigger element and restores focus |
| Squad collapsibles | `aria-expanded` + `aria-controls` on toggle buttons |
| Avatar alt text | `aria-label={name}` + `role="img"` on the initials fallback span |
| Squad search | `aria-label="Search squad"` on the input |
| Position filter group | `role="group"` + `aria-label="Filter by position"` |
| Body scroll locked | `document.body.style.overflow = 'hidden'` while drawer is open |

---

## 11. Performance

| Concern | Solution |
|---------|----------|
| Lazy loading | Data fetched only when drawer opens (never on page load) |
| Session cache | `Map<teamId, TeamDetails>` in `hooks/useTeamDetails.ts` — same team clicked twice uses cached data |
| Server-side cache | Route Handler uses `next: { revalidate: 3600 }` — the Next.js data cache holds the upstream API response for 1 hour |
| No layout shift | Skeleton matches final layout; avatar placeholder uses exact pixel dimensions |
| No bundle bloat | All display sub-components are server-compatible (no `'use client'`) — only the interactive boundary files are bundled |

---

## 12. Future Enhancements

- **Real player images** — `PlayerAvatar` accepts an `imageUrl` prop today. When the API provides player photos (or a third-party source is integrated), pass the URL and the fallback initials are automatically replaced.
- **Player statistics** — goals, assists, caps per player; requires additional API call to `/v4/persons/{id}/matches` or a stats endpoint.
- **Club affiliations** — each squad member's current club can be fetched via `/v4/persons/{id}`.
- **Injury/suspension status** — overlay a status badge on the player card when a status API is available.
- **Team comparison view** — open two drawers side by side (or a dedicated `/compare` page) to compare squad depth, stats, and ratings.
- **Area flag image** — `team.area.flag` is captured in the type but not yet displayed; add a small flag next to the country name in `TeamHeader`.
- **Shareable deep link** — add `?team={id}` query param so the drawer state is URL-addressable and bookmarkable.
