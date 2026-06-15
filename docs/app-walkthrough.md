# World Cup Draft Manager 2026 — Complete App Walkthrough

A reference doc covering every file in the app: what it does, how it connects, and the exact code patterns used.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Tech Stack & Config](#2-tech-stack--config)
3. [Architecture — How Everything Connects](#3-architecture--how-everything-connects)
4. [Data Store — The JSON File](#4-data-store--the-json-file)
5. [External API — Football Data Org](#5-external-api--football-data-org)
6. [Pages](#6-pages)
7. [Library Modules](#7-library-modules)
8. [Components](#8-components)
9. [Server Actions](#9-server-actions)
10. [Scoring System](#10-scoring-system)
11. [Notifications System](#11-notifications-system)
12. [Battles System](#12-battles-system)
13. [Bet Tracker](#13-bet-tracker)
14. [Theme & Dark Mode](#14-theme--dark-mode)

---

## 1. App Overview

This is a **fantasy-style World Cup manager** for a group of friends.

- Each participant **drafts/owns** a set of World Cup 2026 teams.
- As teams play matches, their owners earn **points** (win = 3, draw = 1, clean sheet = +1, etc.).
- When two owned teams play each other it's a **Direct Battle** — flagged as a special head-to-head.
- A separate **Bet Tracker** sub-feature tracks a personal side-bet between Sandy and Rahul (₹30 per win) independent of the fantasy draft.
- Live match data comes from the **Football Data API** (football-data.org).
- All fantasy state (participants, ownership, scores, battles) is persisted in a **local JSON file** (`data/draft-store.json`).

Active pages (visible in nav): War Room, Leaderboard, Fixtures, Bet Tracker.
Hidden/admin pages (commented out of nav): Battles, Draft, Notifications, Admin.

---

## 2. Tech Stack & Config

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.2.9 | App framework (App Router) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Types |
| Tailwind CSS | ^4 | Styling (PostCSS plugin, no config file) |
| Vitest | ^2 | Unit tests |
| Node.js | runtime | File I/O for the JSON store |

**Key Next.js patterns used in this app:**
- **Server Components** (default) — most pages run entirely on the server, fetch data, and render HTML.
- **Client Components** (`'use client'`) — only `ThemeToggle.tsx` uses this, for `useEffect`/`useState`.
- **Server Actions** (`'use server'`) — `app/admin/actions.ts`, for form submissions that mutate the JSON store.
- **`next: { revalidate: 300 }`** — API fetch calls are cached by Next.js and re-validated every 5 minutes (ISR-style caching).
- **`revalidatePath()`** — after a server action mutates data, the relevant page caches are busted.

No `.env` file is committed — the app reads `FOOTBALL_DATA_API_KEY` from the environment.

---

## 3. Architecture — How Everything Connects

```
┌──────────────────────────────────────────────────────────────────┐
│  Football Data API (external)                                    │
│  https://api.football-data.org/v4                                │
└──────────────────────┬───────────────────────────────────────────┘
                       │ fetchFixtures() / fetchStandings()
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  lib/football-data/client.ts          (HTTP client + mapper)     │
│  lib/football-data/types.ts           (Fixture, StandingEntry…)  │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Fixture[]
          ┌────────────┼─────────────────────┐
          ▼            ▼                     ▼
   lib/war-room   lib/match-sync       lib/bet-tracker
   /data.ts       /index.ts            /calculate.ts
                       │
                       ▼
         lib/store/index.ts  ←→  data/draft-store.json
         (readStore / writeStore)
                       │
          ┌────────────┼────────────────────────────┐
          ▼            ▼                             ▼
   lib/scoring   lib/battles               lib/notifications
   /calculate.ts /detect.ts + store.ts     /generate.ts + store.ts
                       │
                       ▼
             lib/leaderboard/calculate.ts
```

**Rule of thumb:**
- Pages **always** call library functions — never read the JSON file directly.
- Library functions read/write the store via `readStore()`/`writeStore()`.
- `lib/football-data/client.ts` is the only file that talks to the external API.

---

## 4. Data Store — The JSON File

**File:** `data/draft-store.json`  
**Module:** [lib/store/index.ts](../lib/store/index.ts)

The entire app state (for the fantasy draft) lives in one JSON file. There is no database.

### The `DraftStore` interface

```ts
interface DraftStore {
  participants: string[];                  // ["Alice", "Bob", ...]
  ownership:   Record<string, string>;     // { "Brazil": "Alice", "France": "Bob" }
  eliminated:  string[];                   // ["Germany"] — knocked out in knockout stage
  scores:      Record<string, number>;     // { "Alice": 45, "Bob": 30 }
  previousRanks: Record<string, number>;   // snapshot used to compute rank change arrows
  notifications: AppNotification[];        // in-app notification log
  battles:     Record<string, DirectBattle>; // keyed by matchId
  scoringRules: ScoringRules;              // configurable point values
  fixtures:    Fixture[];                  // cached copy of last API response
}
```

### `readStore()` — how data is read

```ts
export function readStore(): DraftStore {
  ensureStoreFile();  // creates the file if missing
  try {
    const raw = JSON.parse(readFileSync(STORE_PATH, 'utf-8')) as Partial<DraftStore>;
    return { ...EMPTY_STORE, ...raw };  // merge with defaults so missing keys never crash
  } catch {
    return { ...EMPTY_STORE };
  }
}
```

Key detail: the spread `{ ...EMPTY_STORE, ...raw }` means if you add a new field to `DraftStore` with a default in `EMPTY_STORE`, old JSON files without that field will still work — they get the default automatically.

### `writeStore()` — how data is written

```ts
export function writeStore(store: DraftStore): void {
  ensureStoreFile();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}
```

Synchronous write with 2-space indentation so the file is human-readable. There is **no locking** — two concurrent server actions could theoretically race, but this is acceptable for a small group app.

### Default scoring rules (baked into the store)

```ts
const DEFAULT_SCORING_RULES = {
  win: 3,          draw: 1,         loss: 0,
  cleanSheet: 1,   groupStageQualification: 5,
  roundOf16: 5,    quarterFinal: 8,  semiFinal: 10,
  runnerUp: 10,    champion: 15,
};
```

---

## 5. External API — Football Data Org

**Module:** [lib/football-data/client.ts](../lib/football-data/client.ts)  
**Types:** [lib/football-data/types.ts](../lib/football-data/types.ts)

### Authentication

Every request includes the API key from the environment:
```ts
headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY }
```

If the key is missing, `getApiKey()` throws immediately rather than making a bad request.

### `fetchFixtures(matchday?: number): Promise<Fixture[]>`

```
GET https://api.football-data.org/v4/competitions/WC/matches
    ?matchday=N   (optional)
```

- Fetches all World Cup 2026 matches (or just one matchday).
- Cached by Next.js for **5 minutes** (`next: { revalidate: 300 }`).
- The raw API response `ApiMatch` is mapped to the internal `Fixture` type by `mapMatch()`.

**What `mapMatch()` does:**
- Converts `id` from `number` → `string`
- Coerces `null` crests to `null` (instead of `undefined`)
- Casts `status` and `stage` strings to their union types (`MatchStatus`, `MatchStage`)

### `fetchStandings(season?: number, matchday?: number): Promise<GroupStanding[]>`

```
GET https://api.football-data.org/v4/competitions/WC/standings
    ?season=2026
    ?matchday=N   (optional)
```

- Fetches group-stage standings tables.
- Filtered to `type === 'TOTAL'` only (the API also returns HOME and AWAY splits which we don't need).
- Each group becomes a `GroupStanding` with a `group` label (e.g. `"GROUP_A"`) and a `table` of `StandingEntry` rows.

### Internal types used throughout the app

```ts
type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';
type MatchStage  = 'GROUP_STAGE' | 'LAST_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'THIRD_PLACE' | 'FINAL';

interface Fixture {
  id: string;
  matchday: number | null;
  homeTeam: { id: string; name: string; crest: string | null };
  awayTeam: { id: string; name: string; crest: string | null };
  utcDate: string;          // ISO 8601 e.g. "2026-06-14T18:00:00Z"
  status: MatchStatus;
  stage: MatchStage;
  score: { fullTime: { home: number | null; away: number | null } };
}
```

---

## 6. Pages

All pages are Server Components (except where noted). They fetch/read data at the top, then render JSX.

### 6.1 `app/layout.tsx` — Root Layout

Wraps every page. Runs once on the server, sets up fonts, nav, footer.

**What it does:**
- Loads `Geist` and `Geist_Mono` fonts via `next/font/google`.
- Sets `<html>` title and description via `export const metadata`.
- Renders a sticky top `<header>` with nav links and `<ThemeToggle>`.
- Renders a mobile bottom tab bar (`fixed bottom-0`) with the same nav links.
- Injects an inline `<script>` that runs **synchronously before paint** to restore dark mode from `localStorage` — prevents flash of wrong theme.

**The anti-flash script (important):**
```html
<script>
  try {
    if (localStorage.getItem('theme') === 'dark')
      document.documentElement.classList.add('dark');
  } catch(e) {}
</script>
```

This runs before React hydrates. `try/catch` handles environments where `localStorage` is blocked.

**Nav links:**
```ts
const NAV_LINKS = [
  { href: "/",            label: "War Room",    icon: "🏟" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/fixtures",    label: "Fixtures",    icon: "📅" },
  { href: "/bet-tracker", label: "Bet Tracker", icon: "🎯" },
  // Battles, Draft, Notifications, Admin are commented out
];
```

---

### 6.2 `app/page.tsx` — War Room (Home)

The dashboard / landing page. Makes **3 parallel API/data calls** at the top:

```ts
const [warRoomData, allFixtures, standings] = await Promise.all([
  getWarRoomData(),
  fetchFixtures().catch((): Fixture[] => []),
  fetchStandings(2026).catch(() => []),
]);
```

`Promise.all` means all three start simultaneously — the page waits for whichever takes longest.

**Sections rendered:**

| Section | Data source | What it shows |
|---|---|---|
| Current Leader | `warRoomData.leader` | #1 draft participant's name + points |
| Bet Leader | `calculateBetStats(allFixtures)` | Sandy vs Rahul bet score |
| Draft Standings | `warRoomData.topFive` | Top 5 participants with rank/points |
| Top 5 WC Teams | `standings` (flattened + sorted) | Best performing teams across all groups |
| Upcoming Fixtures | `warRoomData.upcomingFixtures` | Next 5 SCHEDULED/TIMED/IN_PLAY matches |
| Recent Results | `warRoomData.recentResults` | Last 5 FINISHED matches with scores |
| Direct Battles | `warRoomData.upcomingBattles + recentBattles` | Only shown if battles exist |

**Top 5 WC teams logic:**
```ts
const topWcTeams = standings
  .flatMap((g) => g.table)           // flatten all groups into one list
  .sort((a, b) =>
    b.points - a.points ||           // primary: points desc
    b.goalDifference - a.goalDifference ||  // tiebreak 1: GD
    b.goalsFor - a.goalsFor          // tiebreak 2: GF
  )
  .slice(0, 5);
```

**Helper components defined inline:**
- `WRCrest` — renders a team crest image or grey placeholder box
- `BetLabel` — renders `(S)` or `(R)` badge from `getBetLabel()`

---

### 6.3 `app/leaderboard/page.tsx` — Leaderboard

```ts
const store = readStore();
const entries = buildLeaderboard(store);
const standings = await fetchStandings(2026, 1);  // matchday 1 only
```

**Two sections:**

**Draft Standings table** — all participants sorted by fantasy points, with:
- Medal rows (🥇🥈🥉 backgrounds) for top 3
- Rank change arrows (▲ green up, ▼ red down, – grey unchanged)
- Gap column showing how many points behind the person above
- "Teams Left" badge (green pill)

**World Cup Standings** — fetched live from API at matchday 1:
- If the API returns one group labelled `OVERALL` → renders a single `<StandingsTable>`
- Otherwise → renders a `<GroupCard>` grid (one card per group, e.g. GROUP_A through GROUP_J)
- Owned teams are highlighted with a blue row background and owner name badge
- Bet ownership labels `(S)` / `(R)` shown via `getBetLabel()`

---

### 6.4 `app/fixtures/page.tsx` — Fixtures

```ts
fixtures = await fetchFixtures();
const battleIndex = buildBattleIndex(getBattles());  // matchId → DirectBattle
const { ownership } = readStore();
const grouped = groupByStage(fixtures);              // sorted by STAGE_ORDER
```

Groups all fixtures by tournament stage in a defined order:
```ts
const STAGE_ORDER = ['GROUP_STAGE', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'];
```

Each stage is a `<section>` with a heading and a list of `<FixtureCard>` components.

`buildBattleIndex` creates a map `{ matchId: battle }` so `FixtureCard` can be told "this match is a Direct Battle" in O(1).

---

### 6.5 `app/bet-tracker/page.tsx` — Bet Tracker

*(Covered in depth in the separate bet-tracker-code-walkthrough.md)*

```ts
let fixtures = await fetchFixtures().catch(() => []);
const { sandy, rahul, history, teamCrests } = calculateBetStats(fixtures);
```

Three sections: Scoreboard (ScoreCard × 2), Team Ownership (TeamList × 2), Match History (table of HistoryRow).

---

### 6.6 `app/battles/page.tsx` — Battles (hidden from nav)

```ts
const battles = getBattles();   // reads from JSON store, no API call
const { live, upcoming, completed } = partitionBattles(battles);
```

Renders three `<BattleSection>` components (Live, Upcoming, Completed), each of which renders `<BattleCard>` items.

`partitionBattles` filters by `status` field and sorts by `matchDate` string comparison (ISO strings sort correctly lexicographically).

---

### 6.7 `app/draft/page.tsx` — Draft (hidden from nav)

```ts
const store = readStore();
const { participants, ownership, eliminated } = store;
// Inverts ownership: ownerName → [teamName, teamName, ...]
const teamsByOwner: Record<string, string[]> = {};
```

Shows each participant's team list. Eliminated teams are struck through in red. A green/red dot indicates team status. No API calls — pure store read.

---

### 6.8 `app/notifications/page.tsx` — Notifications (hidden from nav)

```ts
const notifications = getNotifications().slice().reverse();
```

`.reverse()` shows newest first. Each notification type has its own color:

| Type | Icon | Card color |
|---|---|---|
| MATCH_WIN | 🏆 | Emerald |
| MATCH_DRAW | 🤝 | Blue |
| MATCH_LOSS | ❌ | Red |
| QUALIFICATION | ⭐ | Amber |
| ELIMINATION | 💔 | Gray |
| BATTLE_RESULT | ⚔️ | Orange |
| RANK_CHANGE | 📊 | Purple |

Unread notifications show a colored dot (`.read === false`).

---

### 6.9 `app/admin/page.tsx` — Admin (hidden from nav)

A non-async Server Component — it reads the store synchronously at render time (no `await`).

```ts
export default function AdminPage() {   // no async!
  const store = readStore();
```

Four forms, each using a Server Action as the form's `action`:

| Form | Server Action | What it does |
|---|---|---|
| Add Participant | `actionAddParticipant` | Adds name to `participants[]` array |
| Assign Team | `actionAssignTeam` | Sets `ownership["TeamName"] = "OwnerName"` |
| Scoring Rules | `actionUpdateScoringRules` | Overwrites `scoringRules` in store |
| Sync / Recalculate | `actionRunSync` / `actionRecalculate` | See §9 |

---

## 7. Library Modules

### 7.1 `lib/store/index.ts` — JSON Store

Already covered in §4. Exports: `readStore`, `writeStore`, `DraftStore` type.

---

### 7.2 `lib/football-data/client.ts` — API Client

Already covered in §5. Exports: `fetchFixtures`, `fetchStandings`.

---

### 7.3 `lib/war-room/data.ts` — War Room Aggregator

```ts
export async function getWarRoomData(): Promise<WarRoomData>
```

Called only by `app/page.tsx`. Does **not** take arguments — reads the store and fetches fixtures internally.

**Fallback behavior:** If `fetchFixtures()` fails (API down), it falls back to `store.fixtures` — the cached copy written by the last successful sync:
```ts
try {
  fixtures = await fetchFixtures();
} catch {
  fixtures = store.fixtures;
}
```

**What it returns:**
```ts
interface WarRoomData {
  leader: LeaderboardEntry | null;
  topFive: LeaderboardEntry[];
  upcomingFixtures: Fixture[];   // next 5 non-finished
  recentResults: Fixture[];      // last 5 FINISHED
  upcomingBattles: DirectBattle[];  // SCHEDULED or LIVE, next 3
  recentBattles: DirectBattle[];    // FINISHED, last 3
}
```

---

### 7.4 `lib/scoring/types.ts` — Scoring Rules Type

```ts
interface ScoringRules {
  win: number;              // default 3
  draw: number;             // default 1
  loss: number;             // default 0
  cleanSheet: number;       // default 1 (bonus if opponent scores 0)
  groupStageQualification: number;  // default 5 (currently unused in calculate.ts)
  roundOf16: number;        // default 5
  quarterFinal: number;     // default 8
  semiFinal: number;        // default 10
  runnerUp: number;         // default 10 (currently unused — champion covers the final)
  champion: number;         // default 15
}
```

---

### 7.5 `lib/scoring/calculate.ts` — Points Engine

**`calculateMatchPoints(fixture, ownership, rules, eliminated)`**

Returns `MatchPointsResult[]` — one entry per owned team that played.

Logic per team:
```
if team is not eliminated:
  win  → rules.win
  draw → rules.draw
  loss → rules.loss
  if opponent scored 0 → +rules.cleanSheet
```

Only runs for `FINISHED` matches with non-null scores.

**`calculateStageBonus(fixture, ownership, rules)`**

Gives a bonus to the **winner** of knockout-stage matches:

```ts
const STAGE_BONUS: Record<string, keyof ScoringRules> = {
  LAST_16:       'roundOf16',
  QUARTER_FINALS:'quarterFinal',
  SEMI_FINALS:   'semiFinal',
  FINAL:         'champion',
};
```

- Only runs for `FINISHED` knockout matches (GROUP_STAGE and THIRD_PLACE are excluded).
- Only the **winner** gets the bonus (draws produce no bonus — shouldn't happen in knockouts).
- The FINAL winner gets `rules.champion` (15 pts).

---

### 7.6 `lib/scoring/store.ts` — Score Persistence

| Function | What it does |
|---|---|
| `getScores()` | Returns `store.scores` |
| `addPoints(ownerName, points)` | Increments one owner's score |
| `getScoringRules()` | Returns `store.scoringRules` |
| `updateScoringRules(rules)` | Overwrites the rules |
| `recalculateAllScores()` | Resets all scores to 0, replays every fixture from `store.fixtures` |

`recalculateAllScores()` is the "nuclear option" — if you realize scores got corrupted or rules changed, call this to recompute everything from scratch using the cached fixtures.

---

### 7.7 `lib/draft/store.ts` — Draft/Ownership CRUD

| Function | What it does |
|---|---|
| `getParticipants()` | Returns `string[]` of participant names |
| `addParticipant(name)` | Adds to `participants[]`, initializes score to 0 |
| `getOwnership()` | Returns `Record<string, string>` (team → owner) |
| `assignTeam(teamName, ownerName)` | Sets one entry in `ownership` |
| `unassignTeam(teamName)` | Deletes one entry from `ownership` |
| `getEliminatedTeams()` | Returns `eliminated[]` array |
| `markEliminated(teamName)` | Pushes to `eliminated[]` if not already there |

Each function does a full `readStore()` → mutate → `writeStore()` cycle.

---

### 7.8 `lib/leaderboard/calculate.ts` — Leaderboard Builder

**`buildLeaderboard(store): LeaderboardEntry[]`**

Pure function. Sorts participants by score (desc), then by teams remaining as tiebreaker.

```ts
const sorted = [...participants].sort((a, b) => {
  const scoreDiff = (scores[b] ?? 0) - (scores[a] ?? 0);
  if (scoreDiff !== 0) return scoreDiff;
  return (teamsPerOwner[b] ?? 0) - (teamsPerOwner[a] ?? 0);  // tiebreak
});
```

Each entry includes:
- `rank` — 1-based position
- `totalPoints`
- `scoreDelta` — how many points behind the person above (0 for rank 1)
- `teamsRemaining` — count of non-eliminated owned teams
- `rankChange: 'UP' | 'DOWN' | 'UNCHANGED'` — compared to `store.previousRanks`

**`snapshotRanks(entries): Record<string, number>`**

Converts the leaderboard array into `{ ownerName: rank }` for storage as `previousRanks`. Called after every sync to track rank movements.

---

### 7.9 `lib/battles/types.ts` — Battle Types

```ts
type BattleStatus  = 'SCHEDULED' | 'LIVE' | 'FINISHED';
type BattleOutcome = 'HOME_WIN' | 'AWAY_WIN' | 'DRAW' | null;

interface DirectBattle {
  matchId:    string;
  homeTeam:   string;  awayTeam:  string;
  homeCrest?: string | null;  awayCrest?: string | null;
  homeOwner:  string;  awayOwner: string;
  status:     BattleStatus;
  outcome:    BattleOutcome;
  matchDate:  string;
}
```

---

### 7.10 `lib/battles/detect.ts` — Battle Detection

```ts
export function detectBattle(fixture: Fixture, ownership: OwnershipMap): DirectBattle | null
```

A battle exists when **both** home and away teams are owned AND by **different** owners:
```ts
if (!homeOwner || !awayOwner) return null;  // at least one unowned
if (homeOwner === awayOwner) return null;   // same owner — no battle
```

Returns a `DirectBattle` with `status: 'SCHEDULED'` and `outcome: null`.

---

### 7.11 `lib/battles/store.ts` — Battle Persistence

| Function | What it does |
|---|---|
| `getBattles()` | Returns all battles as `DirectBattle[]` |
| `getBattleByMatchId(matchId)` | Looks up one battle by match ID |
| `upsertBattle(battle)` | Inserts or overwrites a battle (keyed by `battle.matchId`) |

Battles are stored in `store.battles` as a `Record<string, DirectBattle>` (object, not array) so lookup by matchId is O(1).

---

### 7.12 `lib/battles/update.ts` — Battle Status Updater

```ts
export function updateBattleStatus(fixture: Fixture): void
```

Called during sync for matches that already have a battle record. Updates `status` and `outcome` based on current fixture state:

- `IN_PLAY` or `PAUSED` → `LIVE`
- `FINISHED` → `FINISHED` + resolves outcome (`HOME_WIN` / `AWAY_WIN` / `DRAW`)
- anything else → `SCHEDULED`

---

### 7.13 `lib/match-sync/index.ts` — The Sync Orchestrator

```ts
export async function runSync(): Promise<{ synced: number; error?: string }>
export async function processFixtures(fixtures: Fixture[]): Promise<void>
```

`runSync()` is the top-level function called by the admin "Sync Match Data" button. It:
1. Calls `fetchFixtures()` to get the latest data.
2. Saves the fixtures to `store.fixtures` (the cache).
3. Calls `processFixtures()`.

`processFixtures()` loops over every fixture and does:

**For every fixture (regardless of status):**
- Checks if a battle already exists for this match. If not, runs `detectBattle()` and saves it.
- If it exists, calls `updateBattleStatus()` to refresh its live status.

**For FINISHED fixtures only:**
- Runs `calculateMatchPoints()` and `calculateStageBonus()`.
- Adds points to `store.scores`.
- Detects knockouts where the loser should be marked eliminated (excluding THIRD_PLACE).
- Generates `AppNotification` entries for match results and battle outcomes.

**After all fixtures:**
- Rebuilds the leaderboard and generates rank-change notifications.
- Saves the new `previousRanks` snapshot.

The entire loop uses `try/catch` per section so one bad fixture doesn't abort the whole sync.

---

### 7.14 `lib/notifications/types.ts` — Notification Types

```ts
type NotificationType =
  | 'MATCH_WIN' | 'MATCH_DRAW' | 'MATCH_LOSS'
  | 'QUALIFICATION' | 'ELIMINATION'
  | 'BATTLE_RESULT' | 'RANK_CHANGE';

interface AppNotification {
  id: string;              // UUID
  participantName: string;
  type: NotificationType;
  message: string;
  createdAt: string;       // ISO string
  read: boolean;
}
```

---

### 7.15 `lib/notifications/generate.ts` — Notification Factories

Three generator functions — each returns `AppNotification[]`:

| Function | Triggers | Message pattern |
|---|---|---|
| `generateMatchNotifications` | Per finished match, per owned team | `"Brazil played Argentina: +3 pts"` |
| `generateBattleNotification` | When a battle has an outcome | `"Direct Battle: Brazil vs Argentina — Brazil won"` — sent to BOTH owners |
| `generateRankChangeNotifications` | After leaderboard rebuild | `"You moved up to rank #2 (45 pts)"` — only if rank actually changed |

Each notification gets a UUID via `crypto.randomUUID()` (built-in Node.js — no library needed).

---

### 7.16 `lib/notifications/store.ts` — Notification Persistence

| Function | What it does |
|---|---|
| `getNotifications(participantName?)` | Returns all, or filtered by participant |
| `addNotifications(notes[])` | Appends to `store.notifications[]` |
| `markAllRead(participantName)` | Sets `read: true` on all of a participant's notifications |

---

## 8. Components

### 8.1 `components/ThemeToggle.tsx` — Dark Mode Toggle

The **only Client Component** in the app (`'use client'`).

**Why client?** It needs `useEffect` to read `document.documentElement.classList` (only available in the browser) and `useState` to track the current theme.

**Hydration flash prevention:**
```ts
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
  setDark(document.documentElement.classList.contains('dark'));
}, []);

if (!mounted) return <div className="h-9 w-9 shrink-0" />;  // placeholder same size
```

Before `useEffect` runs (server render + first client render), a fixed-size invisible placeholder is rendered so the nav doesn't shift when the button appears.

**Toggle logic:**
```ts
const toggle = () => {
  const next = !dark;
  setDark(next);
  document.documentElement.classList.toggle('dark', next);   // Tailwind dark mode
  localStorage.setItem('theme', next ? 'dark' : 'light');   // persist for next visit
};
```

Persisted to `localStorage` so the anti-flash script in `layout.tsx` can restore it on next page load.

---

### 8.2 `components/fixtures/FixtureCard.tsx` — Fixture Display

Props: `{ fixture: Fixture, battle?: DirectBattle | null, ownership?: Record<string, string> }`

**Card appearance varies by state:**
- Battle match → amber border + gradient background
- Live match → red border + gradient background
- Regular → plain white / dark

**Status badges:**
```ts
const STATUS_BADGE = {
  IN_PLAY:  { label: '● Live', className: '... animate-pulse' },
  PAUSED:   { label: 'HT',     className: '...' },
  FINISHED: { label: 'FT',     className: '...' },
  TIMED:    { label: 'Soon',   className: '...' },
};
```
`SCHEDULED` has no badge (no entry in the map → `badge` is `undefined` → nothing rendered).

**Score display logic:**
- Finished or live AND scores non-null → shows `"3 – 1"` in large font
- Otherwise → shows `"vs"` as a placeholder

**Owner resolution:** Uses `battle?.homeOwner` first, then falls back to `ownership[teamName]`. Battle ownership takes priority.

---

### 8.3 `components/battles/BattleCard.tsx` — Battle Display

Props: `{ battle: DirectBattle }`

Renders a card with home team | ⚔ outcome | away team, plus status badge and date.

**Card style changes by battle status:**
```ts
const STATUS_STYLE = {
  LIVE:      { card: 'border-red-300 bg-...red...',  badge: 'bg-red-500',  badgeText: '● LIVE' },
  SCHEDULED: { card: 'border-blue-200 bg-...blue...', badge: 'bg-blue-500', badgeText: 'UPCOMING' },
  FINISHED:  { card: 'border-gray-200 bg-white',      badge: 'bg-gray-200', badgeText: 'FT' },
};
```

**Outcome display:** When `status === 'FINISHED' && outcome`, shows `"Home Win"` / `"Away Win"` / `"Draw"` as a pill. While in progress, shows the `⚔` sword icon.

---

### 8.4 `components/battles/BattleSection.tsx` — Battle List Wrapper

Thin wrapper: renders a section heading and either the empty message or a list of `<BattleCard>` components. Used on both the Battles page and the War Room.

---

## 9. Server Actions

**File:** [app/admin/actions.ts](../app/admin/actions.ts)

Marked `'use server'` at the top — Next.js treats these as server-side POST handlers bound to HTML forms.

### How they work

Each action receives a `FormData` object (the submitted form fields) and:
1. Parses and validates the values.
2. Calls the appropriate library function to mutate the JSON store.
3. Calls `revalidatePath()` to tell Next.js to regenerate the cached HTML for affected pages.

### The 5 actions

**`actionAddParticipant(formData)`**
```ts
const name = String(formData.get('name') ?? '').trim();
if (name) addParticipant(name);
revalidatePath('/admin');
revalidatePath('/leaderboard');
```

**`actionAssignTeam(formData)`**
```ts
const team = String(formData.get('team') ?? '').trim();
const owner = String(formData.get('owner') ?? '').trim();
if (team && owner) assignTeam(team, owner);
else if (team && !owner) unassignTeam(team);  // empty owner = unassign
revalidatePath('/admin');
revalidatePath('/draft');
revalidatePath('/battles');
```

**`actionUpdateScoringRules(formData)`**  
Reads 10 numeric fields from the form and passes them as a full `ScoringRules` object to `updateScoringRules()`.

**`actionRecalculate()`**  
Calls `recalculateAllScores()` — wipes all scores and replays every stored fixture. Revalidates `/leaderboard` and `/`.

**`actionRunSync()`**  
Calls `runSync()` — fetches latest fixtures from the API, processes matches, updates battles/scores/notifications. Revalidates fixtures, battles, leaderboard, and home page.

---

## 10. Scoring System

### How points accumulate

Points are **cumulative** — added via `addPoints()` during each sync. They are NOT recomputed on every page load (that would be a bug if sync ran multiple times). The admin "Recalculate" button resets and replays everything from `store.fixtures`.

### Full scoring table (defaults)

| Event | Points |
|---|---|
| Win | 3 |
| Draw | 1 |
| Loss | 0 |
| Clean sheet (opponent scored 0) | +1 bonus |
| Group stage qualification | 5 *(defined but not triggered in code yet)* |
| Qualifying for Round of 16 | 5 |
| Qualifying for Quarter-Finals | 8 |
| Qualifying for Semi-Finals | 10 |
| Runner-up | 10 *(in type, but FINAL winner uses `champion`)* |
| Champion | 15 |

### Stage bonuses flow

```
For each FINISHED knockout fixture:
  If home scored > away scored:
    owner of home team → gets bonus for that stage
  Else if away scored > home scored:
    owner of away team → gets bonus for that stage
  (draws in knockouts → no bonus, handled by overtime in real life)
```

---

## 11. Notifications System

### Full flow

```
Admin clicks "Sync Match Data"
    → actionRunSync()
        → runSync()
            → processFixtures()
                → for each FINISHED match:
                    calculateMatchPoints()  → generateMatchNotifications()
                    (if battle)             → generateBattleNotification()
                → after all matches:
                    buildLeaderboard()      → generateRankChangeNotifications()
                → addNotifications([...all notifications])
```

All notifications are appended in one batch at the end. They accumulate in `store.notifications[]` indefinitely (no auto-deletion).

### Notification message format

- Match: `"Japan played Croatia: +3 pts"`
- Battle: `"Direct Battle: Japan vs Croatia — Japan won"` (both owners get this)
- Rank change: `"You moved up to rank #2 (45 pts)"`
- Elimination: `"Germany has been eliminated from the tournament"`

---

## 12. Battles System

A **Direct Battle** occurs when two teams owned by **different** fantasy participants face each other in a real match.

### Battle lifecycle

```
1. DETECT  → detectBattle() finds both teams are owned by different people
              → upsertBattle() saves it as status: 'SCHEDULED'

2. LIVE    → updateBattleStatus() called during sync
              → status becomes 'LIVE' when fixture is IN_PLAY/PAUSED

3. FINISH  → updateBattleStatus() sets status: 'FINISHED' + resolves outcome
              → generateBattleNotification() sent to both owners

4. DISPLAY → BattleCard shows the outcome; FixtureCard shows "⚔ Direct Battle" badge
```

### Where battles appear

- **War Room** — `upcomingBattles` (next 3) + `recentBattles` (last 3)
- **Fixtures page** — any fixture that is a battle gets the amber "⚔ Direct Battle" badge via `battleIndex[fixture.id]`
- **Battles page** — full list, partitioned into Live / Upcoming / Completed

---

## 13. Bet Tracker

*(Full coverage in [bet-tracker-code-walkthrough.md](bet-tracker-code-walkthrough.md))*

**Key difference from the main fantasy system:**
- The bet tracker is **completely independent** of `data/draft-store.json`.
- It reads **no store** — all data comes directly from `fetchFixtures()`.
- `BET_OWNERSHIP` in `lib/bet-tracker/config.ts` is a hardcoded map of 48 teams split between Sandy and Rahul.
- `calculateBetStats()` is a pure function (fixtures in → scores out) with no side effects.

---

## 14. Theme & Dark Mode

**How dark mode works end-to-end:**

1. **First load:** `layout.tsx` inline script checks `localStorage.getItem('theme')`. If `'dark'`, adds `class="dark"` to `<html>` before anything paints.
2. **Toggle button:** `ThemeToggle.tsx` (Client Component) reads the current class and toggles it + updates `localStorage`.
3. **CSS:** Tailwind v4's `dark:` prefix variants activate when `<html class="dark">` is present.
4. **SSR safe:** `ThemeToggle` renders a placeholder `<div>` on the server (and first client render before `useEffect`) to avoid hydration mismatch.

**Why the inline script approach?** React Server Components render on the server without knowing the user's theme preference. If dark mode were applied only after hydration, there would be a visible flash from light → dark. The synchronous inline script applies the class before the browser paints anything.

---

## File Index

```
app/
├── layout.tsx               Root layout, nav, anti-flash script
├── page.tsx                 War Room (home dashboard)
├── admin/
│   ├── page.tsx             Admin panel (forms for all mutations)
│   └── actions.ts           Server Actions ('use server')
├── battles/
│   └── page.tsx             Direct Battles full list
├── bet-tracker/
│   └── page.tsx             Sandy vs Rahul bet scoreboard
├── draft/
│   └── page.tsx             Team ownership viewer
├── fixtures/
│   └── page.tsx             All fixtures grouped by stage
├── leaderboard/
│   └── page.tsx             Fantasy leaderboard + WC standings
└── notifications/
    └── page.tsx             In-app notification feed

components/
├── ThemeToggle.tsx           'use client' — dark mode toggle
├── battles/
│   ├── BattleCard.tsx        Single battle card UI
│   └── BattleSection.tsx     List wrapper (title + cards)
└── fixtures/
    └── FixtureCard.tsx       Single fixture card (with battle/live states)

lib/
├── store/
│   └── index.ts              readStore / writeStore / DraftStore type
├── football-data/
│   ├── client.ts             fetchFixtures / fetchStandings (API calls)
│   └── types.ts              Fixture, MatchStatus, StandingEntry, etc.
├── war-room/
│   └── data.ts               getWarRoomData() aggregator
├── scoring/
│   ├── types.ts              ScoringRules interface + defaults
│   ├── calculate.ts          calculateMatchPoints / calculateStageBonus
│   └── store.ts              getScores / addPoints / recalculateAllScores
├── draft/
│   └── store.ts              addParticipant / assignTeam / markEliminated
├── leaderboard/
│   └── calculate.ts          buildLeaderboard / snapshotRanks
├── battles/
│   ├── types.ts              DirectBattle, BattleStatus, BattleOutcome
│   ├── detect.ts             detectBattle()
│   ├── store.ts              getBattles / upsertBattle
│   ├── update.ts             updateBattleStatus()
│   └── detect.test.ts        Vitest unit tests for detectBattle
├── match-sync/
│   └── index.ts              runSync / processFixtures (orchestrator)
├── notifications/
│   ├── types.ts              AppNotification, NotificationType
│   ├── generate.ts           Factory functions for each notification type
│   └── store.ts              getNotifications / addNotifications / markAllRead
└── bet-tracker/
    ├── types.ts              BetStats, BetMatchRecord
    ├── config.ts             BET_OWNERSHIP, AMOUNT_PER_WIN, getBetLabel
    └── calculate.ts          calculateBetStats() — pure function

data/
└── draft-store.json          The persistent JSON store (gitignored in prod)
```
