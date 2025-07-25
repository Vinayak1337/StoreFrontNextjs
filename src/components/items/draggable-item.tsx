'use client';

import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditItemDialog } from './edit-item-dialog';
import { DeleteItemButton } from './delete-item-button';
import { Edit, Trash2, GripVertical } from 'lucide-react';

const ItemTypes = {
	ITEM: 'item'
};

interface DraggableItemProps {
	item: Item;
	categoryId?: string;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
}

function DraggableItemComponent({
	item,
	categoryId,
	onDragStart,
	onDragEnd
}: DraggableItemProps) {
	const ref = useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag] = useDrag(
		{
			type: ItemTypes.ITEM,
			item: () => {
				const itemData = { id: item.id, categoryId: categoryId || undefined };
				onDragStart?.(itemData);
				return itemData;
			},
			end: () => {
				onDragEnd?.();
			},
			collect: monitor => ({
				isDragging: monitor.isDragging()
			})
		},
		[item.id, categoryId, onDragStart, onDragEnd]
	);

	// Connect drag to the entire card (like working version)
	drag(ref);

	const formatPrice = (price: string | number) => {
		const numPrice = typeof price === 'string' ? parseFloat(price) : price;
		return `₹${numPrice.toFixed(2)}`;
	};

	return (
		<div
			ref={ref}
			className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
				isDragging
					? 'opacity-40 shadow-lg border-emerald-400 transform rotate-2 scale-105 cursor-grabbing'
					: 'cursor-grab hover:cursor-grab hover:border-gray-300'
			} p-4`}>
			<div className='flex flex-col h-full'>
				<div className='flex-1'>
					<div className='flex items-start justify-between mb-2'>
						<div className='flex-1 min-w-0'>
							<h3 className='font-semibold text-gray-900 text-sm leading-tight line-clamp-2'>
								{item.name}
							</h3>
						</div>
						<div className='flex items-center gap-1 ml-2'>
							<div className='opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
								<EditItemDialog item={item}>
									<Button
										variant='ghost'
										size='sm'
										className='h-6 w-6 p-0 text-gray-400 hover:text-gray-600'>
										<Edit className='h-3 w-3' />
									</Button>
								</EditItemDialog>
								<DeleteItemButton itemId={item.id} itemName={item.name}>
									<Button
										variant='ghost'
										size='sm'
										className='h-6 w-6 p-0 text-gray-400 hover:text-red-600'>
										<Trash2 className='h-3 w-3' />
									</Button>
								</DeleteItemButton>
							</div>
							<div className='opacity-60 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing'>
								<GripVertical className='h-4 w-4 text-gray-500' />
							</div>
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='text-lg font-bold text-green-600'>
								{formatPrice(item.price)}
							</span>
							{item.inStock ? (
								<Badge
									variant='default'
									className='text-xs bg-green-100 text-green-700 border-green-200'>
									In Stock
								</Badge>
							) : (
								<Badge variant='destructive' className='text-xs'>
									Out of Stock
								</Badge>
							)}
						</div>

						{item.weight && (
							<p className='text-xs text-gray-500'>
								Weight: {item.weight} {item.weightUnit || 'kg'}
							</p>
						)}

						<p className='text-xs text-gray-500'>
							Quantity: {item.quantity}{' '}
							{item.quantity === 1 ? 'serving' : 'servings'}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export const DraggableItem = DraggableItemComponent;
