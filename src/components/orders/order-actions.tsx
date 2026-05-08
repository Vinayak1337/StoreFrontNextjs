'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { Eye, Trash, Printer, Loader2, Pencil, Archive } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
	getThermalOrderPrintErrorMessage,
	printThermalOrder
} from '@/lib/utils/thermal-order-printing';
import { getSettings } from '@/app/api/settings/actions';

interface OrderActionsProps {
	order: BasicOrder;
}

export function OrderActions({ order }: OrderActionsProps) {
	const router = useRouter();
	const [settings, setSettings] = useState<Settings | null>(null);
	const [isPrintingThermal, setIsPrintingThermal] = useState(false);

	useEffect(() => {
		getSettings().then(setSettings).catch(console.error);
	}, []);

	const handleThermalPrint = async (orderId: string) => {
		try {
			setIsPrintingThermal(true);

			await printThermalOrder({
				orderId,
				settings,
				onPrinterPaired: printer => {
					toast.success(
						`Thermal printer "${printer.name}" paired successfully! Proceeding with print...`
					);
				}
			});
		} catch (error) {
			console.error('Error with thermal print:', error);
			toast.error(getThermalOrderPrintErrorMessage(error));
		} finally {
			setIsPrintingThermal(false);
		}
	};

	const handleDeleteOrder = async (orderId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			try {
				await api.deleteOrder(orderId);
				router.refresh();
				toast.success('Order deleted successfully!');
			} catch (error) {
				console.error('Failed to delete order:', error);
				toast.error('Failed to delete order. Please try again.');
			}
		}
	};

	const handleArchiveOrder = async (orderId: string) => {
		if (
			confirm(
				'Are you sure you want to archive this order? It will be moved to archived orders.'
			)
		) {
			try {
				await api.archiveOrder(orderId);
				router.refresh();
				toast.success('Order archived successfully!');
			} catch (error) {
				console.error('Failed to archive order:', error);
				toast.error('Failed to archive order. Please try again.');
			}
		}
	};

	const handleViewDetails = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	return (
		<div className='mt-4 pt-4 border-t'>
			<div className='flex items-center justify-between gap-1 sm:gap-2 mb-2'>
				<Link href={`/orders/${order.id}/edit`} title='Edit order' className='flex-1'>
					<Button variant='ghost' size='sm' className='w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50'>
						<Pencil className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
						<span className='text-xs'>Edit</span>
					</Button>
				</Link>
				<Button
					variant='ghost'
					size='sm'
					className='flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50'
					onClick={() => handleArchiveOrder(order.id)}>
					<Archive className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
					<span className='text-xs'>Archive</span>
				</Button>
				<Button
					variant='ghost'
					size='sm'
					className='flex-1 text-red-500 hover:text-red-700 hover:bg-red-50'
					onClick={() => handleDeleteOrder(order.id)}>
					<Trash className='h-3 w-3 sm:h-4 sm:w-4 mr-1' />
					<span className='text-xs'>Delete</span>
				</Button>
			</div>

			<div className='flex flex-col gap-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => handleViewDetails(order.id)}
					className='w-full justify-center'>
					<Eye className='h-3 w-3 mr-1' />
					<span className='text-xs'>View Details</span>
				</Button>

				<Button
					size='sm'
					onClick={() => handleThermalPrint(order.id)}
					disabled={isPrintingThermal}
					className='w-full justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white'>
					{isPrintingThermal ? (
						<>
							<Loader2 className='h-3 w-3 animate-spin' />
							<span className='text-xs'>Printing...</span>
						</>
					) : (
						<>
							<Printer className='h-3 w-3' />
							<span className='text-xs'>Print</span>
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
