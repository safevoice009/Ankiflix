# ANKIFLIX AGENT RUNBOOK v2.1 (SRS UPDATE)
> Complete build, upgrade, and maintenance instructions for any AI agent working on the Ankiflix platform.
> Read EVERY section before executing. Do NOT skip sections. Do NOT hallucinate APIs.

---

## 0. WHAT IS ANKIFLIX?
Ankiflix is a **Netflix-style personalized learning platform** for discovering and mastering Anki flashcard decks. Unlike a generic directory, it uses Spaced Repetition (SRS) to drive the discovery feed.
- **Due for Review**: Personal row for overdue decks (SM-2 logic).
- **Mastered Intelligence**: Showcases high-retention assets.
- **Personalized Hero**: Features the user's most urgent study deck.
- **Cinematic Experience**: High-authority dark mode, glassmorphism, and smooth motion.

---

## 1. TECH STACK (DO NOT CHANGE)
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Database**: Supabase (PostgreSQL) — project ID: `ncaalhdosocuutbjcjtd`
- **Logic**: SM-2 Algorithm (SM2) in `lib/srs-logic.ts`

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

### Table: `user_deck_progress` (SRS State)
```sql
CREATE TABLE user_deck_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  interval INTEGER DEFAULT 0,
  repetition INTEGER DEFAULT 0,
  ease NUMERIC DEFAULT 2.5,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deck_id)
);
```

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
│   ├── supabase.ts         # Supabase client
│   └── srs-logic.ts        # SM-2 Implementation
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
6. ✅ Hero/Feed Overlap → Resolved by adding `pb-32` to Hero and increasing `z-index` to 30 on `DiscoveryFeed`.
7. ✅ Redundant Navbar → Removed duplicate Navbar from Search page fallback.
8. ✅ Neural Sync Visual → Enhanced study simulation with a cinematic scanning line and brain circuit animation.

---

## 6. PERSONALIZED DISCOVERY ARCHITECTURE

### The Discovery Engine (`DiscoveryFeed.tsx`)
The feed is no longer static. It performs a real-time join between `decks` and `user_deck_progress`:
1. **Filter Due**: `next_review <= NOW()` -> "Due for Review" row.
2. **Filter Mastered**: `ease >= 2.8` -> "Mastered Intelligence" row.
3. **In Progress**: Active decks not yet mastered or due -> "In Progress" row.

### The Mastery Indicator (`DeckCard.tsx`)
Every card in an SRS row displays a **Netflix-style red progress bar** at the bottom.
- Formula: `(ease - 1.3) / (5.0 - 1.3) * 100`

### The Study Session Flow (`DeckModal.tsx`)
1. **Start Session**: Simulates a neural sync for 3 seconds (Cinematic Loader).
2. **Performance Assessment**: Shows 5 rating buttons: Again, Hard, Good, Easy, Perfect.
3. **Backend Sync**: Updates `user_deck_progress` using SM-2 calculations.

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

## 14. VISION STATEMENT (SRS VERSION)

Ankiflix is the **Cinematic Command Center** for your brain. 

When a student opens Ankiflix, they don't see a wall of text. They see a **High-Authority Intelligence Premiere**. The most urgent decks glow with red indicators. Their mastery level is visible at a glance. Studying is no longer a chore; it's a high-production experience.

Every design decision must serve this goal:
- **Cinematic Mastery** = The UI feels like a premium streaming service.
- **Academic Authority** = Data-driven discovery via SRS.
- **Frictionless Flow** = From discovery to download in under 10 seconds.
- **Neural Sync** = The platform tracks your memory states automatically.
- **Trustworthy** = verified deck sources (AnkiWeb only), honest card counts

The primary user is a **medical student** preparing for USMLE/NEET PG. Secondary users are law students, language learners, and coders. Design for the medical student first.
