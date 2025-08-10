'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { handleDeleteOrder } from '@/app/api/orders/[id]/order-actions';

interface OrderDetailActionsProps {
	order: Order;
}

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleEditOrderClick = () => {
		router.push(`/orders/${order.id}/edit`);
	};

	const handleDeleteOrderClick = async () => {
		if (!order || isDeleting) return;

		if (
			confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			setIsDeleting(true);
			try {
				await handleDeleteOrder(order.id);
				toast.success('Order deleted successfully');
			} catch (error) {
				toast.error('Failed to delete order');
				console.error(error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	return (
		<div className='flex flex-col sm:items-end gap-3 sm:gap-4 w-full sm:w-auto'>
			<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
				<Button
					variant='outline'
					size='sm'
					onClick={handleEditOrderClick}
					className='flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto'>
					<Pencil className='h-3 w-3 sm:h-4 sm:w-4' />
					<span className='hidden xs:inline'>Edit Order</span>
					<span className='xs:hidden'>Edit</span>
				</Button>
			</div>

			<Button
				variant='ghost'
				size='sm'
				onClick={handleDeleteOrderClick}
				disabled={isDeleting}
				className='text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto'>
				<Trash className='h-3 w-3 sm:h-4 sm:w-4' />
				<span className='hidden xs:inline'>
					{isDeleting ? 'Deleting...' : 'Delete Order'}
				</span>
				<span className='xs:hidden'>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</span>
			</Button>
		</div>
	);
}
