## ADDED Requirements

### Requirement: Battle Store Persistence

The system SHALL persist detected battles in the draft store so that outcomes can be recorded after matches finish.

#### Scenario: Battle is stored on detection

- **WHEN** a fixture is processed by the sync pipeline and both teams are owned by different participants
- **THEN** a battle record is written to the draft store containing the match ID, home team, away team, home owner, away owner, and status `SCHEDULED`

#### Scenario: Battle status updates when match goes live

- **WHEN** a synced fixture transitions to `IN_PLAY` or `PAUSED` status
- **AND** that fixture is flagged as a Direct Battle
- **THEN** the stored battle record's status is updated to `LIVE`

#### Scenario: Battle outcome recorded on completion

- **WHEN** a synced fixture transitions to `FINISHED`
- **AND** that fixture is flagged as a Direct Battle
- **THEN** the stored battle record's status is updated to `FINISHED`
- **AND** the outcome field is set to `HOME_WIN`, `AWAY_WIN`, or `DRAW` based on the match result

### Requirement: Battle Detection Error Isolation

The system SHALL isolate battle detection failures so they do not interrupt the match-sync pipeline.

#### Scenario: Detection error does not break sync

- **WHEN** an error occurs during battle detection for a fixture
- **THEN** the error is logged
- **AND** the sync pipeline continues processing remaining fixtures

### Requirement: Direct Battles Page

The system SHALL provide a `/battles` route that lists all detected direct battles for the competition.

#### Scenario: Battles grouped by status

- **WHEN** a user navigates to `/battles`
- **THEN** battles are shown in three sections: Live, Upcoming, and Completed
- **AND** each section is ordered chronologically

#### Scenario: Battle card content

- **WHEN** a direct battle card is displayed
- **THEN** it shows both teams' names, both owners' names, the match date/time, and (if finished) the result and outcome

#### Scenario: Empty state when no battles exist

- **WHEN** no direct battles have been detected
- **THEN** the page displays an appropriate empty state message

### Requirement: Fixture List Battle Indicator

The system SHALL visually distinguish battle-flagged fixtures from regular fixtures in the fixture list.

#### Scenario: Battle badge on fixture card

- **WHEN** a fixture is rendered in the fixture list and is flagged as a Direct Battle
- **THEN** the fixture card displays a "Direct Battle" badge or indicator
- **AND** both owners' names are shown alongside the team names
