# Match Tracking Spec

## Purpose

Consume live World Cup match data from the Football Data API and expose it throughout the application. No match data is hardcoded; every fixture, result, and competition status is sourced from the API.

API reference: Football Data API — competitions, matches, standings endpoints.

---

## Requirements

### Requirement: Live Fixture Synchronization

The system fetches and stores the full list of World Cup fixtures from the Football Data API. Fixtures are refreshed automatically on a schedule.

#### Scenario: Initial fixture load

- **WHEN** the application initializes for a new tournament
- **THEN** the system fetches all scheduled matches from the API
- **AND** stores fixture metadata (teams, date/time, stage, group) locally
- **AND** no fixture data is hardcoded in the application

#### Scenario: Scheduled refresh

- **WHEN** the periodic sync job runs
- **THEN** the system re-fetches match data for any match that is live or recently completed
- **AND** updates stored results without requiring manual intervention

---

### Requirement: Match Result Import

Completed match results are imported automatically from the Football Data API and made available to the scoring and notification subsystems.

#### Scenario: Result becomes available

- **WHEN** a match transitions to "FINISHED" status in the API
- **THEN** the system imports the final score and match outcome
- **AND** triggers the scoring recalculation for affected team owners
- **AND** triggers notification generation for relevant events

#### Scenario: Result correction

- **WHEN** the API updates a previously imported result (e.g., correction or VAR reversal)
- **THEN** the system re-imports the corrected result
- **AND** recalculates scores and leaderboard positions accordingly

---

### Requirement: Competition Progress Tracking

The system tracks each team's progression through the tournament stages (group stage, round of 16, quarter-finals, semi-finals, final).

#### Scenario: Team advances to next stage

- **WHEN** a team qualifies for the next knockout round
- **THEN** the system records the team's advancement
- **AND** this qualification triggers the scoring bonus for the team's owner
- **AND** the team appears in the correct knockout bracket slot

#### Scenario: Team is eliminated

- **WHEN** a team loses a knockout match and is eliminated
- **THEN** the system marks the team as eliminated
- **AND** the team's owner receives no further points from that team
- **AND** the elimination triggers a notification for the affected owner

---

### Requirement: Match Detail Availability

Individual match details — including teams, score, stage, and time — are accessible throughout the application for display in fixtures lists, the war room, and match cards.

#### Scenario: Display upcoming match

- **WHEN** a user views the fixtures section
- **THEN** the system displays all upcoming matches with their scheduled date/time and stage
- **AND** owned teams within each match are highlighted with their owner's name
