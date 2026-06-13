## Temporary Feature: World Cup Betting Tracker (Sandy vs Rahul)

### Purpose

This is a temporary feature created only for the duration of the FIFA World Cup.

The feature allows two users:

* Sandy
* Rahul

to compete based on the performance of assigned World Cup teams.

After the World Cup ends, this entire feature can be removed without affecting any existing application functionality.

---

# Feature Isolation

* Create a completely separate menu entry:

  * **World Cup Bet Tracker**
* Existing application features must remain unchanged.
* No modifications to current workflows.
* All code should be isolated to simplify future removal.

---

# Team Assignment

## Fixed Assignments

### Sandy

* Netherlands

### Rahul

* Argentina

These assignments are mandatory.

---

# Remaining Team Distribution

There are 48 World Cup teams.

After assigning:

* Netherlands → Sandy
* Argentina → Rahul

Distribute the remaining 46 teams as evenly as possible:

* Sandy = 24 teams total
* Rahul = 24 teams total

### Distribution Goal

The list should be balanced based on overall team strength.

Avoid assigning all strong teams to one person.

The intent is:

* Comparable probability of winning
* Fair betting experience
* Similar number of strong, medium, and weak teams on each side

---

# Hardcoded Team Ownership

Store ownership mapping in a hardcoded configuration.

Example:

```ts
{
  "Argentina": "Rahul",
  "Netherlands": "Sandy",
  ...
}
```

This mapping remains fixed until the end of the World Cup.

No editing UI required.

---

# Betting Rules

Whenever a match is played:

### Scenario A

Team owned by Rahul wins.

Actions:

* Rahul wins +1
* Rahul amount += ₹30

### Scenario B

Team owned by Sandy wins.

Actions:

* Sandy wins +1
* Sandy amount += ₹30

### Scenario C

Draw

Actions:

* No updates
* No money transfer

---

# Statistics To Track

For each participant maintain:

```ts
{
  wins: number,
  amount: number
}
```

Example:

```ts
Sandy:
  wins: 8
  amount: 240

Rahul:
  wins: 10
  amount: 300
```

Amount formula:

```text
amount = wins × 30
```

---

# Ownership Display

Whenever a country name appears in the application, ownership should be visible.

Examples:

```text
Argentina (R)
Netherlands (S)
```

Apply this consistently in:

* Fixtures
* Match details
* Standings
* Group tables
* Knockout brackets
* Team lists
* Search results
* Any screen displaying country names

---

# Standings Enhancement

Add ownership identifier beside every team.

Example:

| Team        
| ----------
| Argentina ( R)  
| Netherlands (S)


The owner should be visible without opening team details.

---

# Fixture Balancing Requirement

When generating or selecting matchups for this feature:

Prefer:

```text
Rahul Team vs Sandy Team
```

Avoid:

```text
Rahul Team vs Rahul Team
Sandy Team vs Sandy Team
```

Reason:

Cross-owner matches create direct competition and are more interesting for betting.

This is a preference, not a strict rule.

If tournament constraints prevent it, use normal fixtures.

---

# Knockout Stage Handling

Group stage can use the original ownership mapping.

After group stage completion:

* Review qualified teams.
* Create a new temporary ownership mapping if necessary.
* Rebalance remaining teams for knockout rounds.
* This can be done manually.

No automatic redistribution required initially.

---

# Dashboard

Create a dedicated page:

## World Cup Bet Tracker

Display:

### Summary

```text
Sandy
Wins: X
Amount: ₹Y

Rahul
Wins: X
Amount: ₹Y
```

---

### Team Ownership

Display all assigned teams grouped by owner.

Example:

Sandy

* Netherlands
* Japan
* USA

Rahul

* Argentina
* Brazil
* Portugal

---

### Match History

Track:

```text
Date
Match
Winner
Owner
Amount Awarded
```

Example:

12 Jun 2026
Argentina vs Canada
Winner: Argentina
Owner: Rahul
+₹30

```

---

# Removal Plan

After the World Cup:

1. Remove menu entry.
2. Remove ownership configuration.
3. Remove betting dashboard.
4. Remove win tracking.
5. Remove ownership labels.
6. Remove hardcoded mappings.

No impact should occur to existing application features.

---

# Technical Notes

- Temporary feature only.
- Keep implementation isolated.
- Prefer feature flag if available.
- Hardcoded ownership mapping is acceptable.
- No admin UI required.
- No persistence editing required.
- Designed for easy deletion after the tournament.
```
# Team list
United States
Mexico
South Korea
Canada
Bosnia-Herzegovina
Qatar
Switzerland
Brazil
Morocco
Haiti
Scotland
Australia
Turkey
Germany
Curaçao
Netherlands
Japan
Ivory Coast
Ecuador
Sweden
Tunisia
Spain
Cape Verde Islands
Belgium
Egypt
Saudi Arabia
Uruguay
Iran
New Zealand
France
Senegal
Iraq
Norway
Argentina
Algeria
Austria
Jordan
Portugal
Congo DR
England
Croatia
Ghana
Panama
Uzbekistan
Colombia
Czechia
South Africa
Paraguay