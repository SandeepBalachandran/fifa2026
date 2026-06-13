## 1. Types and Store Foundation

- [x] 1.1 Create `lib/battles/types.ts` defining `DirectBattle` type with fields: `matchId`, `homeTeam`, `awayTeam`, `homeOwner`, `awayOwner`, `status` (`SCHEDULED | LIVE | FINISHED`), `outcome` (`null | HOME_WIN | AWAY_WIN | DRAW`), `matchDate`
- [x] 1.2 Create `lib/battles/store.ts` with functions: `getBattles()`, `getBattleByMatchId(matchId)`, `upsertBattle(battle)` — reading and writing to the draft store's `battles` map

## 2. Battle Detection Logic

- [x] 2.1 Create `lib/battles/detect.ts` with `detectBattle(fixture, ownership)` — returns a `DirectBattle | null` by cross-referencing both team IDs in the fixture against the ownership map
- [x] 2.2 Create `lib/battles/update.ts` with `updateBattleStatus(fixture)` — updates an existing battle record's `status` and `outcome` based on current fixture status and score; handles `IN_PLAY`, `PAUSED`, and `FINISHED` transitions
- [x] 2.3 Add unit tests for `detectBattle` covering: both teams owned (→ battle), one team unowned (→ null), neither team owned (→ null)

## 3. Match-Sync Pipeline Integration

- [x] 3.1 In the match-sync module (after fixture import/update), call `detectBattle` for each processed fixture and `upsertBattle` for any detected battles — wrap in try/catch so errors are logged and do not interrupt sync
- [x] 3.2 After status updates in sync, call `updateBattleStatus` for existing battles whose match status has changed

## 4. Battles Page

- [x] 4.1 Create `app/battles/page.tsx` as a server component that calls `getBattles()` and partitions results into `live`, `upcoming`, and `completed` arrays sorted chronologically
- [x] 4.2 Create `components/battles/BattleCard.tsx` displaying team names, owner names, match date/time, and (if finished) the scoreline and outcome label
- [x] 4.3 Create `components/battles/BattleSection.tsx` rendering a titled section of `BattleCard` components with an empty state when the array is empty
- [x] 4.4 Wire `BattleSection` into `app/battles/page.tsx` for all three groups (Live, Upcoming, Completed)

## 5. Fixture List Integration

- [x] 5.1 In the fixtures list component, join each fixture against `getBattles()` to determine if it is a Direct Battle
- [x] 5.2 Add a "Direct Battle" badge and owner name display to the fixture card when the match is flagged as a battle

## 6. War Room Integration

- [x] 6.1 In the war-room data aggregator (`lib/war-room/`), call `getBattles()` and filter to upcoming battles (next 3) and recent battles (last 3 completed) to populate the war-room's direct battles section

## 7. Navigation

- [x] 7.1 Add a "Battles" link to the main navigation pointing to `/battles`
