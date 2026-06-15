# Bet Tracker — Code Walkthrough

A detailed reference for how the Bet Tracker feature is written, structured, and connected.
Use this when revisiting the code to understand the "why" behind each piece.

---

## 1. What is the Bet Tracker?

Sandy and Rahul each own a set of World Cup 2026 teams (like a fantasy draft).
Whenever a finished match has at least one team belonging to either player, the owner of the winning team earns ₹30.
This module fetches live fixture data, runs the scoring logic, and renders a scoreboard + match history page.

---

## 2. File Map

```
lib/bet-tracker/
├── types.ts       ← TypeScript interfaces (the "shape" of data)
├── config.ts      ← Who owns which teams, and constants
└── calculate.ts   ← Pure function: fixtures → scores + history

app/bet-tracker/
└── page.tsx       ← Next.js Server Component: fetches + renders everything
```

---

## 3. `lib/bet-tracker/types.ts` — The Data Shapes

This file only exports two interfaces. It has no logic — it's purely the vocabulary for the rest of the module.

```ts
export interface BetStats {
  wins: number;
  amount: number;
}
```

**`BetStats`** — the running total for one player.

| Field    | Type     | Meaning                                      |
|----------|----------|----------------------------------------------|
| `wins`   | `number` | How many matches that player's team won      |
| `amount` | `number` | Total money earned (`wins × AMOUNT_PER_WIN`) |

This is the "scoreboard" object. One for Sandy, one for Rahul.

---

```ts
export interface BetMatchRecord {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  winner: string | null;
  winnerOwner: 'Sandy' | 'Rahul' | null;
  amount: number;
  nobet: boolean;
}
```

**`BetMatchRecord`** — one row in the match history table. One record per finished match that involves at least one owned team.

| Field         | Type                          | Meaning                                                                 |
|---------------|-------------------------------|-------------------------------------------------------------------------|
| `matchId`     | `string`                      | The fixture ID from the Football Data API (used as React key)           |
| `date`        | `string`                      | ISO 8601 UTC date string e.g. `"2026-06-15T18:00:00Z"`                  |
| `homeTeam`    | `string`                      | Home team name as returned by the API                                   |
| `awayTeam`    | `string`                      | Away team name as returned by the API                                   |
| `homeCrest`   | `string \| null`              | URL to the home team's crest image (null if API didn't provide one)     |
| `awayCrest`   | `string \| null`              | URL to the away team's crest image                                      |
| `winner`      | `string \| null`              | Name of the winning team, or `null` if the match ended in a draw        |
| `winnerOwner` | `'Sandy' \| 'Rahul' \| null`  | Whose team won; `null` on a draw or if it's a `nobet` match             |
| `amount`      | `number`                      | ₹ earned in this match (equals `AMOUNT_PER_WIN` if someone won, else 0) |
| `nobet`       | `boolean`                     | `true` when BOTH teams belong to the same owner — no money changes hands|

**Key design detail on `nobet`:** The `winner` field is still set even when `nobet` is true (we still know who won the match), but `winnerOwner` is forced to `null` and no wins are counted. This keeps the history row informative without affecting the scoreboard.

---

## 4. `lib/bet-tracker/config.ts` — Ownership & Constants

### `AMOUNT_PER_WIN`

```ts
export const AMOUNT_PER_WIN = 30;
```

A single source of truth for the stake per win (₹30). Used in `calculate.ts` and displayed in `page.tsx`.

### `BetParticipant`

```ts
export type BetParticipant = 'Sandy' | 'Rahul';
```

A union type used as the value type in `BET_OWNERSHIP`. Keeps the set of valid participants to exactly two names.

### `BET_OWNERSHIP`

```ts
export const BET_OWNERSHIP: Record<string, BetParticipant> = { ... }
```

A lookup map: `teamName → 'Sandy' | 'Rahul'`. This is the core configuration — if a team isn't in this map, it's treated as unowned and ignored.

**Important:** Team names here must **exactly** match what the Football Data API returns. The comments in the file flag cases where the API may use a different spelling (e.g., `"Korea Republic"` vs `"South Korea"`).

### `SANDY_TEAMS` / `RAHUL_TEAMS`

```ts
export const SANDY_TEAMS = Object.entries(BET_OWNERSHIP)
  .filter(([, v]) => v === 'Sandy')
  .map(([k]) => k)
  .sort();
```

Derived arrays built at module load time from `BET_OWNERSHIP`. They are pre-sorted alphabetically and used directly in `page.tsx` to render the Team Ownership section. No separate list to maintain — the single `BET_OWNERSHIP` map is the source of truth.

### `getBetLabel(teamName)`

```ts
export function getBetLabel(teamName: string): '(S)' | '(R)' | '' {
```

A utility that converts a team name to a short display label. Returns `'(S)'`, `'(R)'`, or `''` for unowned teams. Used in places that need an inline badge next to a team name.

---

## 5. `lib/bet-tracker/calculate.ts` — The Core Logic

### Return type: `BetResult`

```ts
export interface BetResult {
  sandy: BetStats;
  rahul: BetStats;
  history: BetMatchRecord[];
  teamCrests: Record<string, string | null>;
}
```

