# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm` field and lockfile).

- `pnpm dev` — start Next.js dev server (Turbopack).
- `pnpm build` — production build.
- `pnpm start` — run the built app.

No lint, typecheck, or test scripts are defined. Type errors only surface at `pnpm build`.

## Architecture

This is "FCA CRABRAS", a Spanish-language (rioplatense) dashboard for managing a goat dairy (tambo caprino). Stack: **Next.js App Router (Turbopack) + React 19 + TypeScript + Tailwind CSS v4 + Radix UI primitives**. UI in `components/ui/` follows the shadcn convention. Charts use `recharts`; icons use `lucide-react` and `@heroicons/react`. Path alias `@/*` resolves to the repo root.

`next.config.ts` has `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — the shadcn UI suite under `components/ui/` has known Radix + React 19 type frictions, and there's no ESLint config. Production builds intentionally skip both. The app code itself is type-checked when you run the dev server.

### Single-page app, not multi-route

Despite the App Router, the user-facing UI is a single page. `app/page.tsx` is a client component that holds an `active: SectionId` state and swaps between view components from `components/views/*-view.tsx` (rutinas, ordeño, alimentación, limpieza, fichas, asistente). The sidebar (`components/sidebar.tsx`) sets that state. There are no per-section routes. When adding a new section: extend `SectionId` in `components/sidebar.tsx`, add a nav entry there, and add a view + entry in the `content` map in `app/page.tsx`.

Cross-section navigation uses an `onConsult(prompt)` callback that switches to the `asistente` section and seeds the prompt — `AsistenteView` is keyed by the prompt string so it remounts when a new one arrives.

### Data layer: in-memory only, Supabase migration pending

- `lib/data.ts` exports the canonical types (`Cabra`, `EstadoReproductivo`) and a small seed array. `FichasView` reads the seed and stores edits in React state only — nothing is persisted across reloads.
- There used to be `app/api/cabras/*` routes on `better-sqlite3` and a `lib/supabase/cabras.ts` helper, but they were broken and unused. Removed in the Vercel-deploy fix. When you wire up real persistence, recreate the API routes on Supabase (`@supabase/supabase-js`, env vars `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) and have `FichasView` call them instead of mutating local state.
- The Supabase schema (per the prior helper) maps DB column `historial_partos` → `Cabra.historialPartos`. Watch the snake_case ↔ camelCase boundary when rebuilding.

### Assistant (`/api/chat`)

`app/api/chat/route.ts` proxies to the Hugging Face Inference API (`mistralai/Mistral-7B-Instruct-v0.2`) using `HUGGINGFACE_API_KEY`. The system prompt is in Spanish rioplatense and frames the assistant as a tambo caprino advisor. Despite `@ai-sdk/react` / `ai` being in dependencies, this route returns a plain JSON shape `{ choices: [{ message: { content } }] }`, not an SDK-compatible stream — match that shape on the client.

## Conventions

- All UI strings, comments, and assistant prompts are in Spanish. Match that when adding code in views or API responses.
- `.env.example` is stale (lists Postgres + next-auth vars that aren't wired up). The only var actually read by code is `HUGGINGFACE_API_KEY` (must be set in Vercel for `/api/chat` to work). Add Supabase vars when you wire up persistence.
- Tailwind is **v4** — config lives in `app/globals.css` via `@theme inline` and `oklch()` tokens. `postcss.config.mjs` uses `@tailwindcss/postcss`. `tailwind.config.ts` is a v3-style file that v4 ignores by default; if you need its `@tailwindcss/forms` plugin, hook it back with `@config '../tailwind.config.ts'` in the CSS.
- The local `node_modules` setup is unusual: `/Users/agus/` (the developer's home) has a `pnpm-workspace.yaml` that catches this repo as a child workspace. Use `pnpm install --ignore-workspace` when working locally; Vercel runs isolated so it's not affected.
