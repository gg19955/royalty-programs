-- 0008 — Public enquiry intake for "Stay with Lively" + "List with Lively".
-- Single table keyed by `type`; columns that only apply to one path are nullable.
-- Photos for the list-with-us path live in a public storage bucket.

create type public.enquiry_type as enum ('stay', 'list');

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type public.enquiry_type not null,

  name text not null,
  email text not null,
  mobile text not null,

  -- Stay with Lively
  dates text,
  nice_to_have text,
  must_have text,

  -- List with Lively
  property_address text,
  property_link text,
  photo_urls text[] not null default '{}',

  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.enquiries (type);
create index on public.enquiries (created_at desc);
create index on public.enquiries (handled);

alter table public.enquiries enable row level security;

-- Admins read/write everything; inserts come via server action using the
-- service-role key (which bypasses RLS) so no anon insert policy is needed.
create policy "admins manage enquiries"
  on public.enquiries
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public bucket for list-with-us property photos. Uploads happen server-side
-- via the service role; reads are public so admins can render thumbnails
-- straight from the URL without signing.
insert into storage.buckets (id, name, public)
values ('enquiry-photos', 'enquiry-photos', true)
on conflict (id) do nothing;
