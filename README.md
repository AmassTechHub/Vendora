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
4. Add env vars: `VITE_API_BASE_URL`, `VITE_PAYSTACK_PUBLIC_KEY`

### Backend → Render
1. Push to GitHub
2. New Web Service in Render → connect repo
3. Set root directory to `Pos/backend`
4. Runtime: Docker
5. Add env vars from `.env.example`

## First Login

On first run, visit `/login` → "Create Account" → first account auto-becomes ADMIN.
After that, new accounts require an invite code (generated from Users page).

## Payment Methods

- **Cash** — Direct, no external service needed
- **Mobile Money / Card** — Via Paystack (requires `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`)
