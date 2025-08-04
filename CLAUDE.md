# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run build:prod      # Production build with optimizations
npm start               # Start production server
npm run lint            # Run ESLint
npm run clean           # Clean build artifacts and node_modules

# Database
npx prisma migrate dev  # Run database migrations
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open Prisma Studio
```

## Architecture Overview

### Core Stack
- **Next.js 15** with App Router - Server-side rendering by default
- **TypeScript** - Strict type checking throughout
- **Prisma ORM** with PostgreSQL database
- **Shadcn UI** components (Radix UI + Tailwind CSS)
- **Emerald theme** color scheme - primary design color

### Key Architectural Patterns

**Server-First Approach:**
- Pages are server-rendered by default using React Server Components
- Server Actions handle data mutations and form submissions
- Client components only used when interactivity is required
- REST API endpoints exist for client-side data fetching when needed

**Authentication System:**
- Custom session-based auth with middleware protection
- Session data stored in HTTP-only cookies
- Routes protected via `middleware.ts` - redirects to `/login` if unauthenticated
- Root path `/` redirects to `/dashboard` when authenticated

**Data Architecture:**
- No Redux or React Query usage - removed for performance
- Server Actions for mutations, direct Prisma queries for reads
- Client-side API calls only for specific interactive components
- Database indexes optimized for performance

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Protected route groups
│   ├── api/               # REST API endpoints & Server Actions
│   └── globals.css        # Global styles with CSS variables
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI base components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # Session management
│   ├── prisma.ts         # Database client
│   └── utils/            # Helper functions
└── hooks/                # Custom React hooks
```

### Database Schema Notes
- `Order.status` field exists but is currently unused
- Orders serve as bills/receipts directly in the implementation
- Focus on `Item`, `Category`, `Order`, and `OrderItem` models
- Settings table stores store configuration and printer settings

### UI/UX Guidelines
- **Simplicity first** - minimal animations, clean interfaces
- **Emerald color scheme** - use existing CSS custom properties
- **Responsive design** - mobile-first with tablet optimizations
- **Performance optimized** - server rendering, minimal client JS

### Component Patterns
- Server Components by default for static content
- Client Components marked with `'use client'` only when needed
- Form handling via Server Actions, not client-side state
- Toasts via `react-toastify` for user feedback
- Loading states handled at page level with `loading.tsx`

### Authentication Flow
1. Middleware checks for session cookie on all protected routes
2. `/` redirects to `/dashboard` if authenticated, `/login` if not
3. Session verification happens server-side via `verifySession()`
4. Client-side auth state managed by `useAuth()` hook

### Performance Optimizations
- Server rendering eliminates hydration overhead
- Turbopack for fast development builds
- Direct database queries instead of ORM abstractions where needed
- Minimal client-side JavaScript bundle

### Printer Integration
- Bluetooth thermal printer support via Web Bluetooth API
- Auto-connect functionality for saved printers
- Print utilities in `lib/utils/bluetooth/` and `lib/utils/printer-utils.ts`