## Why

The `direct-battles` capability has a fully written spec (`openspec/specs/direct-battles/spec.md`) but no implementation. Head-to-head matchups between owned teams are the most dramatic moments in the competition and need to be detected, surfaced, and recorded before the tournament begins.

## What Changes

- New `lib/battles/` module implementing battle detection, storage, and outcome recording
- New `/battles` route (`app/battles/`) displaying the full battle history and upcoming battles
- Battle detection wired into the match-sync pipeline (runs after each fixture import/update)
- War Room integration: existing `direct-battles` section in war-room reads from the battles module
- Fixture list integration: battle-flagged matches are visually distinguished on `/fixtures`

## Capabilities

### New Capabilities

_(none — `direct-battles` spec already exists at `openspec/specs/direct-battles/spec.md`)_

### Modified Capabilities

_(none — requirements in the existing spec are unchanged; this change is a pure implementation)_

## Impact

- **New files**: `lib/battles/`, `app/battles/page.tsx`, battle-related UI components
- **Modified files**: match-sync pipeline (to call battles detection), war-room data aggregator, fixtures list component
- **API**: Football Data API fixture data (already consumed by match-tracking) is the source; no new endpoints needed
- **Data**: New persistent store entries for detected battles and recorded outcomes (draft store)
