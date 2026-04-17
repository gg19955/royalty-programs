-- 0004_platform_foundations.sql
-- Phase A of the Lively platform pivot: introduce marketplace-grade entities
-- (hosts, property listings, rate plans, availability, bookings-with-payment,
-- payouts, stripe events, reviews) without breaking the existing rewards flow.
--
-- Existing tables that stay: profiles, properties, reservations, stay_claims,
-- claim_requests, points_ledger, partners, experiences, offers, redemptions.
-- Extensions are additive and gated with `if not exists` so this is re-runnable.

---------------------------------------------------------------
-- hosts
---------------------------------------------------------------

do $$ begin
  create type public.host_onboarding_status as enum (
    'invited','submitted','approved','rejected','paused'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.hosts (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  abn text,
  contact_email text not null,
  phone text,
  stripe_connect_account_id text unique,
  onboarding_status public.host_onboarding_status not null default 'invited',
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.hosts enable row level security;

drop policy if exists "hosts: admin read" on public.hosts;
create policy "hosts: admin read" on public.hosts
  for select using (public.is_admin());

drop policy if exists "hosts: admin write" on public.hosts;
create policy "hosts: admin write" on public.hosts
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- profiles: add 'host' to user_role, host_id FK
---------------------------------------------------------------

alter type public.user_role add value if not exists 'host';

alter table public.profiles
  add column if not exists host_id uuid references public.hosts(id);

---------------------------------------------------------------
-- properties: promote to full listing
---------------------------------------------------------------

do $$ begin
  create type public.property_type as enum (
    'villa','beach_house','apartment','chalet','farm_stay','cottage','penthouse','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cancellation_policy as enum ('flexible','moderate','strict');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_status as enum ('draft','pending_review','published','paused','archived');
exception when duplicate_object then null; end $$;

alter table public.properties
  add column if not exists host_id uuid references public.hosts(id),
  add column if not exists slug text unique,
  add column if not exists headline text,
  add column if not exists description text,
  add column if not exists property_type public.property_type,
  add column if not exists bedrooms int,
  add column if not exists bathrooms int,
  add column if not exists max_guests int,
  add column if not exists amenities text[] not null default '{}',
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists country text default 'Australia',
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists base_rate_cents int,
  add column if not exists cleaning_fee_cents int default 0,
  add column if not exists min_nights int default 2,
  add column if not exists check_in_time time default '15:00',
  add column if not exists check_out_time time default '10:00',
  add column if not exists cancellation_policy public.cancellation_policy default 'moderate',
  add column if not exists house_rules text,
  add column if not exists listing_status public.listing_status not null default 'draft',
  add column if not exists published_at timestamptz;

create index if not exists properties_listing_status_idx on public.properties (listing_status);
create index if not exists properties_region_idx on public.properties (region);
create index if not exists properties_slug_idx on public.properties (slug);

-- Allow the public to see *published* listings (the old `active=true` rule stays for legacy rows)
drop policy if exists "properties: public read" on public.properties;
create policy "properties: public read" on public.properties
  for select using (
    listing_status = 'published'
    or active = true
    or public.is_admin()
  );

---------------------------------------------------------------
-- property_images
---------------------------------------------------------------

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_hero boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists property_images_property_sort_idx
  on public.property_images (property_id, sort_order);

create unique index if not exists property_images_one_hero_idx
  on public.property_images (property_id) where is_hero = true;

alter table public.property_images enable row level security;

drop policy if exists "property_images: public read" on public.property_images;
create policy "property_images: public read" on public.property_images
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and (p.listing_status = 'published' or p.active = true or public.is_admin())
    )
  );

drop policy if exists "property_images: admin write" on public.property_images;
create policy "property_images: admin write" on public.property_images
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- rate_plans
---------------------------------------------------------------

create table if not exists public.rate_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  nightly_rate_cents int not null check (nightly_rate_cents >= 0),
  min_nights int,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists rate_plans_property_range_idx
  on public.rate_plans (property_id, start_date, end_date);

alter table public.rate_plans enable row level security;

drop policy if exists "rate_plans: public read" on public.rate_plans;
create policy "rate_plans: public read" on public.rate_plans
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = rate_plans.property_id
        and (p.listing_status = 'published' or p.active = true or public.is_admin())
    )
  );

