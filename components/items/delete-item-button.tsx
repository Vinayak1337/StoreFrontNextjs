'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { deleteItem } from '@/lib/redux/slices/items.slice';

interface DeleteItemButtonProps {
	itemId: string;
	itemName: string;
}

export function DeleteItemButton({ itemId, itemName }: DeleteItemButtonProps) {
	const dispatch = useDispatch();
	const [open, setOpen] = useState(false);

	const handleDelete = () => {
		dispatch(deleteItem(itemId));
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='destructive' size='sm'>
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Delete Item</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &quot;{itemName}&quot;? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={handleDelete}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
