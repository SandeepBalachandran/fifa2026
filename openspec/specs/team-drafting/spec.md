# Team Drafting Spec

## Purpose

Manage the assignment of national teams to participants before the tournament begins. Each team has exactly one owner; ownership is locked once the tournament starts. Administrators can configure draft settings and override the lock when necessary.

---

## Requirements

### Requirement: Team Ownership Assignment

Each of the 32 World Cup national teams must be assignable to exactly one participant. A participant may own multiple teams; no team may have more than one owner.

#### Scenario: Assign a team to a participant

- **WHEN** an admin assigns a national team to a participant
- **THEN** that participant becomes the sole owner of the team
- **AND** the team is no longer available for assignment to others

#### Scenario: Prevent duplicate ownership

- **WHEN** an admin attempts to assign a team that already has an owner
- **THEN** the system rejects the assignment
- **AND** displays which participant currently owns that team

---

### Requirement: Draft Lock

Once the tournament begins, team ownership is frozen. No reassignments are permitted during the tournament unless an admin explicitly overrides the lock.

#### Scenario: Lock activates at tournament start

- **WHEN** the tournament start date/time is reached
- **THEN** the draft is automatically locked
- **AND** no further team assignments or changes are accepted from non-admin users

#### Scenario: Admin override of draft lock

- **WHEN** an admin explicitly overrides the draft lock
- **THEN** the system allows a one-time reassignment for the specified team
- **AND** the override is recorded with a timestamp and the admin's identity
- **AND** the lock is reinstated after the reassignment

---

### Requirement: Ownership Validation

The system must always be able to report the current owner of any team and detect unowned teams.

#### Scenario: Query team ownership

- **WHEN** any user views the team list or a match involving a specific team
- **THEN** the system displays the owner's name alongside the team name
- **AND** unowned teams are clearly marked as unassigned

#### Scenario: Detect unowned teams

- **WHEN** the draft period closes
- **THEN** the system surfaces a list of all teams that have no owner assigned
- **AND** alerts the admin to resolve unassigned teams before the tournament lock

---

### Requirement: Admin Draft Configuration

Administrators can configure draft settings including participant list, assignment method (manual admin assignment vs. participant self-draft), and draft open/close windows.

#### Scenario: Configure draft window

- **WHEN** an admin sets the draft open and close dates
- **THEN** team assignments are only accepted within that window
- **AND** the system rejects assignment attempts outside the configured window
