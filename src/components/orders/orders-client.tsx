'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders } from '@/lib/hooks/useOrders';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { Order } from '@/types';
import api from '@/lib/services/api';
import { Plus, Eye, ChevronUp, Trash, Printer, Loader2, Bluetooth } from 'lucide-react';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { printDirectlyToThermalPrinter } from '@/lib/utils/direct-thermal-print';
import { scanForPrinters, isBluetoothSupported, savePrinterForDirectUse } from '@/lib/utils/printer-utils';

interface OrdersClientProps {
	initialOrders: Order[];
}

export default function OrdersClient({ }: OrdersClientProps) {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const queryClient = useQueryClient();
	const { settings } = useSelector((state: RootState) => state.settings || { settings: null });
	const [expandedOrders] = useState<string[]>([]);
	const [isPrintingThermal, setIsPrintingThermal] = useState<string | null>(null);
	const [isPairingPrinter, setIsPairingPrinter] = useState(false);

	// Use React Query hooks for data fetching
	const { data: orders = [], isLoading, error } = useOrders();

	// Load settings on component mount
	useEffect(() => {
		dispatch(fetchSettings());
	}, [dispatch]);


	// Handle printer pairing with success state
	const [printerSaved, setPrinterSaved] = useState(false);
	
	const handlePairPrinter = async () => {
		try {
			setIsPairingPrinter(true);
			setPrinterSaved(false);
			
			if (!isBluetoothSupported()) {
				alert('Bluetooth is not supported in this browser. Please use Chrome or Edge.');
				return;
			}
			
			// Scan for printers
			const printers = await scanForPrinters();
			
			if (printers.length === 0) {
				alert('No printer was selected or found. Please try again.');
				return;
			}
			
			// Get the first (and likely only) printer
			const printer = printers[0];
			
			// Save it for direct use
			savePrinterForDirectUse(printer);
			
			// Set success state
			setPrinterSaved(true);
			
			// Reset success state after 3 seconds
			setTimeout(() => {
				setPrinterSaved(false);
			}, 3000);
			
			alert(`Thermal printer "${printer.name}" paired successfully! You can now print orders directly.`);
			
		} catch (error) {
			console.error('Error pairing printer:', error);
			alert('Failed to pair printer. Please try again.');
		} finally {
			setIsPairingPrinter(false);
		}
	};

	// Handle direct thermal print - no dialog
	const handleThermalPrint = async (orderId: string) => {
		try {
			setIsPrintingThermal(orderId);
			
			const order = orders?.find(o => o.id === orderId);
			if (!order) return;

			// Calculate total
			const total = order.orderItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			let billToUse = order.bill;

			// Create bill if it doesn't exist
			if (!billToUse) {
				const billResult = await api.createBill({
					orderId,
					totalAmount: total,
					taxes: 0,
					paymentMethod: 'Cash'
				});


				if (billResult) {
					billToUse = billResult;
					// Invalidate and refetch orders
					queryClient.invalidateQueries({ queryKey: ['orders'] });
				} else {
					alert('Failed to create bill for printing');
					return;
				}
			} else {
				// If bill exists but doesn't have order data, fetch it with full data
				if (!billToUse.order) {
					billToUse = await api.getBillById(billToUse.id);
				}
			}

			// Use settings or default values for printing
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
			
			if (billToUse) {
				// Call direct print function that uses auto-connected printer
				await printDirectlyToThermalPrinter(billToUse, settingsToUse);
			} else {
				alert('Failed to create or find bill for printing.');
			}
		} catch (error) {
			console.error('Error with thermal print:', error);
			alert('Failed to print order. Please try again.');
		} finally {
			setIsPrintingThermal(null);
		}
	};

	const handleDeleteOrder = async (orderId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			await api.deleteOrder(orderId);
			// Invalidate orders cache
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		}
	};

	const handleViewDetails = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	if (isLoading) {
		return <FullScreenLoader message="Loading orders..." />;
	}

	if (error) {
		return (
			<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
				<p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Orders Management</h1>
					<div className='flex items-center gap-2'>
						<Button
							onClick={() => router.push('/orders/create')}
							className='flex items-center gap-2 text-sm md:text-base'>
							<Plus className='h-4 w-4' />
							<span className='hidden sm:inline'>Create New Order</span>
							<span className='sm:hidden'>Create</span>
						</Button>
						<Button
							variant={printerSaved ? 'default' : 'outline'}
							onClick={handlePairPrinter}
							disabled={isPairingPrinter}
							className={`flex items-center gap-2 text-sm md:text-base ${
								printerSaved 
									? 'bg-green-600 hover:bg-green-700 text-white' 
									: ''
							}`}>
							{isPairingPrinter ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : printerSaved ? (
								<Bluetooth className='h-4 w-4' />
							) : (
								<Bluetooth className='h-4 w-4' />
							)}
							<span className='hidden sm:inline'>
								{printerSaved ? 'Printer Saved' : 'Pair Printer'}
							</span>
							<span className='sm:hidden'>
								{printerSaved ? 'Saved' : 'Pair'}
							</span>
						</Button>
					</div>
				</div>
			</header>
			<main className='flex-1 p-4 md:p-6'>
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold tracking-tight'>Orders</h2>

					{!orders || orders.length === 0 ? (
						<div className='border rounded-md p-8 text-center'>
							<p className='text-muted-foreground'>
								No orders found. Create a new order to get started.
							</p>
						</div>
					) : (
						<div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
							{orders.map(order => (
								<Card key={order.id} className='flex flex-col'>
									<CardHeader className='pb-2'>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-base md:text-lg'>
												Order #{order.id.substring(0, 8)}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent className='flex-1 flex flex-col'>
										<div className='grid gap-2 flex-1'>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-muted-foreground'>Customer:</span>
												<span className='font-medium truncate ml-2'>{order.customerName}</span>
											</div>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-muted-foreground'>Date:</span>
												<span>
													{format(new Date(order.createdAt), 'MMM dd, yyyy')}
												</span>
											</div>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-muted-foreground'>Items:</span>
												<span>{order.orderItems.length}</span>
											</div>
											<div className='flex items-center justify-between font-medium mt-1'>
												<span>Total:</span>
												<span>
													₹{' '}
													{order.orderItems
														.reduce(
															(
																sum: number,
																item: { price: number; quantity: number }
															) => sum + item.price * item.quantity,
															0
														)
														.toFixed(2)}
												</span>
											</div>

											{expandedOrders.includes(order.id) && (
												<div className='mt-2 pt-2 border-t'>
													<h4 className='text-sm font-medium mb-1'>
														Order Items:
													</h4>
													<ul className='text-sm space-y-1 max-h-32 overflow-y-auto'>
														{order.orderItems.map(item => (
															<li key={item.id} className='flex justify-between'>
																<span className='truncate'>
																	{item.quantity}x{' '}
																	{item.item?.name ||
																		`Item #${item.itemId.substring(0, 6)}`}
																</span>
																<div className='ml-auto text-right flex-shrink-0'>
																	₹ {(item.price * item.quantity).toFixed(2)}
																</div>
															</li>
														))}
													</ul>
												</div>
											)}
										</div>

										<div className='flex flex-col gap-2 mt-4 pt-4 border-t'>
											<Button
												variant='ghost'
												size='sm'
												className='text-red-500 hover:text-red-700 hover:bg-red-50 self-start'
												onClick={() => handleDeleteOrder(order.id)}>
												<Trash className='h-4 w-4 mr-1' />
												Delete
											</Button>

											<div className='flex flex-col sm:flex-row gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewDetails(order.id)}
													className='flex-1'>
													{expandedOrders.includes(order.id) ? (
														<ChevronUp className='h-4 w-4 mr-1' />
													) : (
														<Eye className='h-4 w-4 mr-1' />
													)}
													<span className='hidden sm:inline'>
														{expandedOrders.includes(order.id)
															? 'Hide Details'
															: 'View Details'}
													</span>
													<span className='sm:hidden'>
														{expandedOrders.includes(order.id) ? 'Hide' : 'View'}
													</span>
												</Button>

												<Button
													size='sm'
													onClick={() => handleThermalPrint(order.id)}
													disabled={isPrintingThermal === order.id}
													className='flex-1 sm:flex-none gap-1 bg-blue-600 hover:bg-blue-700 text-white'>
													{isPrintingThermal === order.id ? (
														<>
															<Loader2 className='h-3 w-3 animate-spin' />
															<span className='hidden sm:inline'>Printing...</span>
														</>
													) : (
														<>
															<Printer className='h-3 w-3' />
															<span className='hidden sm:inline'>Thermal Print</span>
														</>
													)}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}