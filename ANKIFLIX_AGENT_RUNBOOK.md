# ANKIFLIX AGENT RUNBOOK v2.0
> Complete build, upgrade, and maintenance instructions for any AI agent working on the Ankiflix platform.
> Read EVERY section before executing. Do NOT skip sections. Do NOT hallucinate APIs.

---

## 0. WHAT IS ANKIFLIX?
Ankiflix is a **Netflix-style web platform** for discovering, browsing, and downloading Anki flashcard decks. Think "Netflix UI for Anki shared decks". Users can:
- Browse curated decks by category (Medical, Law, Languages, Coding, etc.)
- Search decks in real-time
- Click a deck to see a modal with details
- Click Download → go to AnkiWeb or direct `.apkg` file
- (Future) Sign in, save favorites, rate decks

---

## 1. TECH STACK (DO NOT CHANGE)
- **Framework**: Next.js 16+ (App Router) — read `node_modules/next/dist/docs/` before using any Next.js API
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Database**: Supabase (PostgreSQL) — project ID: `ncaalhdosocuutbjcjtd`
- **Hosting**: Vercel — project: `ankiflix` under `apexs-projects-3d0f841e`
- **Repo**: `https://github.com/safevoice009/Ankiflix`
- **Font**: Inter (Google Fonts, already configured)
- **Color**: Primary = `#E50914` (Netflix red), Background = `#141414`, Card = `#181818`

---

## 2. ENVIRONMENT & CREDENTIALS
File: `c:\Users\unbou\ankiflix\.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://ncaalhdosocuutbjcjtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYWFsaGRvc29jdXV0YmpjanRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDUxODcsImV4cCI6MjA5MzcyMTE4N30.8r8Y5BfAy8YEqHmCDnuS-dCUdWxM_HXR1ML5IVDk_Yo
```

**Supabase MCP Server**: Already configured. Project ref = `ncaalhdosocuutbjcjtd`
**Vercel**: Logged in via Chrome browser (use browser_subagent to interact)
**GitHub**: `safevoice009/Ankiflix` — push via `git push origin main`

### Vercel Environment Variables (must exist in dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Vercel Build Settings (do NOT override):
- Framework Preset: **Next.js**
- Build Command: **next build** (default, no override)
- Root Directory: **(empty = project root)**
- `tsconfig.json` must have `"exclude": ["node_modules", "supabase"]`

---

## 3. DATABASE SCHEMA

### Table: `categories`
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `decks`
```sql
CREATE TABLE decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  anki_link TEXT,           -- Direct AnkiWeb URL e.g. https://ankiweb.net/shared/info/12345
  download_url TEXT,        -- Direct .apkg download link if available
  category_id UUID REFERENCES categories(id),
  ranking NUMERIC DEFAULT 0, -- 0 to 5 scale
  total_cards INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `profiles` (add when auth is implemented)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `favorites` (add when auth is implemented)
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deck_id)
);
```

### RLS Policies
```sql
-- Public read for decks and categories
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read decks" ON decks FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Favorites: only owner can read/write
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON favorites USING (auth.uid() = user_id);
```

---

## 4. CURRENT FILE STRUCTURE
```
ankiflix/
├── app/
│   ├── layout.tsx          # Root layout with Navbar + Footer
│   ├── page.tsx            # Homepage (Hero + DiscoveryFeed)
│   ├── globals.css         # Design system CSS
│   └── search/
│       └── page.tsx        # Search results page
├── components/
│   ├── Navbar.tsx          # Fixed navbar with search
│   ├── Footer.tsx          # Site footer
│   ├── DiscoveryFeed.tsx   # Main deck browsing grid
│   ├── DeckRow.tsx         # Horizontal scrolling row
│   ├── DeckModal.tsx       # Deck detail popup
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   └── supabase.ts         # Supabase client
├── public/
│   └── hero-bg.png         # Hero background image
├── scripts/
│   └── scraper.py          # Python AnkiWeb scraper
├── supabase/
│   └── functions/
│       └── scrape-decks/
│           └── index.ts    # Deno edge function
├── .github/
│   └── workflows/
│       └── scrape.yml      # Daily scraper automation
└── tsconfig.json           # MUST exclude "supabase" folder
```

---

## 5. KNOWN BUGS & FIXES ALREADY APPLIED
1. ✅ `DialogTitle` missing in DeckModal → Fixed with `sr-only` DialogHeader
2. ✅ Supabase folder causing TypeScript errors on Vercel → Fixed with `"exclude": ["supabase"]` in tsconfig
3. ✅ Hero text invisible on mobile → Fixed with `justify-end pb-20` on mobile, `justify-center` on md+
4. ✅ Vercel 403/404 on production → Was caused by custom build override `rm -rf supabase && npm run build`. Removed override. Standard Next.js build now works.
5. ✅ Git push rejected → Fixed with `git pull --rebase origin main` before pushing

