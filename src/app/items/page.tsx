'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { AddItemDialog } from '@/components/items/add-item-dialog';
import { EditItemDialog } from '@/components/items/edit-item-dialog';
import { DeleteItemButton } from '@/components/items/delete-item-button';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Search } from 'lucide-react';

export default function ItemsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const { items, loading, error } = useSelector(
		(state: RootState) => state.items
	);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterLowStock, setFilterLowStock] = useState(false);

	useEffect(() => {
		dispatch(fetchItems());
	}, [dispatch]);

	// Filter items based on search term and low stock filter
	const filteredItems = items.filter(item => {
		const matchesSearch = item.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesLowStock = !filterLowStock || item.quantity < 10;
		return matchesSearch && matchesLowStock;
	});

	// Check if an item has low stock
	const isLowStock = (quantity: number) => quantity < 10;

	return (
		<div className='flex min-h-screen flex-col'>
			<Header />
			<main className='flex-1 container py-10'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold'>Items</h1>
					<AddItemDialog />
				</div>

				<div className='flex items-center justify-between mb-6'>
					<div className='relative w-64'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<input
							type='search'
							placeholder='Search items...'
							className='w-full rounded-md border border-input bg-background pl-8 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						variant={filterLowStock ? 'default' : 'outline'}
						onClick={() => setFilterLowStock(!filterLowStock)}
						className='flex items-center gap-2'>
						<AlertTriangle className='h-4 w-4' />
						{filterLowStock ? 'Showing Low Stock Only' : 'Show Low Stock'}
					</Button>
				</div>

				{loading && (
					<div className='flex justify-center items-center py-10'>
						<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
					</div>
				)}

				{error && (
					<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
						<p>Error: {error}</p>
					</div>
				)}

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{filteredItems.map(item => (
						<Card
							key={item.id}
							className={`overflow-hidden ${
								isLowStock(item.quantity)
									? 'border-red-300 animate-pulse-subtle'
									: ''
							}`}>
							<CardHeader className='pb-3 flex flex-row items-center justify-between'>
								<CardTitle>{item.name}</CardTitle>
								{isLowStock(item.quantity) && (
									<Badge variant='destructive' className='ml-2'>
										Low Stock
									</Badge>
								)}
							</CardHeader>
							<CardContent>
								<div className='grid gap-2'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Price:</span>
										<span className='font-medium'>
											${item.price.toFixed(2)}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Quantity:</span>
										<span
											className={`font-medium ${
												isLowStock(item.quantity)
													? 'text-red-600 font-bold'
													: ''
											}`}>
											{item.quantity} {isLowStock(item.quantity) && '(Low)'}
										</span>
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

				{filteredItems.length === 0 && !loading && (
					<div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
						<Package className='h-12 w-12 mb-3 opacity-20' />
						<p className='text-lg font-medium'>No items found</p>
						<p className='text-sm mt-1'>
							{searchTerm || filterLowStock
								? 'Try adjusting your filters'
								: 'Add some items to get started'}
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
