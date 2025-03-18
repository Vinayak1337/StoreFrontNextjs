'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { RootState } from '@/lib/redux/store';
import { AddItemDialog } from '@/components/items/add-item-dialog';
import { EditItemDialog } from '@/components/items/edit-item-dialog';
import { DeleteItemButton } from '@/components/items/delete-item-button';

export default function ItemsPage() {
	const dispatch = useDispatch();
	const { items, loading, error } = useSelector(
		(state: RootState) => state.items
	);

	useEffect(() => {
		dispatch(fetchItems());
	}, [dispatch]);

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 container py-10'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold'>Items</h1>
					<AddItemDialog />
				</div>

				{loading && <p>Loading items...</p>}
				{error && <p className='text-red-500'>Error: {error}</p>}

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{items.map(item => (
						<Card key={item.id} className='overflow-hidden'>
							<CardHeader className='pb-3'>
								<CardTitle>{item.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='grid gap-2'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Price:</span>
										<span className='font-medium'>${item.price}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Quantity:</span>
										<span className='font-medium'>{item.quantity}</span>
									</div>
									{item.weight && (
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>Weight:</span>
											<span className='font-medium'>{item.weight} kg</span>
										</div>
									)}
								</div>
								<div className='flex justify-end gap-2 mt-4'>
									<EditItemDialog item={item} />
									<DeleteItemButton itemId={item.id} itemName={item.name} />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{items.length === 0 && !loading && (
					<div className='text-center py-10'>
						<p className='text-muted-foreground'>
							No items found. Add some items to get started.
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
