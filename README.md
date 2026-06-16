# MedTrack — Patient Follow-up Monitoring

A focused MVP for remote patient follow-up monitoring:

> Doctor is assigned a monitoring plan → Patient enters daily vitals → Doctor reviews trends, gets alerts, and chats with the patient.

It is intentionally **not** a full hospital EMR. It does one thing well: condition-based
vitals follow-up with trends, automatic alerts, real-time chat, and clinical notes.

## Features

- **Auth & roles** — register/login as a *patient* or *doctor* (Supabase Auth).
- **Template-driven vitals** — vitals are **not hardcoded**. Each condition type
  (Diabetes, Hypertension, COPD, Post-Surgery, General) maps to its own set of
  vital templates with units and safe ranges.
- **Patient** — create condition/monitoring plans, assign a doctor, log vitals,
  view 7/30/90-day trend charts.
- **Doctor** — see assigned patients, review latest readings and trends, add
  clinical notes, chat.
- **Automatic alerts** — a database trigger raises `warning`/`critical` alerts
  when a reading falls outside its template range.
- **Real-time chat** — patient ↔ doctor messaging per condition via Supabase Realtime.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (Base UI)
- Supabase (Postgres + Auth + Realtime), with Row Level Security on every table
- Recharts for trend charts

## Getting started

```bash
pnpm install
pnpm dev
```

The app reads Supabase credentials from `.env` (committed; the anon/publishable key
is a public client key protected by RLS). To point at your own project, copy
`.env.example` to `.env.local` and fill in your values.

## Database

The schema lives in Supabase migrations (`profiles`, `conditions`, `vital_templates`,
`condition_vitals`, `vital_entries`, `chats`, `clinical_notes`, `alerts`). Access is
governed by RLS so patients only see their own data and doctors only see the patients
assigned to them.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) on `:3000` |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
