-- Lively Properties royalty portal — initial schema
-- Run from the Supabase SQL editor or via `supabase db push`.

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists "pgcrypto";

-- =====================================================================
-- Enums
-- =====================================================================
create type public.points_event as enum ('earn_stay', 'spend_redemption', 'admin_adjust');
create type public.redemption_status as enum ('pending', 'confirmed', 'used', 'cancelled');
create type public.user_role as enum ('guest', 'admin');

-- =====================================================================
-- profiles (1:1 with auth.users)
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.user_role not null default 'guest',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- properties (mirrors Guesty)
-- =====================================================================
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  guesty_id text unique,
  name text not null,
  address text,
  region text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- reservations (synced from Guesty; code is what guests enter)
-- =====================================================================
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guesty_id text unique,
  code text not null unique,
  property_id uuid references public.properties(id) on delete set null,
  guest_email text not null,
  guest_name text,
  check_in date not null,
  check_out date not null,
  nights integer generated always as (greatest((check_out - check_in), 0)) stored,
  total_value_cents integer,
  currency text default 'AUD',
  created_at timestamptz not null default now()
);

create index on public.reservations (guest_email);
create index on public.reservations (code);

-- =====================================================================
-- stay_claims (guest claims a reservation → earns points)
-- =====================================================================
create table public.stay_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  points_awarded integer not null check (points_awarded >= 0),
  claimed_at timestamptz not null default now(),
  unique (reservation_id)
);

create index on public.stay_claims (user_id);

-- =====================================================================
-- partners
-- =====================================================================
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  contact_email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- experiences (points-redeemable offerings)
-- =====================================================================
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  title text not null,
  description text,
  image_url text,
  region text,
  points_cost integer not null check (points_cost >= 0),
  stock integer, -- null = unlimited
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- offers (non-points promos shown in UI)
-- =====================================================================
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  cta_label text,
  cta_url text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- redemptions (guest spends points on an experience)
-- =====================================================================
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete restrict,
  points_spent integer not null check (points_spent >= 0),
  status public.redemption_status not null default 'pending',
  confirmation_code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index on public.redemptions (user_id);
create index on public.redemptions (experience_id);

-- =====================================================================
-- points_ledger (append-only source of truth for balance)
-- =====================================================================
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event public.points_event not null,
  amount integer not null, -- positive for earn, negative for spend
  stay_claim_id uuid references public.stay_claims(id) on delete set null,
  redemption_id uuid references public.redemptions(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index on public.points_ledger (user_id);

-- Balance view
create or replace view public.v_user_points as
  select p.id as user_id,
         coalesce(sum(l.amount), 0)::int as balance
  from public.profiles p
  left join public.points_ledger l on l.user_id = p.id
  group by p.id;

-- =====================================================================
-- Admin dashboard views
-- =====================================================================
create or replace view public.v_admin_daily_signups as
  select date_trunc('day', created_at)::date as day,
         count(*)::int as count
  from public.profiles
  group by 1 order by 1 desc;

create or replace view public.v_admin_daily_claims as
  select date_trunc('day', claimed_at)::date as day,
         count(*)::int as count,
         sum(points_awarded)::int as points_awarded
  from public.stay_claims
  group by 1 order by 1 desc;

create or replace view public.v_admin_daily_redemptions as
  select date_trunc('day', created_at)::date as day,
         count(*)::int as count,
         sum(points_spent)::int as points_spent
  from public.redemptions
  group by 1 order by 1 desc;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.stay_claims enable row level security;
alter table public.points_ledger enable row level security;
alter table public.redemptions enable row level security;
alter table public.reservations enable row level security;
alter table public.properties enable row level security;
alter table public.experiences enable row level security;
alter table public.partners enable row level security;
alter table public.offers enable row level security;

-- helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: user reads/updates own; admin reads all
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin update" on public.profiles
  for update using (public.is_admin());

-- stay_claims: user reads own; admin reads all; inserts via server only (service role bypasses RLS)
create policy "stay_claims: self read" on public.stay_claims
  for select using (user_id = auth.uid() or public.is_admin());

-- points_ledger: user reads own
create policy "points_ledger: self read" on public.points_ledger
  for select using (user_id = auth.uid() or public.is_admin());

-- redemptions: user reads own; inserts via server
create policy "redemptions: self read" on public.redemptions
  for select using (user_id = auth.uid() or public.is_admin());

-- reservations: admins only by default (guests don't need direct read)
create policy "reservations: admin read" on public.reservations
  for select using (public.is_admin());

-- properties: public read (names/region only, fine for browsing); admin write
create policy "properties: public read" on public.properties
  for select using (active = true or public.is_admin());

-- experiences: public read of active; admin all
create policy "experiences: public read active" on public.experiences
  for select using (active = true or public.is_admin());

-- partners: public read of active; admin all
create policy "partners: public read active" on public.partners
  for select using (active = true or public.is_admin());

-- offers: public read of active-in-window
create policy "offers: public read active" on public.offers
  for select using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    or public.is_admin()
  );
