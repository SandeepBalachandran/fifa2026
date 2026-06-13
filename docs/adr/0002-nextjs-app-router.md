# ADR-0002: Next.js 16 App Router with React Server Components

**Status:** Accepted  
**Date:** 2026-06-13

---

## Context

The application needs to serve data-heavy pages (leaderboard, fixtures, war room) efficiently. Most data is read-heavy (participants view current standings) with infrequent writes (result imports, draft assignments). The tech stack must be maintainable by a small team and deployable on standard Node.js hosting.

## Decision

Use **Next.js 16 with the App Router** and **React Server Components (RSC)** as the primary rendering model.

Specific conventions:
- Pages and layout components are Server Components by default — they fetch data at render time with no client JS bundle
- Client Components (`'use client'`) are used only for interactive elements (e.g., polling, interactive bracket, notification drawer)
- Data mutations use **Server Actions** (no separate REST API layer for internal operations)
- API Routes (`app/api/`) are reserved for: scheduled sync job endpoints, webhook receivers

## Consequences

**Positive:**
- Data-heavy pages render fast — HTML is generated server-side with fresh data, no client waterfall
- Simplified data fetching — server components call `lib/` modules directly, no fetch layer for internal data
- Tailwind CSS v4 integrates well with the App Router's CSS module system

**Negative / Risks:**
- Server Components have restrictions: no hooks, no browser APIs — requires careful boundary placement
- Real-time features (live score updates during a match) require either polling or a separate approach; the v1 approach is server-side polling via page refresh or timed revalidation

**Conventions established:**
- All `app/` directories use Server Components unless the file has `'use client'` at the top
- Data fetching happens in page/layout server components or in `lib/` modules called from them
- Never call Football Data API directly from a client component
