# StoreFront – Modern POS/Billing & Inventory Management

A fast, modern POS and inventory app built with Next.js App Router and Prisma. Includes drag‑and‑drop item organization, order creation, analytics, and Bluetooth thermal printing.

## Demo

- [![Watch the demo](https://raw.githubusercontent.com/Vinayak1337/StoreFrontNextjs/master/public/demo-thumbnail.png)](https://github.com/Vinayak1337/StoreFrontNextjs/blob/master/demo.mp4)


## Features

- **Dashboard**: Revenue, orders, items-in-stock, retention-like metric, recent orders, and quick actions.
- **Inventory**:
  - Add/Edit/Delete items (price, weight, quantity, in-stock) and manage categories (color, rename, delete).
  - Search, pagination for uncategorized.
  - Drag‑and‑drop items across categories with auto-scroll while dragging.
  - Long‑press/right‑click to enter selection mode; multi‑select and mass move between categories or to uncategorized.
- **Orders**:
  - Create orders with search + category filter, inline quantity controls, customer name, notes, and live totals.
  - View order details (responsive table/cards) and edit existing orders.
  - Bluetooth thermal printing via Web Bluetooth; printer pairing and persisted direct-print support.
- **Analytics**: Daily/weekly/monthly charts, metrics, top items, today stats, loading/empty states.
- **Auth & Security**: Cookie-based sessions, middleware-protected routes, CSRF on mutations, login rate limiting.
- **Performance/UX**: Server actions with cache, Prisma transactions, Suspense loaders, responsive sidebar and tablet navbar, toasts.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Data**: PostgreSQL, Prisma ORM
- **UI**: Tailwind CSS, shadcn/ui (Radix), lucide-react
- **DnD**: react-dnd-multi-backend (HTML5 + touch)
- **Charts**: Recharts-like custom charting in `components/analytics`
- **Printing**: Web Bluetooth (ESC/POS-like, AT POS/Epson/Star paths)

## Key Pages

- `src/app/dashboard/page.tsx`: Metrics, recent orders, quick links.
- `src/app/items/page.tsx`: Inventory with DnD categories, selection mode, add/edit/delete, pagination.
- `src/app/orders/page.tsx`: Orders list with actions (print/delete) and Pair Printer button.
- `src/app/orders/create/page.tsx`: Create order UI with search, category filter, quantities, totals.
- `src/app/orders/[id]/page.tsx`: Order details with responsive layout; print/edit/delete.
- `src/app/orders/[id]/edit/page.tsx`: Edit order client flow.
- `src/app/analytics/page.tsx`: Metrics + interactive chart (daily/weekly/monthly).
- `src/app/settings/page.tsx`: App settings and paired printer persistence.

## Security & Architecture

- **Middleware** (`src/middleware.ts`): Auth gating, redirects, CSRF validation for API mutations, SSR-friendly headers.
- **Auth** (`src/app/api/auth/*`, `src/hooks/use-auth.ts`): Cookie session, verify session, logout; login rate limiting.
- **APIs/Actions**: Items, categories, orders, analytics, and settings via API routes and server actions with caching.

## Bluetooth Thermal Printing

- Pair via Orders page “Pair Printer”.
- Print from order actions; robust service/characteristic discovery and chunked writes.
- Supports common ESC/POS-compatible devices (AT POS, Epson, Star) with fallbacks.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

1. Install dependencies:

```bash
npm install
```

1. Configure environment:

```bash
cp .env.example .env    # ensure DATABASE_URL is set
```

1. Initialize database:

```bash
npx prisma migrate dev
```

1. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

- `src/app/`: App Router pages, API routes, middleware-aware SSR
- `src/components/`: Reusable UI including items DnD, orders, analytics
- `src/lib/`: Prisma, auth, services, utilities (Bluetooth, printing)
- `prisma/`: Schema and migrations
- `public/`: Static assets (includes `demo.mp4`)

## License

MIT
