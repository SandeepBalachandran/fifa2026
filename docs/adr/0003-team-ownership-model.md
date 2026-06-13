# ADR-0003: Team-Based Ownership Model (Not Player-Based)

**Status:** Accepted  
**Date:** 2026-06-13

---

## Context

Fantasy football products typically use a player-based model (participants pick individual players and score based on individual player performance). This project has a different goal: a tournament-companion experience designed for casual fans that remains engaging for the full 4-week tournament duration.

Options considered:
1. **Team ownership** — each of the 32 national teams is owned by one participant; points based on team outcomes (wins, advancement, goals conceded)
2. **Player ownership** — participants pick players from any team; points based on individual player stats
3. **Match prediction** — participants predict match outcomes; points for correct predictions

## Decision

Use **team-based ownership**: each national team is assigned to exactly one participant. Points are awarded based on team-level outcomes only (match results, stage advancement).

## Consequences

**Positive:**
- Simple mental model — participants follow "their" teams just as any football fan would
- Requires no player-level data from the API — team and match data is sufficient
- Scales naturally with the World Cup format (32 teams, natural eliminations)
- Remains engaging throughout because teams survive for multiple rounds

**Negative:**
- Less granularity than player-based fantasy — no way to reward individual performance (goals scored, clean sheets at a player level)
- With 32 teams and many participants, some teams will be unowned — intentionally acceptable in v1

**Constraints established:**
- Scoring rules operate on match outcomes and stage advancement only
- No player-level data is fetched from the Football Data API
- The draft is a one-time event per tournament (not a weekly lineup decision)
- Future enhancement: configurable bonus points for goals scored by owned team (still team-level, not player-level)
