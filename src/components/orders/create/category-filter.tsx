'use client';

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
	categories: Category[];
	selectedCategory: string | null;
	onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
	categories,
	selectedCategory,
	onSelectCategory
}: CategoryFilterProps) {
	return (
		<div className='flex flex-wrap gap-2 mb-4'>
			<Button
				variant={selectedCategory === null ? 'default' : 'outline'}
				size='sm'
				onClick={() => onSelectCategory(null)}
				className='gap-1 sm:gap-2 text-xs sm:text-sm'>
				<Package className='h-3 w-3 sm:h-4 sm:w-4' />
				All Items
			</Button>
			{categories.map(category => (
				<Button
					key={category.id}
					variant={selectedCategory === category.id ? 'default' : 'outline'}
					size='sm'
					onClick={() => onSelectCategory(category.id)}
					className='gap-1 sm:gap-2 text-xs sm:text-sm'>
					<div
						className='w-2 h-2 sm:w-3 sm:h-3 rounded-full'
						style={{ backgroundColor: category.color }}
					/>
					<span className='truncate max-w-[100px] sm:max-w-none'>{category.name}</span>
				</Button>
			))}
		</div>
	);
}