'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import api from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AddItemDialog } from '@/components/items/add-item-dialog';
import { CategorySection } from '@/components/items/category-section';
import { UncategorizedSection } from '@/components/items/uncategorized-section';
import { Search, Plus, Loader2, Package, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORY_COLORS = [
	'#EF4444',
	'#F97316',
	'#F59E0B',
	'#EAB308',
	'#84CC16',
	'#22C55E',
	'#10B981',
	'#14B8A6',
	'#06B6D4',
	'#0EA5E9',
	'#3B82F6',
	'#6366F1',
	'#8B5CF6',
	'#A855F7',
	'#D946EF',
	'#EC4899',
	'#F43F5E',
	'#6B7280'
];

function AddCategoryDialog({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [color, setColor] = useState(CATEGORY_COLORS[0]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setLoading(true);
		try {
			await api.createCategory({
				name: name.trim(),
				color
			});
			router.refresh();
			setName('');
			setColor(CATEGORY_COLORS[0]);
			setOpen(false);
		} catch (error) {
			console.error('Failed to create category:', error);
		}
		setLoading(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Create New Category</DialogTitle>
					<DialogDescription>
						Add a new category to organize your items.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='space-y-4 py-4'>
						<div>
							<Label htmlFor='name'>Category Name</Label>
							<Input
								id='name'
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='e.g., Beverages, Snacks, etc.'
								className='mt-1'
								autoFocus
							/>
						</div>
						<div>
							<Label>Category Color</Label>
							<div className='grid grid-cols-10 gap-2 mt-2'>
								{CATEGORY_COLORS.map(c => (
									<button
										key={c}
										type='button'
										onClick={() => setColor(c)}
										className={`w-6 h-6 rounded-full transition-all ${
											color === c
												? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
												: 'hover:scale-105'
										}`}
										style={{ backgroundColor: c }}
									/>
								))}
							</div>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}
							className='flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading || !name.trim()}
							className='flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300'>
							{loading ? (
								<>
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
									Creating...
								</>
							) : (
								'Create Category'
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

interface ItemsClientProps {
	initialItems: Item[];
	initialCategories: Category[];
	pagination: Pagination;
}

export default function ItemsClient({
	initialItems: items,
	initialCategories: categories,
	pagination
}: ItemsClientProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
		new Set()
	);

	const [dragState, setDragState] = useState<{
		isDragging: boolean;
		draggedItem: { id: string; categoryId?: string } | null;
	}>({
		isDragging: false,
		draggedItem: null
	});

	// Selection state
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [selectionCategory, setSelectionCategory] = useState<string | null>(null);

	useEffect(() => {
		if (!dragState.isDragging) return;

		let scrollInterval: NodeJS.Timeout;

		const handleScroll = (clientY: number) => {
			const scrollSpeed = 15;
			const viewportHeight = window.innerHeight;
			const topThreshold = viewportHeight * 0.3;
			const bottomThreshold = viewportHeight * 0.7;

			if (scrollInterval) {
				clearInterval(scrollInterval);
			}

			if (clientY < topThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, -scrollSpeed);
				}, 16);
			} else if (clientY > bottomThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, scrollSpeed);
				}, 16);
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			handleScroll(e.clientY);
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				handleScroll(e.touches[0].clientY);
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			handleScroll(e.clientY);
		};

		const handleDragEnd = () => {
			if (scrollInterval) {
				clearInterval(scrollInterval);
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('dragover', handleDragOver);
		document.addEventListener('dragend', handleDragEnd);
		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchend', handleDragEnd);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('dragover', handleDragOver);
			document.removeEventListener('dragend', handleDragEnd);
			document.removeEventListener('mouseup', handleDragEnd);
			document.removeEventListener('touchend', handleDragEnd);
			if (scrollInterval) {
				clearInterval(scrollInterval);
			}
		};
	}, [dragState.isDragging]);

	const handleDragStart = useCallback(
		(item: { id: string; categoryId?: string }) => {
			setDragState({
				isDragging: true,
				draggedItem: item
			});
		},
		[]
	);

	const handleDragEnd = useCallback(() => {
		setDragState({
			isDragging: false,
			draggedItem: null
		});
		if (selectionMode && selectedItems.size > 0) {
			setSelectedItems(new Set());
			setSelectionMode(false);
			setSelectionCategory(null);
		}
	}, [selectionMode, selectedItems.size]);

	const toggleSelectionMode = useCallback(() => {
		setSelectionMode(prev => !prev);
		if (selectionMode) {
			setSelectedItems(new Set());
			setSelectionCategory(null);
		}
	}, [selectionMode]);

	const handleItemHold = useCallback((item: { id: string; categoryId?: string }) => {
		if (!selectionMode) {
			setSelectionMode(true);
			setSelectionCategory(item.categoryId || 'uncategorized');
			setSelectedItems(new Set([item.id]));
		}
	}, [selectionMode]);

	const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
		setSelectedItems(prev => {
			const newSelected = new Set(prev);
			if (selected) {
				newSelected.add(itemId);
			} else {
				newSelected.delete(itemId);
			}
			return newSelected;
		});
	}, []);

	const toggleCategoryCollapse = useCallback((categoryId: string) => {
		setCollapsedCategories(prev => {
			const newCollapsed = new Set(prev);
			if (newCollapsed.has(categoryId)) {
				newCollapsed.delete(categoryId);
			} else {
				newCollapsed.add(categoryId);
			}
			return newCollapsed;
		});
	}, []);

	const { filteredCategorizedItems, filteredUncategorizedItems } =
		useMemo(() => {
			if (!items || !categories)
				return {
					filteredCategorizedItems: [],
					filteredUncategorizedItems: []
				};

			const searchLower = searchTerm.toLowerCase();
			const filteredUncategorizedItems = items.filter(item =>
				item.name.toLowerCase().includes(searchLower)
			);

			const filteredCategorizedItems = categories.map(category => {
				const categoryItems = (category.items
					?.map(itemCategory => ({
						...itemCategory.item,
						price: itemCategory.item?.price || 0,
						weight: itemCategory.item?.weight || 0
					}))
					.filter(
						item => item.id && item.name?.toLowerCase().includes(searchLower)
					) || []) as Item[];

				return {
					category,
					items: categoryItems
				};
			});

			return {
				filteredCategorizedItems,
				filteredUncategorizedItems
			};
		}, [items, categories, searchTerm]);

	const router = useRouter();

	const onPageChange = useCallback(
		(page: number) => {
			const totalPages = Math.ceil(pagination.total / pagination.limit);
			if (page < 1 || page > totalPages) return;
			router.push(`/items?page=${page}&limit=${pagination.limit}`);
		},
		[pagination.total, pagination.limit, router]
	);

	return (
		<DndProvider options={HTML5toTouch}>
			<div className='space-y-4 lg:space-y-6 pb-4 lg:pb-6'>
				{/* Header */}
				<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
					<div>
						<h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
							Items
						</h1>
						<p className='text-gray-600 mt-1'>
							Manage your inventory and organize items by categories
						</p>
					</div>
					<div className='flex items-center gap-3'>
						<AddCategoryDialog>
							<Button
								variant='outline'
								className='gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50'>
								<Plus className='h-4 w-4' />
								Add Category
							</Button>
						</AddCategoryDialog>
						<AddItemDialog>
							<Button className='gap-2 bg-emerald-600 hover:bg-emerald-700'>
								<Plus className='h-4 w-4' />
								Add Item
							</Button>
						</AddItemDialog>
					</div>
				</div>

				{/* Search and Controls */}
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='relative w-full sm:w-96'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
							<Input
								placeholder='Search items...'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
						{selectionMode && (
							<Button
								variant='outline'
								size='sm'
								onClick={toggleSelectionMode}
								className='border-red-200 text-red-600 hover:bg-red-50'>
								<X className='h-4 w-4 mr-1' />
								Cancel
							</Button>
						)}
					</div>
					{selectionMode && selectedItems.size > 0 && (
						<div className='text-sm text-gray-600'>
							{selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
						</div>
					)}
				</div>

				<div className='space-y-6'>
					{/* Uncategorized Items Section - Always visible at top */}
					<UncategorizedSection
						items={filteredUncategorizedItems}
						isDragging={dragState.isDragging}
						draggedItem={dragState.draggedItem}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						pagination={pagination}
						onPageChange={onPageChange}
						selectionMode={selectionMode}
						selectedItems={selectedItems}
						selectionCategory={selectionCategory}
						onItemHold={handleItemHold}
						onItemSelect={handleItemSelect}
					/>

					{/* Categories */}
					{filteredCategorizedItems.map(item => (
						<CategorySection
							key={item.category.id}
							category={item.category}
							items={item.items}
							collapsed={collapsedCategories.has(item.category.id)}
							onToggleCollapse={() => toggleCategoryCollapse(item.category.id)}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
							selectionMode={selectionMode}
							selectedItems={selectedItems}
							selectionCategory={selectionCategory}
							onItemHold={handleItemHold}
							onItemSelect={handleItemSelect}
						/>
					))}
				</div>

				{/* Empty State */}
				{filteredCategorizedItems.length === 0 &&
					filteredUncategorizedItems.length === 0 && (
						<div className='text-center py-12'>
							<div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
								<Package className='h-12 w-12 text-gray-400' />
							</div>
							<h3 className='text-lg font-semibold text-gray-900 mb-2'>
								{searchTerm ? 'No items found' : 'No items yet'}
							</h3>
							<p className='text-gray-600 mb-6 max-w-sm mx-auto'>
								{searchTerm
									? `No items match "${searchTerm}". Try a different search term.`
									: 'Get started by adding your first item to the inventory.'}
							</p>
							{!searchTerm && (
								<AddItemDialog>
									<Button className='gap-2 bg-emerald-600 hover:bg-emerald-700'>
										<Plus className='h-4 w-4' />
										Add Your First Item
									</Button>
								</AddItemDialog>
							)}
						</div>
					)}
			</div>
		</DndProvider>
	);
}
