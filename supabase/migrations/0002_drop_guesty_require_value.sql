-- Decision 2026-04-17: no Guesty sync; reservations owned in this DB.
-- Drop vestigial guesty_id columns and require total_value_cents (needed for
-- 1-point-per-AUD earning).

alter table public.reservations drop column if exists guesty_id;
alter table public.properties drop column if exists guesty_id;

alter table public.reservations alter column total_value_cents set not null;
alter table public.reservations
  add constraint reservations_total_value_nonneg check (total_value_cents >= 0);
