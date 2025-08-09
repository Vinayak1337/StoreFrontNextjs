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
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='w-[92vw] max-w-md sm:max-w-lg p-5'>
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
