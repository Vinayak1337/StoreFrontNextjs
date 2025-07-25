'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import {
	fetchItems,
	fetchCategories,
	createCategory,
	addItemToCategory,
	removeItemFromCategory
} from '@/lib/redux/slices/items.slice';
import { Item, Category } from '@/types';

// React DnD imports
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// UI Components
import {
	Search,
	Plus,
	Package,
	Grid3X3,
	List,
	ChevronDown,
	ChevronRight,
	Tag,
	Trash2,
	Edit3,
	GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AddItemDialog } from '@/components/items/add-item-dialog';
import { EditItemDialog } from '@/components/items/edit-item-dialog';
import { DeleteItemButton } from '@/components/items/delete-item-button';
import { toast } from 'react-toastify';

// Category color palette
const CATEGORY_COLORS = [
	'#ef4444',
	'#f97316',
	'#f59e0b',
	'#eab308',
	'#84cc16',
	'#22c55e',
	'#10b981',
	'#14b8a6',
	'#06b6d4',
	'#0ea5e9',
	'#3b82f6',
	'#1d4ed8',
	'#1e40af',
	'#1e3a8a',
	'#1e3a8a',
	'#ec4899',
	'#f43f5e',
	'#64748b',
	'#6b7280',
	'#374151'
];

// Drag types
const ItemTypes = {
	ITEM: 'item'
};

// Draggable Item Component
function DraggableItem({
	item,
	categoryId,
	onDragStart,
	onDragEnd
}: {
	item: Item;
	categoryId?: string;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: ItemTypes.ITEM,
			item: () => {
				onDragStart?.({ id: item.id, categoryId });
				return { id: item.id, categoryId };
			},
			end: () => {
				onDragEnd?.();
			},
			collect: monitor => ({
				isDragging: monitor.isDragging()
			})
		}),
		[item.id, categoryId, onDragStart, onDragEnd]
	);

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
					: 'cursor-grab hover:cursor-grab'
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
					</div>
					<div className='opacity-60 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing'>
						<GripVertical className='h-4 w-4 text-gray-500' />
					</div>
				</div>

				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<span className='text-lg font-bold text-gray-900'>
							{formatPrice(item.price)}
						</span>
						<Badge
							variant={item.inStock ? 'default' : 'destructive'}
							className='text-xs'>
							{item.inStock ? 'In Stock' : 'Out of Stock'}
						</Badge>
					</div>

					<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						<EditItemDialog item={item}>
							<Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
								<Edit3 className='h-3 w-3' />
							</Button>
						</EditItemDialog>
						<DeleteItemButton itemId={item.id} itemName={item.name}>
							<Button
								variant='ghost'
								size='sm'
								className='h-8 w-8 p-0 text-red-600 hover:text-red-700'>
								<Trash2 className='h-3 w-3' />
							</Button>
						</DeleteItemButton>
					</div>
				</div>
			</div>
		</div>
	);
}

