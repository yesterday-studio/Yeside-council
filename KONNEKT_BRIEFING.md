# Konnekt Briefing — for Yeside & Co. Council

> **Purpose:** This is the single source of truth the Council (Chair, CEO, COO, CMO, Sales, Distribution, CFO, Social, CPO, CAIO, Policy) draws on for Konnekt facts. Update this file whenever pricing, the stack, or the roadmap changes — then re-sync the relevant lines into each persona's `systemPrompt` in `index.html`.
>
> **Last verified against live codebase:** June 2026

---

## What Konnekt Is

Konnekt.ng is a Nigerian NFC digital business card platform. A user taps their physical card on someone's phone, the visitor lands on a hosted profile page, and their contact details are automatically captured into a CRM lead — no app required on either side. WhatsApp is the primary notification and conversion channel throughout.

**Core loop:** NFC tap → profile page visit → WhatsApp ping to card owner → lead auto-captured to Pipeline CRM → enriched via Abstract API (phone, IP, company).

This is the **primary, flagship venture** of Yeside & Co.'s portfolio.

---

## Pricing (live, current — do not use older ₦3,500 flat figure)

| Plan | Price | Includes |
|---|---|---|
| **Core (Free)** | ₦0/mo | 1 digital profile, basic lead capture, NFC card linking, WhatsApp button, contact exchange |
| **Pro** | ₦3,000/mo | Everything in Core + services/catalogue, testimonials, referral link, basic lead tracking dashboard, advanced analytics, CRM & CSV exports, custom branding themes, premium support |
| **Business** | ₦15,000/mo | Everything in Pro + auto referral message, full lead tracking dashboard, announcement banner, multi-WhatsApp routing, multi-user admin dashboard, team provisioning, WaCRM/Evolution WhatsApp sync, dedicated account ops, bulk NFC card discounts |

**Physical NFC card:** ₦15,000 **one-time** purchase (not a subscription). This is separate from — and coincidentally the same number as — the Business plan's monthly price. Do not conflate the two when discussing revenue or pricing.

---

## Referral / Partner Program

Plan-aware milestone ladder based on **active** referrals:

| Threshold | Tier | Reward |
|---|---|---|
| 1 referral | Starter | Personal invite link unlocked (`konnekt.ng/invite/yourhandle`) |
| 20 referrals | Builder | 3 months free extension on current plan (or 3 months free Pro if on Free) |
| 50 referrals | Champion | 1 year free extension on Business + a physical NFC card shipped |
| 100 referrals | Partner | Konnekt Partner Program — 20% monthly revenue share on every referred user's subscription, for as long as they stay active |

Public application page: `/partners`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Hosting | **Vercel Hobby tier** — hard limits: 12 serverless functions max, 10-second function timeout |
| Database / Auth | Supabase (Postgres + RLS + Realtime) |
| WhatsApp | Evolution API (not Meta's official WhatsApp Business API) |
| Enrichment | Abstract API — phone validation, IP geolocation, company data |
| Payments | Paystack (subscriptions + webhooks) |
| OG/social previews | Custom bot-detection routing in `vercel.json` for rich WhatsApp link previews |

**The single biggest engineering constraint right now:** Vercel Hobby's 10-second timeout has caused recurring "endless spinner" bugs across the app. Fix is enforcing `AbortSignal`/`AbortController` timeouts on every external call (Supabase, Evolution, Abstract API, Paystack) inside every serverless function and every frontend fetch. This is an active, ongoing audit — not yet fully closed out.

The 12-function cap means new API routes must be folded into existing consolidated files (`api/data.ts`, `api/referrals.ts`, `og-image.tsx`, etc.) rather than created as new endpoints.

---

## Current State (as of June 2026)

**Shipped:**
- Abstract API lead enrichment (phone/IP/company) in Pipeline CRM
- Referral/partner program with milestone ladder + public `/partners` page
- Personalised WhatsApp tap notifications with IP-based dedup (30 min window)
- OG image previews fixed for WhatsApp/social link sharing
- Pipeline CRM with enrichment display panels
- Plain-English pricing table with 10-row feature comparison matrix
- Mobile nav rebuilt to include all tabs
- Function consolidation to stay under Vercel's 12-function limit

**Actively in progress:**
- Timeout/AbortSignal audit across all serverless functions (root cause of recurring spinner bugs)
- `whatsapp.ts` → `/api/validate-phone` returning a 500 error — unresolved

**Not yet built (roadmap, not current state):**
- Paystack webhook idempotency hardening
- Multiple cards per user
- Card-level tap analytics
- Lead deduplication, export, tagging
- Referral payouts via Paystack transfers
- Team/org accounts
- Public REST API / Zapier integration

---

## Founder & Team Context

- Solo founder/developer (the only engineer on Konnekt)
- Also runs **Yesterday Studio** (brand/design agency) as a separate revenue stream and Pipeline parallel
- Works iteratively, build-by-build, auditing and patching ZIP exports
- No dedicated ops, sales, or support team — everything routes through the founder personally right now

**Council members should calibrate advice accordingly:** recommendations need to be executable by one person with no team, not strategies that assume a department exists to action them. "Hire someone to do X" is rarely a usable answer at this stage — "automate X" or "do the smallest version of X yourself this week" usually is.

---

## What the Council Should NOT Assume

- Do not cite the old ₦3,500/mo flat pricing or "50 subscribers by September 2026" goal unless the founder reconfirms that target — current reality is the 3-tier Free/₦3K/₦15K structure above.
- Do not assume a sales team, support team, or engineering team beyond the solo founder exists.
- Do not assume Meta's official WhatsApp Business API — it's Evolution API.
- Do not assume unlimited serverless functions — Vercel Hobby's 12-function/10-second limits are a live, binding constraint on every technical recommendation involving new endpoints.
