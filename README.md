# DishTok Platform

A merchant-facing web app that transforms restaurant websites into modern ordering, reservation, and payment platforms. Powered by DishTok / 吃什么, a food-focused short-form social media platform.

## Features

- **Conditional AI-Generated Transformation**: Built-in demo links stay on the static Son Cubano experience, while pasted restaurant URLs generate a bounded AI-driven restaurant page from live public site facts
- **Before/After Comparison**: Interactive slider comparing original vs. transformed sites
- **Preset Theme Switching**: Instantly preview three curated restaurant color systems without regenerating the site
- **Snapshot-Powered Generated Routes**: User-submitted sites persist to filesystem snapshots and reload at unique `/demo/[slug]` URLs
- **Online Ordering**: Full menu with cart, quantity management, and add-ons
- **Reservations**: Date/time picker, party size, and confirmation system
- **Stripe Payments**: Test-mode checkout (works without Stripe keys in demo mode)
- **DishTok Integration**: "Why Choose Us" section showcasing the DishTok food community
- **Editorial Visual Refresh**: Image-led landing page, richer transformed preview, and a signature gallery on the restaurant site
- **Responsive Design**: Mobile-first with floating cart button and adaptive layouts
- **Animations**: Framer Motion page transitions, scroll reveals, and interactive elements

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** + shadcn/ui
- **Framer Motion** for animations
- **OpenAI SDK** for generated restaurant page schemas
- **Cheerio** for bounded same-origin source extraction
- **Stripe** for payments (test mode)
- **Zod** for API validation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Demo Flow

1. Landing page -> Click `Try Demo` or enter a restaurant URL
2. `/demo?url=demo` -> Existing Son Cubano demo flow with the static preview and `/demo/son-cubano?theme=...` full-site route
3. `/demo?url=https://restaurant-site.example` -> AI-generated transform flow:
   - crawl up to 4 same-origin pages
   - extract public facts only
   - generate a validated JSON page schema
   - persist a snapshot
   - preview and open a unique `/demo/[slug]?theme=...` route
4. `/demo/[generated-slug]?theme=terracotta-sunset` -> Generated full restaurant experience loaded from the saved snapshot

## Environment Variables (Optional)

Create `.env.local` for Stripe and AI integration:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
TRANSFORM_STORE_DIR=/tmp/dishtok-transforms
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Without `OPENAI_API_KEY`, the `/api/transform` route still creates a generated snapshot, but falls back to deterministic facts-safe content and the default preset theme.

`TRANSFORM_STORE_DIR` defaults to `/tmp/dishtok-transforms` and stores generated user-site snapshots for 24 hours.

Without Stripe keys, checkout simulates success automatically.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/dishtok-platform)
