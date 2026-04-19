-- Guesty returns fractional bathrooms (2.5, 1.5) for properties with a
-- half-bath. Our original column was `integer`, which rejected the first
-- full Guesty listings pull. Widen it to numeric(3,1) so we preserve the
-- half-bath signal for the property detail page.
alter table public.properties
  alter column bathrooms type numeric(3,1) using bathrooms::numeric(3,1);
