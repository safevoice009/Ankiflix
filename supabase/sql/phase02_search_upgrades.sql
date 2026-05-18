-- Phase 02: Search Synonyms, Zero-Result Queries, and Hot Cache
-- Run this against the Ankiflix project database.

-- 1) search_synonyms table
create table if not exists public.search_synonyms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  synonyms text[] not null,
  created_at timestamptz not null default now()
);

create index if not exists search_synonyms_term_idx on public.search_synonyms(term);

-- 2) zero_result_queries table
create table if not exists public.zero_result_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null unique,
  count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zero_result_queries_query_idx on public.zero_result_queries(query);
create index if not exists zero_result_queries_count_idx on public.zero_result_queries(count desc);

-- 3) search_cache table
create table if not exists public.search_cache (
  id uuid primary key default gen_random_uuid(),
  query text not null unique,
  results jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists search_cache_query_idx on public.search_cache(query);

-- 4) Security and Row Level Security (RLS) policies
alter table public.search_synonyms enable row level security;
alter table public.zero_result_queries enable row level security;
alter table public.search_cache enable row level security;

-- public read synonyms
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_synonyms'
      and policyname = 'select_search_synonyms_public'
  ) then
    create policy select_search_synonyms_public
      on public.search_synonyms
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- public insert/select/update zero_result_queries
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'zero_result_queries'
      and policyname = 'all_zero_result_queries_public'
  ) then
    create policy all_zero_result_queries_public
      on public.zero_result_queries
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- public all search_cache (or server-side bypass using service role)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_cache'
      and policyname = 'all_search_cache_public'
  ) then
    create policy all_search_cache_public
      on public.search_cache
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- 5) Seed initial high-yield exam/topic synonyms
insert into public.search_synonyms (term, synonyms) values
  ('med', array['medical', 'anatomy', 'physiology', 'pathology', 'usmle', 'mcat', 'medicine']),
  ('coding', array['programming', 'javascript', 'python', 'developer', 'react', 'rust', 'c++', 'software']),
  ('lang', array['language', 'japanese', 'spanish', 'french', 'chinese', 'german', 'korean', 'jlpt']),
  ('law', array['legal', 'contracts', 'constitutional', 'torts', 'bar', 'jurisprudence'])
on conflict (term) do update
set synonyms = excluded.synonyms;
