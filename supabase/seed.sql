-- Dev seed data. Run after migration, then sign in with an email and
-- update your own profile role to 'admin' to access /admin.

insert into public.partners (name, website, contact_email) values
  ('Yarra Valley Cellars', 'https://example.com', 'partners@example.com'),
  ('Great Ocean Kayak Co.', 'https://example.com', 'partners@example.com'),
  ('Mornington Peninsula Spa', 'https://example.com', 'partners@example.com')
on conflict do nothing;

insert into public.experiences (partner_id, title, description, region, points_cost, image_url)
select p.id, 'Private cellar door tasting', 'A curated 90-minute tasting for two at a boutique Yarra Valley winery.', 'Yarra Valley', 800,
       'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
from public.partners p where p.name = 'Yarra Valley Cellars'
on conflict do nothing;

insert into public.experiences (partner_id, title, description, region, points_cost, image_url)
select p.id, 'Half-day sea kayaking', 'Guided kayak tour along the Great Ocean coast — gear included.', 'Great Ocean Road', 1200,
       'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800'
from public.partners p where p.name = 'Great Ocean Kayak Co.'
on conflict do nothing;

insert into public.experiences (partner_id, title, description, region, points_cost, image_url)
select p.id, 'Hot springs & massage', '2hr hot springs entry + 30min massage on the Mornington Peninsula.', 'Mornington Peninsula', 1500,
       'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
from public.partners p where p.name = 'Mornington Peninsula Spa'
on conflict do nothing;

insert into public.offers (title, description, cta_label, cta_url) values
  ('20% off midweek stays in May', 'Book any midweek stay in May and save 20%. Use code MIDWEEK20.',
   'Book now', 'https://livelyproperties.com.au')
on conflict do nothing;

-- Example reservation (use this code for dev testing)
insert into public.reservations (code, guest_email, guest_name, check_in, check_out, total_value_cents)
values ('LP-DEMO-001', 'you@example.com', 'Demo Guest', current_date - 7, current_date - 4, 120000)
on conflict (code) do nothing;
