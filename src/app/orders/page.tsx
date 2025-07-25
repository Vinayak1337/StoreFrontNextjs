'use client';

import { Suspense } from 'react';
import OrdersClient from '@/components/orders/orders-client';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';

// Loading component
function OrdersLoading() {
  return <FullScreenLoader message="Loading orders..." />;
}

// Client Component with React Query handling server-side caching
export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersClient initialOrders={[]} />
    </Suspense>
  );
}