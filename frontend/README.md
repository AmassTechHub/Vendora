# Vendora Frontend

Vendora is a retail POS frontend built with React + Vite.

## Setup

1. Copy `.env.example` to `.env`.
2. Set:
   - `VITE_API_BASE_URL`
   - `VITE_PAYSTACK_PUBLIC_KEY`
3. Install dependencies:
   - `npm install`
4. Start:
   - `npm run dev`

## Build

- `npm run build`

## Paystack Flow

- Cash payments continue to use direct checkout.
- Card and Mobile Money now use Paystack popup, then backend verification (`/api/payments/paystack/verify-and-create`) before sale is finalized.

## Invite-Based Account Creation

- New users create accounts from login screen.
- If system already has users, invite code is required.
- Admins generate invite codes from **Users** page.

## Vercel Deployment

- `vercel.json` is included for SPA routing.
- Configure:
  - `VITE_API_BASE_URL`
  - `VITE_PAYSTACK_PUBLIC_KEY`
