'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQueryClient } from '@tanstack/react-query';
import { useItems, useCategories } from '@/lib/hooks/useItems';
import { Item, Category } from '@/types';
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
import { Search, Plus, Grid, List, Loader2, Package } from 'lucide-react';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';

// Predefined color palette for categories
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

// Add Category Dialog Component
function AddCategoryDialog({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const { data: categories = [] } = useCategories();

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
				color, 
				order: categories.length 
			});
			// Invalidate categories cache
			queryClient.invalidateQueries({ queryKey: ['categories'] });
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
							className='flex-1'>
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
}

export default function ItemsClient({ }: ItemsClientProps) {
	// Local state
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
		new Set()
	);
	const [uncategorizedPage, setUncategorizedPage] = useState(1);
	const ITEMS_PER_PAGE = 25;
	const [dragState, setDragState] = useState<{
		isDragging: boolean;
		draggedItem: { id: string; categoryId?: string } | null;
	}>({
		isDragging: false,
		draggedItem: null
	});

	// Use React Query hooks for data fetching
	const { data: items = [], isLoading: itemsLoading } = useItems();
	const { data: categories = [], isLoading: categoriesLoading } = useCategories();

	// Auto-scroll functionality
	useEffect(() => {
		if (!dragState.isDragging) return;

		let scrollInterval: NodeJS.Timeout;

		const handleMouseMove = (e: MouseEvent) => {
			const scrollSpeed = 15;
			const viewportHeight = window.innerHeight;
			const mouseY = e.clientY;
			const topThreshold = viewportHeight * 0.3;
			const bottomThreshold = viewportHeight * 0.7;

			if (scrollInterval) {
				clearInterval(scrollInterval);
			}

			if (mouseY < topThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, -scrollSpeed);
				}, 16);
			} else if (mouseY > bottomThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, scrollSpeed);
				}, 16);
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			const scrollSpeed = 15;
			const viewportHeight = window.innerHeight;
			const mouseY = e.clientY;
			const topThreshold = viewportHeight * 0.3;
			const bottomThreshold = viewportHeight * 0.7;

			if (scrollInterval) {
				clearInterval(scrollInterval);
			}

			if (mouseY < topThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, -scrollSpeed);
				}, 16);
			} else if (mouseY > bottomThreshold) {
				scrollInterval = setInterval(() => {
					window.scrollBy(0, scrollSpeed);
				}, 16);
			}
		};

		const handleDragEnd = () => {
			if (scrollInterval) {
				clearInterval(scrollInterval);
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('dragover', handleDragOver);
		document.addEventListener('dragend', handleDragEnd);
		document.addEventListener('mouseup', handleDragEnd);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('dragover', handleDragOver);
			document.removeEventListener('dragend', handleDragEnd);
			document.removeEventListener('mouseup', handleDragEnd);
			if (scrollInterval) {
				clearInterval(scrollInterval);
			}
		};
	}, [dragState.isDragging]);

	// Drag handlers
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
	}, []);

	// Category toggle handler
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

	// Filter and organize items
	const { filteredCategories, uncategorizedItems, totalUncategorizedPages } =
		useMemo(() => {
			if (!items || !categories) return { filteredCategories: [], uncategorizedItems: [], totalUncategorizedPages: 0 };

			const searchLower = searchTerm.toLowerCase();
			const filteredItems = items.filter(item =>
				item.name.toLowerCase().includes(searchLower)
			);

			const itemsByCategory = new Map<string, Item[]>();
			const uncategorizedList: Item[] = [];

			filteredItems.forEach(item => {
				if (item.categories && item.categories.length > 0) {
					item.categories.forEach(cat => {
						if (!itemsByCategory.has(cat.categoryId)) {
							itemsByCategory.set(cat.categoryId, []);
						}
						itemsByCategory.get(cat.categoryId)!.push(item);
					});
				} else {
					uncategorizedList.push(item);
				}
			});

			const sortedCategories = [...categories]
				.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
				.filter(
					category => searchTerm === '' || itemsByCategory.has(category.id)
				)
				.map(category => ({
					category,
					items: itemsByCategory.get(category.id) || []
				}));

			// Paginate uncategorized items
			const totalPages = Math.ceil(uncategorizedList.length / ITEMS_PER_PAGE);
			const startIndex = (uncategorizedPage - 1) * ITEMS_PER_PAGE;
			const paginatedUncategorized = uncategorizedList.slice(
				startIndex,
				startIndex + ITEMS_PER_PAGE
			);

			return {
				filteredCategories: sortedCategories,
				uncategorizedItems: paginatedUncategorized,
				totalUncategorizedPages: totalPages
			};
		}, [items, categories, searchTerm, uncategorizedPage, ITEMS_PER_PAGE]);

	if (itemsLoading || categoriesLoading) {
		return <FullScreenLoader message="Loading items..." />;
	}

	return (
		<DndProvider backend={HTML5Backend}>
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
							<Button variant='outline' className='gap-2'>
								<Plus className='h-4 w-4' />
								Add Category
							</Button>
						</AddCategoryDialog>
						<AddItemDialog>
							<Button className='gap-2'>
								<Plus className='h-4 w-4' />
								Add Item
							</Button>
						</AddItemDialog>
					</div>
				</div>

				{/* Search and Controls */}
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					<div className='relative w-full sm:w-96'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
						<Input
							placeholder='Search items...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10'
						/>
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant={viewMode === 'grid' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setViewMode('grid')}
							className='gap-2'>
							<Grid className='h-4 w-4' />
							Grid
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setViewMode('list')}
							className='gap-2'>
							<List className='h-4 w-4' />
							List
						</Button>
					</div>
				</div>

				{/* Items with React DnD */}
				<div className='space-y-6'>
					{/* Uncategorized Items Section - Always visible at top */}
					<UncategorizedSection
						items={uncategorizedItems}
						isDragging={dragState.isDragging}
						draggedItem={dragState.draggedItem}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						currentPage={uncategorizedPage}
						totalPages={totalUncategorizedPages}
						onPageChange={setUncategorizedPage}
					/>

					{/* Categories */}
					{filteredCategories.map(item => (
						<CategorySection
							key={item.category.id}
							category={item.category}
							items={item.items}
							collapsed={collapsedCategories.has(item.category.id)}
							onToggleCollapse={() => toggleCategoryCollapse(item.category.id)}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						/>
					))}
				</div>

				{/* Empty State */}
				{filteredCategories.length === 0 && uncategorizedItems.length === 0 && (
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
								<Button className='gap-2'>
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