# Architecture Audit Report

## Current Architecture
- Monorepo with pnpm workspaces: frontend apps in `artifacts/*`, backend in `artifacts/api-server`, shared libs in `lib/*`.
- Runtime stack already aligns in large part with production goals:
  - Frontend: React + TypeScript + Tailwind + Framer Motion + React Query.
  - Backend: Node.js + Express + TypeScript.
  - Database/ORM: PostgreSQL + Prisma (active runtime).
- API is modular by route groups (`auth`, `user`, `dashboard`, `data`, `profile`, `ai`) with service layer usage.

## Existing Frontend Framework
- Primary app: `artifacts/genzverse`.
- Uses `react-router-dom` for routing, Zustand store for auth state, TanStack React Query for data fetching.
- Component system includes reusable UI primitives in `artifacts/genzverse/src/components/ui`.

## Existing Backend
- Express app with:
  - `helmet`, CORS controls, compression, rate limiting.
  - auth middleware, CSRF middleware, centralized error handler.
  - service modules for auth, profile, storage, email, audit logging.
- JWT + refresh tokens with session persistence in database.

## Existing Database
- Prisma schema at `lib/db/prisma/schema.prisma` with extensive domain models:
  - users, sessions, friends/friend-requests, communities/members, challenges/progress,
    notifications, messages, achievements, xp history, leaderboard, reports,
    activities, settings, login history, invites, system/audit logs.
- Foreign keys and indexes are present across major relations.

## Dead / Duplicate Code
- Legacy Drizzle schema layer still exists under `lib/db/src/schema/*` and is inconsistent with Prisma UUID model.
- Contract duplication/drift between runtime API behavior and `lib/api-spec/openapi.yaml` + generated zod artifacts.
- Duplicate UI primitive sets also exist in `artifacts/mockup-sandbox`.

## Components To Reuse
- `artifacts/genzverse/src/components/layout/*` (layout shell).
- `artifacts/genzverse/src/components/ui/*` actively used primitives.
- Backend middleware/services: auth, validation, error handling, audit logging, storage abstraction.
- Prisma data model as the source of truth.

## Components To Delete
- Marketplace feature references: no active Marketplace route/module found in runtime app.
- Remove legacy/stale references to Marketplace text where present in docs/copy only.
- Plan retirement of legacy Drizzle schema path once Prisma-only migration is complete.

## Components Needing Refactor
- Auth/OAuth hardening (token/session consistency, OAuth state validation, no URL token leakage).
- API contract alignment (OpenAPI vs runtime responses and models).
- Pagination/response envelope consistency across data endpoints.
- Replace static or placeholder-only UI/data flows with backend-backed data or remove route.

## Immediate Production Refactor Plan (Phase 1)
1. Security and auth correctness fixes (high priority).
2. Remove/retire mock/static response paths in backend and frontend.
3. Align API contracts and validators with real runtime behavior.
4. Consolidate to Prisma-only schema ownership.
5. Remove unused/duplicate components and sandbox duplication.

This report is the baseline for the production migration.
