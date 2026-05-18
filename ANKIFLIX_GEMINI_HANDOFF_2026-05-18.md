# Ankiflix Gemini Handoff (May 18, 2026)

## 1) Project Context Lock
- This repo is isolated to Ankiflix Supabase project: `nkkrezwvxxosasvmvlft`.
- Do not reuse Trochlea refs, keys, schemas, or deployment assumptions.
- Ankiflix is running on Supabase free tier.

## 2) Completed Work (High Priority)
- React/render stability and major lint/runtime blockers fixed.
- Search proxy upgraded for canonical Anki links + inferred direct download URLs.
- Telemetry foundation added:
  - `deck_events` model migration
  - telemetry API endpoint
  - client tracking helper
- Search UX upgraded:
  - direct Open on AnkiWeb
  - local/external dedupe by `anki_id` (fallback title key)
  - behavior ranking based on telemetry
- Search ranking optimized:
  - removed N+1 event queries
  - batched telemetry aggregation per result set
- Deck modal UX upgraded:
  - inline related deck swap (no redirect)
  - safe modal state resets on deck change
- Homepage discovery upgraded:
  - telemetry-informed Trending Now
  - Trending This Week (strict 7-day engagement)
  - Top Searches chips from telemetry query events
- GitHub scraper workflow upgraded:
  - modern action versions + Python 3.11 + pip upgrade
- Scraper output improved:
  - canonical links + `download_url` + real ISO timestamps
- Lint now passes clean locally.

## 3) Critical Open Risk
1. Windows `.next` file lock can block `next build` (`EPERM` on `trace-build`) until running processes release handles.

## 4) Priority Roadmap

### Phase 0 - Build Reliability (P0)
1. Stop any running Next dev/build processes.
2. Release `.next` file locks and clean build artifacts.
3. Re-run `npm run lint` and `npm run build`.
4. Capture green baseline and deployment validation notes.

### Phase 1 - Supabase Data Contract Hardening (P0)
1. Apply and verify SQL migration:
   - `supabase/sql/phase01_anki_id_and_events.sql`
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel for server telemetry/secure upserts.
3. Confirm RLS policies for core tables/views (`favorites`, `user_deck_progress`, `leaderboard`, `deck_events`).

### Phase 2 - Core UX Correctness (P1)
1. ✅ DeckModal related deck navigation is now inline swap.
2. Keep profile/search/study states deterministic for invalid IDs/slugs.
3. Preserve canonical Anki flow: discovery in Ankiflix, final open/download on AnkiWeb.

### Phase 3 - Netflix-grade Discovery Experience (P1)
1. Search:
   - ✅ local/external dedupe by stable IDs
   - ✅ telemetry-informed behavior ranking
2. Discovery:
   - ✅ Trending Now with telemetry blend
   - ✅ Trending This Week
   - ✅ Top Searches chips
3. Deck detail:
   - Continue improving trust signals (last sync/source confidence/card quality).

### Phase 4 - Performance + Accessibility (P2)
1. Continue moving remaining heavy visuals to optimized patterns where needed.
2. Re-check bundle/hydration hotspots after telemetry features.

### Phase 5 - Quality Gates (P2)
1. Add integration tests for:
   - search proxy success/failure
   - telemetry event ingest
   - auth callback/signout
2. CI gates: lint + build (+ optional typecheck).

## 5) Key Files Added/Updated
- `app/api/search-proxy/route.ts`
- `app/api/telemetry/deck-event/route.ts`
- `app/page.tsx`
- `app/search/page.tsx`
- `components/DeckModal.tsx`
- `components/DiscoveryFeed.tsx`
- `components/RelatedDecks.tsx`
- `lib/anki.ts`
- `lib/telemetry.ts`
- `lib/types.ts`
- `scripts/scraper.py`
- `.github/workflows/scrape.yml`
- `supabase/sql/phase01_anki_id_and_events.sql`

## 6) Immediate Command Sequence
1. Resolve `.next` lock (if present).
2. `npm run lint`
3. `npm run build`
4. Deploy preview, validate:
   - Home + discovery rows
   - Search ranking + Top Searches chips
   - Deck modal inline related swap
   - AnkiWeb open/download redirects
