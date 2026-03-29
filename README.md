# HotWheels Baku

Production-ready starter for a Hot Wheels marketplace focused only on Baku, Azerbaijan. The stack is tuned for real development on Next.js, PostgreSQL, Prisma, NextAuth, Redis-compatible caching, Telegram-based moderation, and cheap deployment on Render.

## Stack

- Next.js 15 + React 19 + TypeScript: SSR, routing, API handlers, strong typing.
- Prisma + PostgreSQL: clean relational model for listings, roles, chat, moderation, bans, and logs.
- NextAuth: Google OAuth and email/password auth in one flow.
- Upstash Redis: lightweight cache and rate limiting that works well with free hosting.
- Tailwind CSS + custom component layer: modern UI without heavy runtime cost.
- Telegram Bot API: external moderation commands and inline review buttons.
- Render + optional Docker: low-cost deploy path with straightforward env management.

## Core features

- Baku-only marketplace scope.
- Hot Wheels-only catalog with search, filters, sorting, pagination, favorites.
- Listing lifecycle: pending, approved, rejected, banned, archived.
- User profile with numeric universal ID.
- Admin panel and moderator panel.
- User bans, listing bans, moderation logs, Telegram command logs.
- Basic buyer/seller conversations.
- Local uploads or S3-compatible object storage.
- SEO helpers: metadata, Open Graph, sitemap, robots.txt, schema markup.

## Environment

Copy `.env.example` to `.env` and fill:

- `DATABASE_URL`, `DIRECT_DATABASE_URL`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_TELEGRAM_PUBLIC_BOT_URL`, `TELEGRAM_PUBLIC_BOT_USERNAME`, `TELEGRAM_PUBLIC_BOT_TOKEN`
- `TELEGRAM_MOD_BOT_TOKEN`, `TELEGRAM_MOD_ALLOWED_USER_ID`, `TELEGRAM_MOD_CHAT_ID`, `TELEGRAM_MOD_WEBHOOK_SECRET`
- `CRYPTOBOT_API_TOKEN`, `CRYPTOBOT_COMMISSION_AMOUNT_USD`, `LISTING_CONTACT_COMMISSION_AZN`, `PLATFORM_OWNER_TELEGRAM_USERNAME`
- `TELEGRAM_AUTO_START`, `TELEGRAM_BOT_MODE`, `TELEGRAM_WEBHOOK_URL`
- `STORAGE_MODE` plus S3 variables if you do not want local uploads
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

Production URL used in this project:

- `https://hotwheels-i8pm.onrender.com`
- Google OAuth callback: `https://hotwheels-i8pm.onrender.com/api/auth/callback/google`
- Telegram webhook base: `https://hotwheels-i8pm.onrender.com`

## Local run

1. `npm install`
2. `npm run prisma:generate`
3. `npm run prisma:migrate`
4. `npm run prisma:seed`
5. `npm run dev`

Telegram bot startup is automatic together with the app:

- `TELEGRAM_BOT_MODE=auto`: polling locally, webhook on public deployments.
- `TELEGRAM_BOT_MODE=polling`: the site starts the bot with long polling.
- `TELEGRAM_BOT_MODE=webhook`: the site registers `/api/telegram/webhook` on startup.
- `TELEGRAM_AUTO_START=false`: disables bot startup.
- The app auto-starts both Telegram bots when the tokens are configured.
- Public bot webhook route: `/api/telegram/public-webhook`
- Moderation bot webhook route: `/api/telegram/webhook`

## Telegram commands

- `/grant_moderator <userUniversalId>`
- `/revoke_moderator <userUniversalId>`
- `/grant_admin <userUniversalId>`
- `/revoke_admin <userUniversalId>`
- `/ban_user <userUniversalId> <reason>`
- `/unban_user <userUniversalId> <reason>`
- `/listings`
- `/listing <listingId>`
- `/listing_approve <listingId>`
- `/listing_reject <listingId> <reason>`
- `/listing_ban <listingId> <reason>`
- `/listing_unban <listingId> <reason>`

## Public bot flow

- `/start` opens the public menu.
- `Разместить объявление` launches the guided posting flow with photo, title, series, year, price and description.
- `Найти продавца` or `/listing <listingId>` opens the contact-unlock flow.
- The bot shows a 1 AZN commission notice before contact reveal.
- `Оплатить через CryptoBot` creates a CryptoBot invoice.
- `Проверить оплату` verifies the invoice and reveals the seller contact after successful payment.
- `Оплата владельцу (он вернет)` shows the owner Telegram username for manual refund handling.

## Render notes

- `render.yaml` creates the Node web service and PostgreSQL database.
- Redis is expected through Upstash env vars to stay friendly to free hosting.
- Health endpoint: `/api/health`
- Start command runs `prisma migrate deploy` before boot.

## Cloudflare and performance

- Put Cloudflare in front of Render and enable proxy mode for your custom domain.
- Cache static assets aggressively in Cloudflare and keep HTML on standard caching unless you add page rules.
- Enable Brotli, HTTP/3 and Auto Minify in Cloudflare.
- Keep PostgreSQL on Render or a managed provider with a region close to Render to reduce latency.
- Use `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for cache/rate limit without a heavy Redis server.
- Keep image uploads on local storage only for testing; for production, prefer S3-compatible storage plus Cloudflare CDN.

## Project map

```text
src/
  app/                App Router pages and API handlers
  components/         UI, forms, listing cards, dashboards
  lib/
    services/         Domain services
    telegram/         Bot integration helpers
    validations/      Zod schemas
prisma/               Schema and seed
render.yaml           Render blueprint
Dockerfile            Container deployment
```

## Notes

- By default, role changes from the admin web UI are disabled unless `ALLOW_WEB_ROLE_MANAGEMENT=true`.
- Moderator role flow is designed to work safely through Telegram using a single trusted Telegram user ID.
- Homepage and catalog queries are intentionally simple and cacheable to survive free-tier cold starts.
