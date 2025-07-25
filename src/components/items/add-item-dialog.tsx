'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger
} from '@/components/ui/dialog';
import { ItemForm } from './item-form';

export function AddItemDialog({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<DialogDescription>
						Fill out the form below to add a new inventory item.
					</DialogDescription>
				</DialogHeader>
				<ItemForm onClose={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
