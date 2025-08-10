'use client';

import { useRef, memo, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DraggableItem } from './draggable-item';
import {
	ChevronDown,
	ChevronRight,
	Tag,
	Pencil,
	Trash2,
	Save,
	X
} from 'lucide-react';
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
	const [isEditing, setIsEditing] = useState(false);
	const [nameDraft, setNameDraft] = useState(category.name);

	const handleDrop = useCallback(
		async (draggedItem: { id: string; categoryId?: string }) => {
			if (draggedItem.categoryId !== category.id) {
				try {
					const itemsToMove =
						selectedItems.has(draggedItem.id) && selectedItems.size > 1
							? Array.from(selectedItems)
							: [draggedItem.id];

					await Promise.all(
						itemsToMove.map(async itemId => {
							const currentCategoryId =
								itemId === draggedItem.id
									? draggedItem.categoryId
									: selectedItems.has(itemId)
									? selectionCategory === 'uncategorized'
										? undefined
										: selectionCategory
									: undefined;

							if (currentCategoryId) {
								await api.removeItemFromCategory(currentCategoryId, itemId);
							}
							await api.addItemToCategory(category.id, itemId);
						})
					);

					router.refresh();

					const count = itemsToMove.length;
					toast.success(
						`${count} item${count > 1 ? 's' : ''} moved successfully!`
					);
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
				<div className='flex items-center justify-between gap-2'>
					<Button
						variant='ghost'
						onClick={onToggleCollapse}
						className='flex items-center gap-3 p-0 h-auto hover:bg-transparent'>
						{collapsed ? (
							<ChevronRight className='h-4 w-4 text-gray-400' />
						) : (
							<ChevronDown className='h-4 w-4 text-gray-400' />
						)}
						<svg className='w-4 h-4' viewBox='0 0 12 12' aria-hidden='true'>
							<circle
								cx='6'
								cy='6'
								r='5'
								fill={category.color}
								stroke={category.color}
								strokeWidth='2'
							/>
						</svg>
						<div className='flex items-center gap-2'>
							{isEditing ? (
								<input
									value={nameDraft}
									onChange={e => setNameDraft(e.target.value)}
									className='border rounded px-2 py-1 text-sm'
									autoFocus
									aria-label='Edit category name'
									placeholder='Category name'
								/>
							) : (
								<h3 className='font-semibold text-gray-900'>{category.name}</h3>
							)}
							<Badge variant='secondary' className='text-xs'>
								{items.length} {items.length === 1 ? 'item' : 'items'}
							</Badge>
						</div>
					</Button>

					<div className='flex items-center gap-2'>
						{isOver && (
							<Badge variant='default' className='text-xs bg-emerald-600'>
								<Tag className='h-3 w-3 mr-1' />
								Drop here
							</Badge>
						)}
						{isEditing ? (
							<>
								<Button
									size='sm'
									variant='secondary'
									onClick={async () => {
										try {
											const newName = nameDraft.trim();
											if (!newName) return setIsEditing(false);
											await api.updateCategory(category.id, { name: newName });
											setIsEditing(false);
											router.refresh();
										} catch {
											console.error('Failed to update category');
										}
									}}
									className='h-8 px-2'>
									<Save className='h-4 w-4' />
								</Button>
								<Button
									size='sm'
									variant='ghost'
									onClick={() => {
										setIsEditing(false);
										setNameDraft(category.name);
									}}
									className='h-8 px-2'>
									<X className='h-4 w-4' />
								</Button>
							</>
						) : (
							<>
								<Button
									size='sm'
									variant='ghost'
									onClick={() => setIsEditing(true)}
									className='h-8 px-2'>
									<Pencil className='h-4 w-4 text-gray-500' />
								</Button>
								<Button
									size='sm'
									variant='ghost'
									onClick={async () => {
										if (
											!confirm(
												'Delete this category? Items will be uncategorized.'
											)
										)
											return;
										try {
											await api.deleteCategory(category.id);
											router.refresh();
										} catch {
											console.error('Failed to delete category');
										}
									}}
									className='h-8 px-2 hover:text-red-600'>
									<Trash2 className='h-4 w-4' />
								</Button>
							</>
						)}
					</div>
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
									showSelection={
										selectionMode && selectionCategory === category.id
									}
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
