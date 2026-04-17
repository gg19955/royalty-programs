-- 0003: manual-review claim flow + branding fields
-- Adds last_name to profiles (matching during review),
-- featured flag + partial unique index on offers (Current Season Offer),
-- and claim_requests table for persisted submissions.

alter table public.profiles add column if not exists last_name text;

alter table public.offers add column if not exists featured boolean not null default false;
create unique index if not exists offers_one_featured
  on public.offers ((featured)) where featured = true and active = true;

create type public.claim_request_status as enum ('pending', 'approved', 'rejected');

create table public.claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reservation_code text not null,
  last_name text not null,
  status public.claim_request_status not null default 'pending',
  reviewer_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.claim_requests (user_id);
create index on public.claim_requests (status);

alter table public.claim_requests enable row level security;

create policy "claim_requests: self read"
  on public.claim_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy "claim_requests: self insert"
  on public.claim_requests for insert
  with check (user_id = auth.uid());

create policy "claim_requests: admin update"
  on public.claim_requests for update
  using (public.is_admin());
