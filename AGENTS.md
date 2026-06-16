# AGENTS.md

## Cursor Cloud specific instructions

MedTrack is a Next.js 15 (App Router) + Supabase patient follow-up monitoring app.
Standard scripts live in `package.json` (`pnpm dev`, `pnpm build`, `pnpm lint`,
`pnpm start`); the dev server runs on `:3000` with Turbopack.

Non-obvious things worth knowing:

- **Supabase env vars are committed in `.env`** (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`). These are public client keys protected by Row
  Level Security, so the app runs out of the box. Real secrets, if ever needed, go
  in `.env.local` (gitignored). The Supabase project is `med-monitoring`
  (ref `xlbxsyznlrezbuerqohs`); schema/RLS/seed are applied via SQL migrations.
- **Auth has no SMTP.** A DB `before insert` trigger on `auth.users` auto-confirms
  email, so sign-up immediately allows sign-in. If you ever recreate the Supabase
  project, re-create that trigger or registration will be blocked on email confirmation.
- **shadcn/ui here is the Base UI registry**, not the classic Radix one. Components
  use the `render={<El/>}` prop instead of `asChild`. Do **not** remove the `shadcn`
  package — `src/app/globals.css` imports `shadcn/tailwind.css` from it, and the
  build fails without it.
- **Vercel deploys via git integration.** The Vercel project (`med`) was created
  when the repo was empty, so its Framework Preset is "Other". `vercel.json` forces
  `framework: nextjs`; without it deployments build successfully but every route
  404s. Production deploys from `main`; preview/branch deployments sit behind Vercel
  Authentication (return 401 to the public) — view them while logged into Vercel.
