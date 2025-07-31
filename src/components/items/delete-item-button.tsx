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
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { toast } from 'react-toastify';

interface DeleteItemButtonProps {
	itemId: string;
	itemName?: string;
	children: React.ReactNode;
}

export function DeleteItemButton({ itemId, itemName, children }: DeleteItemButtonProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await api.deleteItem(itemId);
			toast.success('Item deleted successfully!');
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error('Error deleting item:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to delete item. Please try again.');
		} finally {
			setIsDeleting(false);
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
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isDeleting}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