`teamCrests` is a bonus map built during iteration: `teamName → crestUrl`. It is passed to the UI so crest images can be looked up for the Team Ownership section (the config doesn't store URLs, only names).

### `calculateBetStats(fixtures: Fixture[]): BetResult`

This is a single pure function — no side effects, no API calls. It takes the raw fixture list and returns everything the UI needs.

**Step-by-step walkthrough of the loop:**

```ts
for (const f of fixtures) {
```

**Step 1 — Collect crests**
```ts
if (f.homeTeam.crest) teamCrests[f.homeTeam.name] = f.homeTeam.crest;
if (f.awayTeam.crest) teamCrests[f.awayTeam.name] = f.awayTeam.crest;
```
Every fixture is scanned regardless of status. This builds the crest map for all teams, not just finished ones.

**Step 2 — Skip non-finished matches**
```ts
if (f.status !== 'FINISHED') continue;
const { home, away } = f.score.fullTime;
if (home === null || away === null) continue;
```
Only `FINISHED` matches with a real score are counted.

**Step 3 — Skip unowned matches**
```ts
const homeOwner = BET_OWNERSHIP[f.homeTeam.name] ?? null;
const awayOwner = BET_OWNERSHIP[f.awayTeam.name] ?? null;
if (!homeOwner && !awayOwner) continue;
```
If neither team is in `BET_OWNERSHIP`, the match is irrelevant to the bet and is skipped entirely (not even added to history).

**Step 4 — Detect `nobet`**
```ts
const nobet = homeOwner !== null && homeOwner === awayOwner;
```
If both teams belong to the same owner, it's a `nobet` match.

**Step 5 — Determine winner**
```ts
if (home > away) {
  winner = f.homeTeam.name;
  winnerOwner = nobet ? null : homeOwner;
} else if (away > home) {
  winner = f.awayTeam.name;
  winnerOwner = nobet ? null : awayOwner;
}
```
Draws leave `winner` and `winnerOwner` as `null`. On a `nobet` match, `winnerOwner` is forced to `null` even though `winner` is set.

**Step 6 — Tally wins**
```ts
if (!nobet) {
  if (winnerOwner === 'Sandy') sandyWins++;
  else if (winnerOwner === 'Rahul') rahulWins++;
}
```
Only increments when there is a real owner win (not a `nobet`, not a draw).

**Step 7 — Push to history**
```ts
history.push({
  matchId: f.id,
  ...
  amount: winnerOwner ? AMOUNT_PER_WIN : 0,
  nobet,
});
```
Every match that involves at least one owned team is recorded (including `nobet` matches and draws), but amount is 0 unless a real win occurred.

**Final sort:** History is sorted newest-first using ISO string comparison:
```ts
history: history.sort((a, b) => b.date.localeCompare(a.date)),
```

---

## 6. `app/bet-tracker/page.tsx` — The UI Layer

This is a **Next.js App Router Server Component** (no `'use client'`). Data fetching happens directly in the component at request time.

### Data flow

```
fetchFixtures()          ← calls Football Data API (server-side)
    ↓
calculateBetStats()      ← pure function, no I/O
    ↓
{ sandy, rahul, history, teamCrests }
    ↓
Rendered as JSX
```

Error handling is minimal: `fetchFixtures().catch(() => [])` — if the API fails, the page renders with empty data rather than crashing.

### Sub-components

| Component     | Props                                      | Purpose                                                         |
|---------------|--------------------------------------------|-----------------------------------------------------------------|
| `Crest`       | `src`, `name`, `size`                      | Renders a team crest image, or a grey placeholder box if no URL |
| `ScoreCard`   | `name`, `wins`, `amount`, `isLeading`, `accent` | The big card for one player showing win count and total money  |
| `TeamList`    | `teams`, `crests`, `label`                 | Renders a bulleted list of team names with crests               |
| `HistoryRow`  | `record: BetMatchRecord`                   | One `<tr>` in the match history table                           |

### `HistoryRow` rendering logic

Each `BetMatchRecord` is rendered in a table row. The conditional logic in the Amount column mirrors the `nobet` flag:

- `nobet === true` → shows `"no bet"` badge (grey pill)
- `winnerOwner` is set → shows the owner name in their colour (green for Sandy, blue for Rahul)
- Draw → shows `—`
- `amount > 0` → shows `+₹{amount}` in amber

### Colour scheme

| Player | Colour   | Tailwind classes                           |
|--------|----------|--------------------------------------------|
| Sandy  | Green    | `emerald-500/600/700`, `text-emerald-400`  |
| Rahul  | Blue     | `blue-500/600/700`, `text-blue-400/indigo` |

---

## 7. Data Flow Diagram

```
Football Data API
        │
        ▼
fetchFixtures()  →  Fixture[]
        │
        ▼
calculateBetStats(fixtures)
        │
        ├── teamCrests  →  TeamList (crest images in ownership grid)
        ├── sandy       →  ScoreCard (Sandy's wins + amount)
        ├── rahul       →  ScoreCard (Rahul's wins + amount)
        └── history     →  HistoryRow × N (match table, newest first)
```

---

## 8. Key Design Decisions

| Decision | Reason |
|---|---|
| `nobet` is stored on the record, not filtered out | So the history table can still show those matches with a "same owner" label — informative without polluting the score |
| Team names as string keys in `BET_OWNERSHIP` | Simpler than an enum; must match API output exactly (see comments in config.ts) |
| `SANDY_TEAMS` / `RAHUL_TEAMS` derived, not hardcoded | Single source of truth — edit one map, both lists stay in sync automatically |
| Crest URLs stored in `teamCrests`, not in config | Config only has names; URLs come from the live API, so they're collected during iteration |
| Server Component, no `'use client'` | Data is fetched once per request on the server; no client-side state or hydration needed |
| `calculateBetStats` is a pure function | Easy to test in isolation; all side effects (API call) stay in the page component |
