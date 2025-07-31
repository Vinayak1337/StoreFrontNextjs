'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Save, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OrderItemCard } from './order-item-card';
import { CategoryFilter } from './category-filter';
import { OrderSummary } from './order-summary';
import { createOrderAction } from '@/app/api/orders/create/actions';

interface OrderItem {
	itemId: string;
	quantity: number;
	price: number;
}

interface CreateOrderClientProps {
	items: Item[];
	categories: Category[];
}

export function CreateOrderClient({ items, categories }: CreateOrderClientProps) {
	const router = useRouter();

	// Form state
	const [customerName, setCustomerName] = useState('');
	const [customMessage, setCustomMessage] = useState('');
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

	// UI state
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Filter items
	const filteredItems = items.filter(item => {
		// Search filter
		if (
			searchTerm &&
			!item.name.toLowerCase().includes(searchTerm.toLowerCase())
		) {
			return false;
		}

		// Category filter
		if (selectedCategory) {
			return item.categories?.some(cat => cat.categoryId === selectedCategory);
		}

		return true;
	});

	// Add item to order
	const addItem = (itemId: string) => {
		const item = items.find(i => i.id === itemId);
		if (!item) return;

		const existingItem = orderItems.find(i => i.itemId === itemId);
		if (existingItem) {
			updateQuantity(itemId, existingItem.quantity + 1);
		} else {
			setOrderItems([
				...orderItems,
				{
					itemId,
					quantity: 1,
					price: Number(item.price)
				}
			]);
		}
	};

	// Update item quantity
	const updateQuantity = (itemId: string, quantity: number) => {
		if (quantity <= 0) {
			removeItem(itemId);
			return;
		}

		setOrderItems(
			orderItems.map(i => (i.itemId === itemId ? { ...i, quantity } : i))
		);
	};

	// Remove item from order
	const removeItem = (itemId: string) => {
		setOrderItems(orderItems.filter(i => i.itemId !== itemId));
	};

	// Calculate total
	const total = orderItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!customerName.trim() || orderItems.length === 0 || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await createOrderAction({
				customerName: customerName.trim(),
				orderItems: orderItems,
				customMessage: customMessage.trim() || undefined
			});

			if (result.success) {
				router.push('/orders');
			} else {
				alert(result.error || 'Failed to create order. Please try again.');
			}
		} catch (error) {
			console.error('Error creating order:', error);
			alert('Failed to create order. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle direct creation - creates order and redirects
	const handleDirectCreate = async () => {
		if (!customerName.trim() || orderItems.length === 0 || isSubmitting) {
			alert('Please add customer name and items before creating order.');
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await createOrderAction({
				customerName: customerName.trim(),
				orderItems: orderItems,
				customMessage: customMessage.trim() || undefined
			});

			if (result.success) {
				router.push('/orders');
			} else {
				alert(result.error || 'Failed to create order. Please try again.');
			}
		} catch (error) {
			console.error('Error creating order:', error);
			alert('Failed to create order. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Organize items by category
	const itemsByCategory = filteredItems.reduce((acc, item) => {
		if (item.categories && item.categories.length > 0) {
			item.categories.forEach(cat => {
				const category = categories.find(c => c.id === cat.categoryId);
				if (category) {
					if (!acc[cat.categoryId])
						acc[cat.categoryId] = { category, items: [] };
					acc[cat.categoryId].items.push(item);
				}
			});
		} else {
			if (!acc['uncategorized'])
				acc['uncategorized'] = { category: null, items: [] };
			acc['uncategorized'].items.push(item);
		}
		return acc;
	}, {} as Record<string, { category: Category | null; items: Item[] }>);

	return (
		<div className='space-y-4 sm:space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push('/orders')}
						className='gap-2 self-start'>
						<ArrowLeft className='h-4 w-4' />
						<span className='hidden xs:inline'>Back to Orders</span>
						<span className='xs:hidden'>Back</span>
					</Button>
					<div className='min-w-0'>
						<h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate'>
							Create New Order
						</h1>
						<p className='text-gray-600 mt-1 text-sm sm:text-base'>
							Add items and create a new customer order
						</p>
					</div>
				</div>
				{/* Create Order button - only show on tablet vertical and mobile */}
				<Button
					onClick={handleDirectCreate}
					disabled={!customerName.trim() || orderItems.length === 0 || isSubmitting}
					className='xl:hidden flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto'>
					<Save className='h-4 w-4' />
					<span className='hidden sm:inline'>Create Order</span>
					<span className='sm:hidden'>Order</span>
				</Button>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6'>
				{/* Main Content */}
				<div className='xl:col-span-3 space-y-4 sm:space-y-6'>
					{/* Customer Information */}
					<div className='bg-white rounded-xl border p-4 sm:p-6'>
						<h2 className='text-base sm:text-lg font-semibold mb-4 flex items-center gap-2'>
							<User className='h-4 w-4 sm:h-5 sm:w-5' />
							Customer Information
						</h2>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='customerName'>Customer Name *</Label>
								<Input
									id='customerName'
									value={customerName}
									onChange={e => setCustomerName(e.target.value)}
									placeholder='Enter customer name'
									className='mt-1'
									required
								/>
							</div>
							<div>
								<Label htmlFor='customMessage'>Special Instructions</Label>
								<Textarea
									id='customMessage'
									value={customMessage}
									onChange={e => setCustomMessage(e.target.value)}
									placeholder='Any special requests or notes...'
									className='mt-1'
									rows={2}
								/>
							</div>
						</div>
					</div>

					{/* Order Summary - Show in column view between customer info and items */}
					<div className='xl:hidden'>
						<OrderSummary
							orderItems={orderItems}
							items={items}
							total={total}
						/>
					</div>

					{/* Items Selection */}
					<div className='bg-white rounded-xl border p-4 sm:p-6'>
						<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6'>
							<h2 className='text-base sm:text-lg font-semibold flex items-center gap-2'>
								<Package className='h-4 w-4 sm:h-5 sm:w-5' />
								Select Items
							</h2>
							<div className='relative w-full sm:w-80'>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
								<Input
									placeholder='Search items...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>

						{/* Category Filter */}
						<CategoryFilter
							categories={categories}
							selectedCategory={selectedCategory}
							onSelectCategory={setSelectedCategory}
						/>

						{/* Items Grid */}
						{Object.keys(itemsByCategory).length === 0 ? (
							<div className='text-center py-8 sm:py-12'>
								<Package className='h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400' />
								<h3 className='text-base sm:text-lg font-medium text-gray-900 mb-2'>
									No items found
								</h3>
								<p className='text-gray-600 text-sm sm:text-base'>
									Try adjusting your search or category filter.
								</p>
							</div>
						) : (
							<div className='space-y-4 sm:space-y-6'>
								{Object.entries(itemsByCategory).map(
									([categoryId, { category, items: categoryItems }]) => (
										<div key={categoryId}>
											<h3 className='font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base'>
												{category ? (
													<>
														<div
															className='w-3 h-3 rounded-full'
															style={{ backgroundColor: category.color }}
														/>
														{category.name}
													</>
												) : (
													<>
														<Package className='h-4 w-4 text-gray-400' />
														Uncategorized
													</>
												)}
												<Badge variant='secondary' className='text-xs'>
													{categoryItems.length}
												</Badge>
											</h3>
											<div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
												{categoryItems.map(item => {
													const orderItem = orderItems.find(
														oi => oi.itemId === item.id
													);
													return (
														<OrderItemCard
															key={item.id}
															item={item}
															orderQuantity={orderItem?.quantity}
															onAdd={() => addItem(item.id)}
															onUpdateQuantity={quantity =>
																updateQuantity(item.id, quantity)
															}
															onRemove={() => removeItem(item.id)}
															isSelected={!!orderItem}
														/>
													);
												})}
											</div>
										</div>
									)
								)}
							</div>
						)}
					</div>
				</div>

				{/* Order Summary Sidebar - Only show on desktop */}
				<div className='hidden xl:block xl:col-span-1'>
					<OrderSummary
						orderItems={orderItems}
						items={items}
						total={total}
					/>

					{/* Submit Button */}
					<form onSubmit={handleSubmit} className='mt-4 sm:mt-6'>
						<Button
							type='submit'
							disabled={
								!customerName.trim() ||
								orderItems.length === 0 ||
								isSubmitting
							}
							className='w-full gap-2 h-10 sm:h-12 text-sm sm:text-base'
							size='lg'>
							{isSubmitting ? (
								<div className='animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full' />
							) : (
								<Save className='h-3 w-3 sm:h-4 sm:w-4' />
							)}
							{isSubmitting ? 'Creating Order...' : 'Create Order'}
						</Button>
					</form>
				</div>

				{/* Submit Button for mobile/tablet - Show after all items */}
				<div className='xl:hidden'>
					<form onSubmit={handleSubmit} className='mt-4 sm:mt-6'>
						<Button
							type='submit'
							disabled={
								!customerName.trim() ||
								orderItems.length === 0 ||
								isSubmitting
							}
							className='w-full gap-2 h-10 sm:h-12 text-sm sm:text-base'
							size='lg'>
							{isSubmitting ? (
								<div className='animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full' />
							) : (
								<Save className='h-3 w-3 sm:h-4 sm:w-4' />
							)}
							{isSubmitting ? 'Creating Order...' : 'Create Order'}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}