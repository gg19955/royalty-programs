-- 0005_host_onboarding.sql
-- Phase C slice 1: host onboarding funnel.
--   * host_applications: public-intake form rows, reviewed by admin.
--   * is_host_of(): SQL helper so RLS on listing tables can grant hosts
--     self-scoped read/write in addition to existing admin-all policies.
--   * host-scoped policies layered on top of the public/admin policies
--     from 0004 (properties, property_images, rate_plans, availability_blocks).
-- Migration is idempotent.

---------------------------------------------------------------
-- host_applications
---------------------------------------------------------------

do $$ begin
  create type public.host_application_status as enum (
    'submitted','reviewing','approved','rejected','withdrawn'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.host_applications (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  contact_name text not null,
  phone text,
  display_name text not null,           -- public-facing host / brand name
  property_name text not null,           -- the flagship property the applicant is pitching
  location text not null,                -- free-text region (e.g. "Sorrento, Mornington Peninsula")
  property_url text,                     -- existing listing / website, optional
  description text not null,             -- why this property fits Lively
  about text,                            -- about the applicant / operator
  status public.host_application_status not null default 'submitted',
  review_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  host_id uuid references public.hosts(id),   -- set on approval
  created_at timestamptz not null default now()
);

create index if not exists host_applications_status_idx
  on public.host_applications (status, created_at desc);

alter table public.host_applications enable row level security;

-- Anon + authenticated users can submit an application (insert only).
drop policy if exists "host_applications: public insert" on public.host_applications;
create policy "host_applications: public insert" on public.host_applications
  for insert with check (true);

-- Only admins can read or mutate existing applications.
drop policy if exists "host_applications: admin read" on public.host_applications;
create policy "host_applications: admin read" on public.host_applications
  for select using (public.is_admin());

drop policy if exists "host_applications: admin write" on public.host_applications;
create policy "host_applications: admin write" on public.host_applications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "host_applications: admin delete" on public.host_applications;
create policy "host_applications: admin delete" on public.host_applications
  for delete using (public.is_admin());

---------------------------------------------------------------
-- is_host_of(property_id): true when auth.uid() is linked to a
-- profile whose host_id owns the property.
---------------------------------------------------------------

create or replace function public.is_host_of(p_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles pr
    join public.properties pp on pp.host_id = pr.host_id
    where pr.id = auth.uid()
      and pp.id = p_property_id
      and pr.host_id is not null
  );
$$;

grant execute on function public.is_host_of(uuid) to authenticated;

-- Helper: current user's host_id (null if not a host).
create or replace function public.current_host_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select host_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_host_id() to authenticated;

---------------------------------------------------------------
-- properties: host self-scoped read + write
---------------------------------------------------------------

drop policy if exists "properties: host read own" on public.properties;
create policy "properties: host read own" on public.properties
  for select using (
    host_id is not null and host_id = public.current_host_id()
  );

drop policy if exists "properties: host insert own" on public.properties;
create policy "properties: host insert own" on public.properties
  for insert with check (
    host_id is not null and host_id = public.current_host_id()
  );

drop policy if exists "properties: host update own" on public.properties;
create policy "properties: host update own" on public.properties
  for update using (
    host_id is not null and host_id = public.current_host_id()
  ) with check (
    host_id is not null and host_id = public.current_host_id()
  );

---------------------------------------------------------------
-- property_images: host self-scoped
---------------------------------------------------------------

drop policy if exists "property_images: host read" on public.property_images;
create policy "property_images: host read" on public.property_images
  for select using (public.is_host_of(property_id));

drop policy if exists "property_images: host write" on public.property_images;
create policy "property_images: host write" on public.property_images
  for all using (public.is_host_of(property_id))
  with check (public.is_host_of(property_id));

---------------------------------------------------------------
-- rate_plans: host self-scoped
---------------------------------------------------------------

drop policy if exists "rate_plans: host read" on public.rate_plans;
create policy "rate_plans: host read" on public.rate_plans
  for select using (public.is_host_of(property_id));

drop policy if exists "rate_plans: host write" on public.rate_plans;
create policy "rate_plans: host write" on public.rate_plans
  for all using (public.is_host_of(property_id))
  with check (public.is_host_of(property_id));

---------------------------------------------------------------
-- availability_blocks: host self-scoped (read-only in v1; platform
-- writes via service role when bookings confirm)
---------------------------------------------------------------

drop policy if exists "availability_blocks: host read" on public.availability_blocks;
create policy "availability_blocks: host read" on public.availability_blocks
  for select using (public.is_host_of(property_id));

-- Hosts may add/remove manual blocks (e.g. their own holiday use).
drop policy if exists "availability_blocks: host write manual" on public.availability_blocks;
create policy "availability_blocks: host write manual" on public.availability_blocks
  for all using (public.is_host_of(property_id) and source = 'manual')
  with check (public.is_host_of(property_id) and source = 'manual');

---------------------------------------------------------------
-- reservations: host read own
---------------------------------------------------------------

drop policy if exists "reservations: host read" on public.reservations;
create policy "reservations: host read" on public.reservations
  for select using (
    host_id is not null and host_id = public.current_host_id()
  );
