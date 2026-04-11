# Vendora POS

A full-featured Point of Sale system built with React + Spring Boot.

## Project Structure

```
Pos/
├── frontend/     React + Vite + Tailwind CSS  → Deploy to Vercel
└── backend/      Spring Boot + Java 17         → Deploy to Render
```

## Who Has Access

| Feature | ADMIN | MANAGER | CASHIER |
|---|---|---|---|
| Dashboard & Analytics | ✅ | ✅ | ❌ |
| Cashier (POS) | ✅ | ✅ | ✅ |
| Sales History | ✅ | ✅ | ✅ (own) |
| Shifts | ✅ | ✅ | ✅ |
| Products | ✅ | ✅ | ❌ |
| Suppliers | ✅ | ✅ | ❌ |
| Customers | ✅ | ✅ | ❌ |
| Refunds | ✅ | ✅ | ❌ |
| Expenses | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |
| My Account | ✅ | ✅ | ✅ |

## Features

- **Cashier** — Product search, barcode scan, cart, discounts, Paystack payments (card/mobile money), receipt printing
- **Dashboard** — Real-time KPIs, revenue charts, top products, low stock alerts
- **Products** — CRUD, stock adjustment with reason tracking, low stock alerts
- **Suppliers** — Manage vendors and contact info
- **Customers** — Customer profiles, loyalty points, purchase history
- **Sales** — Full transaction history with receipt viewer
- **Refunds** — Process returns, restore stock automatically
- **Expenses** — Track operational costs by category
- **Shifts** — Start/end shifts, cash reconciliation, variance tracking
- **Reports** — Daily/weekly/date range analytics, inventory reports
- **Users** — Role-based access (ADMIN/MANAGER/CASHIER), invite codes
- **Audit Logs** — Full action trail
- **Dark Mode** — Toggle in sidebar

## Quick Start

### Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL and VITE_PAYSTACK_PUBLIC_KEY
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
# Set your database and JWT credentials
mvn spring-boot:run
```

## Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Set root directory to `Pos/frontend`
4. **Required:** `VITE_API_BASE_URL` = your Render API base including `/api`, e.g. `https://your-service.onrender.com/api` (if this is missing, the app calls localhost and every screen fails).
5. `VITE_PAYSTACK_PUBLIC_KEY` (optional, for card/mobile money)

### Backend → Render
1. Push to GitHub
2. New Web Service in Render → connect repo
3. Set root directory to `Pos/backend`
4. Runtime: Docker
5. Env vars from `backend/.env.example`, especially `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_*`, `JWT_SECRET`, and **`CORS_ALLOWED_ORIGINS`** including your exact Vercel URL (e.g. `https://vendora-afrik.vercel.app`). Production also allows `https://*.vercel.app` via `CORS_ALLOWED_ORIGIN_PATTERNS` for preview deployments.

## First Login

On first run, visit `/login` → "Create Account" → first account auto-becomes ADMIN.
After that, new accounts require an invite code (generated from Users page).

## Demo / presentation data (optional)

After the API and database work, you can add sample suppliers, customers, and products by running `scripts/demo-seed-postgres.sql` once in the Supabase SQL editor (or any PostgreSQL client). For a live demo with the lecturer, pre-seeded data avoids empty screens; adding one customer on the spot also shows the UI clearly.

## Payment Methods

- **Cash** — Direct, no external service needed
- **Mobile Money / Card** — Via Paystack (requires `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`)