---

## 6. PRIORITY UPGRADE ROADMAP

### PHASE A — UX OVERHAUL (Do First, Most Impactful)

#### A1. Replace hero background with a real animated gradient + particles
- Remove dependency on `/hero-bg.png` (it may not exist or look bad)
- Use a CSS animated gradient: deep dark blues/purples with a red accent shimmer
- Add floating card particles using pure CSS `@keyframes`
- Hero must look CINEMATIC on first load

#### A2. Redesign Deck Cards (Most visible problem)
Current cards are basic `div` with background-image. Replace with:
```tsx
// Each card should have:
// - Aspect ratio 16:9 thumbnail (with fallback gradient if no image)
// - Category badge (top-left)
// - Card count badge (top-right)
// - On hover: scale 1.05, show overlay with title + Download button
// - Smooth shadow transition
```
Use Unsplash category-specific images as fallback per category:
- Medical: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400`
- Law: `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400`
- Languages: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`
- Coding: `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400`
- History: `https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=400`
- Science: `https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400`
- Math: `https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400`
- Default: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400`

#### A3. Make Download Button Actually Work
In `DeckModal.tsx`, the Download button currently does nothing. Fix:
```tsx
// If deck.download_url exists: window.open(deck.download_url, '_blank')
// Else if deck.anki_link exists: window.open(deck.anki_link, '_blank')  
// Else: window.open(`https://ankiweb.net/shared/decks?search=${encodeURIComponent(deck.title)}`, '_blank')
```

#### A4. Add Category Browse Pages
Create `app/categories/[slug]/page.tsx`:
- Fetches all decks for that category from Supabase
- Shows a grid of deck cards (not horizontal scroll, full grid)
- Has a hero banner with category name and count

#### A5. Add Individual Deck Pages
Create `app/decks/[id]/page.tsx`:
- Full page view (not modal) for SEO and sharing
- Shows full description, all tags, download stats
- "Download Now" button → direct link to AnkiWeb

#### A6. Navbar Mobile Menu
Current navbar hides all links on mobile. Add a hamburger menu:
- Use `Sheet` from shadcn/ui
- Show Home, Decks, Categories, New & Popular links
- Keep search icon visible always

---

### PHASE B — DATA & CONTENT

#### B1. Seed More Decks (Run this SQL in Supabase)
```sql
-- First ensure categories exist
INSERT INTO categories (name, slug, description) VALUES
  ('Medical', 'medical', 'USMLE, MBBS, NEET PG, Anatomy, Pharmacology'),
  ('Law', 'law', 'Bar Exam, Constitutional Law, Criminal Law'),
  ('Languages', 'languages', 'Spanish, French, Japanese, Mandarin, German'),
  ('Coding', 'coding', 'Python, JavaScript, Data Structures, Algorithms'),
  ('History', 'history', 'World History, US History, Ancient Civilizations'),
  ('Science', 'science', 'Physics, Chemistry, Biology, Earth Science'),
  ('Mathematics', 'mathematics', 'Calculus, Linear Algebra, Statistics'),
  ('Competitive Exams', 'competitive', 'GRE, GMAT, SAT, IELTS, TOEFL')
ON CONFLICT (slug) DO NOTHING;
```

#### B2. Improve Scraper (`scripts/scraper.py`)
AnkiWeb URL pattern for shared decks:
- List: `https://ankiweb.net/shared/decks?search=TERM`
- Info page: `https://ankiweb.net/shared/info/DECK_ID`
- Download: `https://ankiweb.net/shared/download/DECK_ID` (POST request needed)

The scraper should:
1. Search AnkiWeb for each category keyword
2. Parse title, card count, rating, description from info page
3. Use Unsplash category fallback for thumbnail
4. Upsert into `decks` table via Supabase Python SDK
5. Run daily via GitHub Actions (`.github/workflows/scrape.yml`)

#### B3. Add AnkiWeb Direct Links
Every deck must have `anki_link` = `https://ankiweb.net/shared/info/{ankiweb_id}`.
The download button opens this link. AnkiWeb handles the actual download.
Do NOT try to proxy or re-host `.apkg` files. Just redirect users.

---

### PHASE C — AUTHENTICATION (Supabase Auth)

