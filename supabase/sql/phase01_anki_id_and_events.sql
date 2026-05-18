-- Phase 01: Anki ID normalization + deck event telemetry
-- Run this against the Ankiflix project database.

-- 1) Deck identity hardening
alter table if exists public.decks
  add column if not exists anki_id text;

-- Backfill anki_id from known URL patterns if present.
update public.decks
set anki_id = substring(anki_link from '/shared/(?:info|download)/([0-9]+)')
where anki_id is null
  and anki_link ~ '/shared/(info|download)/[0-9]+';

-- Keep anki_id unique when present.
create unique index if not exists decks_anki_id_unique_idx
  on public.decks(anki_id)
  where anki_id is not null;

-- 2) Lightweight telemetry table
create table if not exists public.deck_events (
  id uuid primary key default gen_random_uuid(),
  deck_id text not null,
  event_type text not null check (event_type in ('open_ankiweb', 'download_ankiweb', 'search_open_ankiweb')),
  query text null,
  anki_id text null,
  user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists deck_events_created_at_idx on public.deck_events(created_at desc);
create index if not exists deck_events_deck_id_idx on public.deck_events(deck_id);
create index if not exists deck_events_event_type_idx on public.deck_events(event_type);

alter table public.deck_events enable row level security;

-- Public can insert events (read disabled by default for anon).
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deck_events'
      and policyname = 'insert_deck_events_public'
  ) then
    create policy insert_deck_events_public
      on public.deck_events
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