drop policy if exists "rate_plans: admin write" on public.rate_plans;
create policy "rate_plans: admin write" on public.rate_plans
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- availability_blocks
---------------------------------------------------------------

do $$ begin
  create type public.availability_source as enum ('ical','manual','platform_booking');
exception when duplicate_object then null; end $$;

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  source public.availability_source not null,
  ical_event_id text,
  reservation_id uuid references public.reservations(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists availability_blocks_property_range_idx
  on public.availability_blocks (property_id, start_date, end_date);

alter table public.availability_blocks enable row level security;

drop policy if exists "availability_blocks: public read" on public.availability_blocks;
create policy "availability_blocks: public read" on public.availability_blocks
  for select using (
    exists (
      select 1 from public.properties p
      where p.id = availability_blocks.property_id
        and (p.listing_status = 'published' or p.active = true or public.is_admin())
    )
  );

drop policy if exists "availability_blocks: admin write" on public.availability_blocks;
create policy "availability_blocks: admin write" on public.availability_blocks
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- reservations: OTA fields
---------------------------------------------------------------

do $$ begin
  create type public.reservation_source as enum ('guesty_import','platform_booking','manual_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reservation_status as enum (
    'pending_payment','confirmed','cancelled','completed','refunded'
  );
exception when duplicate_object then null; end $$;

alter table public.reservations
  add column if not exists source public.reservation_source not null default 'manual_admin',
  add column if not exists user_id uuid references public.profiles(id),
  add column if not exists host_id uuid references public.hosts(id),
  add column if not exists status public.reservation_status not null default 'confirmed',
  add column if not exists num_guests int,
  add column if not exists special_requests text,
  add column if not exists stripe_payment_intent_id text unique,
  add column if not exists accommodation_cents int,
  add column if not exists cleaning_fee_cents int default 0,
  add column if not exists platform_fee_cents int default 0,
  add column if not exists host_payout_cents int,
  add column if not exists total_charged_cents int,
  add column if not exists points_applied int not null default 0,
  add column if not exists points_discount_cents int not null default 0,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists completed_at timestamptz;

create index if not exists reservations_user_id_idx on public.reservations (user_id);
create index if not exists reservations_host_id_idx on public.reservations (host_id);
create index if not exists reservations_status_idx on public.reservations (status);

-- Let a guest read their own platform bookings (admin read already exists from 0001)
drop policy if exists "reservations: self read" on public.reservations;
create policy "reservations: self read" on public.reservations
  for select using (user_id = auth.uid() or public.is_admin());

---------------------------------------------------------------
-- points_ledger: spend_booking event + reservation FK
---------------------------------------------------------------

alter type public.points_event add value if not exists 'spend_booking';

alter table public.points_ledger
  add column if not exists reservation_id uuid references public.reservations(id) on delete set null;

---------------------------------------------------------------
-- payouts
---------------------------------------------------------------

do $$ begin
  create type public.payout_status as enum ('scheduled','paid','failed','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete restrict,
  reservation_id uuid references public.reservations(id) on delete set null,
  amount_cents int not null check (amount_cents >= 0),
  stripe_transfer_id text unique,
  status public.payout_status not null default 'scheduled',
  scheduled_for timestamptz,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists payouts_host_idx on public.payouts (host_id);
create index if not exists payouts_status_idx on public.payouts (status);

alter table public.payouts enable row level security;

drop policy if exists "payouts: admin all" on public.payouts;
create policy "payouts: admin all" on public.payouts
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- stripe_events (idempotent webhook log)
---------------------------------------------------------------

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

drop policy if exists "stripe_events: admin all" on public.stripe_events;
create policy "stripe_events: admin all" on public.stripe_events
  for all using (public.is_admin()) with check (public.is_admin());

---------------------------------------------------------------
-- reviews
---------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews: public read published" on public.reviews;
create policy "reviews: public read published" on public.reviews
  for select using (published = true or public.is_admin());

drop policy if exists "reviews: admin write" on public.reviews;
create policy "reviews: admin write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());