#### C1. Setup Auth
```tsx
// lib/supabase-server.ts — for server components
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

#### C2. Add Login/Signup Pages
- `app/auth/login/page.tsx` — Email + Password + Google OAuth
- `app/auth/callback/route.ts` — Supabase auth callback handler
- Use `@supabase/ssr` package (install: `npm install @supabase/ssr`)

#### C3. User Profile & Favorites
- Add "Add to List" (favorites) button in DeckModal — requires auth
- `app/profile/page.tsx` — shows user's saved decks
- If not logged in, show sign-in prompt when clicking Add to List

---

### PHASE D — SEARCH IMPROVEMENTS

#### D1. Real-time Search with Debounce
Current search requires pressing Enter. Improve:
- Add 300ms debounce
- Show results dropdown below search bar as user types
- Show top 5 results in dropdown, "See all" link

#### D2. Full-Text Search
Enable Postgres full-text search:
```sql
ALTER TABLE decks ADD COLUMN search_vector TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;
CREATE INDEX decks_search_idx ON decks USING GIN(search_vector);
```
Query:
```sql
SELECT * FROM decks WHERE search_vector @@ plainto_tsquery('english', $1);
```

#### D3. Filter & Sort on Search Page
Add filter controls:
- Sort by: Most Popular, Newest, Highest Rated
- Filter by: Category
- Filter by: Card count range

---

### PHASE E — PERFORMANCE & POLISH

#### E1. Image Optimization
- All deck thumbnails should use `next/image` with `width={400} height={225}` (16:9)
- Add `placeholder="blur"` with a dark blurDataURL
- Add `loading="lazy"` for cards below the fold

#### E2. Loading Skeletons
Create `components/DeckRowSkeleton.tsx`:
- Show 6 skeleton cards while data loads
- Use `animate-pulse` with dark gray cards

#### E3. Error Boundary
Create `app/error.tsx`:
```tsx
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <button onClick={reset} className="mt-4 px-6 py-2 bg-primary text-white rounded">Try Again</button>
      </div>
    </div>
  )
}
```

#### E4. Not Found Page
Create `app/not-found.tsx` with a Netflix-style "404 - Page Not Found" page.

---

## 7. DESIGN SYSTEM RULES (NEVER BREAK THESE)

```
Background:  #141414 (always dark)
Card bg:     #181818
Primary:     #E50914 (Netflix red)
Text:        #FFFFFF primary, #808080 muted
Green:       #46D369 (match score)
Font:        Inter (Google Fonts)
Border:      rgba(255,255,255,0.1)
```

### Animation Rules:
- Card hover: `scale(1.05)` + `translateY(-8px)`, duration 200ms ease-out
- Modal open: slide up + fade in
- Page transitions: fade in 300ms
- Navbar: transitions from transparent to solid `#141414` on scroll

### Layout Rules:
- Max content width: `1400px` centered
- Horizontal padding: `px-4 md:px-12`
- Row gap between deck rows: `space-y-12`
- Cards per row: 2 mobile, 3 tablet, 5 desktop (min-w approach)

---

## 8. AGENT WORKFLOW — HOW TO EXECUTE CHANGES

### Step 1: Always Read First
Before modifying any file, read it with `view_file`. Never assume content.

### Step 2: Check Git Status
```bash
git status
git pull --rebase origin main  # Always do this before committing
```

### Step 3: Make Changes Locally
Use `write_to_file` or `replace_file_content` or `multi_replace_file_content`.

### Step 4: Test Locally
```bash
npm run dev  # Start dev server at localhost:3000
```
Use `browser_subagent` to visit `http://localhost:3000` and verify the change visually.

### Step 5: Commit and Push
```bash
git add .
git commit -m "feat/fix/chore: Description of change"
git push origin main
```

### Step 6: Verify Vercel Deployment
- Vercel auto-deploys on push to `main`
- Use `browser_subagent` to check `https://ankiflix-brown.vercel.app`
- If build fails, check Vercel dashboard → Deployments → Logs

### Step 7: Debug Build Failures
Common Vercel build errors and fixes:
| Error | Fix |
|-------|-----|
| TypeScript error in supabase/ folder | Ensure `"exclude": ["supabase"]` in tsconfig.json |
| Module not found | Run `npm install PACKAGE` locally and commit package.json |
| Environment variable undefined | Add var in Vercel Settings → Environment Variables |
| 404 on production | Check framework preset = Next.js, no root directory override |

---

## 9. SUPABASE MCP USAGE

The Supabase MCP server is configured. Use these tools:
- `mcp_supabase-mcp-server_execute_sql` — Run SELECT queries for debugging
- `mcp_supabase-mcp-server_apply_migration` — Run DDL (CREATE TABLE, ALTER, etc.)
- `mcp_supabase-mcp-server_get_logs` — Debug edge function logs
- `mcp_supabase-mcp-server_get_advisors` — Check security/performance issues

