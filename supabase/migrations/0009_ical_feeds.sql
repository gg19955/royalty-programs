-- Phase F Track 2 — iCal feeds for partner-host properties.
--
-- Partner hosts manage their listing inside Lively but keep their existing
-- booking calendar elsewhere (Airbnb, VRBO, Stayz, Guesty, etc.). We pull
-- their .ics feeds on a schedule and write VEVENT blocks into
-- availability_blocks with source='ical', so the booking flow can't
-- double-book a date that is already taken on another platform.
--
-- The availability_source enum already contains 'ical' (migration 0004) and
-- availability_blocks already has an ical_event_id column — no changes to
-- that table. This migration only adds the feed-registry table.

create table if not exists public.ical_feeds (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  -- Human label so the host can tell Airbnb vs VRBO apart in the UI.
  label text not null,
  active boolean not null default true,
  -- Sync telemetry. Updated on every pull whether it succeeded or not.
  last_synced_at timestamptz,
  last_sync_status text,          -- 'ok' | 'error'
  last_sync_error text,
  last_event_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ical_feeds_property_id_idx
  on public.ical_feeds (property_id);
create index if not exists ical_feeds_active_idx
  on public.ical_feeds (active) where active = true;

-- Reuse updated_at trigger helper if defined; create a local one only if not.
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'set_updated_at'
  ) then
    create function public.set_updated_at() returns trigger as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$ language plpgsql;
  end if;
end $$;

drop trigger if exists ical_feeds_set_updated_at on public.ical_feeds;
create trigger ical_feeds_set_updated_at
  before update on public.ical_feeds
  for each row execute function public.set_updated_at();

-- RLS — hosts see/manage only their own feeds; admins see all.
alter table public.ical_feeds enable row level security;

drop policy if exists "hosts manage own ical feeds" on public.ical_feeds;
create policy "hosts manage own ical feeds"
  on public.ical_feeds
  for all
  using (
    exists (
      select 1 from public.properties p
      join public.profiles prof on prof.host_id = p.host_id
      where p.id = ical_feeds.property_id
        and prof.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      join public.profiles prof on prof.host_id = p.host_id
      where p.id = ical_feeds.property_id
        and prof.id = auth.uid()
    )
  );

drop policy if exists "admins read all ical feeds" on public.ical_feeds;
create policy "admins read all ical feeds"
  on public.ical_feeds
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
