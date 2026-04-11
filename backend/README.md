# Vendora Backend

Spring Boot backend for Vendora POS.

## Environment

### Local (SQLite)

Default profile is `local` — database file `pos.db` in this directory. No extra config.

### Local → Supabase (PostgreSQL)

1. In Supabase: **Project Settings → Database** — copy the **database password** and build a JDBC URL (see comments in `.env.example`).
2. Copy `.env.example` to `.env` in this folder and set `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and a strong `JWT_SECRET`.
3. Run from **this directory**: `mvn spring-boot:run`  
   On startup, `.env` is loaded into JVM properties (real OS environment variables still win over `.env`).

### Render / CI

Set the same variables in the host environment (no `.env` file on the server). See `render.yaml`.

## Run

```bash
mvn spring-boot:run
```

## Build

```bash
mvn -DskipTests compile
```

## Paystack Endpoint

- `POST /api/payments/paystack/verify-and-create`
  - Verifies a Paystack reference server-side
  - Creates and finalizes sale only after successful verification

## Auth Endpoints

- `GET /api/auth/status` -> returns setup/initialization state.
- `POST /api/auth/setup` -> creates first admin account (only when no users exist and `AUTH_SETUP_ENABLED=true`).
- `POST /api/auth/register` -> creates a new account from the login screen.
- `POST /api/auth/login` -> regular login.
- `POST /api/auth/refresh` -> rotates refresh token and returns a new access token.
- `POST /api/auth/logout` -> revokes refresh token.
- `GET /api/auth/me` -> current user profile (requires access token).
- `POST /api/auth/change-password` -> authenticated password change.

## Invite Onboarding

- Admins can generate invite codes from:
  - `POST /api/admin/invites`
- List recent invite codes:
  - `GET /api/admin/invites`
- Registration uses invite code when at least one user already exists.
- If there are no users in the system, first registration auto-creates an `ADMIN`.

## Deployment

- Render backend:
  - Uses `Dockerfile` and `render.yaml` in this directory.
