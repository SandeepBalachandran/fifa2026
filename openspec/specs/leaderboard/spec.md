# Leaderboard Spec

## Purpose

Display an accurate, real-time ranking of all participants by total score. The leaderboard surfaces score differences, teams-remaining counts, and is the primary competitive reference throughout the tournament.

---

## Requirements

### Requirement: Overall Rankings

All participants are ranked in descending order of total score. The leaderboard is always current with the latest imported match results.

#### Scenario: View leaderboard

- **WHEN** a user opens the leaderboard
- **THEN** the system displays all participants ordered by total points (highest first)
- **AND** each row shows: rank, participant name, total points, score difference to the participant above, and number of teams still active

#### Scenario: Tie-breaking

- **WHEN** two participants have identical total points
- **THEN** they share the same rank
- **AND** the tie is broken by the number of teams still active (more teams remaining = higher tiebreak position)

---

### Requirement: Score Difference Display

The leaderboard shows the points gap between consecutive participants to make the competition stakes immediately legible.

#### Scenario: Score delta between adjacent ranks

- **WHEN** a user views the leaderboard
- **THEN** each entry below rank 1 shows the points difference to the participant directly above them
- **AND** the first-place entry shows the gap to second place

---

### Requirement: Teams Remaining Count

Each participant row shows how many of their drafted teams are still active in the tournament (not yet eliminated).

#### Scenario: Teams remaining reflects eliminations

- **WHEN** a team is eliminated from the tournament
- **THEN** the owner's teams-remaining count decreases by one on the leaderboard
- **AND** this update is reflected immediately after the result import

---

### Requirement: Historical Performance Visibility

The leaderboard provides enough context to understand how standings have changed over the course of the tournament.

#### Scenario: Rank change indicator

- **WHEN** a participant's rank changes after a result import
- **THEN** the leaderboard displays a rank-change indicator (up/down/unchanged) relative to their previous position
