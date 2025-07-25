'use client';

import { Suspense } from 'react';
import ItemsClient from '@/components/items/items-client';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';

// Loading component
function ItemsLoading() {
  return <FullScreenLoader message="Loading items..." />;
}

// Client Component with React Query handling server-side caching
export default function ItemsPage() {
  return (
    <Suspense fallback={<ItemsLoading />}>
      <ItemsClient initialItems={[]} initialCategories={[]} />
    </Suspense>
  );
}