# KlaroCRM

Enterprise-grade Web-CRM scaffold for German SMEs built with Next.js App Router, Supabase, shadcn/ui, Google Calendar sync, and React PDF.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth, Postgres, Storage
- Google Calendar OAuth + incremental sync
- React PDF for offers and invoices
- Vercel deployment targeting `fra1`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Optional: initialize Supabase locally and apply migrations:

```bash
npx supabase start
npx supabase db reset
```

## Scripts

- `npm run dev` starts the app
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting
- `npm run test` runs Vitest
- `npm run build` verifies the production build
- `npm run format` runs Prettier

## Notes

- If Supabase env vars are missing, the app falls back to demo data so the UI scaffold still renders.
- The schema, RLS policies, custom access-token hook, and storage policies live in [`supabase/migrations/202604050001_initial_schema.sql`](/c:/Users/Malte/Desktop/2026/supabase/migrations/202604050001_initial_schema.sql).
- Google Calendar sync expects service-role access plus `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALENDAR_WEBHOOK_SECRET`.
- The document module stores EN 16931 placeholder payloads now; ZUGFeRD/XRechnung XML export is intentionally left for a later phase.
"# 05.04.2026" 
