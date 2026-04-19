-- Extend availability_source enum so the Guesty calendar sync can write rows
-- that are cleanly distinguishable from iCal imports, platform bookings and
-- manual holds. Reconciliation in sync-availability.ts uses source='guesty_import'
-- to scope deletes without touching rows owned by other sources.
--
-- Note: ALTER TYPE ... ADD VALUE must run outside a transaction. Supabase CLI
-- executes single-statement migrations in autocommit mode by default.

alter type public.availability_source add value if not exists 'guesty_import';
