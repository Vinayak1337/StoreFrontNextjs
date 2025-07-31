'use client';

import { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditItemDialog } from './edit-item-dialog';
import { DeleteItemButton } from './delete-item-button';
import { Edit, Trash2, GripVertical, Check } from 'lucide-react';

const ItemTypes = {
	ITEM: 'item'
};

interface DraggableItemProps {
	item: Item;
	categoryId?: string;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
	selectionMode?: boolean;
	isSelected?: boolean;
	showSelection?: boolean;
	selectedItems?: Set<string>;
	onItemHold?: (item: { id: string; categoryId?: string }) => void;
	onItemSelect?: (itemId: string, selected: boolean) => void;
}

function DraggableItemComponent({
	item,
	categoryId,
	onDragStart,
	onDragEnd,
	selectionMode = false,
	isSelected = false,
	showSelection = false,
	selectedItems,
	onItemHold,
	onItemSelect
}: DraggableItemProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isHolding, setIsHolding] = useState(false);
	const holdTimeoutRef = useRef<NodeJS.Timeout>(null);

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

	// Handle hold functionality
	const handleMouseDown = () => {
		if (selectionMode) return;
		setIsHolding(true);
		holdTimeoutRef.current = setTimeout(() => {
			onItemHold?.({ id: item.id, categoryId });
			setIsHolding(false);
		}, 800); // 800ms hold
	};

	const handleMouseUp = () => {
		setIsHolding(false);
		if (holdTimeoutRef.current) {
			clearTimeout(holdTimeoutRef.current);
		}
	};

	const handleMouseLeave = () => {
		setIsHolding(false);
		if (holdTimeoutRef.current) {
			clearTimeout(holdTimeoutRef.current);
		}
	};

	useEffect(() => {
		return () => {
			if (holdTimeoutRef.current) {
				clearTimeout(holdTimeoutRef.current);
			}
		};
	}, []);

	const handleCheckboxChange = (checked: boolean) => {
		onItemSelect?.(item.id, checked);
	};

	const formatPrice = (price: string | number) => {
		const numPrice = typeof price === 'string' ? parseFloat(price) : price;
		return `₹${numPrice.toFixed(2)}`;
	};

	return (
		<div
			ref={ref}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative ${
				isDragging
					? 'opacity-40 shadow-lg border-emerald-400 transform rotate-2 scale-105 cursor-grabbing'
					: 'cursor-grab hover:cursor-grab hover:border-gray-300'
			} ${isSelected ? 'border-blue-400 bg-blue-50' : ''} ${
				isHolding ? 'scale-105 shadow-lg' : ''
			} p-4`}>
			{/* Multiple items indicator when dragging */}
			{isDragging &&
				selectionMode &&
				isSelected &&
				selectedItems &&
				selectedItems.size > 1 && (
					<div className='absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white z-20'>
						{selectedItems.size}
					</div>
				)}

			<div
				className='flex flex-col h-full'
				onClick={
					showSelection
						? e => {
								e.stopPropagation();
								handleCheckboxChange(!isSelected);
						  }
						: undefined
				}>
				<div className='flex-1'>
					<div className='flex items-start justify-between mb-2'>
						<div className='flex items-center gap-3'>
							{/* Selection Checkbox */}
							{showSelection && (
								<div
									className='cursor-pointer'
									onClick={e => {
										e.stopPropagation();
										handleCheckboxChange(!isSelected);
									}}>
									<div
										className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
											isSelected
												? 'bg-blue-500 border-blue-500'
												: 'bg-white border-gray-300 hover:border-blue-400'
										}`}>
										{isSelected && <Check className='w-3 h-3 text-white' />}
									</div>
								</div>
							)}
							<div className={`flex-1 min-w-0`}>
								<h3 className='font-semibold text-gray-900 text-sm leading-tight line-clamp-2'>
									{item.name}
								</h3>
							</div>
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
