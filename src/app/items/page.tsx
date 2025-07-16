'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
	const [filterOutOfStock, setFilterOutOfStock] = useState(false);

	useEffect(() => {
		dispatch(fetchItems());
	}, [dispatch]);

	// Filter items based on search term and stock filter
	const filteredItems = items.filter(item => {
		const matchesSearch = item.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesStockFilter = !filterOutOfStock || !item.inStock;
		return matchesSearch && matchesStockFilter;
	});

	// Helper to ensure price is a number before formatting
	const formatPrice = (price: string | number | unknown) => {
		if (typeof price === 'number') {
			return `₹${price.toFixed(2)}`;
		}
		if (typeof price === 'string') {
			return `₹${parseFloat(price).toFixed(2)}`;
		}
		return '₹0.00';
	};

	return (
		<div className='flex min-h-screen flex-col'>
			<main className='flex-1 container py-6 md:py-10 px-4 md:px-8'>
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-4'>
					<h1 className='text-2xl md:text-3xl font-bold'>Items</h1>
					<AddItemDialog />
				</div>

				<div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 md:mb-6 gap-4'>
					<div className='relative w-full sm:w-64 md:w-80'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<input
							type='search'
							placeholder='Search items...'
							className='w-full rounded-md border border-input bg-background pl-8 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						variant={filterOutOfStock ? 'default' : 'outline'}
						onClick={() => setFilterOutOfStock(!filterOutOfStock)}
						className='flex items-center gap-2 w-full sm:w-auto justify-center'>
						<AlertTriangle className='h-4 w-4' />
						<span className='hidden sm:inline'>
							{filterOutOfStock
								? 'Showing Out of Stock Only'
								: 'Show Out of Stock'}
						</span>
						<span className='sm:hidden'>
							{filterOutOfStock ? 'Out of Stock' : 'Filter Stock'}
						</span>
					</Button>
				</div>

				{loading && (
					<div className='flex justify-center items-center py-10'>
						<div className='flex items-center space-x-2'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
							<span className='text-muted-foreground'>Loading items...</span>
						</div>
					</div>
				)}

				{error && (
					<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6'>
						<p>Error: {error}</p>
					</div>
				)}

				<div className='grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{filteredItems.map(item => (
						<Card
							key={item.id}
							className={`overflow-hidden transition-all hover:shadow-md ${
								!item.inStock ? 'border-red-300 animate-pulse-subtle' : ''
							}`}>
							<CardHeader className='pb-3 flex flex-row items-center justify-between space-y-0'>
								<CardTitle className='text-base md:text-lg truncate flex-1 mr-2'>{item.name}</CardTitle>
								{!item.inStock && (
									<Badge variant='destructive' className='text-xs flex-shrink-0'>
										Out of Stock
									</Badge>
								)}
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='grid gap-2'>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Price:</span>
										<span className='font-medium text-sm md:text-base'>
											{formatPrice(item.price)}
										</span>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Quantity:</span>
										<span className='font-medium text-sm md:text-base'>{item.quantity}</span>
									</div>
									{item.weight && (
										<div className='flex justify-between items-center'>
											<span className='text-sm text-muted-foreground'>Weight:</span>
											<span className='font-medium text-sm md:text-base'>
												{item.weight} {item.weightUnit || 'kg'}
											</span>
										</div>
									)}
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Status:</span>
										<span
											className={`font-medium text-sm md:text-base ${
												!item.inStock
													? 'text-red-600 font-bold'
													: 'text-green-600'
											}`}>
											{item.inStock ? 'In Stock' : 'Out of Stock'}
										</span>
									</div>
								</div>
								<div className='flex justify-end gap-2 mt-4 pt-3 border-t'>
									<EditItemDialog item={item} />
									<DeleteItemButton itemId={item.id} itemName={item.name} />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{filteredItems.length === 0 && !loading && (
					<div className='flex flex-col items-center justify-center py-12 md:py-16 text-muted-foreground'>
						<Package className='h-16 w-16 md:h-20 md:w-20 mb-4 opacity-20' />
						<p className='text-lg md:text-xl font-medium mb-2'>No items found</p>
						<p className='text-sm md:text-base text-center max-w-md'>
							{searchTerm || filterOutOfStock
								? 'Try adjusting your search term or filters to see more results'
								: 'Get started by adding some items to your inventory'}
						</p>
						{!searchTerm && !filterOutOfStock && (
							<div className='mt-4'>
								<AddItemDialog />
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
