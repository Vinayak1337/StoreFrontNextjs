'use client';

import { useState } from 'react';
// Global types available without import
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger
} from '@/components/ui/dialog';
import { ItemForm } from './item-form';

interface EditItemDialogProps {
	item: Item;
	children: React.ReactNode;
}

export function EditItemDialog({ item, children }: EditItemDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
					<DialogDescription>
						Make changes to the item details below.
					</DialogDescription>
				</DialogHeader>
				<ItemForm item={item} onClose={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
