-- 0014_host_onboarding_gates.sql
-- Post-approval host onboarding gates:
--   * Agreement acceptance (versioned)
--   * Legal name + ABN already live on hosts since 0004; no schema change needed
--     for those, but we use them as publish gates from the server.
--   * KYC document upload + admin verification (new private bucket).
-- Idempotent.

---------------------------------------------------------------
-- host_kyc_status enum + new columns on hosts
---------------------------------------------------------------

do $$ begin
  create type public.host_kyc_status as enum (
    'none','pending','verified','rejected'
  );
exception when duplicate_object then null; end $$;

alter table public.hosts
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists agreement_version text,
  add column if not exists kyc_status public.host_kyc_status not null default 'none',
  add column if not exists kyc_document_path text,
  add column if not exists kyc_document_type text,
  add column if not exists kyc_uploaded_at timestamptz,
  add column if not exists kyc_verified_at timestamptz,
  add column if not exists kyc_verified_by uuid references public.profiles(id),
  add column if not exists kyc_rejection_reason text;

create index if not exists hosts_kyc_status_idx on public.hosts (kyc_status);

---------------------------------------------------------------
-- Private storage bucket for KYC documents.
-- Writes happen server-side via service role (admin client), so no host
-- upload/update policy is needed. Admins can read via the admin policy.
---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('host-kyc', 'host-kyc', false)
on conflict (id) do nothing;

drop policy if exists "host-kyc: admin read" on storage.objects;
create policy "host-kyc: admin read" on storage.objects
  for select using (bucket_id = 'host-kyc' and public.is_admin());

drop policy if exists "host-kyc: admin write" on storage.objects;
create policy "host-kyc: admin write" on storage.objects
  for all using (bucket_id = 'host-kyc' and public.is_admin())
  with check (bucket_id = 'host-kyc' and public.is_admin());
