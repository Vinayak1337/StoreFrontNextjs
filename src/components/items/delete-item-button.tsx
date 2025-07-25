'use client';

import { useState } from 'react';
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
import { useDeleteItem } from '@/lib/hooks/useItems';
import { toast } from 'react-toastify';

interface DeleteItemButtonProps {
	itemId: string;
	itemName?: string;
	children: React.ReactNode;
}

export function DeleteItemButton({ itemId, itemName, children }: DeleteItemButtonProps) {
	const deleteItemMutation = useDeleteItem();
	const [open, setOpen] = useState(false);

	const handleDelete = async () => {
		try {
			await deleteItemMutation.mutateAsync(itemId);
			toast.success('Item deleted successfully!');
			setOpen(false);
		} catch (error) {
			console.error('Error deleting item:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to delete item. Please try again.');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Delete Item</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete {itemName ? `"${itemName}"` : 'this item'}? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={deleteItemMutation.isPending}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={handleDelete} disabled={deleteItemMutation.isPending}>
						{deleteItemMutation.isPending ? 'Deleting...' : 'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
