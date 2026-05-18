# Ankiflix Upgrades & Updates Tracker

## Current Check (Now)
- Lint status: pass (`npm run lint`).
- Working tree has unstaged changes in:
  - `app/decks/[id]/page.tsx`
  - `app/search/page.tsx`
  - `app/study/[id]/page.tsx`
  - `components/Navbar.tsx`
  - `components/DeckModal.tsx`

## Priority Order (Execution Sequence)

### P0 - Stabilize and Validate
- [x] 1. Review the 4 modified files and confirm intended behavior.
- [x] 2. Run full build validation (`npm run build`).
- [x] 3. Verify key runtime paths manually:
  - [x] deck detail open/download routing
  - [x] search ranking and merge behavior
  - [x] study flow progress update
  - [x] navbar search dropdown behavior

### P1 - Full Catalog Search Quality
- [x] 1. Expand query matching:
  - [x] include tags/aliases consistently in search layers.
- [x] 2. Ensure external AnkiWeb merge is resilient:
  - [x] local-only fallback on proxy failure.
- [x] 3. Keep dedupe strict:
  - [x] `anki_id` first, title fallback only.

### P1 - Ranking Intelligence
- [x] 1. Keep batched telemetry aggregation (avoid N+1).
- [x] 2. Tune blended rank weights:
  - [x] quality score
  - [x] card volume
  - [x] engagement
  - [x] 7-day recency.
- [x] 3. Add small caps to prevent outlier domination.

### P2 - Discovery UX Upgrades
- [x] 1. Improve top-search chips:
  - [x] normalize display labels
  - [x] hide noisy low-signal queries.
- [x] 2. Add confidence labels on deck detail:
  - [x] source confidence
  - [x] last sync freshness.
- [x] 3. Keep related-deck inline modal swap smooth.

### P2 - Automation & Operations
- [x] 1. Confirm GitHub scraper workflow runs clean.
- [x] 2. Confirm Vercel env and Supabase migration contract.
- [x] 3. Add CI workflow for:
  - [x] lint
  - [x] build
  - [x] optional smoke check.

## Required Verification Gate Before Any “Done” Claim
- [x] 1. `npm run lint` passes.
- [x] 2. `npm run build` passes.
- [x] 3. Manual flow checks pass:
  - [x] search broad terms
  - [x] Anki open/download redirects
  - [x] telemetry events
  - [x] trending rows.

## Notes for Gemini
- Follow `GEMINI_FULL_CATALOG_AUTOMATION_WORKFLOW.md` exactly.
- Do not skip fallback behavior.
- Do not change project context or secrets scope.
