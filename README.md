# FIFA Fantasy War Room

A private fantasy football draft tracker and live match dashboard built with Next.js 16 App Router. Supports the FIFA World Cup draft game between participants, with live fixtures, standings, top scorers, head-to-head battles, and bet tracking — all switchable across major football leagues and historical seasons.

---

## Table of Contents

1. [Stack](#stack)
2. [Environment Setup](#environment-setup)
3. [Project Structure](#project-structure)
4. [Pages](#pages)
5. [Components](#components)
6. [API Routes](#api-routes)
7. [Library Layer (`lib/`)](#library-layer-lib)
8. [Football Data API Integration](#football-data-api-integration)
9. [Competition & Season Switching](#competition--season-switching)
10. [Draft System](#draft-system)
11. [Scoring System](#scoring-system)
12. [Battles System](#battles-system)
13. [Bet Tracker](#bet-tracker)
14. [Leaderboard](#leaderboard)
15. [Notifications](#notifications)
16. [Plan Upgrade / API Restrictions](#plan-upgrade--api-restrictions)
17. [Responsive Design](#responsive-design)
18. [Data Persistence](#data-persistence)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data source | [football-data.org](https://www.football-data.org) API v4 |
| Persistence | JSON flat files (no database) |
| Hosting | Local / Vercel-ready |

---

## Environment Setup

Create a `.env.local` file in the root:

```env
FOOTBALL_DATA_API_KEY=your_api_key_here
```

Get a free key at [football-data.org](https://www.football-data.org/client/register). Note: free tier only provides current-season data; historical seasons return 403 and show a subscription prompt.

Run the dev server:

```bash
npm run dev
```

---

## Project Structure

```
fifa/
├── app/                        # Next.js App Router pages & API routes
│   ├── page.tsx                # War Room landing page
│   ├── fixtures/page.tsx       # All fixtures by stage
│   ├── scorers/page.tsx        # Top scorers / Golden Boot
│   ├── leaderboard/page.tsx    # Draft leaderboard + standings
│   ├── battles/page.tsx        # Head-to-head draft battles
│   ├── draft/page.tsx          # Draft management
│   ├── bet-tracker/page.tsx    # Match bet tracker
│   ├── admin/page.tsx          # Admin panel
│   ├── notifications/page.tsx  # Notification feed
│   └── api/                    # Proxy API routes (see API Routes)
├── components/                 # React components
│   ├── CompetitionSwitcher.tsx
│   ├── SeasonSwitcher.tsx
│   ├── PlanUpgradeBanner.tsx
│   ├── ThemeToggle.tsx
│   ├── battles/
│   ├── fixtures/
│   ├── leaderboard/
│   ├── match-details/
│   ├── person/
│   └── team-details/
├── lib/                        # Business logic, data access, types
│   ├── football-data/          # API client + types
│   ├── store/                  # Root JSON store reader
│   ├── draft/                  # Draft pick storage
│   ├── scoring/                # Points calculation
│   ├── leaderboard/            # Leaderboard builder
│   ├── battles/                # Head-to-head battle detection
│   ├── bet-tracker/            # Bet result calculation
│   ├── war-room/               # Landing page data aggregator
│   ├── notifications/          # Notification generation
│   └── match-sync/             # Match result syncing
└── data/                       # JSON flat-file store (gitignored)
```

---

## Pages

### War Room (`/`) — `app/page.tsx`

The main landing page. A server component that reads `?competition=` and `?season=` from search params.

**Sections:**
- **Current Leader** — top participant by draft points; Bet Leader sub-section
- **Standings** — top 5 draft participants table; Top 5 Teams from the selected competition's standings
- **Upcoming Fixtures** — next 6 scheduled/live matches from selected competition
- **Recent Results** — last 5 finished matches from selected competition
- **Direct Battles** — upcoming and recent head-to-head draft battles

**WC-only sections** (unaffected by competition/season switcher):
- Draft standings, Current Leader, Bet Leader, Direct Battles

**Switches with competition/season:**
- Upcoming Fixtures, Recent Results, Top 5 Teams

Bet stats are always calculated from WC fixtures specifically, even when another competition is selected.

---

### Fixtures (`/fixtures`) — `app/fixtures/page.tsx`

Server component. Reads `?competition=` and `?season=`. Fetches all matches for the selected competition/season and groups them by stage (Group Stage, Round of 16, Semi-Finals, Final, Regular Season for leagues, etc.).

Clicking a fixture opens a **Match Details Drawer** with goals, bookings, head-to-head stats, and lineups.

---

### Top Scorers (`/scorers`) — `app/scorers/page.tsx`

Server component. Shows Golden Boot ranking for the selected competition/season. Includes a **Goals by Bet Owner** stacked bar (Sandy vs Rahul share of goals scored by their bet teams).

---

### Leaderboard (`/leaderboard`) — `app/leaderboard/page.tsx`

Server component. Two sections:
1. **Draft Standings** — all participants ranked by total points, with rank change indicators (▲▼–), medals for top 3, and gap from leader
2. **League/Competition Standings** — adapts to API response: single "Overall Standings" table for leagues, group cards grid for tournaments

Competition and Season switchers live in the standings section header.

---

### Battles (`/battles`) — `app/battles/page.tsx`

Shows all head-to-head battles between draft participants — upcoming and completed. Each battle card shows which participant owns which team in the fixture.

---

### Draft (`/draft`) — `app/draft/page.tsx`

Draft management page. Lists all participants and their assigned teams.

---

### Bet Tracker (`/bet-tracker`) — `app/bet-tracker/page.tsx`

Tracks match-by-match bets between Sandy and Rahul. Shows win/loss record, running amounts, and per-match bet labels.

---

### Admin (`/admin`) — `app/admin/page.tsx`

Internal admin panel for managing participants, draft picks, and triggering match syncs.

---

### Notifications (`/notifications`) — `app/notifications/page.tsx`

Notification feed showing scoring events — goals by drafted teams, match results, etc.

---

## Components

### `CompetitionSwitcher` — `components/CompetitionSwitcher.tsx`

Client component. Fetches `/api/competitions` on mount and renders a flag + select dropdown. Reads `?competition=` from the URL via `useSearchParams`, pushes updated URL on change via `useRouter` + `usePathname`. Uses `useTransition` to disable during navigation. Shows a skeleton while loading.

Must be wrapped in `<Suspense>` when used inside a Server Component page.

---

### `SeasonSwitcher` — `components/SeasonSwitcher.tsx`

Client component. Watches the `?competition=` param and re-fetches `/api/competitions/{code}/seasons` when it changes. Reads/writes `?season=`. Returns `null` if only one season is available (no dropdown needed). Shows a skeleton while loading.

---

### `PlanUpgradeBanner` — `components/PlanUpgradeBanner.tsx`

Shown whenever the API returns a 403 (historical season data not on current plan). Displays a lock icon, explanation message, and a disabled "Subscribe — Coming Soon" button.

---

### `FixturesShell` — `components/fixtures/FixturesShell.tsx`

Client component. Groups fixtures by stage and renders them as clickable cards. Stage labels are auto-formatted from API strings (e.g. `QUARTER_FINALS` → "Quarter-Finals"; unknown stages are title-cased). Opens `MatchDetailsDrawer` on click.

Stage ordering: `REGULAR_SEASON → GROUP_STAGE → LAST_16 → QUARTER_FINALS → SEMI_FINALS → THIRD_PLACE → FINAL`. Unknown stages are appended alphabetically.

---

### `LeaderboardShell` — `components/leaderboard/LeaderboardShell.tsx`

Client component. Renders both the draft leaderboard table and the competition standings. Detects whether standings are `OVERALL` (one table) or grouped (multiple group cards). Clicking a team opens `TeamDetailsDrawer`.

---

### `MatchDetailsDrawer` — `components/match-details/MatchDetailsDrawer.tsx`

Slide-in drawer showing full match details: scoreline, goals, bookings, and head-to-head record between the two teams.

---

### `TeamDetailsDrawer` — `components/team-details/TeamDetailsDrawer.tsx`

Slide-in drawer showing a team's squad, recent matches, competitions, and coach.

---

### `PersonDrawer` — `components/person/PersonDrawer.tsx`

Slide-in drawer showing a player or coach profile.

---

## API Routes

All routes proxy to football-data.org, keeping the API key server-side.

| Route | Description |
|---|---|
| `GET /api/competitions` | List of all available competitions |
| `GET /api/competitions/[code]/seasons` | Available seasons for a competition (capped at 10 most recent) |
| `GET /api/teams/[id]` | Team details, squad, coach |
| `GET /api/teams/[id]/matches` | Recent/upcoming matches for a team |
| `GET /api/matches/[id]` | Single match details with goals and bookings |
| `GET /api/matches/[id]/head2head` | Head-to-head history between the two teams |
| `GET /api/persons/[id]` | Player or coach profile |

---

## Library Layer (`lib/`)

### `lib/football-data/client.ts`

Core API client. All functions are async, server-side only (use `process.env.FOOTBALL_DATA_API_KEY`). Responses are cached with `next: { revalidate }`.

```typescript
fetchCompetitions(): Promise<Competition[]>               // revalidate: 3600s
fetchCompetitionSeasons(code, limit?): Promise<CompetitionSeason[]>  // revalidate: 3600s
fetchFixtures(competition?, matchday?, season?): Promise<Fixture[]>  // revalidate: 300s
fetchStandings(competition?, season?, matchday?): Promise<GroupStanding[]> // revalidate: 300s
fetchScorers(competition?, limit?, season?): Promise<TopScorer[]>    // revalidate: 300s
```

All competition params default to `'WC'`. Season param is the **start year** of the season (e.g. `2024` for 2024/25).

403 responses throw `'Historical season data is not available on the current API plan.'` — caught and displayed as a `PlanUpgradeBanner`.

---

### `lib/football-data/types.ts`

Shared types: `Fixture`, `GroupStanding`, `StandingEntry`, `MatchStage` (open union — allows arbitrary stage strings from league APIs alongside known tournament stages).

---

### `lib/store/index.ts`

Reads the root JSON flat-file store. Returns participants, draft picks, ownership map, and scoring data.

---

### `lib/war-room/data.ts`

Aggregates all War Room data: current leader, top 5 draft participants, upcoming and recent head-to-head battles.

---

### `lib/scoring/calculate.ts`

Calculates points per participant based on match results and their drafted teams.

---

### `lib/leaderboard/calculate.ts`

Builds the sorted leaderboard from the store, including rank, rank change (UP/DOWN/UNCHANGED), score delta from leader, and teams remaining.

---

### `lib/battles/detect.ts`

Detects head-to-head battles: fixtures where two different draft participants each own one of the playing teams.

---

### `lib/bet-tracker/calculate.ts`

Calculates bet win/loss record and running totals for Sandy and Rahul based on finished WC matches.

---

### `lib/bet-tracker/config.ts`

`BET_OWNERSHIP` map: team name → owner ('Sandy' | 'Rahul'). `getBetLabel()` returns the bet label string for a team name (used to badge teams across the UI).

---

## Football Data API Integration

**Base URL:** `https://api.football-data.org/v4`

**Authentication:** `X-Auth-Token` header.

**Key endpoints used:**

| Endpoint | Used for |
|---|---|
| `GET /competitions` | CompetitionSwitcher dropdown |
| `GET /competitions/{code}` | Season list for SeasonSwitcher |
| `GET /competitions/{code}/matches` | Fixtures page, War Room fixtures |
| `GET /competitions/{code}/standings` | Leaderboard standings, War Room Top 5 |
| `GET /competitions/{code}/scorers` | Top Scorers page |
| `GET /teams/{id}` | Team Details Drawer |
| `GET /teams/{id}/matches` | Team recent matches |
| `GET /matches/{id}` | Match Details Drawer |
| `GET /matches/{id}/head2head` | Head-to-head section |
| `GET /persons/{id}` | Player/coach profile |

**Season parameter:** Pass the start year of the season (e.g. `2024` for the 2024/25 Premier League season, `2026` for the 2026 World Cup). Omitting the parameter returns the current/upcoming season.

---

## Competition & Season Switching

All view pages (War Room, Fixtures, Scorers, Leaderboard) support `?competition=CODE&season=YEAR` URL params.

**Flow:**
1. `CompetitionSwitcher` fetches available competitions from `/api/competitions`
2. On competition change, updates `?competition=` in the URL (clears `?season=`)
3. `SeasonSwitcher` watches `?competition=` and re-fetches seasons from `/api/competitions/{code}/seasons`
4. On season change, appends `?season=YEAR` to the URL
5. Server Component pages `await searchParams`, parse `competition` (default `'WC'`) and `season`, then pass to fetch functions

**Draft/battles/bet-tracker sections always remain WC-only** regardless of switcher state.

**Season label format:** `2024/25` for multi-year seasons (leagues), `2026` for single-year tournaments.

---

## Draft System

Participants draft national teams before the tournament. Each team is assigned to exactly one participant. The `ownership` map (`team name → participant name`) is used throughout the UI to highlight owned teams in standings, fixtures, and scorers.

---

## Scoring System

Points are awarded to participants based on their teams' match results:
- Win, draw, loss results
- Goals scored by drafted teams
- Tournament progression (reaching knockout rounds, winning)

Scores are stored in the flat-file JSON store and recalculated on demand.

---

## Battles System

A battle is detected when a fixture features two teams owned by two different draft participants. The system scans all fixtures against the `ownership` map and returns upcoming/recent battles with participant names attached.

Battle cards appear on the War Room landing page and the Battles page.

---

## Bet Tracker

Sandy and Rahul place a bet on each WC match where one or both of them own a team. `calculateBetStats()` reads all finished WC fixtures and computes wins, losses, and running ₹ totals for each person. Results show in the War Room "Current Leader" card (Bet Leader sub-section) and the Bet Tracker page.

Team ownership for bets is configured in `lib/bet-tracker/config.ts`.

---

## Leaderboard

The leaderboard is built from `buildLeaderboard(store)` which:
1. Reads all participants and their total points from the store
2. Sorts by points descending
3. Assigns rank, computes rank change vs. previous snapshot, and calculates score delta from the leader
4. Returns `LeaderboardEntry[]` passed as props to `LeaderboardShell`

The competition standings below the draft table switch with the `CompetitionSwitcher`. For leagues, the API returns a single `OVERALL` standing (rendered as a full table). For tournaments with group stages, multiple group standings are returned (rendered as a 2-column card grid on mobile, up to 2 per row on wider screens).

---

## Notifications

The notifications system generates feed items for significant events — goals, match results, ranking changes. Events are stored in `lib/notifications/store.ts` and displayed on `/notifications`.

---

## Plan Upgrade / API Restrictions

The free tier of football-data.org only provides data for the current/upcoming season. Requesting historical seasons returns HTTP 403.

**Handling:**
- `fetchFixtures` and `fetchStandings` throw a descriptive `Error` on 403
- All callers catch this error and store it separately from the data
- `PlanUpgradeBanner` is shown in place of empty sections, with a "Subscribe — Coming Soon" disabled button
- The `SeasonSwitcher` still shows historical seasons (the metadata endpoint is unrestricted), but selecting one will show the banner

---

## Responsive Design

All pages are mobile-first with Tailwind breakpoints:

| Breakpoint | Width | Layout change |
|---|---|---|
| (default) | < 480px | Single column, minimal table columns |
| `min-[400px]` | ≥ 400px | GroupCard shows P, D, L columns |
| `sm` | ≥ 640px | StandingsTable shows P, D, L; Scorers show Ast/Pen/MP; Draft table shows Gap column |
| `md` | ≥ 768px | StandingsTable shows GF, GA columns |
| `lg` | ≥ 1024px | War Room switches to 3-column grid |

**Key responsive patterns:**
- Tables use `hidden sm:table-cell` to progressively reveal columns
- Team names use `shortName` on mobile where available
- Fixture cards stack to 1 column on mobile, 2 on `sm`
- Group standings cards: 1 column on mobile, 2 columns from 480px
- `CompetitionSwitcher` + `SeasonSwitcher` wrapped in `flex-wrap` rows on all header bars
