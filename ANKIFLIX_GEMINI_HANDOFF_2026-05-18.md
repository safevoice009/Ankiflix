# Ankiflix Gemini Execution Instructions (May 18, 2026)

## 1) Environment Lock (Mandatory)
- Project: `ankiflix`
- Supabase project ref: `nkkrezwvxxosasvmvlft`
- Hosting: Vercel
- Repo/automation: GitHub Actions
- Rule: never mix any Trochlea config, ref, keys, migrations, or assumptions.

## 2) Current Verified Architecture
- Frontend: Next.js App Router
- Backend/data: Supabase (Postgres + Auth + RLS)
- Ingestion:
  - API scraping proxy: `app/api/search-proxy/route.ts`
  - GitHub scheduled scraper: `.github/workflows/scrape.yml` + `scripts/scraper.py`
- Discovery intelligence:
  - Telemetry event model: `deck_events`
  - Search behavior ranking + trending rows
  - Canonical Anki workflow (`anki_link`, `download_url`, `anki_id`)

## 3) Completed and Active Features
- Canonical Anki routing:
  - Search/deck flow resolves to AnkiWeb info/download endpoints.
- Telemetry tracking:
  - `open_ankiweb`, `download_ankiweb`, `search_open_ankiweb`
  - API endpoint: `app/api/telemetry/deck-event/route.ts`
- Search quality:
  - local/external dedupe using `anki_id` fallback title key
  - telemetry-informed behavior ranking (batched aggregation, no N+1)
- Discovery:
  - Trending Now (telemetry blend)
  - Trending This Week (strict 7-day telemetry window)
  - Top Searches chips from telemetry queries
- Modal UX:
  - related deck inline swap (no search redirect)
  - safe state reset on active deck change

## 4) Required DB + Env Contract
1. Apply SQL migration:
   - `supabase/sql/phase01_anki_id_and_events.sql`
2. Confirm Vercel env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for secure server telemetry/upserts)
3. Confirm GitHub Actions secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Confirm RLS compatibility for:
   - `favorites`
   - `user_deck_progress`
   - `leaderboard`
   - `deck_events`

## 5) Exact Gemini Runbook (Use In Order)
1. Pull latest branch and inspect diff scope.
2. Validate code quality:
   - `npm run lint`
3. Validate build:
   - `npm run build`
4. If build fails on Windows `.next` lock (`EPERM trace-build`):
   - stop running Next/dev processes
   - clear `.next` safely
   - rerun lint/build
5. Validate functional flows in preview:
   - Homepage rows: Trending Now / Trending This Week / Top Searches
   - Search: behavior ranking + dedupe + Open on AnkiWeb
   - Deck modal: inline related deck swap + Open/Download actions
   - Study/progress update flow
6. Validate ingestion:
   - Search proxy returns results and optionally upserts
   - GitHub scraper workflow syntax and secrets present
7. Document outcomes in this file before handoff.

## 6) Non-Negotiable Functional Rules
- Ankiflix is a discovery layer; AnkiWeb remains the source host/download endpoint.
- Any new deck ingestion logic must preserve:
  - `anki_id` extraction
  - canonical `anki_link`
  - inferred/known `download_url`
- Do not reintroduce title-only dedupe when `anki_id` exists.
- Do not remove telemetry fallback logic (app must still function if events table is empty/unavailable).

## 7) High-Risk Mistakes To Avoid
- Using anon client where service role is required for backend writes.
- Running per-deck telemetry count queries in loops (N+1 regressions).
- Reverting modal inline swap back to redirect flow.
- Breaking App Router server/client boundaries during refactors.
- Editing build settings to custom commands that remove required project folders.

## 8) Next Priority Work (If Continuing)
1. Add integration tests:
   - search-proxy success/failure
   - telemetry ingest endpoint
   - auth callback/signout
2. Add CI gate workflow:
   - lint
   - build
3. Add telemetry dashboard/admin surface (optional) for top decks/queries.
4. Add source confidence badges on deck detail using `last_sync_at`/`anki_id`.

## 9) Key Files
- `app/page.tsx`
- `app/search/page.tsx`
- `components/DiscoveryFeed.tsx`
- `components/DeckModal.tsx`
- `components/RelatedDecks.tsx`
- `app/api/search-proxy/route.ts`
- `app/api/telemetry/deck-event/route.ts`
- `lib/anki.ts`
- `lib/telemetry.ts`
- `lib/types.ts`
- `scripts/scraper.py`
- `.github/workflows/scrape.yml`
- `supabase/sql/phase01_anki_id_and_events.sql`
