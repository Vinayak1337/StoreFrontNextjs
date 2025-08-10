'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Save, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OrderItemCard } from '../create/order-item-card';
import { CategoryFilter } from '../create/category-filter';
import { OrderSummary } from '../create/order-summary';
import { updateOrderAction } from '@/app/api/orders/update/actions';

interface OrderItemState {
	itemId: string;
	quantity: number;
	price: number;
}

interface EditOrderClientProps {
	order: Order;
	items: Item[];
	categories: Category[];
}

export function EditOrderClient({
	order,
	items,
	categories
}: EditOrderClientProps) {
	const router = useRouter();

	// Form state (pre-filled)
	const [customerName, setCustomerName] = useState(order.customerName);
	const [customMessage, setCustomMessage] = useState(order.customMessage || '');
	const [orderItems, setOrderItems] = useState<OrderItemState[]>(
		(order.orderItems || []).map(oi => ({
			itemId: oi.itemId,
			quantity: oi.quantity,
			price: Number(oi.price)
		}))
	);

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
				{ itemId, quantity: 1, price: Number(item.price) }
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

	// Submit update
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!customerName.trim() || orderItems.length === 0 || isSubmitting) return;
		setIsSubmitting(true);
		try {
			const result = await updateOrderAction({
				id: order.id,
				customerName: customerName.trim(),
				customMessage: customMessage.trim() || undefined,
				orderItems
			});
			if (result.success) {
				router.push(`/orders/${order.id}`);
			} else {
				console.error(result.error || 'Failed to update order.');
			}
		} catch (err) {
			console.error('Error updating order:', err);
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
							Edit Order
						</h1>
						<p className='text-gray-600 mt-1 text-sm sm:text-base'>
							Update items and customer information
						</p>
					</div>
				</div>
				{/* Save button - mobile/tablet */}
				<Button
					onClick={handleSubmit as unknown as () => void}
					disabled={
						!customerName.trim() || orderItems.length === 0 || isSubmitting
					}
					className='xl:hidden flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto'>
					<Save className='h-4 w-4' />
					<span className='hidden sm:inline'>Save Changes</span>
					<span className='sm:hidden'>Save</span>
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

					{/* Order Summary - mobile/tablet */}
					<div className='xl:hidden'>
						<OrderSummary orderItems={orderItems} items={items} total={total} />
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
								{(() => {
									const entries = Object.entries(itemsByCategory);
									const uncategorized = entries.find(
										([id]) => id === 'uncategorized'
									);
									const categorized = entries.filter(
										([id]) => id !== 'uncategorized'
									);
									categorized.sort((a, b) => {
										const catA = a[1].category;
										const catB = b[1].category;
										const orderA = catA?.order ?? Number.MAX_SAFE_INTEGER;
										const orderB = catB?.order ?? Number.MAX_SAFE_INTEGER;
										if (orderA !== orderB) return orderA - orderB;
										const nameA = (catA?.name || '').toLowerCase();
										const nameB = (catB?.name || '').toLowerCase();
										return nameA.localeCompare(nameB);
									});
									const ordered = uncategorized
										? [uncategorized, ...categorized]
										: categorized;
									return ordered.map(
										([categoryId, { category, items: categoryItems }]) => (
											<div key={categoryId}>
												<h3 className='font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base'>
													{category ? (
														<>
															<svg
																className='w-3 h-3'
																viewBox='0 0 8 8'
																aria-hidden='true'>
																<circle
																	cx='4'
																	cy='4'
																	r='4'
																	fill={category.color}
																/>
															</svg>
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
									);
								})()}
							</div>
						)}
					</div>
				</div>

				{/* Order Summary Sidebar - desktop */}
				<div className='hidden xl:block xl:col-span-1'>
					<OrderSummary orderItems={orderItems} items={items} total={total} />
					<form onSubmit={handleSubmit} className='mt-4 sm:mt-6'>
						<Button
							type='submit'
							disabled={
								!customerName.trim() || orderItems.length === 0 || isSubmitting
							}
							className='w-full gap-2 h-10 sm:h-12 text-sm sm:text-base'
							size='lg'>
							{isSubmitting ? (
								<div className='animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full' />
							) : (
								<Save className='h-3 w-3 sm:h-4 sm:w-4' />
							)}
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
