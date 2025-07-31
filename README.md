# StoreFront - Modern Point of Sale System

StoreFront is a modern, responsive point of sale (POS) system built with Next.js, TypeScript, and Shadcn UI components. It's designed to help small businesses manage their inventory, orders, and sales analytics.

## Features

- **Dashboard**: Get a quick overview of your store's performance with key metrics and charts
- **Inventory Management**: Add, edit, and delete items in your inventory with categories
- **Order Processing**: Create and manage customer orders (orders serve as bills directly)
- **Analytics**: View sales data and performance metrics
- **Modern UI**: Clean emerald-themed interface with responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS with Emerald theme
- **Charts**: Recharts
- **Authentication**: Built-in session management
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Database

This project uses PostgreSQL with Prisma ORM for data management. Run `npx prisma migrate dev` to set up the database schema.

### Project Structure

- `src/app/`: Next.js app router pages and API routes
- `src/components/`: Reusable UI components
- `src/lib/`: Utility functions and database configuration
- `public/`: Static assets
- `prisma/`: Database schema and migrations
- `src/types/`: TypeScript type definitions

## License

MIT
