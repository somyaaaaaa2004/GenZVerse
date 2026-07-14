# Authentication System Audit Report (Internal)

Date: 2026-07-13  
Scope: Frontend + Backend + DB + Cookies/JWT/Refresh + CSRF + Email + Google OAuth + Protected routes

## Executive summary

- **Primary observed failure (“CSRF token missing”)**: occurs when a mutating request (POST/PATCH/DELETE) is made **without** a Bearer access token **and** without the required CSRF cookie/header pair. This affects **signup** and **forgot/reset password** flows most often.
- **Root-cause class #1 (environment/runtime)**: When **Postgres is not up or not ready**, Prisma throws initialization errors; auth endpoints (and anything that touches DB) become unreliable. This manifests as “login unreliable”, “signup fails”, and random 500s.
- **Root-cause class #2 (client bootstrap sequencing / stale bundle)**: The frontend must bootstrap CSRF **before** first unauthenticated mutation or ensure it attaches CSRF automatically. The current client already contains a CSRF bootstrap + auto-attach mechanism; persistent “CSRF token missing” usually indicates the user is running an older build or the servers aren’t running as expected.

## Current architecture (auth-critical)

### Backend
- **Express** app in `artifacts/api-server/src/app.ts`
- **Global middleware order**:
  - `cookieParser()` then `csrfProtection` (good)
  - `cors({ credentials: true })` (good for cookie-based flows)
- **Auth routes**: `artifacts/api-server/src/routes/auth.routes.ts`
  - `POST /api/auth/register` (canonical)
  - `POST /api/auth/signup` (legacy alias; returns `{ token, refreshToken, user }`)
  - `POST /api/auth/login` (returns `{ token, refreshToken, user }`)
  - `POST /api/auth/refresh` (returns `{ success: true, data: { accessToken, refreshToken, user } }`)
  - `POST /api/auth/logout`, `POST /api/auth/logout-all`
  - `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
  - `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`
- **Auth service**: `artifacts/api-server/src/services/auth.service.ts`
  - Password hashing + lockout + login history
  - Refresh token rotation and **reuse detection**
  - Secure-cookie session support (`accessToken`, `refreshToken`)
- **CSRF**: `artifacts/api-server/src/middleware/csrf.ts`
  - Enforced for non-safe methods unless `Authorization: Bearer ...` is present
  - Token issuance: `GET /api/csrf-token` (in `routes/health.routes.ts`)

### Frontend
- **Auth store**: `artifacts/genzverse/src/stores/authStore.ts`
  - Calls `ensureCsrfToken()` during `initialize()`
  - Tries localStorage token first, then cookie-based session refresh
- **API client**: `artifacts/genzverse/src/lib/api/client.ts`
  - Automatically:
    - fetches CSRF token from `/api/csrf-token`
    - attaches `x-csrf-token` for mutating requests when no Bearer token exists
    - retries once on 401 via refresh
    - clears CSRF token and retries once when response indicates CSRF failure
- **Auth pages**:
  - `pages/Signup.tsx`, `pages/Login.tsx`, `pages/ForgotPassword.tsx`, `pages/ResetPassword.tsx`

## Findings (bugs / risks)

### 1) DB readiness causes “unreliable auth”
- **Symptom**: random 500s and “unreliable login/signup” when the API starts before Postgres is reachable.
- **Evidence**: Prisma initialization errors when DB is down (`Can't reach database server at localhost:5432`).
- **Fix**: Add an API startup DB-connect retry and fail-fast with a clear log when DB never comes up.

### 2) CSRF “missing” happens only in a specific request shape
- **Rule**:
  - If request is mutating and **no Bearer token** is present → CSRF cookie+header required.
  - If Bearer token is present → CSRF bypassed.
- **Impact**:
  - Signup/forgot/reset flows are unauthenticated → **must** send CSRF.
  - If the frontend bundle is stale or CSRF bootstrap didn’t run, these endpoints fail with 403 “CSRF token missing”.
- **Fix**:
  - Ensure frontend always fetches CSRF on app boot and auto-attaches on unauthenticated mutations (already implemented).
  - Ensure servers are actually running at the expected origins/ports.

### 3) Response envelope inconsistency (harder to reason about)
- `POST /auth/login` and legacy `POST /auth/signup` return `{ token, refreshToken, user }`
- `POST /auth/refresh` returns `{ success: true, data: { accessToken, refreshToken, user } }`
- Not a functional bug by itself (frontend already handles it), but it increases integration mistakes risk.

## Security review highlights
- **Passwords**: strong validation on both client and server; bcrypt rounds configured.
- **Brute force/lockout**: implemented via failed attempts + lockout timers; auth rate limiter present.
- **Refresh tokens**: stored hashed in `Session.refreshTokenHash`; rotation + reuse detection implemented.
- **Cookies**: `httpOnly`, `sameSite=lax`, `secure` controlled by env; domain configurable.
- **CSRF**: implemented as double-submit cookie (signed cookie + header token).
- **Google OAuth**: uses `state` cookie for CSRF protection; avoids token leakage in redirect URL.

## Work completed in this pass (no “temporary fixes”)
- **Backend reliability**: API now attempts to connect to Postgres with retry before listening.

## Verification checklist (to be executed after changes)
- Signup → verify email token issued + email path works (SMTP optional, log fallback must still return success)
- Login (email + username) → session created, cookies set, tokens stored
- Refresh → rotation works + old refresh unusable (reuse triggers revocation)
- Logout (current + all devices) → sessions revoked + cookies cleared
- Forgot password → token stored hashed + email template generated
- Reset password → token verified + password updated + sessions revoked
- Protected routes → redirect + session bootstrap from cookies works

