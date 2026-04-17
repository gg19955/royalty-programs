# Claude project notes — royalty-programs

**Product pivot (2026-04):** this repo started as a guest loyalty portal and is
now evolving into the **Lively platform** — a curated luxury short-stay
marketplace (Lively + invite-only partner properties) with the rewards program
integrated as one feature. See `/Users/gussgroves/.claude/plans/linear-swinging-whistle.md`
for the full phased plan.

- **Phase A — Foundations** (migration 0004, types, host/listing schema) is
  done. The rewards/claim flow still works end-to-end and must keep working
  through Phase D.
- Phase B (browse & discovery — `/stays`) is next.
- Model: OTA (we take payment via Stripe Connect, pay hosts). Estate-agent
  licence covers trust-account plumbing.

See `README.md` for the product/stack overview.

## Key files

- `supabase/migrations/0001_init.sql` — base schema, RLS, helper functions (`public.is_admin()`)
- `supabase/migrations/0004_platform_foundations.sql` — platform pivot (hosts, property listing fields, rate_plans, availability_blocks, reservations→OTA, payouts, stripe_events, reviews, `'host'` role, `'spend_booking'` points event)
- `src/types/db.ts` — Supabase-generated types; regenerate via MCP `generate_typescript_types` after any migration
- `src/app/claim/actions.ts` — `submitClaimRequest` server action (inserts into `claim_requests` for manual admin review)
- `src/app/admin/claim-requests/actions.ts` — `approveClaimRequest` / `rejectClaimRequest` (admin-only; writes `stay_claims` + `points_ledger` on approve)
- `src/app/experiences/[id]/actions.ts` — redeem server action (balance check, ledger-debit)
- `src/lib/supabase/{client,server,admin,middleware}.ts` — Supabase helpers (admin is service-role, server-only)

Pre-platform reservations still flow through **`claim_requests` → admin
approval → ledger credit**. Post-Phase-D platform bookings (`reservations.source
= 'platform_booking'`) will auto-credit on check-out via a scheduled edge
function; legacy Guesty imports keep the manual claim path.

## Invariants — do not break

- Points balance is derived from `points_ledger` (sum of `amount`). **Never store balance as a mutable scalar.**
- `points_ledger` is append-only. Reversing a spend = insert a compensating row; do not `update` or `delete` existing rows.
- Claims are one-per-reservation (unique constraint on `stay_claims.reservation_id`).
- **Legacy/Guesty reservations** keep the manual claim path: guest submits `claim_requests` → admin approves in `/admin/claim-requests` → ledger credit with `event='earn_stay'`.
- **Platform bookings** (`reservations.source = 'platform_booking'`) auto-earn on completion (Phase E edge function) and can spend points at checkout with `event='spend_booking'` + `reservation_id` on the ledger row.
- A property belongs to exactly one host. `properties.host_id` is nullable only for legacy rows; all new listings must reference a `hosts` row.
- A published listing is `properties.listing_status = 'published'` AND `published_at is not null`. Public RLS reads use these fields; legacy rows with `active = true` still render until they migrate.
- Only one offer may have `featured=true AND active=true` (partial unique index in migration 0003).
- Only one property image may have `is_hero=true` (partial unique index `property_images_one_hero_idx`).
- Service-role key is **server-only**. Never import `@/lib/supabase/admin` from a client component.
- RLS is enabled on all user-facing tables. Server actions use the admin client intentionally to insert `stay_claims` / `points_ledger` / `redemptions` rows after validation.

## MVP defaults

- 1 point per AUD spent (`POINTS_PER_AUD=1`). Derived from `reservations.total_value_cents` — value is **required** for a claim to succeed.
- No point expiration
- No stock limits by default (experiences can set one)

## v2 backlog

See the "What's next" section in README.md. Partner logins + Guesty webhook sync + Klaviyo emails are the highest-value next bets.
