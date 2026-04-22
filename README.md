# Job Apply Tracking

A responsive Next.js app for tracking job applications with a SQLite database.

## Stack

- Next.js App Router
- React 19
- libSQL / SQLite via `@libsql/client`
- Manifest + service worker PWA setup

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and keep the default local SQLite URL:

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

Local development uses `file:./data/job-tracker.db`, so the database is a real SQLite file stored inside the project.

## Vercel deployment without database reset

Vercel's filesystem is ephemeral, so a SQLite file bundled into the deployment would be recreated or lost between deployments. To prevent resets, this app is wired to use a persistent remote libSQL/SQLite database in production.

Set these environment variables in Vercel:

- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_DATABASE_AUTH_TOKEN`

One common option is [Turso](https://turso.tech/), which provides a hosted SQLite-compatible libSQL database.

The app behavior is:

- Local development: `DATABASE_URL` or fallback `file:./data/job-tracker.db`
- Production / Vercel: `PRODUCTION_DATABASE_URL` + `PRODUCTION_DATABASE_AUTH_TOKEN`

## Validation rules

- `Selected` and `Rejected` require a reason
- `Reason` must be 1000 words or fewer
- Filters support status, company name, and position

## PWA support

This app includes:

- `manifest.webmanifest`
- generated app icons
- a registered service worker in production
- offline-friendly caching for the app shell

For install prompts and service worker behavior, use a production build:

```bash
npm run build
npm run start
```
