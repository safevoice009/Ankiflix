# GEMINI FULL CATALOG AUTONOMOUS WORKFLOW (ANKIFLIX)

## Mission
Make Ankiflix behave like Anki Shared Library search at scale:
1. Broad query recall (any relevant term should return useful results).
2. Strong ranking quality (best decks rise first).
3. Continuous catalog growth from AnkiWeb.
4. Reliable destination routing to AnkiWeb for final open/download.
5. Zero-regression execution with strict validation gates.

---

## Project Lock (Do Not Violate)
- Repo: `ankiflix`
- Supabase project ref: `nkkrezwvxxosasvmvlft`
- Hosting: Vercel
- Automation: GitHub Actions
- Never mix Trochlea settings, refs, tables, or keys.

---

## Current Architecture (Gemini Must Respect)
- Search ingestion/runtime:
  - `app/api/search-proxy/route.ts`
- Telemetry endpoint:
  - `app/api/telemetry/deck-event/route.ts`
- Discovery/ranking:
  - `app/page.tsx`
  - `app/search/page.tsx`
  - `components/DiscoveryFeed.tsx`
- Deck UX:
  - `components/DeckModal.tsx`
  - `components/RelatedDecks.tsx`
- Canonical helpers/types:
  - `lib/anki.ts`
  - `lib/telemetry.ts`
  - `lib/types.ts`
- Scheduled scraping:
  - `.github/workflows/scrape.yml`
  - `scripts/scraper.py`
- DB migration:
  - `supabase/sql/phase01_anki_id_and_events.sql`

---

## Mandatory Environment and DB Contract
Gemini must verify these before shipping any feature work:

### Vercel env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Action secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase schema
- `decks.anki_id` exists and is used for identity.
- `deck_events` exists with event types:
  - `open_ankiweb`
  - `download_ankiweb`
  - `search_open_ankiweb`
- RLS allows intended inserts/reads for current app behavior.

---

## Autonomous Execution Pipeline (Strict Sequence)

## Phase 0: Safety + Baseline
1. Pull latest code.
2. Run:
```bash
npm run lint
npm run build
```
3. If Windows `.next` lock (`EPERM trace-build`):
   - stop running dev/build processes
   - clear lock / restart shell
   - rerun lint/build
4. Do not proceed if lint/build fails.

## Phase 1: Full-Catalog Coverage Engine
1. Ensure scraper strategy covers:
   - category term
   - exam aliases/prefixes
   - common topic synonyms
2. Every ingested record must include:
   - `anki_id` (if derivable)
   - canonical `anki_link` (`/shared/info/{id}`)
   - `download_url` (`/shared/download/{id}` where possible)
3. Upsert policy:
   - dedupe by `anki_id` first
   - title fallback only if id unavailable

## Phase 2: Search Behavior (Anki-like)
1. Local search scope must include:
   - title
   - description
   - category name
   - tags
2. If local recall is weak:
   - call search proxy (live AnkiWeb pull)
3. Merge policy:
   - dedupe by `anki_id`
   - fallback dedupe by normalized title
4. Return mixed high-quality set:
   - local + external discoveries

## Phase 3: Ranking Intelligence
1. Base relevance:
   - deck rating/quality
   - total cards signal
2. Behavior relevance:
   - telemetry events (`open_ankiweb`, `download_ankiweb`)
3. Recency relevance:
   - 7-day engagement boost
4. If telemetry missing:
   - safe fallback to non-telemetry ranking

## Phase 4: Discovery Rows
1. Maintain and verify:
   - Trending Now
   - Trending This Week (7-day)
   - Top Searches chips
2. Ensure row click flow stays modal-first and smooth.

## Phase 5: Destination Integrity
1. CTA routing priority:
   - `download_url` -> `anki_link` -> AnkiWeb search fallback
2. Always track telemetry before opening external target.
3. External open must use safe tab flags.

## Phase 6: Post-Change Validation Gate
Gemini must execute and record:
1. `npm run lint` pass
2. `npm run build` pass
3. Functional checks:
   - broad query recall
   - dedupe correctness
   - external merge reliability
   - modal inline related swap
   - open/download destination correctness
   - telemetry event writes

No feature is complete until all checks pass or fallback behavior is verified.

---

## Hard Failure Handling Rules
1. If Supabase telemetry table unavailable:
   - keep app fully functional with fallback ranking.
2. If search proxy external fetch fails:
   - return local results gracefully.
3. If service role key missing:
   - disable privileged write paths safely and log clearly.
4. Never break local discovery because external systems fail.

---

## Anti-Regression Guardrails
Gemini must not:
1. Reintroduce N+1 telemetry queries.
2. Replace `anki_id` identity logic with title-only logic.
3. Revert modal related-deck inline swap back to redirect.
4. Remove fallback behavior for missing telemetry/migrations.
5. Change build commands to destructive/custom overrides.

---

## Required Run Output Format (Every Gemini Run)
Gemini must output:
1. Changes made (files + behavior impact).
2. Validation results (lint/build/functional).
3. External dependency status (Vercel/Supabase/GitHub checks).
4. Remaining risks.
5. Next queued step.

---

## Upgrade Backlog (Continue Automatically)
1. `search_synonyms` table + query expansion.
2. Zero-result query logging + weekly auto-fix list.
3. Hot query cache for faster perceived search.
4. Admin observability view:
   - scraper freshness
   - top failed queries
   - top converting decks
5. CI workflow (`lint + build + smoke route checks`).

---

## Quick Command Block
```bash
npm run lint
npm run build
```

If both pass, proceed to deployment validation.
