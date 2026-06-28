# Task: Integrate API-FOOTBALL for Player Photos Only (Keep football-data.org as Primary Provider)

You are a senior full-stack engineer working on an existing football application.

## Objective

The application currently uses **football-data.org** as its primary data source.

**Do NOT replace, remove, or migrate away from football-data.org.**

The existing integration works correctly and must remain unchanged.

The only missing feature is **player profile images**.

To solve this, integrate **API-FOOTBALL** as a **secondary provider exclusively for player photos**.

---

# Existing Football Data Provider

Base URL:

```
https://api.football-data.org/v4
```

Authentication:

```
X-Auth-Token
```

Current endpoints used by the application:

- GET /competitions
- GET /competitions/{code}
- GET /competitions/{code}/matches
- GET /competitions/{code}/standings
- GET /competitions/{code}/scorers
- GET /teams/{id}
- GET /teams/{id}/matches
- GET /matches/{id}
- GET /matches/{id}/head2head
- GET /persons/{id}

These endpoints and their implementations must remain exactly as they are.

Do not replace any of them with API-FOOTBALL equivalents.

---

# New Provider

API-FOOTBALL

Base URL

```
https://v3.football.api-sports.io
```

Authentication Header

```
x-apisports-key: YOUR_API_KEY
```

This provider should only be used to retrieve player profile photos.

No fixtures, standings, competitions, teams, or match data should come from API-FOOTBALL.

---

# Functional Requirements

Whenever the frontend needs to display a player's image:

1. Load the player using the existing football-data.org APIs.
2. Check whether a cached photo already exists.
3. If a cached photo exists:
   - Return it immediately.
4. Otherwise:
   - Search API-FOOTBALL for the player.
   - Find the correct player.
   - Retrieve the player's photo URL.
   - Cache the result.
   - Return the photo URL.

The application should never repeatedly search API-FOOTBALL for the same player.

---

# Player Matching Strategy

Since football-data.org IDs and API-FOOTBALL IDs are different, implement intelligent matching.

Match using the following priority:

1. Player Name
2. Team Name
3. Competition
4. Season
5. Nationality (if available)

If multiple players are returned:

Choose the player whose team matches.

If multiple still exist:

Choose the one playing in the same competition.

If ambiguity still exists:

Choose the one with matching nationality.

If no confident match exists:

Return null.

Never guess randomly.

---

# API-FOOTBALL Search

Use the appropriate player search endpoint.

Example:

GET /players?search=Messi

Extract:

```
response[0].player.id
response[0].player.photo
```

The returned photo URL should already be usable.

Example:

```
https://media.api-sports.io/football/players/276.png
```

---

# Local Cache

Create a cache table.

Example schema:

```
player_photo_cache

id
football_data_person_id
api_football_player_id
player_name
team_name
photo_url
last_verified
created_at
updated_at
```

Requirements:

football_data_person_id must be unique.

If a cache entry exists:

Never call API-FOOTBALL again.

Always return the cached URL.

---

# Backend Service

Create a dedicated service.

Example:

PlayerPhotoService

Responsibilities:

```
getPlayerPhoto(footballDataPersonId)
```

Flow:

```
Load football-data player

↓

Check cache

↓

Cache exists?

↓

Yes

↓

Return cached URL

↓

No

↓

Search API-FOOTBALL

↓

Match player

↓

Save cache

↓

Return photo URL
```

---

# API Client

Create a dedicated API-FOOTBALL client.

Responsibilities:

- Authentication
- Request handling
- Error handling
- Retry logic
- Rate limiting
- Timeout handling

Keep this client completely isolated from football-data.org.

---

# Caching Strategy

Always check cache first.

Never call API-FOOTBALL during every page load.

If a player cannot be matched:

Cache the failed lookup for 24 hours to prevent repeated unnecessary requests.

After 24 hours the lookup may be retried.

---

# Error Handling

If API-FOOTBALL is unavailable:

Do not break the application.

Return:

```
null
```

or

```
default-player-avatar.png
```

The UI must continue functioning.

---

# UI Changes

Replace placeholder avatars wherever player information is displayed.

Examples include:

- Top Scorers
- Player Profile
- Team Squad
- Match Details
- Lineups
- Team Details
- Any player cards

Render:

```
photo_url ?? defaultAvatar
```

instead of a placeholder image.

---

# Performance Requirements

The application should never make dozens of API-FOOTBALL requests while rendering a page.

Implement:

- Local caching
- Lazy loading
- Background synchronization where appropriate
- Efficient request deduplication

Only one lookup should ever occur per player.

---

# Environment Variables

Add:

```
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

API_FOOTBALL_KEY=YOUR_API_KEY
```

---

# Code Organization

Keep API-FOOTBALL completely isolated.

Suggested structure:

```
services/
    footballData/
        FootballDataClient.ts

    apiFootball/
        ApiFootballClient.ts
        PlayerMatcher.ts
        PlayerPhotoService.ts
        CacheRepository.ts

database/
    player_photo_cache

models/
    PlayerPhotoCache

controllers/

routes/
```

No existing football-data.org code should be modified except where PlayerPhotoService is called to retrieve a player's image.

---

# Logging

Log:

- Successful cache hits
- Successful API lookups
- Failed matches
- API failures
- Cache writes

Avoid excessive logging.

---

# Testing

Add unit tests for:

- Cache hit
- Cache miss
- Successful player match
- Multiple player results
- Failed player lookup
- API failure
- Retry logic

---

# Final Deliverables

Implement the following:

✅ API-FOOTBALL client

✅ PlayerPhotoService

✅ Player matching algorithm

✅ Cache table/model

✅ Cache repository

✅ Environment configuration

✅ API integration

✅ Error handling

✅ Logging

✅ Unit tests

✅ UI integration

The final implementation must satisfy these constraints:

- football-data.org remains the single source of truth for all football data.
- API-FOOTBALL is used exclusively for player profile photos.
- Photo URLs are cached after the first successful lookup.
- No repeated API-FOOTBALL requests occur for the same player.
- Existing functionality must continue working without modification.
- The implementation should be production-ready, clean, modular, and maintainable.