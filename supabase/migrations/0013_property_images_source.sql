-- Add a source column to property_images so the Guesty sync can own the
-- images it pulls without clobbering manually-curated images for the
-- existing signature/editorial properties. Same pattern as
-- availability_blocks.source.
--
-- Existing rows (currently all human-curated for 6 signature properties)
-- default to 'manual'. The Guesty sync writes 'guesty' and only deletes
-- rows where source='guesty' before re-inserting.

alter table public.property_images
  add column if not exists source text not null default 'manual';
