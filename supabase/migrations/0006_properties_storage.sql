-- 0006_properties_storage.sql
-- Phase C slice 2: Supabase Storage bucket for property imagery.
--   * Bucket is public-read (listing photography is shown to anyone browsing
--     /stays).
--   * Writes are gated by host ownership of the property whose UUID forms the
--     first path segment: `{property_id}/{filename}`.
--   * Admin bypass policy so the service-role + admins can moderate.
-- Idempotent.

insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

-- Public read: anyone can view property imagery in the bucket.
drop policy if exists "properties: public read" on storage.objects;
create policy "properties: public read" on storage.objects
  for select using (bucket_id = 'properties');

-- Host upload: authenticated users can upload into their own properties' folder.
drop policy if exists "properties: host upload" on storage.objects;
create policy "properties: host upload" on storage.objects
  for insert
  with check (
    bucket_id = 'properties'
    and auth.role() = 'authenticated'
    and (
      public.is_admin()
      or public.is_host_of(
        -- First path segment is the property UUID.
        (storage.foldername(name))[1]::uuid
      )
    )
  );

drop policy if exists "properties: host update" on storage.objects;
create policy "properties: host update" on storage.objects
  for update using (
    bucket_id = 'properties'
    and (
      public.is_admin()
      or public.is_host_of((storage.foldername(name))[1]::uuid)
    )
  );

drop policy if exists "properties: host delete" on storage.objects;
create policy "properties: host delete" on storage.objects
  for delete using (
    bucket_id = 'properties'
    and (
      public.is_admin()
      or public.is_host_of((storage.foldername(name))[1]::uuid)
    )
  );
