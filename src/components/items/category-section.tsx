'use client';

import { useRef, memo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DraggableItem } from './draggable-item';
import { ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { toast } from 'react-toastify';

const ItemTypes = {
	ITEM: 'item'
};

interface CategorySectionProps {
	category: Category;
	items: Item[];
	collapsed: boolean;
	onToggleCollapse: () => void;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
	selectionMode?: boolean;
	selectedItems?: Set<string>;
	selectionCategory?: string | null;
	onItemHold?: (item: { id: string; categoryId?: string }) => void;
	onItemSelect?: (itemId: string, selected: boolean) => void;
}

function CategorySectionComponent({
	category,
	items,
	collapsed,
	onToggleCollapse,
	onDragStart,
	onDragEnd,
	selectionMode = false,
	selectedItems = new Set(),
	selectionCategory,
	onItemHold,
	onItemSelect
}: CategorySectionProps) {
	const router = useRouter();
	const ref = useRef<HTMLDivElement>(null);

	const handleDrop = useCallback(
		async (draggedItem: { id: string; categoryId?: string }) => {
			if (draggedItem.categoryId !== category.id) {
				try {
					const itemsToMove = selectedItems.has(draggedItem.id) && selectedItems.size > 1
						? Array.from(selectedItems)
						: [draggedItem.id];

					await Promise.all(itemsToMove.map(async (itemId) => {
						const currentCategoryId = itemId === draggedItem.id 
							? draggedItem.categoryId 
							: selectedItems.has(itemId) 
								? selectionCategory === 'uncategorized' ? undefined : selectionCategory
								: undefined;

						if (currentCategoryId) {
							await api.removeItemFromCategory(currentCategoryId, itemId);
						}
						await api.addItemToCategory(category.id, itemId);
					}));

					router.refresh();

					const count = itemsToMove.length;
					toast.success(`${count} item${count > 1 ? 's' : ''} moved successfully!`);
				} catch (error) {
					console.error('Failed to move items:', error);
					toast.error('Failed to move items to category. Please try again.');
				}
			}
		},
		[category.id, router, selectedItems, selectionCategory]
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
			className={`rounded-xl border transition-all duration-300 ${
				isOver
					? 'border-emerald-400 bg-emerald-50 shadow-lg'
					: 'border-gray-200 bg-white hover:border-gray-300'
			}`}>
			<div className='p-4 border-b border-gray-100'>
				<div className='flex items-center justify-between'>
					<Button
						variant='ghost'
						onClick={onToggleCollapse}
						className='flex items-center gap-3 p-0 h-auto hover:bg-transparent'>
						{collapsed ? (
							<ChevronRight className='h-4 w-4 text-gray-400' />
						) : (
							<ChevronDown className='h-4 w-4 text-gray-400' />
						)}
						<div
							className='w-4 h-4 rounded-full border-2'
							style={{
								backgroundColor: category.color,
								borderColor: category.color
							}}
						/>
						<div className='flex items-center gap-2'>
							<h3 className='font-semibold text-gray-900'>{category.name}</h3>
							<Badge variant='secondary' className='text-xs'>
								{items.length} {items.length === 1 ? 'item' : 'items'}
							</Badge>
						</div>
					</Button>

					{isOver && (
						<Badge variant='default' className='text-xs bg-emerald-600'>
							<Tag className='h-3 w-3 mr-1' />
							Drop here
						</Badge>
					)}
				</div>
			</div>

			{!collapsed && (
				<div className='p-4'>
					{items.length === 0 ? (
						<div className='text-center py-8 text-gray-500'>
							<Tag className='h-12 w-12 mx-auto mb-3 opacity-50' />
							<p>No items in this category</p>
							<p className='text-xs mt-1'>Drag items here to organize them</p>
						</div>
					) : (
						<div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{items.map(item => (
								<DraggableItem
									key={item.id}
									item={item}
									categoryId={category.id}
									onDragStart={onDragStart}
									onDragEnd={onDragEnd}
									selectionMode={selectionMode}
									isSelected={selectedItems.has(item.id)}
									showSelection={selectionMode && selectionCategory === category.id}
									selectedItems={selectedItems}
									onItemHold={onItemHold}
									onItemSelect={onItemSelect}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export const CategorySection = memo(CategorySectionComponent);
