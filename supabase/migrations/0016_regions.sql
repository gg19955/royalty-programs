-- 0016_regions.sql
-- Admin-managed regions + suburb lookup. Replaces the hardcoded REGIONS
-- constant previously duplicated in hero-search.tsx and listing-form.tsx.
-- Powers the /stays search bar, the listing form region dropdown, and the
-- filter chips.
-- Idempotent.

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  slug text not null unique,
  suburbs text[] not null default '{}',
  display_order int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists regions_active_order_idx
  on public.regions (active, display_order, label);

alter table public.regions enable row level security;

drop policy if exists "regions: public read" on public.regions;
create policy "regions: public read" on public.regions
  for select using (true);

drop policy if exists "regions: admin write" on public.regions;
create policy "regions: admin write" on public.regions
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed the six canonical regions with the existing suburb sets from
-- hero-search.tsx. On re-run, on conflict clauses make this idempotent.
insert into public.regions (label, slug, suburbs, display_order) values
  ('Mornington Peninsula', 'mornington-peninsula',
   array['Portsea','Sorrento','Blairgowrie','Rye','Rosebud','Mount Martha','Mornington','Dromana','Red Hill','Flinders','Shoreham','Point Leo'],
   10),
  ('Yarra Valley', 'yarra-valley',
   array['Healesville','Yarra Glen','Coldstream','Yering','Dixons Creek','Warburton','Seville','Gruyere','Wandin'],
   20),
  ('Melbourne & Surrounds', 'melbourne-surrounds',
   array['Melbourne CBD','South Yarra','Toorak','St Kilda','Brighton','Albert Park','Richmond','Fitzroy','Carlton','Port Melbourne'],
   30),
  ('Bellarine Peninsula', 'bellarine-peninsula',
   array['Queenscliff','Point Lonsdale','Ocean Grove','Barwon Heads','Portarlington','St Leonards','Indented Head','Drysdale'],
   40),
  ('Great Ocean Road', 'great-ocean-road',
   array['Lorne','Apollo Bay','Anglesea','Torquay','Aireys Inlet','Kennett River','Wye River']::text[],
   50),
  ('Daylesford', 'daylesford',
   array['Daylesford','Hepburn Springs','Trentham','Clunes','Creswick']::text[],
   60)
on conflict (slug) do nothing;
