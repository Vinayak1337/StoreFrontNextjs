# StoreFront - Modern Point of Sale System

StoreFront is a modern, responsive point of sale (POS) system built with Next.js, TypeScript, and Shadcn UI components. It's designed to help small businesses manage their inventory, orders, and sales analytics.

## Features

- **Dashboard**: Get a quick overview of your store's performance with key metrics and charts
- **Inventory Management**: Add, edit, and delete items in your inventory
- **Order Processing**: Create and manage customer orders
- **Billing**: Generate bills for completed orders
- **Analytics**: View sales data and performance metrics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn UI (built on Radix UI)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API Mocking**: Mock Service Worker (MSW)

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

### Mock API

This project uses Mock Service Worker (MSW) to simulate API responses during development. The mock data is defined in `mocks/handlers.ts`.

### Project Structure

- `app/`: Next.js app router pages
- `components/`: Reusable UI components
- `lib/`: Utility functions and Redux store
- `mocks/`: MSW configuration for API mocking
- `public/`: Static assets
- `services/`: API service configuration
- `types/`: TypeScript type definitions

## License

MIT
