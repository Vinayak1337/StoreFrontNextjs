'use client';

import { useRef, memo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useQueryClient } from '@tanstack/react-query';
import { Item } from '@/types';
import api from '@/lib/services/api';
import { Badge } from '@/components/ui/badge';
import { DraggableItem } from './draggable-item';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const ItemTypes = {
	ITEM: 'item'
};

interface UncategorizedSectionProps {
	items: Item[];
	isDragging?: boolean;
	draggedItem?: { id: string; categoryId?: string } | null;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
}

function UncategorizedSectionComponent({
	items,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	isDragging = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	draggedItem = null,
	onDragStart,
	onDragEnd,
	currentPage = 1,
	totalPages = 1,
	onPageChange
}: UncategorizedSectionProps) {
	const queryClient = useQueryClient();
	const ref = useRef<HTMLDivElement>(null);

	const handleDrop = useCallback(
		async (draggedItem: { id: string; categoryId?: string }) => {
			if (draggedItem.categoryId) {
				try {
					console.log('Removing item from category:', {
						categoryId: draggedItem.categoryId,
						itemId: draggedItem.id
					});

					await api.removeItemFromCategory(
						draggedItem.categoryId,
						draggedItem.id
					);

					// Invalidate queries to refresh the UI
					queryClient.invalidateQueries({ queryKey: ['items'] });
					queryClient.invalidateQueries({ queryKey: ['categories'] });

					toast.success('Item removed from category!');
				} catch (error) {
					console.error('Failed to remove item from category:', error);
					console.error('Error details:', {
						categoryId: draggedItem.categoryId,
						itemId: draggedItem.id,
						error: error
					});
					toast.error('Failed to remove item from category. Please try again.');
				}
			}
		},
		[queryClient]
	);

	const [{ isOver }, drop] = useDrop({
		accept: ItemTypes.ITEM,
		drop: handleDrop,
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	});

	drop(ref);

	return (
		<div
			ref={ref}
			className={`rounded-xl border-2 transition-all duration-300 ${
				isOver
					? 'border-emerald-400 bg-emerald-50 shadow-lg'
					: 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
			}`}>
			<div className='p-4 border-b border-gray-200'>
				<div className='flex items-center gap-3'>
					<Package className='h-5 w-5 text-gray-400' />
					<div className='flex-1'>
						<h3 className='font-semibold text-gray-700'>Uncategorized Items</h3>
						<p className='text-sm text-gray-500 mt-0.5'>
							{totalPages > 1
								? `Page ${currentPage} of ${totalPages}`
								: `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
							{isOver
								? ' • Drop zone'
								: ' • Drop items here to remove from categories'}
						</p>
					</div>
					{isOver && (
						<Badge variant='default' className='text-xs bg-emerald-500'>
							Drop here
						</Badge>
					)}
				</div>
			</div>

			<div className='p-4'>
				{items.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>
						<Package className='h-12 w-12 mx-auto mb-3 opacity-50' />
						<p>All items are organized</p>
						<p className='text-sm mt-1'>Drag items here to uncategorize them</p>
					</div>
				) : (
					<div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{items.map(item => (
							<DraggableItem
								key={item.id}
								item={item}
								onDragStart={onDragStart}
								onDragEnd={onDragEnd}
							/>
						))}
					</div>
				)}

				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className='flex items-center justify-center gap-2 pt-4 border-t border-gray-200'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => onPageChange?.(currentPage - 1)}
							disabled={currentPage === 1}
							className='gap-1'>
							<ChevronLeft className='h-3 w-3' />
							Previous
						</Button>

						<div className='flex items-center gap-1'>
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNum: number;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (currentPage <= 3) {
									pageNum = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = currentPage - 2 + i;
								}

								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? 'default' : 'outline'}
										size='sm'
										onClick={() => onPageChange?.(pageNum)}
										className='w-8 h-8 p-0'>
										{pageNum}
									</Button>
								);
							})}
						</div>

						<Button
							variant='outline'
							size='sm'
							onClick={() => onPageChange?.(currentPage + 1)}
							disabled={currentPage === totalPages}
							className='gap-1'>
							Next
							<ChevronRight className='h-3 w-3' />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export const UncategorizedSection = memo(UncategorizedSectionComponent);
