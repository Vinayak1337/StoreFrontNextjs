'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderItemCardProps {
	item: Item;
	orderQuantity?: number;
	onAdd: () => void;
	onUpdateQuantity?: (quantity: number) => void;
	onRemove?: () => void;
	isSelected: boolean;
}

export function OrderItemCard({
	item,
	orderQuantity,
	onAdd,
	onUpdateQuantity,
	onRemove,
	isSelected
}: OrderItemCardProps) {
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
			<div className='p-3 sm:p-4'>
				<div className='flex items-start justify-between mb-3'>
					<div className='flex-1 min-w-0'>
						<h3 className='font-semibold text-gray-900 truncate text-sm sm:text-base'>
							{item.name}
						</h3>
						<p className='text-xs sm:text-sm text-gray-600 mt-1'>
							Serving: {item.quantity}{' '}
							{item.weightUnit && `• ${item.weight}${item.weightUnit}`}
						</p>
						<div className='flex items-center gap-2 mt-2'>
							<span className='text-base sm:text-lg font-bold text-gray-900'>
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
							<div className='text-center min-w-[2.5rem] sm:min-w-[3rem]'>
								<div className='text-base sm:text-lg font-bold'>{orderQuantity}</div>
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
							<div className='text-xs sm:text-sm text-gray-600'>Total</div>
							<div className='text-base sm:text-lg font-bold text-emerald-600'>
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