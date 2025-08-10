'use client';

import { useRef, useEffect, memo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditItemDialog } from './edit-item-dialog';
import { DeleteItemButton } from './delete-item-button';
import { Edit, Trash2, GripVertical, Check } from 'lucide-react';

const ItemTypes = {
	ITEM: 'item'
};

const formatPrice = (price: string | number) => {
	const numPrice = typeof price === 'string' ? parseFloat(price) : price;
	return `₹${numPrice.toFixed(2)}`;
};

interface DraggableItemProps {
	item: Item;
	categoryId?: string;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
	selectionMode?: boolean;
	isSelected?: boolean;
	showSelection?: boolean;
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
	onItemHold,
	onItemSelect
}: DraggableItemProps) {
	const ref = useRef<HTMLDivElement>(null);
	const dragHandleRef = useRef<HTMLDivElement>(null);
	const holdTimeoutRef = useRef<NodeJS.Timeout>(null);
	const [isDragStarted, setIsDragStarted] = useState(false);

	const [{ isDragging }, drag] = useDrag(
		{
			type: ItemTypes.ITEM,
			item: () => {
				setIsDragStarted(true);
				const itemData = { id: item.id, categoryId: categoryId || undefined };
				onDragStart?.(itemData);
				return itemData;
			},
			end: () => {
				setIsDragStarted(false);
				onDragEnd?.();
			},
			collect: monitor => ({
				isDragging: monitor.isDragging()
			}),
			canDrag: () => true
		},
		[item.id, categoryId, onDragStart, onDragEnd]
	);

	drag(dragHandleRef);

	const startHold = () => {
		if (selectionMode || isDragStarted) return;
		holdTimeoutRef.current = setTimeout(() => {
			if (!isDragStarted) {
				onItemHold?.({ id: item.id, categoryId });
			}
		}, 600);
	};

	const endHold = () => {
		if (holdTimeoutRef.current) {
			clearTimeout(holdTimeoutRef.current);
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (
			selectionMode ||
			isDragStarted ||
			(e.target as HTMLElement).closest('.drag-handle') ||
			(e.target as HTMLElement).closest('button') ||
			(e.target as HTMLElement).closest('.cursor-pointer')
		) {
			return;
		}
		startHold();
	};

	const handleMouseUp = () => {
		endHold();
	};

	const handleMouseLeave = () => {
		endHold();
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!selectionMode) {
			onItemHold?.({ id: item.id, categoryId });
		}
	};

	useEffect(() => {
		return () => {
			if (holdTimeoutRef.current) {
				clearTimeout(holdTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={ref}
			onMouseDown={selectionMode ? undefined : handleMouseDown}
			onMouseUp={selectionMode ? undefined : handleMouseUp}
			onMouseLeave={selectionMode ? undefined : handleMouseLeave}
			onContextMenu={handleContextMenu}
			className={`bg-white rounded-xl border border-gray-200 shadow-sm relative select-none p-4 ${
				isDragging
					? 'opacity-40 shadow-lg border-emerald-400 cursor-grabbing'
					: 'cursor-grab hover:border-gray-300'
			} ${isSelected ? 'border-blue-400 bg-blue-50' : ''}`}>
			<div
				className='flex flex-col h-full'
				onClick={
					showSelection
						? e => {
								e.stopPropagation();
								e.preventDefault();
								onItemSelect?.(item.id, !isSelected);
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
										e.preventDefault();
										onItemSelect?.(item.id, !isSelected);
									}}
									onMouseDown={e => e.stopPropagation()}
									onTouchStart={e => e.stopPropagation()}>
									<div
										className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
											isSelected
												? 'bg-blue-500 border-blue-500'
												: 'bg-white border-gray-300'
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
							<div className='flex gap-1'>
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
							<div
								ref={dragHandleRef}
								className='drag-handle p-2 cursor-grab active:cursor-grabbing touch-none'
								onClick={e => e.stopPropagation()}>
								<GripVertical className='h-4 w-4 text-gray-500' />
							</div>
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='text-lg font-bold text-emerald-600'>
								{formatPrice(item.price)}
							</span>
							{item.inStock ? (
								<Badge
									variant='default'
									className='text-xs bg-emerald-100 text-emerald-700 border-emerald-200'>
									In Stock
								</Badge>
							) : (
								<Badge variant='destructive' className='text-xs'>
									Out of Stock
								</Badge>
							)}
						</div>

						{item.weight ? (
							<p className='text-xs text-gray-500'>
								Weight: {item.weight} {item.weightUnit || 'kg'}
							</p>
						) : null}

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

export const DraggableItem = memo(DraggableItemComponent);
