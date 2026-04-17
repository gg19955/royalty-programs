# Claude project notes — royalty-programs

Loyalty/rewards portal for Lively Properties short stays. See `README.md` for the product/stack overview.

## Key files

- `supabase/migrations/0001_init.sql` — full schema, RLS, helper functions
- `src/app/claim/actions.ts` — stay-claim server action (strict email match, ledger-credit)
- `src/app/experiences/[id]/actions.ts` — redeem server action (balance check, ledger-debit)
- `src/lib/supabase/{client,server,admin,middleware}.ts` — Supabase helpers (admin is service-role, server-only)
- `src/lib/guesty.ts` — Guesty API wrapper (MVP uses synced `reservations` table rather than live lookup)

## Invariants — do not break

- Points balance is derived from `points_ledger` (sum of `amount`). **Never store balance as a mutable scalar.**
- Claims are one-per-reservation (unique constraint on `stay_claims.reservation_id`).
- Strict email match in claim flow (`guest_email` on reservation vs signed-in user). Admin override path is separate.
- Service-role key is **server-only**. Never import `@/lib/supabase/admin` from a client component.
- RLS is enabled on all user-facing tables. Server actions use the admin client intentionally to insert `stay_claims` / `points_ledger` / `redemptions` rows after validation.

## MVP defaults

- 100 points per night (`POINTS_PER_NIGHT` env)
- No point expiration
- No stock limits by default (experiences can set one)

## v2 backlog

See the "What's next" section in README.md. Partner logins + Guesty webhook sync + Klaviyo emails are the highest-value next bets.
