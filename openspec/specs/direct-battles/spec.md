# Direct Battles Spec

## Purpose

Detect and surface matchups where both competing national teams in a single fixture are owned by different participants. These head-to-head moments are the most dramatic events in the competition and receive special prominence throughout the application.

---

## Requirements

### Requirement: Direct Battle Detection

A direct battle exists when both teams in a scheduled or live match are owned by different participants.

#### Scenario: Detect a direct battle at fixture import

- **WHEN** a fixture is imported or updated and both teams have owners
- **THEN** the system automatically flags the match as a Direct Battle
- **AND** the battle is associated with both owners' names and team names

#### Scenario: No battle when a team is unowned

- **WHEN** a fixture contains at least one unowned team
- **THEN** the match is not flagged as a Direct Battle

---

### Requirement: Direct Battle Visibility

Direct battles appear throughout the application wherever matches are listed or referenced.

#### Scenario: Direct battle in fixture list

- **WHEN** a user views the fixtures list
- **THEN** matches flagged as Direct Battles are visually distinguished from regular matches
- **AND** each Direct Battle card shows both owners' names alongside their team names

#### Scenario: Direct battle in the War Room

- **WHEN** a user views the War Room dashboard
- **THEN** upcoming and recent Direct Battles are surfaced in a dedicated section

---

### Requirement: Direct Battle Outcome Recording

After a Direct Battle concludes, the outcome is recorded and the winner is identifiable.

#### Scenario: Battle resolved after result import

- **WHEN** a Direct Battle match transitions to "FINISHED"
- **THEN** the system records the battle outcome (which owner's team won, or if it was a draw)
- **AND** the result is displayed in the Direct Battle history section

#### Scenario: Draw outcome in a Direct Battle

- **WHEN** a Direct Battle match ends in a draw
- **THEN** the battle is recorded as a draw
- **AND** both owners are shown as equal in the battle summary
