# Notifications Spec

## Purpose

Automatically generate in-application notifications when significant tournament events occur. Notifications keep participants informed of their own team outcomes and leaderboard changes without requiring them to manually check results.

Notifications are generated server-side as a side-effect of result imports and scoring recalculations.

---

## Requirements

### Requirement: Match Victory Notification

When an owned team wins a match, its owner receives a notification.

#### Scenario: Owned team wins

- **WHEN** a match result is imported and an owned team is the winner
- **THEN** a notification is generated for that team's owner
- **AND** the notification includes the team name, opponent, score, and points earned

---

### Requirement: Qualification Achievement Notification

When an owned team advances to a new tournament stage, the owner is notified.

#### Scenario: Team qualifies to next round

- **WHEN** a team is confirmed as advancing to the next knockout stage
- **THEN** a notification is generated for the owner
- **AND** the notification specifies the stage reached and the qualification bonus points awarded

---

### Requirement: Elimination Notification

When an owned team is eliminated from the tournament, the owner receives a notification.

#### Scenario: Owned team eliminated

- **WHEN** a team loses a knockout match and is marked eliminated
- **THEN** a notification is generated for the owner
- **AND** the notification includes the team name, the match they lost, and their final accumulated points

---

### Requirement: Leaderboard Change Notification

When a participant's rank changes, they are notified.

#### Scenario: Participant moves up in rank

- **WHEN** a scoring recalculation results in a participant's rank improving
- **THEN** a notification is generated informing them of their new rank and the points gained

#### Scenario: Participant is overtaken

- **WHEN** a scoring recalculation results in a participant dropping in rank
- **THEN** a notification is generated informing them of their new rank and who overtook them

---

### Requirement: Direct Battle Outcome Notification

When a Direct Battle concludes, both involved owners receive a notification.

#### Scenario: Direct battle result notification

- **WHEN** a Direct Battle match result is imported
- **THEN** both owners receive a notification summarizing the head-to-head outcome
- **AND** the notification includes team names, owners, final score, and battle result (win/draw/loss from each owner's perspective)
