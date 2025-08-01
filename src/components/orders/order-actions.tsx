'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { Eye, Trash, Printer, Loader2 } from 'lucide-react';
import { printDirectlyToThermalPrinter } from '@/lib/utils/direct-thermal-print';
import {
	scanForPrinters,
	isBluetoothSupported,
	savePrinterForDirectUse,
	getGlobalConnectedPrinter
} from '@/lib/utils/printer-utils';
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

			const pairedPrinter = getGlobalConnectedPrinter();
			console.log('Current paired printer:', pairedPrinter);
			
			if (!pairedPrinter) {
				console.log('No printer found, attempting to pair...');
				try {
					await handleAutoPairPrinter();
					const newPairedPrinter = getGlobalConnectedPrinter();
					console.log('After pairing, new printer:', newPairedPrinter);
					
					if (!newPairedPrinter) {
						alert('Printer pairing was cancelled or failed. Cannot print order.');
						return;
					}
				} catch (pairError) {
					console.error('Pairing failed:', pairError);
					alert('Failed to pair printer. Cannot print order.');
					return;
				}
			}

			console.log('Getting order details...');
			const orderDetails = await api.getOrderById(orderId);

			if (!orderDetails) {
				alert('Order not found');
				return;
			}

			const settingsToUse = settings || {
				storeName: 'Store',
				address: 'Address',
				phone: 'Phone',
				email: 'Email',
				currency: '₹',
				footer: 'Thank you for your business!',
				taxRate: 0,
				notifications: {
					outOfStock: false,
					newOrders: false,
					orderStatus: false,
					dailyReports: false
				},
				printer: {
					name: '',
					deviceId: '',
					type: 'bluetooth' as const,
					autoConnect: false,
					connected: false,
					paperWidth: 58
				}
			};

			console.log('Attempting to print...');
			await printDirectlyToThermalPrinter(orderDetails, settingsToUse);
			console.log('Print successful!');
		} catch (error) {
			console.error('Error with thermal print:', error);

			// Check if this is a "no printer" or "out of range" error that wasn't caught above
			if (
				error instanceof Error &&
				(error.message.includes('No thermal printer') ||
				 error.message.includes('no longer in range') ||
				 error.message.includes('Could not connect to printer'))
			) {
				console.log('Caught printer connectivity error, attempting to pair...');
				try {
					await handleAutoPairPrinter();
					const newPairedPrinter = getGlobalConnectedPrinter();
					if (newPairedPrinter) {
						console.log('Retry print after pairing...');
						const orderDetails = await api.getOrderById(orderId);
						if (orderDetails) {
							const settingsToUse = settings || {
								storeName: 'Store',
								address: 'Address',
								phone: 'Phone',
								email: 'Email',
								currency: '₹',
								footer: 'Thank you for your business!',
								taxRate: 0,
								notifications: {
									outOfStock: false,
									newOrders: false,
									orderStatus: false,
									dailyReports: false
								},
								printer: {
									name: '',
									deviceId: '',
									type: 'bluetooth' as const,
									autoConnect: false,
									connected: false,
									paperWidth: 58
								}
							};
							await printDirectlyToThermalPrinter(orderDetails, settingsToUse);
							console.log('Retry print successful!');
							return; // Success, don't show error
						}
					}
				} catch (pairError) {
					console.error('Error pairing printer during retry:', pairError);
					alert('Failed to pair printer. Please try the Pair Printer button first.');
					return;
				}
			}

			// Show specific error message based on error type
			if (error instanceof Error) {
				if (error.message.includes('Bluetooth not supported')) {
					alert('Bluetooth is not supported in this browser. Please use Chrome or Edge.');
				} else if (error.message.includes('No printer selected')) {
					alert('No printer was selected. Please try again and select a printer.');
				} else if (error.message.includes('no longer in range')) {
					alert('Printer is out of range. Please bring the printer closer and try again.');
				} else {
					alert(`Print failed: ${error.message}`);
				}
			} else {
				alert('Failed to print order. Please try again.');
			}
		} finally {
			setIsPrintingThermal(false);
		}
	};

	const handleAutoPairPrinter = async () => {
		console.log('Starting auto pair process...');
		
		if (!isBluetoothSupported()) {
			console.log('Bluetooth not supported');
			alert(
				'Bluetooth is not supported in this browser. Please use Chrome or Edge.'
			);
			throw new Error('Bluetooth not supported');
		}

		console.log('Scanning for printers...');
		const printers = await scanForPrinters();
		console.log('Scan result:', printers);

		if (printers.length === 0) {
			console.log('No printers found or selected');
			throw new Error('No printer selected');
		}

		const printer = printers[0];
		console.log('Selected printer:', printer);
		
		savePrinterForDirectUse(printer);
		console.log('Printer saved for direct use');

		// Verify it was saved
		const savedPrinter = getGlobalConnectedPrinter();
		console.log('Verified saved printer:', savedPrinter);

		alert(
			`Thermal printer "${printer.name}" paired successfully! Proceeding with print...`
		);
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
				alert('Order deleted successfully!');
			} catch (error) {
				console.error('Failed to delete order:', error);
				alert('Failed to delete order. Please try again.');
			}
		}
	};

	const handleViewDetails = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	return (
		<div className='flex flex-col gap-2 mt-4 pt-4 border-t'>
			<Button
				variant='ghost'
				size='sm'
				className='text-red-500 hover:text-red-700 hover:bg-red-50 self-start'
				onClick={() => handleDeleteOrder(order.id)}>
				<Trash className='h-4 w-4 mr-1' />
				Delete
			</Button>

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
