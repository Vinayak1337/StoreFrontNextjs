'use client';

import { useState } from 'react';
import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { ItemForm } from './item-form';

interface EditItemDialogProps {
	item: Item;
}

export function EditItemDialog({ item }: EditItemDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
				</DialogHeader>
				<ItemForm item={item} onClose={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
