-- 0007_guesty_sync.sql
-- Phase F slice 1: Guesty Open API integration scaffolding.
--
-- Additions:
--   * properties.guesty_listing_id (unique, nullable) — links our row to
--     the Guesty listing; null for partner listings onboarded manually.
--   * guesty_tokens — singleton cache for the OAuth2 client_credentials
--     access token. Guesty caps token issuance at 5 per 24h per client,
--     so this MUST be persisted, not re-issued per request.
--   * guesty_sync_runs — audit log of every listings/calendar sync.
--   * guesty_events — webhook event log (Phase F slice 3 consumer, but
--     the table lands now so the webhook endpoint has somewhere to write).
--
-- Also seeds a "Lively" host row so the listings sync can assign every
-- Lively-managed Guesty listing to host_id = <Lively>.

---------------------------------------------------------------
-- properties.guesty_listing_id
---------------------------------------------------------------

alter table public.properties
  add column if not exists guesty_listing_id text;

create unique index if not exists properties_guesty_listing_id_key
  on public.properties (guesty_listing_id)
  where guesty_listing_id is not null;

comment on column public.properties.guesty_listing_id is
  'Guesty listing _id. Null for listings not sourced from Guesty (partners).';

---------------------------------------------------------------
-- hosts: ensure the "Lively" host exists
---------------------------------------------------------------

insert into public.hosts (display_name, legal_name, contact_email, onboarding_status, approved_at)
select 'Lively', 'Lively Properties', 'hello@livelyproperties.com.au', 'approved', now()
where not exists (
  select 1 from public.hosts where lower(display_name) = 'lively'
);

---------------------------------------------------------------
-- guesty_tokens (singleton-style cache)
---------------------------------------------------------------

create table if not exists public.guesty_tokens (
  id               text primary key default 'default',
  access_token     text not null,
  token_type       text not null default 'Bearer',
  expires_at       timestamptz not null,
  issued_at        timestamptz not null default now(),
  issued_count_24h integer not null default 1, -- local counter; Guesty also enforces 5/24h
  constraint guesty_tokens_single_row check (id = 'default')
);

alter table public.guesty_tokens enable row level security;

drop policy if exists "guesty_tokens: admin all" on public.guesty_tokens;
create policy "guesty_tokens: admin all" on public.guesty_tokens
  for all using (public.is_admin()) with check (public.is_admin());

comment on table public.guesty_tokens is
  'Single-row cache of the Guesty OAuth2 access token. Respects the 5-tokens/24h hard cap.';

---------------------------------------------------------------
-- guesty_sync_runs
---------------------------------------------------------------

do $$ begin
  create type public.guesty_sync_kind as enum ('listings', 'calendar', 'reservations');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.guesty_sync_status as enum ('running', 'ok', 'error');
exception when duplicate_object then null; end $$;

create table if not exists public.guesty_sync_runs (
  id            uuid primary key default gen_random_uuid(),
  kind          public.guesty_sync_kind not null,
  status        public.guesty_sync_status not null default 'running',
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  pages_fetched integer not null default 0,
  items_seen    integer not null default 0,
  items_created integer not null default 0,
  items_updated integer not null default 0,
  items_skipped integer not null default 0,
  error_message text,
  notes         jsonb not null default '{}'::jsonb
);

create index if not exists guesty_sync_runs_kind_started_idx
  on public.guesty_sync_runs (kind, started_at desc);

alter table public.guesty_sync_runs enable row level security;

drop policy if exists "guesty_sync_runs: admin read" on public.guesty_sync_runs;
create policy "guesty_sync_runs: admin read" on public.guesty_sync_runs
  for select using (public.is_admin());

drop policy if exists "guesty_sync_runs: admin write" on public.guesty_sync_runs;
create policy "guesty_sync_runs: admin write" on public.guesty_sync_runs
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- guesty_events (webhook log — consumer lands in slice 3)
---------------------------------------------------------------

create table if not exists public.guesty_events (
  id               uuid primary key default gen_random_uuid(),
  event_type       text not null,
  guesty_event_id  text,
  guesty_entity_id text,
  payload          jsonb not null,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz,
  processing_error text
);

create unique index if not exists guesty_events_event_id_key
  on public.guesty_events (guesty_event_id)
  where guesty_event_id is not null;

create index if not exists guesty_events_type_received_idx
  on public.guesty_events (event_type, received_at desc);

alter table public.guesty_events enable row level security;

drop policy if exists "guesty_events: admin read" on public.guesty_events;
create policy "guesty_events: admin read" on public.guesty_events
  for select using (public.is_admin());

drop policy if exists "guesty_events: admin write" on public.guesty_events;
create policy "guesty_events: admin write" on public.guesty_events
  for all using (public.is_admin()) with check (public.is_admin());