// Category Section Component
function CategorySection({
	category,
	items,
	collapsed,
	onToggleCollapse,
	onDragStart,
	onDragEnd
}: {
	category: Category;
	items: Item[];
	collapsed: boolean;
	onToggleCollapse: () => void;
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
}) {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);

	const [{ isOver }, drop] = useDrop(() => ({
		accept: ItemTypes.ITEM,
		drop: async (draggedItem: { id: string; categoryId?: string }) => {
			if (draggedItem.categoryId !== category.id) {
				try {
					// Remove from current category if it has one
					if (draggedItem.categoryId) {
						await dispatch(
							removeItemFromCategory({
								categoryId: draggedItem.categoryId,
								itemId: draggedItem.id
							})
						).unwrap();
					}
					// Add to new category
					await dispatch(
						addItemToCategory({
							categoryId: category.id,
							itemId: draggedItem.id
						})
					).unwrap();

					// Refresh data only after successful operations
					dispatch(fetchItems());
					dispatch(fetchCategories());
				} catch (error) {
					console.error('Failed to move item:', error);
					toast.error('Failed to move item to category. Please try again.');
				}
			}
		},
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	}));

	drop(ref);

	return (
		<div
			ref={ref}
			className={`rounded-xl border-2 transition-all duration-200 ${
				isOver
					? 'border-emerald-400 bg-emerald-50 shadow-lg'
					: 'border-gray-200 bg-white shadow-sm hover:shadow-md'
			}`}>
			{/* Category Header - Always droppable */}
			<div
				className={`p-4 ${collapsed ? '' : 'border-b border-gray-100'} ${
					isOver && collapsed ? 'bg-emerald-50' : ''
				}`}>
				<div className='flex items-center justify-between'>
					<button
						onClick={onToggleCollapse}
						className='flex items-center gap-3 flex-1 text-left hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors'>
						{collapsed ? (
							<ChevronRight className='h-4 w-4 text-gray-400' />
						) : (
							<ChevronDown className='h-4 w-4 text-gray-400' />
						)}
						<div
							className='w-4 h-4 rounded-full flex-shrink-0'
							style={{ backgroundColor: category.color }}
						/>
						<div className='flex-1'>
							<h3 className='font-semibold text-gray-900'>{category.name}</h3>
							<p className='text-sm text-gray-500 mt-0.5'>
								{items.length} {items.length === 1 ? 'item' : 'items'}
							</p>
						</div>
					</button>

					<div className='flex items-center gap-2'>
						<Badge variant='secondary' className='text-xs'>
							{items.length}
						</Badge>
						{isOver && (
							<Badge variant='default' className='text-xs bg-emerald-500'>
								Drop here
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Category Items */}
			{!collapsed && (
				<div className='p-4'>
					{items.length === 0 ? (
						<div className='text-center py-8 text-gray-500'>
							<Package className='h-8 w-8 mx-auto mb-2 opacity-50' />
							<p className='text-sm'>No items in this category</p>
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
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// Uncategorized Items Section
function UncategorizedSection({
	items,
	onDragStart,
	onDragEnd
}: {
	items: Item[];
	onDragStart?: (item: { id: string; categoryId?: string }) => void;
	onDragEnd?: () => void;
}) {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);

	const [{ isOver }, drop] = useDrop(() => ({
		accept: ItemTypes.ITEM,
		drop: async (draggedItem: { id: string; categoryId?: string }) => {
			if (draggedItem.categoryId) {
				try {
					await dispatch(
						removeItemFromCategory({
							categoryId: draggedItem.categoryId,
							itemId: draggedItem.id
						})
					).unwrap();

					// Refresh data only after successful operation
					dispatch(fetchItems());
					dispatch(fetchCategories());
				} catch (error) {
					console.error('Failed to remove item from category:', error);
					toast.error('Failed to remove item from category. Please try again.');
				}
			}
		},
		collect: monitor => ({
			isOver: monitor.isOver()
		})
	}));

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
							{items.length} {items.length === 1 ? 'item' : 'items'}
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
			</div>
		</div>
	);
}

// Create Category Dialog
function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch();
	const { categories } = useAppSelector(state => state.items);
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [color, setColor] = useState(CATEGORY_COLORS[0]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setLoading(true);
		try {
			await dispatch(
				createCategory({ name: name.trim(), color, order: categories.length })
			);
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
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type='submit' disabled={!name.trim() || loading}>
							{loading ? 'Creating...' : 'Create Category'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// Main Items Page Component
function ItemsPageContent() {
	const dispatch = useAppDispatch();
	const { items, categories, loading, categoryLoading } = useAppSelector(
		(state: RootState) => state.items
	);

	// Local state
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
		new Set()
	);

	// Load data
	useEffect(() => {
		dispatch(fetchItems());
		dispatch(fetchCategories());
	}, [dispatch]);

	// Filter and organize items with useMemo
	const { categorizedItems, uncategorizedItems, filteredCategories } =
		useMemo(() => {
			// Filter items by search - only search items, not categories
			const filtered = items.filter(item =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase())
			);

			// Group items by category
			const itemsByCategory: Record<string, Item[]> = {};
			const uncategorized: Item[] = [];

			filtered.forEach(item => {
				if (item.categories && item.categories.length > 0) {
					item.categories.forEach(cat => {
						if (!itemsByCategory[cat.categoryId]) {
							itemsByCategory[cat.categoryId] = [];
						}
						itemsByCategory[cat.categoryId].push(item);
					});
				} else {
					uncategorized.push(item);
				}
			});

			// Show all categories, but filter items within them when searching
			const sortedCategories = categories.sort((a, b) =>
				a.name.localeCompare(b.name)
			);

			return {
				categorizedItems: itemsByCategory,
				uncategorizedItems: uncategorized,
				filteredCategories: sortedCategories
			};
		}, [items, categories, searchTerm]);

	// Toggle category collapse
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

	// Drag handlers - keeping empty for compatibility with DraggableItem components
	const handleDragStart = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_item: { id: string; categoryId?: string }) => {
			// No longer needed for uncategorized section collapse
		},
		[]
	);

	const handleDragEnd = useCallback(() => {
		// No longer needed for uncategorized section collapse
	}, []);

	if (loading || categoryLoading) {
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
		<div className='space-y-4 lg:space-y-6 pb-4 lg:pb-6'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
				<div>
					<h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
						Items & Inventory
					</h1>
					<p className='text-gray-600 mt-1'>
						Manage your items and organize them into categories
					</p>
				</div>

				<div className='flex items-center gap-3 w-full lg:w-auto'>
					{/* Search */}
					<div className='relative flex-1 lg:w-80'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search items...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>

					{/* View Mode Toggle */}
					<div className='flex items-center border rounded-lg p-1'>
						<Button
							variant={viewMode === 'grid' ? 'default' : 'ghost'}
							size='sm'
							onClick={() => setViewMode('grid')}
							className='h-8 px-3'>
							<Grid3X3 className='h-4 w-4' />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'ghost'}
							size='sm'
							onClick={() => setViewMode('list')}
							className='h-8 px-3'>
							<List className='h-4 w-4' />
						</Button>
					</div>

					{/* Add Buttons */}
					<CreateCategoryDialog>
						<Button variant='outline' className='gap-2'>
							<Tag className='h-4 w-4' />
							Category
						</Button>
					</CreateCategoryDialog>

					<AddItemDialog>
						<Button className='gap-2'>
							<Plus className='h-4 w-4' />
							Add Item
						</Button>
					</AddItemDialog>
				</div>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				<div className='bg-white rounded-lg border p-4'>
					<div className='text-2xl font-bold text-gray-900'>{items.length}</div>
					<div className='text-sm text-gray-600'>Total Items</div>
				</div>
				<div className='bg-white rounded-lg border p-4'>
					<div className='text-2xl font-bold text-gray-900'>
						{categories.length}
					</div>
					<div className='text-sm text-gray-600'>Categories</div>
				</div>
				<div className='bg-white rounded-lg border p-4'>
					<div className='text-2xl font-bold text-green-600'>
						{items.filter(item => item.inStock).length}
					</div>
					<div className='text-sm text-gray-600'>In Stock</div>
				</div>
				<div className='bg-white rounded-lg border p-4'>
					<div className='text-2xl font-bold text-red-600'>
						{items.filter(item => !item.inStock).length}
					</div>
					<div className='text-sm text-gray-600'>Out of Stock</div>
				</div>
			</div>

			{/* Items with React DnD */}
			<div className='space-y-6'>
				{/* Uncategorized Items Section - Always visible at top */}
				<UncategorizedSection
					items={uncategorizedItems}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				/>

				{/* Categories */}
				{filteredCategories.map(category => (
					<CategorySection
						key={category.id}
						category={category}
						items={categorizedItems[category.id] || []}
						collapsed={collapsedCategories.has(category.id)}
						onToggleCollapse={() => toggleCategoryCollapse(category.id)}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
					/>
				))}
			</div>

			{/* Empty State */}
			{items.length === 0 && !loading && (
				<div className='text-center py-12'>
					<Package className='h-16 w-16 mx-auto mb-4 text-gray-400' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>
						No items found
					</h3>
					<p className='text-gray-600 mb-6'>
						Get started by adding your first item to the inventory.
					</p>
					<AddItemDialog>
						<Button className='gap-2'>
							<Plus className='h-4 w-4' />
							Add Your First Item
						</Button>
					</AddItemDialog>
				</div>
			)}
		</div>
	);
}

// Main export with DnD Provider
export default function ItemsPageRedesign() {
	return (
		<DndProvider backend={HTML5Backend}>
			<ItemsPageContent />
		</DndProvider>
	);
}
