-- 0015_property_admin_overrides.sql
-- Admin-curated overrides that survive Guesty sync:
--   * display_name — override for the public listing title (falls back to
--     properties.name if null).
--   * featured_amenities — up to 4 slugs the admin pins to the property hero
--     card on browse/detail (subset of the full amenities[] array).
-- Both columns are untouched by sync-listings.ts so edits stick.
-- Idempotent.

alter table public.properties
  add column if not exists display_name text,
  add column if not exists featured_amenities text[] not null default '{}';

-- Optional invariant: cap the featured set to 4 entries.
do $$ begin
  alter table public.properties
    add constraint properties_featured_amenities_max
    check (coalesce(array_length(featured_amenities, 1), 0) <= 4);
exception when duplicate_object then null; end $$;
