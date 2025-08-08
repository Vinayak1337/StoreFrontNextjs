'use client';

import { ShoppingCart, Receipt } from 'lucide-react';

interface OrderItem {
	itemId: string;
	quantity: number;
	price: number;
}

interface OrderSummaryProps {
	orderItems: OrderItem[];
	items: Item[];
	total: number;
}

export function OrderSummary({ orderItems, items, total }: OrderSummaryProps) {
	const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

	return (
		<div className='bg-white rounded-xl border p-4 sm:p-6 sticky top-4'>
			<h2 className='text-base sm:text-lg font-semibold mb-4 flex items-center gap-2'>
				<Receipt className='h-4 w-4 sm:h-5 sm:w-5' />
				Order Summary
			</h2>

			{orderItems.length === 0 ? (
				<div className='text-center py-6 sm:py-8 text-gray-500'>
					<ShoppingCart className='h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50' />
					<p className='text-sm sm:text-base'>No items selected</p>
					<p className='text-xs sm:text-sm mt-1'>
						Add items to see order summary
					</p>
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
							<span className='text-emerald-600'>{formatPrice(total)}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
