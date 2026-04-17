# Lively Rewards — royalty-programs

Guest loyalty portal for [Lively Properties](https://livelyproperties.com.au). Guests sign in, claim their stays via reservation code, earn points, and redeem partner experiences across Victoria. Admins track signups, claims, and redemptions.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** (auth, Postgres, RLS)
- Deploy target: **Vercel**

Reservations live in our own `reservations` table — **not synced from Guesty**. Admin enters them (via Supabase UI for now; admin CRUD page is v2).

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL (http://localhost:3000 for dev)

# 3. Apply schema
# In Supabase SQL editor, run:
#   supabase/migrations/0001_init.sql
#   supabase/seed.sql         (optional dev seed data)

# 4. Run
npm run dev
```

Open http://localhost:3000.

## Making yourself an admin

After signing in for the first time, open the Supabase SQL editor and run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Refresh and you'll see the **Admin** link in the nav.

## Testing the claim flow

The seed script inserts a reservation `LP-DEMO-001` bound to `you@example.com`. To test end-to-end:

1. Change the `guest_email` in the seed SQL to your real email (or run an `update` after seeding).
2. Sign in with that email.
3. Visit `/claim` and enter `LP-DEMO-001`.
4. Points credit and appear on `/profile`.

## Data model

- `profiles` — 1:1 with `auth.users` (trigger creates on signup)
- `properties` — mirrors Guesty properties
- `reservations` — synced from Guesty, keyed by `code`
- `stay_claims` — one-time claim per reservation → credits points
- `experiences` / `partners` / `offers` — redeemable catalogue
- `redemptions` — debit points, generate confirmation code
- `points_ledger` — append-only source of truth; balance via `v_user_points` view

See [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) for the full schema + RLS policies.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/login` | Magic-link sign-in |
| `/auth/callback` | OAuth code exchange |
| `/profile` | Balance, stays, redemptions |
| `/claim` | Enter reservation code |
| `/experiences` | Browse catalogue + offers |
| `/experiences/[id]` | Detail + redeem |
| `/admin` | Dashboard |
| `/admin/users` | User list |
| `/admin/claims` | Claim log |
| `/admin/redemptions` | Redemption log |
| `/admin/experiences` | Experience catalogue (read-only MVP) |

## MVP defaults (change in `.env` / SQL as needed)

- **Points earning**: 1 point per AUD spent (`POINTS_PER_AUD=1`). Computed from `reservations.total_value_cents`.
- **Expiration**: none
- **Reservation match**: strict email match on the `reservations.guest_email` you enter
- **Experience pricing**: admin-set
- **Partner redemption**: guest shows confirmation code (honor system)

## What's next (v2 ideas)

- Admin CRUD UI for reservations, experiences, partners, offers
- Partner logins to mark redemptions `used`
- Klaviyo lifecycle emails (welcome, claim confirmed, "you're X points from Y")
- Referral bonuses + tiered earnings
- Stripe point top-ups or paid-tier experiences

## Deploy

1. Push to GitHub.
2. Connect the repo in Vercel.
3. Add the same env vars from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your prod URL).
4. In Supabase **Auth → URL Configuration**, add your prod URL to redirect allow-list.
