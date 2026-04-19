-- Denormalised single hero image URL on the property row itself. Guesty
-- returns one "picture" per listing, so piping it into property_images
-- would force a second join for the card query. hero_url is the cache;
-- property_images remains the source once hosts upload gallery sets.
alter table public.properties
  add column if not exists hero_url text;
