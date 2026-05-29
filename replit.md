# GenZVerse

The AI-powered social life operating system for Gen Z — combining social networking, personal growth, productivity, AI coaching, communities, and analytics into one universe.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/genzverse run dev` — run the frontend (port 21292, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, wouter, next-themes
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, squads, communities, challenges, activities)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/genzverse/src/` — React frontend
  - `src/context/AuthContext.tsx` — JWT auth context (localStorage: `genzverse_token`)
  - `src/pages/` — all pages (Landing, Login, Signup, Onboarding, Dashboard, etc.)
  - `src/index.css` — theme variables (dark/light mode, Syne + Inter fonts)

## Architecture decisions

- Contract-first: OpenAPI spec gates all codegen; frontend consumes generated React Query hooks only
- JWT auth via simple base64url tokens stored in localStorage (`genzverse_token`)
- Dashboard stats endpoint returns user-specific scores when authenticated, falls back to sample data
- Dark/light mode via next-themes with system detection and localStorage persistence
- All routes behind `/dashboard/*` are protected; unauthenticated users redirect to `/login`

## Product

**Landing Page** — Hero, Features Grid, AI Digital Twin, Social Squads, Life Wrapped, Communities, CTA sections with Framer Motion animations

**Auth** — Signup, Login with JWT token flow; after signup → onboarding if incomplete, else dashboard

**Onboarding** — 4-step wizard: About You, Interests (chip selection), Goals (card selection), Welcome celebration

**Dashboard** — Sidebar nav, Life/Productivity/Social/Learning/Finance/Style score widgets, Recent Activity feed

**Additional Pages** — Squads, Communities, Challenges, AI Companion shell, StyleVerse, Marketplace, Life Wrapped, Profile, Settings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI changes: always run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- Password hashing: SHA-256 with random salt, stored as `hash:salt`
- Array columns in Drizzle: use `.array()` method, e.g. `text("tags").array()`
- Google Fonts `@import` must be the very first line in `index.css`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