**Project ID**: `ncaalhdosocuutbjcjtd`

---

## 10. RECOMMENDED OPEN-SOURCE TOOLS TO INTEGRATE

| Tool | Purpose | Install |
|------|---------|---------|
| `@supabase/ssr` | Proper server-side auth for Next.js | `npm install @supabase/ssr` |
| `swr` | Client-side data fetching with cache | `npm install swr` |
| `react-intersection-observer` | Infinite scroll / lazy loading | `npm install react-intersection-observer` |
| `date-fns` | Format dates on deck cards | `npm install date-fns` |
| `react-hot-toast` | Beautiful toast notifications | `npm install react-hot-toast` |
| `zod` | Schema validation for forms | `npm install zod` |

**DO NOT** install:
- `neon` or any other database (Supabase only)
- `prisma` (use Supabase JS directly)
- `next-auth` (use Supabase Auth)
- Any additional CSS framework (Tailwind only)

---

## 11. CONTENT SEEDING — ANKIWEB DECK IDS

Use these confirmed AnkiWeb deck IDs to seed initial content:

```
Medical:
- 1297714478  (Anking Step 1 - USMLE)
- 2090532287  (Anking Step 2)
- 1539005337  (Physiology)
- 484863061   (Anatomy Gray's)

Languages:
- 647902872   (Spanish 5000 words)
- 1988145294  (Japanese Core 2000)
- 1559127499  (French A1-B2)
- 3463967560  (German Basic)

Law:
- 2109509414  (Bar Exam MBE)
- 2098271182  (Constitutional Law)

Coding:
- 1103600453  (Python Fundamentals)
- 998424038   (JavaScript ES6+)
- 1953461684  (Data Structures & Algorithms)
```

AnkiWeb info URL: `https://ankiweb.net/shared/info/{ID}`
AnkiWeb download: Direct link `https://ankiweb.net/shared/download/{ID}` (requires user session)
→ **Best practice**: Link users to the info page, let AnkiWeb handle download.

---

## 12. CRITICAL RULES FOR AGENT

1. **NEVER** use `rm -rf` as a build command in Vercel. This broke the site before.
2. **NEVER** commit `.env.local` — it's in `.gitignore`.
3. **ALWAYS** run `git pull --rebase origin main` before `git push`.
4. **ALWAYS** add `DialogTitle` when using Radix `DialogContent` (accessibility requirement).
5. **ALWAYS** exclude `supabase/` from tsconfig.json (Deno code breaks Node.js TypeScript).
6. **NEVER** use `process.env` in Client Components — use `NEXT_PUBLIC_` prefixed vars only.
7. **ALWAYS** test on `localhost:3000` before pushing to production.
8. When using `next/image` with external URLs, add domains to `next.config.ts`:
```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.ankiweb.net' },
    ],
  },
}
```
9. The site MUST stay in **dark mode always** — `className="dark"` on `<html>` tag.
10. All pages need `export const metadata` for SEO — title, description, keywords.

---

## 13. DEPLOYMENT CHECKLIST (Run Before Every Deploy)

- [ ] `npm run build` succeeds locally with zero errors
- [ ] `localhost:3000` hero section visible and responsive
- [ ] Deck cards render with thumbnails
- [ ] Search returns results
- [ ] Download button links to AnkiWeb
- [ ] Deck modal opens with correct data
- [ ] Mobile layout (375px) looks good
- [ ] No console errors in browser
- [ ] `git push origin main` pushed successfully
- [ ] Vercel deployment shows "Ready" (not "Error")
- [ ] Production URL `https://ankiflix-brown.vercel.app` loads correctly

---

## 14. VISION STATEMENT (Keep This In Mind Always)

Ankiflix is NOT just a list of links. It is a **premium discovery experience**.

When a student opens Ankiflix, they should feel like they opened Netflix — cinematic, beautiful, fast, and immediately useful. They should be able to find the best Anki deck for their exam in under 10 seconds, click Download, and get it from AnkiWeb instantly.

Every design decision must serve this goal:
- **Cinematic** = dark background, rich gradients, smooth animations
- **Curated** = ranked decks, quality thumbnails, clear metadata
- **Fast** = server-side rendering, lazy loading, minimal JavaScript
- **Trustworthy** = verified deck sources (AnkiWeb only), honest card counts

The primary user is a **medical student** preparing for USMLE/NEET PG. Secondary users are law students, language learners, and coders. Design for the medical student first.
