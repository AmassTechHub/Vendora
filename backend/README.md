# Vendora Backend

Spring Boot backend for Vendora POS.

## Environment

Copy `.env.example` values into your runtime environment:

- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `AUTH_SETUP_ENABLED`
- `AUTH_PUBLIC_SIGNUP_ENABLED`
- `JWT_ACCESS_TOKEN_EXPIRATION`
- `AUTH_REFRESH_TOKEN_EXPIRATION`
- `AUTH_MAX_LOGIN_ATTEMPTS`
- `AUTH_LOCK_MINUTES`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`

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
