# 0005 — WhatsApp checkout for the MVP

- Status: Accepted (2026-11-01)

## Context

Village sellers already sell through WhatsApp. A payment gateway (Midtrans/Xendit) needs a legal entity, merchant KYC,
split payouts, refunds and shipping — impossible before 2026-12-11 and HIMA is not a legal entity.

## Decision

The MVP is a catalogue. "Order via WhatsApp" opens `wa.me/<number>?text=<prefilled message>`; marketplace links
(Shopee, Tokopedia, TikTok Shop) are shown when the seller has them. Clicks are counted in `analytics_events`.

## Consequences

- No order, payment or shipping tables in the MVP; prices are integers ready for orders later.
- Impact is measured by views and WhatsApp clicks.
- Phase 3 prerequisites: legal entity (foundation/cooperative/company or via BUMDes), merchant onboarding,
  split payment design, idempotent webhooks, refund policy, Vercel Pro.
