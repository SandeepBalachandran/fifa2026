# War Room Spec

## Purpose

A single central dashboard that gives participants a live overview of the entire tournament at a glance. The War Room is the primary landing experience — it aggregates data from all other capabilities into one coherent view.

---

## Requirements

### Requirement: Current Leader Display

The War Room prominently displays who is leading the competition.

#### Scenario: Leader panel

- **WHEN** a user opens the War Room
- **THEN** the system displays the current leader's name, their total points, and their owned teams
- **AND** the leader panel updates after each scoring recalculation

---

### Requirement: Leaderboard Summary

A condensed leaderboard is embedded in the War Room for quick ranking reference.

#### Scenario: Top-N rankings visible

- **WHEN** a user views the War Room
- **THEN** the system shows at minimum the top 5 participants by score with rank, name, and total points
- **AND** a link to the full leaderboard is available

---

### Requirement: Teams Remaining Summary

The War Room shows how many teams each participant still has active in the tournament.

#### Scenario: Active teams count

- **WHEN** a user views the War Room
- **THEN** each participant entry shows their count of non-eliminated teams
- **AND** eliminated teams are visually distinct from active teams

---

### Requirement: Upcoming Matches Panel

The War Room displays the next scheduled matches, with owned teams highlighted.

#### Scenario: Next matches section

- **WHEN** a user views the War Room
- **THEN** the system lists the next N upcoming fixtures ordered by scheduled time
- **AND** any fixture involving an owned team is highlighted with the owner's name
- **AND** Direct Battle fixtures are flagged with a special badge

---

### Requirement: Recent Results Panel

The War Room displays the most recently completed match results.

#### Scenario: Recent results section

- **WHEN** a user views the War Room
- **THEN** the system displays the last N completed matches with final scores
- **AND** matches involving owned teams are highlighted

---

### Requirement: Direct Battles Section

Upcoming and recent Direct Battles are given dedicated prominence in the War Room.

#### Scenario: Direct battles panel

- **WHEN** a user views the War Room
- **THEN** the system shows any Direct Battles scheduled within the next 48 hours
- **AND** recently completed Direct Battles are shown with their outcomes

---

### Requirement: Knockout Bracket Preview

The War Room includes a simplified view of the knockout bracket showing team positions.

#### Scenario: Bracket visualization

- **WHEN** the tournament is in the knockout stage
- **THEN** the War Room displays the bracket with teams in their current positions
- **AND** owned teams are labeled with their owner's name

---

### Requirement: Tournament Insights

The War Room surfaces auto-generated insights to make the tournament more engaging.

#### Scenario: Predicted winner

- **WHEN** the system has sufficient data (e.g., after the group stage)
- **THEN** the War Room displays a predicted tournament winner based on current form/performance data from the API
- **AND** the prediction is clearly labeled as a data-derived estimate, not a guarantee
