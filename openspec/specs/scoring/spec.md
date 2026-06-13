# Scoring Spec

## Purpose

Automatically calculate and maintain each participant's score based on real World Cup results. Points are awarded for match wins, draws, and stage qualification bonuses. All scoring is triggered by match result imports — no manual entry is required.

---

## Requirements

### Requirement: Result-Based Point Calculation

Points are awarded to a team's owner whenever that team achieves a scored outcome (win, draw, or goal-related bonus as configured by the admin).

#### Scenario: Team wins a match

- **WHEN** a match result is imported and one of the teams is marked as the winner
- **THEN** the winning team's owner receives the configured win points
- **AND** the losing team's owner receives the configured loss points (may be zero)

#### Scenario: Match ends in a draw

- **WHEN** a group-stage match result is imported as a draw
- **THEN** both teams' owners each receive the configured draw points

#### Scenario: Configurable scoring rules

- **WHEN** an admin configures scoring weights (win points, draw points, clean sheet bonus, etc.)
- **THEN** all future and recalculated scores use the updated configuration
- **AND** historical scores are recalculated if the admin explicitly triggers a recalculation

---

### Requirement: Qualification Bonuses

Additional points are awarded when a team progresses to a new tournament stage.

#### Scenario: Team qualifies from group stage

- **WHEN** a team's group-stage results confirm qualification for the round of 16
- **THEN** the team's owner receives the configured group-stage qualification bonus

#### Scenario: Team advances through knockout rounds

- **WHEN** a team wins a knockout match and advances to the next round (R16 → QF → SF → Final → Winner)
- **THEN** the team's owner receives the configured bonus for that round advancement

---

### Requirement: Automatic Leaderboard Recalculation

After any score change, participant totals and rankings are recalculated without manual intervention.

#### Scenario: Score updates propagate to leaderboard

- **WHEN** one or more participants' scores change due to a result import
- **THEN** the leaderboard is recalculated immediately
- **AND** the updated rankings are available to all users without a page reload trigger

---

### Requirement: Elimination Handling

When a team is eliminated, no further points accrue for that team's owner from that team.

#### Scenario: Eliminated team plays no further matches

- **WHEN** a team is marked as eliminated
- **THEN** the scoring engine ignores any subsequent fixtures involving that team
- **AND** the team's owner's total is frozen at the points accrued up to elimination
