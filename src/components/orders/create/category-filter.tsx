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
		<div className='mb-4'>
			<div className='flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
				<Button
					variant={selectedCategory === null ? 'default' : 'outline'}
					size='sm'
					onClick={() => onSelectCategory(null)}
					className='gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0'>
					<Package className='h-3 w-3 sm:h-4 sm:w-4' />
					All Items
				</Button>
				{categories.map(category => (
					<Button
						key={category.id}
						variant={selectedCategory === category.id ? 'default' : 'outline'}
						size='sm'
						onClick={() => onSelectCategory(category.id)}
						className='gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0'>
						<div
							className='w-2 h-2 sm:w-3 sm:h-3 rounded-full'
							style={{ backgroundColor: category.color }}
						/>
						<span>{category.name}</span>
					</Button>
				))}
			</div>
		</div>
	);
}