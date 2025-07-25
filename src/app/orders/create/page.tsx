'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/redux/store';
import { useItems, useCategories } from '@/lib/hooks/useItems';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { Item, Category } from '@/types';
import { printBill } from '@/lib/utils/bill-utils';
import api from '@/lib/services/api';

// UI Components
import {
	Search,
	Plus,
	Minus,
	ShoppingCart,
	ArrowLeft,
	Save,
	Package,
	Trash2,
	Receipt,
	Printer,
	User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
	itemId: string;
	quantity: number;
	price: number;
}

// Redesigned Order Item Component
function OrderItemCard({
	item,
	orderQuantity,
	onAdd,
	onUpdateQuantity,
	onRemove,
	isSelected
}: {
	item: Item;
	orderQuantity?: number;
	onAdd: () => void;
	onUpdateQuantity?: (quantity: number) => void;
	onRemove?: () => void;
	isSelected: boolean;
}) {
	const formatPrice = (price: string | number) => {
		const numPrice = typeof price === 'string' ? parseFloat(price) : price;
		return `₹${numPrice.toFixed(2)}`;
	};

	return (
		<div
			className={`group bg-white rounded-xl border transition-all duration-200 ${
				isSelected
					? 'border-emerald-500 shadow-md bg-emerald-50/30'
					: 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
			}`}>
			<div className='p-4'>
				<div className='flex items-start justify-between mb-3'>
					<div className='flex-1 min-w-0'>
						<h3 className='font-semibold text-gray-900 truncate'>
							{item.name}
						</h3>
						<p className='text-sm text-gray-600 mt-1'>
							Serving: {item.quantity}{' '}
							{item.weightUnit && `• ${item.weight}${item.weightUnit}`}
						</p>
						<div className='flex items-center gap-2 mt-2'>
							<span className='text-lg font-bold text-gray-900'>
								{formatPrice(item.price)}
							</span>
							<Badge
								variant={item.inStock ? 'default' : 'destructive'}
								className='text-xs'>
								{item.inStock ? 'Available' : 'Unavailable'}
							</Badge>
						</div>
					</div>
				</div>

				{!isSelected ? (
					<Button
						onClick={onAdd}
						disabled={!item.inStock}
						className='w-full gap-2'
						size='sm'>
						<Plus className='h-4 w-4' />
						Add to Order
					</Button>
				) : (
					<div className='space-y-3'>
						{/* Quantity Controls */}
						<div className='flex items-center justify-center gap-3'>
							<Button
								variant='outline'
								size='sm'
								onClick={() =>
									onUpdateQuantity?.(Math.max(1, (orderQuantity || 1) - 1))
								}
								className='h-8 w-8 p-0'>
								<Minus className='h-3 w-3' />
							</Button>
							<div className='text-center min-w-[3rem]'>
								<div className='text-lg font-bold'>{orderQuantity}</div>
								<div className='text-xs text-gray-500'>servings</div>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => onUpdateQuantity?.((orderQuantity || 1) + 1)}
								className='h-8 w-8 p-0'>
								<Plus className='h-3 w-3' />
							</Button>
						</div>

						{/* Total Price */}
						<div className='text-center p-2 bg-emerald-100 rounded-lg'>
							<div className='text-sm text-gray-600'>Total</div>
							<div className='text-lg font-bold text-emerald-600'>
								{formatPrice(Number(item.price) * (orderQuantity || 1))}
							</div>
						</div>

						{/* Remove Button */}
						<Button
							variant='outline'
							size='sm'
							onClick={onRemove}
							className='w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50'>
							<Trash2 className='h-4 w-4' />
							Remove
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// Category Filter Component
function CategoryFilter({
	categories,
	selectedCategory,
	onSelectCategory
}: {
	categories: Category[];
	selectedCategory: string | null;
	onSelectCategory: (categoryId: string | null) => void;
}) {
	return (
		<div className='flex flex-wrap gap-2 mb-4'>
			<Button
				variant={selectedCategory === null ? 'default' : 'outline'}
				size='sm'
				onClick={() => onSelectCategory(null)}
				className='gap-2'>
				<Package className='h-4 w-4' />
				All Items
			</Button>
			{categories.map(category => (
				<Button
					key={category.id}
					variant={selectedCategory === category.id ? 'default' : 'outline'}
					size='sm'
					onClick={() => onSelectCategory(category.id)}
					className='gap-2'>
					<div
						className='w-3 h-3 rounded-full'
						style={{ backgroundColor: category.color }}
					/>
					{category.name}
				</Button>
			))}
		</div>
	);
}

// Order Summary Component
function OrderSummary({
	orderItems,
	items,
	total,
	onDirectPrint
}: {
	orderItems: OrderItem[];
	items: Item[];
	total: number;
	onDirectPrint: () => void;
}) {
	const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

	return (
		<div className='bg-white rounded-xl border p-6 sticky top-4'>
			<h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
				<Receipt className='h-5 w-5' />
				Order Summary
			</h2>

			{orderItems.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					<ShoppingCart className='h-12 w-12 mx-auto mb-3 opacity-50' />
					<p>No items selected</p>
					<p className='text-sm mt-1'>Add items to see order summary</p>
				</div>
			) : (
				<div className='space-y-4'>
					{/* Order Items List */}
					<div className='max-h-60 overflow-y-auto space-y-2'>
						{orderItems.map(orderItem => {
							const item = items.find(i => i.id === orderItem.itemId);
							if (!item) return null;

							return (
								<div
									key={orderItem.itemId}
									className='flex justify-between items-center p-2 bg-gray-50 rounded-lg'>
									<div className='flex-1 min-w-0'>
										<div className='font-medium truncate'>{item.name}</div>
										<div className='text-sm text-gray-600'>
											{orderItem.quantity} servings ×{' '}
											{formatPrice(orderItem.price)}
										</div>
									</div>
									<div className='font-bold text-gray-900'>
										{formatPrice(orderItem.price * orderItem.quantity)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Total */}
					<div className='border-t pt-4'>
						<div className='flex justify-between items-center text-lg font-bold'>
							<span>Total</span>
							<span className='text-green-600'>{formatPrice(total)}</span>
						</div>
					</div>

					{/* Direct Print Button */}
					<Button
						variant='outline'
						onClick={onDirectPrint}
						className='w-full gap-2 mt-4'>
						<Printer className='h-4 w-4' />
						Print Order Directly
					</Button>
				</div>
			)}
		</div>
	);
}

// Main Create Order Page
export default function CreateOrderPage() {
	const router = useRouter();
	const { data: items = [], isLoading: itemsLoading } = useItems();
	const { data: categories = [] } = useCategories();
	const createOrderMutation = useCreateOrder();
	const { settings } = useSelector(
		(state: RootState) => state.settings || { settings: null }
	);

	// Form state
	const [customerName, setCustomerName] = useState('');
	const [customMessage, setCustomMessage] = useState('');
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

	// UI state
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Load data

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

		if (!customerName.trim() || orderItems.length === 0) {
			return;
		}

		const orderData = {
			customerName: customerName.trim(),
			orderItems: orderItems,
			customMessage: customMessage.trim() || undefined
		};

		try {
			await createOrderMutation.mutateAsync(orderData);
			router.push('/orders');
		} catch (error) {
			console.error('Error creating order:', error);
		}
	};

	// Handle direct print - creates order, bill, and prints immediately
	const handleDirectPrint = async () => {
		if (!customerName.trim() || orderItems.length === 0) {
			alert('Please add customer name and items before printing.');
			return;
		}

		try {
			// Create the order first
			const orderData = {
				customerName: customerName.trim(),
				orderItems: orderItems,
				customMessage: customMessage.trim() || undefined
			};

			const newOrder = await createOrderMutation.mutateAsync(orderData);

			// Create bill for the order
			const newBill = await api.createBill({
				orderId: newOrder.id,
				totalAmount: total,
				taxes: 0,
				paymentMethod: 'Cash'
			});

			// Print if settings are available
			if (settings && newBill) {
				printBill(newBill, settings);
				// Navigate to orders after successful print
				router.push('/orders');
			} else {
				alert('Settings not loaded. Order created but cannot print.');
				router.push('/orders');
			}
		} catch (error) {
			console.error('Error with direct print:', error);
			alert('Failed to create order and print. Please try again.');
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

	if (itemsLoading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-center'>
					<div className='animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading items...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push('/orders')}
						className='gap-2'>
						<ArrowLeft className='h-4 w-4' />
						Back to Orders
					</Button>
					<div>
						<h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
							Create New Order
						</h1>
						<p className='text-gray-600 mt-1'>
							Add items and create a new customer order
						</p>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
				{/* Main Content */}
				<div className='xl:col-span-3 space-y-6'>
					{/* Customer Information */}
					<div className='bg-white rounded-xl border p-6'>
						<h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
							<User className='h-5 w-5' />
							Customer Information
						</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

					{/* Items Selection */}
					<div className='bg-white rounded-xl border p-6'>
						<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
							<h2 className='text-lg font-semibold flex items-center gap-2'>
								<Package className='h-5 w-5' />
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
							<div className='text-center py-12'>
								<Package className='h-16 w-16 mx-auto mb-4 text-gray-400' />
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									No items found
								</h3>
								<p className='text-gray-600'>
									Try adjusting your search or category filter.
								</p>
							</div>
						) : (
							<div className='space-y-6'>
								{Object.entries(itemsByCategory).map(
									([categoryId, { category, items: categoryItems }]) => (
										<div key={categoryId}>
											<h3 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
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
											<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
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

				{/* Order Summary Sidebar */}
				<div className='xl:col-span-1'>
					<OrderSummary
						orderItems={orderItems}
						items={items}
						total={total}
						onDirectPrint={handleDirectPrint}
					/>

					{/* Submit Button */}
					<form onSubmit={handleSubmit} className='mt-6'>
						<Button
							type='submit'
							disabled={
								!customerName.trim() ||
								orderItems.length === 0 ||
								createOrderMutation.isPending
							}
							className='w-full gap-2 h-12'
							size='lg'>
							{createOrderMutation.isPending ? (
								<div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
							) : (
								<Save className='h-4 w-4' />
							)}
							{createOrderMutation.isPending
								? 'Creating Order...'
								: 'Create Order'}
						</Button>
					</form>

					{createOrderMutation.error && (
						<div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
							<p className='text-sm text-red-600'>
								{createOrderMutation.error instanceof Error
									? createOrderMutation.error.message
									: 'An error occurred'}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
