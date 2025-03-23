'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateBillDialog } from '@/components/bills/create-bill-dialog';
import {
	fetchBills,
	deleteBill,
	updateBill
} from '@/lib/redux/slices/bills.slice';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { printBill } from '@/lib/utils/bill-utils';
import { toast } from 'react-toastify';
import {
	Trash,
	Eye,
	Bell,
	Printer,
	Bluetooth,
	AlertCircle,
	Check,
	Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatBillForThermalPrinter } from '@/lib/utils/bill-utils';
import Cookies from 'js-cookie';

// Add declaration for navigator.bluetooth.getDevices
declare global {
	interface Bluetooth {
		getDevices(): Promise<BluetoothDevice[]>;
	}
}

// Define printer device interface (same as in thermal-printer-dialog.tsx)
interface PrinterDevice {
	device: BluetoothDevice;
	name: string;
}

// Cookie storage keys
const PRINTER_ID_COOKIE = 'preferred_printer_id';
const PRINTER_NAME_COOKIE = 'preferred_printer_name';
const COOKIE_OPTIONS = { expires: 365, path: '/' }; // Make cookies available across the site

export default function BillsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const { bills, loading, error } = useSelector(
		(state: RootState) => state.bills
	);
	const { settings } = useSelector((state: RootState) => state.settings);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

	// Thermal printer states
	const [isScanning, setIsScanning] = useState(false);
	const [printers, setPrinters] = useState<PrinterDevice[]>([]);
	const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(
		null
	);
	const [isPrinting, setIsPrinting] = useState(false);
	const [hasBluetoothSupport, setHasBluetoothSupport] = useState(true);
	const [rememberedPrinter, setRememberedPrinter] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [isAutoConnecting, setIsAutoConnecting] = useState(false);

	useEffect(() => {
		dispatch(fetchBills());
		dispatch(fetchSettings());

		// Load remembered printer from cookies
		const printerId = Cookies.get(PRINTER_ID_COOKIE);
		const printerName = Cookies.get(PRINTER_NAME_COOKIE);

		if (printerId && printerName) {
			setRememberedPrinter({ id: printerId, name: printerName });
			console.log('Remembered printer found:', {
				id: printerId,
				name: printerName
			});
		}
	}, [dispatch]);

	// Check if Web Bluetooth is supported without requesting device
	useEffect(() => {
		if (typeof navigator !== 'undefined') {
			// Just check if API exists, don't try to use it yet
			const hasApi = 'bluetooth' in navigator;
			setHasBluetoothSupport(hasApi);
		}
	}, []);

	// Calculate the number of unpaid bills
	const unpaidBillsCount = bills.filter(bill => !bill.isPaid).length;

	// Save printer to cookies
	const rememberPrinter = (device: BluetoothDevice, name: string) => {
		try {
			Cookies.set(PRINTER_ID_COOKIE, device.id, COOKIE_OPTIONS); // Store for a year
			Cookies.set(PRINTER_NAME_COOKIE, name, COOKIE_OPTIONS);
			setRememberedPrinter({ id: device.id, name });
			console.log('Remembered printer:', { id: device.id, name });
			console.log('Cookies after saving:', {
				id: Cookies.get(PRINTER_ID_COOKIE),
				name: Cookies.get(PRINTER_NAME_COOKIE)
			});
		} catch (error) {
			console.error('Error saving printer to cookies:', error);
		}
	};

	// Try to auto-connect to remembered printer
	const connectToRememberedPrinter = async () => {
		if (!rememberedPrinter || !hasBluetoothSupport || !navigator.bluetooth) {
			return false;
		}

		try {
			setIsAutoConnecting(true);
			console.log(
				'Attempting to connect to remembered printer:',
				rememberedPrinter
			);

			// Get available devices that the browser already has permission for
			let availableDevices: BluetoothDevice[] = [];

			try {
				// Use type assertion with unknown as intermediate step to avoid direct any usage
				availableDevices = await (
					navigator.bluetooth as unknown as {
						getDevices(): Promise<BluetoothDevice[]>;
					}
				).getDevices();
				console.log('Available paired devices:', availableDevices);
			} catch (error) {
				console.error('Error getting available devices:', error);
				return false;
			}

			// Find our remembered printer in the list
			const matchedDevice = availableDevices.find(
				(device: BluetoothDevice) => device.id === rememberedPrinter.id
			);

			if (matchedDevice) {
				console.log(
					'Found remembered printer in paired devices:',
					matchedDevice
				);

				// Create printer device object
				const printer: PrinterDevice = {
					device: matchedDevice,
					name: matchedDevice.name || rememberedPrinter.name
				};

				// Update state with this printer
				setPrinters([printer]);
				setSelectedPrinter(printer);

				toast.success(`Connected to saved printer: ${printer.name}`);
				return true;
			} else {
				console.log('Remembered printer not found in paired devices');
				// Clear remembered printer if it's not available anymore
				Cookies.remove(PRINTER_ID_COOKIE, { path: '/' });
				Cookies.remove(PRINTER_NAME_COOKIE, { path: '/' });
				setRememberedPrinter(null);
				return false;
			}
		} catch (error) {
			console.error('Error connecting to remembered printer:', error);
			return false;
		} finally {
			setIsAutoConnecting(false);
		}
	};

	const handleViewDetails = (billId: string) => {
		router.push(`/bills/${billId}`);
	};

	const handlePrintBill = async (billId: string) => {
		if (!settings) {
			toast.error('Store settings not loaded. Please try again later.');
			return;
		}

		const bill = bills.find(b => b.id === billId);
		if (!bill) {
			toast.error('Bill not found');
			return;
		}

		// Set the selected bill ID
		setSelectedBillId(billId);

		// Try to connect to remembered printer first
		const connected = await connectToRememberedPrinter();

		if (connected) {
			// If connected successfully, open dialog with pre-selected printer
			setIsDialogOpen(true);
			// If auto-connected, proceed directly to printing after a brief pause
			setTimeout(() => {
				printToBluetooth();
			}, 500);
		} else {
			// If no remembered printer or connection failed, open dialog to scan
			setIsDialogOpen(true);
			setPrinters([]);
			setSelectedPrinter(null);

			// Immediately check for Bluetooth support
			if (hasBluetoothSupport) {
				// Show instructions for scanning
				toast.info('Click "Scan for Printers" to find nearby thermal printers');
			} else {
				// If Bluetooth is disabled or not supported, show a message and offer standard printing
				toast.info(
					'Bluetooth printing not available. Standard printing will be used instead.'
				);
			}
		}
	};

	// Scan for Bluetooth printers
	const scanForPrinters = async () => {
		if (!hasBluetoothSupport) {
			toast.error('Bluetooth is not supported or is disabled in this browser');
			return;
		}

		try {
			setIsScanning(true);
			setPrinters([]);
			setSelectedPrinter(null);

			// Request Bluetooth device with printer service
			const device = await navigator.bluetooth?.requestDevice({
				acceptAllDevices: true,
				// Request all possible services to maximize chances of connecting
				optionalServices: [
					'00001800-0000-1000-8000-00805f9b34fb', // Generic Access
					'00001801-0000-1000-8000-00805f9b34fb', // Generic Attribute
					'00001812-0000-1000-8000-00805f9b34fb', // Human Interface Device
					'03b7e958-aed3-4d18-a30e-c6313ad7d9dd', // Another printer service
					'49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service
					'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
					'0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
					'0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
					'0000ff00-0000-1000-8000-00805f9b34fb' // Another printer service
				]
			});

			if (!device) {
				throw new Error('No device selected');
			}

			// Add the discovered printer
			const newPrinter = {
				device,
				name: device.name || 'Unknown Printer'
			};

			setPrinters([newPrinter]);
			// Explicitly set the selected printer state
			setSelectedPrinter(newPrinter);

			// Remember this printer for future use
			rememberPrinter(device, newPrinter.name);

			console.log('Selected printer:', newPrinter);
			toast.success(`Found printer: ${newPrinter.name}`);
		} catch (error: unknown) {
			console.error('Error scanning for printers:', error);

			// Show more specific error messages
			if (error instanceof Error) {
				if (
					error.name === 'NotFoundError' &&
					error.message.includes('globally disabled')
				) {
					toast.error(
						'Web Bluetooth API is disabled. Please enable it in your browser settings.'
					);
					// Fall back to standard printing
					handleStandardPrint();
				} else if (error.name === 'NotFoundError') {
					toast.info('No printer was selected or found. Please try again.');
				} else if (error.name === 'SecurityError') {
					toast.error(
						'Bluetooth permission denied. Please allow Bluetooth access.'
					);
				} else {
					toast.error(`Failed to scan for printers: ${error.message}`);
				}
			} else {
				toast.error(
					'Failed to scan for printers. Make sure Bluetooth is enabled.'
				);
			}
		} finally {
			setIsScanning(false);
		}
	};

	// Generate a specialized ESC/POS command set based on the printer name or characteristics
	const generateSpecializedPrintData = (
		content: string,
		printerName: string
	): Uint8Array => {
		console.log('Using specialized print data generator for:', printerName);
		const encoder = new TextEncoder();

		// Different printers may require different initialization commands
		// AT POS thermal printer specific support
		if (
			printerName.toLowerCase().includes('at') ||
			printerName.toLowerCase().includes('pos') ||
			printerName.toLowerCase().includes('thermal')
		) {
			console.log('Using AT POS thermal printer format');
			// AT POS printers often use standard ESC/POS commands
			return encoder.encode(content);
		}

		// Different printers may require different initialization commands
		if (printerName.toLowerCase().includes('epson')) {
			// Epson-specific commands
			console.log('Using Epson-specific format');
			// Just send the ESC/POS commands already in the content
			return encoder.encode(content);
		}

		if (printerName.toLowerCase().includes('star')) {
			// Star Micronics-specific
			console.log('Using Star Micronics format');
			// Star printers may use different commands for some operations
			return encoder.encode(
				content
					.replace('\x1B\x61\x01', '\x1B\x1D\x61\x01') // Center align
					.replace('\x1B\x61\x00', '\x1B\x1D\x61\x00') // Left align
					.replace('\x1D\x56\x42', '\x1B\x64\x02') // Cut paper
			);
		}

		// Generic implementation for unknown printers - try multiple approaches
		console.log('Using generic printer format');
		return encoder.encode(content);
	};

	// Print to the selected printer with multiple fallback strategies
	const printToBluetooth = async () => {
		if (!selectedPrinter) {
			toast.error('Please select a printer first');
			return;
		}

		console.log('Starting print process with printer:', selectedPrinter);

		const bill = selectedBillId
			? bills.find(b => b.id === selectedBillId)
			: null;
		if (!bill || !settings) {
			toast.error('Bill data not available');
			return;
		}

		try {
			setIsPrinting(true);
			const device = selectedPrinter.device;

			// Remember this printer if not already remembered or if it's a different one
			if (!rememberedPrinter || rememberedPrinter.id !== device.id) {
				rememberPrinter(device, selectedPrinter.name);
			}

			toast.info('Connecting to printer...');
			console.log('Attempting to connect to GATT server...');

			// Connect to the printer
			const server = await device.gatt?.connect();
			if (!server) {
				throw new Error('Could not connect to printer');
			}

			console.log('GATT connection successful, getting services...');

			// Format the bill data for printing with ESC/POS commands
			const formattedContent = formatBillForThermalPrinter(bill, settings);
			if (!formattedContent) {
				throw new Error('Could not format bill data');
			}

			// Generate specialized print data for this printer
			const printData = generateSpecializedPrintData(
				formattedContent,
				selectedPrinter.name
			);
			console.log('Print data prepared, size:', printData.length, 'bytes');

			// Try to find a service for sending data
			console.log('Discovering available services...');
			const services = await server.getPrimaryServices();
			console.log(`Found ${services.length} services`);

			// Log available services
			for (let i = 0; i < services.length; i++) {
				console.log(`Service ${i + 1}: ${services[i].uuid}`);
			}

			// Common printer service UUIDs to try first
			const priorityServiceUUIDs = [
				'49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service (highest priority)
				'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
				'0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
				'000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
				'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
				'00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
				'0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
				'0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
				'03b7e958-aed3-4d18-a30e-c6313ad7d9dd' // Another printer service
			];

			// Sort services to try priority ones first
			const sortedServices = [...services].sort((a, b) => {
				const aIsPriority = priorityServiceUUIDs.includes(a.uuid.toLowerCase());
				const bIsPriority = priorityServiceUUIDs.includes(b.uuid.toLowerCase());
				return bIsPriority ? 1 : aIsPriority ? -1 : 0;
			});

			let success = false;
			const remainingBytes = printData;

			for (const service of sortedServices) {
				if (success) break;

				try {
					console.log(`Trying service: ${service.uuid}`);
					const characteristics = await service.getCharacteristics();
					console.log(
						`Found ${characteristics.length} characteristics for service ${service.uuid}`
					);

					// Log characteristics
					for (let i = 0; i < characteristics.length; i++) {
						const char = characteristics[i];
						console.log(
							`  Characteristic ${i + 1}: ${char.uuid}, properties:`,
							Object.keys(char.properties).filter(
								k => char.properties[k as keyof typeof char.properties]
							)
						);
					}

					// First try specific AT POS printer characteristic UUIDs
					const atPosCharUUIDs = [
						'49535343-8841-43f4-a8d4-ecbe34729bb3', // AT POS/ISSC write characteristic
						'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC UART write
						'0000ffe1-0000-1000-8000-00805f9b34fb', // Common BLE UART characteristic
						'0000fff1-0000-1000-8000-00805f9b34fb', // Common printer characteristic
						'0000ff01-0000-1000-8000-00805f9b34fb' // Another printer characteristic
					];

					// Try to find specific known characteristics first
					for (const charUUID of atPosCharUUIDs) {
						try {
							// Exit if already successful
							if (success) break;

							// Try to get this specific characteristic
							const specificChar = await service.getCharacteristic(charUUID);
							console.log(`Found specific characteristic: ${charUUID}`);

							// Try writing to this characteristic
							if (
								specificChar.properties.write ||
								specificChar.properties.writeWithoutResponse
							) {
								try {
									console.log(
										`Attempting to write to specific characteristic: ${specificChar.uuid}`
									);

									// Small test write first (printer initialization)
									const initSeq = new Uint8Array([0x1b, 0x40]); // ESC @ - Initialize printer
									await specificChar.writeValue(initSeq);
									console.log('Init sequence successfully sent');

									// Now send the full print data in chunks
									const mtu = 512;
									if (remainingBytes.length <= mtu) {
										await specificChar.writeValue(remainingBytes);
									} else {
										const data = new Uint8Array(remainingBytes);
										for (let offset = 0; offset < data.length; offset += mtu) {
											const chunk = data.slice(offset, offset + mtu);
											console.log(
												`Sending chunk ${offset}-${offset + chunk.length} (${
													chunk.length
												} bytes)`
											);
											await specificChar.writeValue(chunk);
											await new Promise(resolve => setTimeout(resolve, 100)); // Longer delay for AT POS printers
										}
									}

									success = true;
									console.log('Successfully wrote to specific characteristic');
									break;
								} catch (writeError) {
									console.log(
										`Error writing to specific characteristic ${specificChar.uuid}:`,
										writeError
									);
								}
							}
						} catch {
							// Just continue if this characteristic is not found
							console.log(
								`Specific characteristic ${charUUID} not found, trying others...`
							);
						}
					}

					// If specific characteristic approach didn't work, try all characteristics
					// Find a writable characteristic
					for (const characteristic of characteristics) {
						if (
							!success &&
							(characteristic.properties.write ||
								characteristic.properties.writeWithoutResponse)
						) {
							// Send the print data
							try {
								console.log(
									`Attempting to write to characteristic: ${characteristic.uuid}`
								);

								// Some printers have limited buffer sizes, so we may need to chunk the data
								const mtu = 512; // Most Bluetooth LE devices support at least 512 bytes

								if (remainingBytes.length <= mtu) {
									// Small enough to send in one go
									await characteristic.writeValue(remainingBytes);
									console.log('Write successful!');
									success = true;
								} else {
									// Need to chunk the data
									console.log(
										`Data too large (${remainingBytes.length} bytes), sending in chunks of ${mtu} bytes`
									);

									const data = new Uint8Array(remainingBytes);
									for (let offset = 0; offset < data.length; offset += mtu) {
										const chunk = data.slice(offset, offset + mtu);
										console.log(
											`Sending chunk ${offset}-${offset + chunk.length} (${
												chunk.length
											} bytes)`
										);
										await characteristic.writeValue(chunk);
										await new Promise(resolve => setTimeout(resolve, 100)); // Increase delay for AT POS printers
									}

									console.log('All chunks sent successfully!');
									success = true;
								}

								break;
							} catch (writeError) {
								console.log(
									`Error writing to characteristic ${characteristic.uuid}:`,
									writeError
								);
								// Continue trying other characteristics
							}
						}
					}
				} catch (e) {
					console.log(`Error with service ${service.uuid}:`, e);
					// Continue trying other services
				}
			}

			if (success) {
				toast.success('Print sent to thermal printer successfully');
			} else {
				// More informative error message
				console.error('No writable characteristics found for printer');
				toast.error(
					'Could not find a way to send data to this printer. Please see console for details.'
				);
			}

			// Disconnect from the device
			if (device.gatt?.connected) {
				device.gatt.disconnect();
				console.log('Disconnected from device');
			}

			setIsDialogOpen(false);
		} catch (error) {
			console.error('Error printing to Bluetooth printer:', error);
			toast.error(
				`Failed to print: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		} finally {
			setIsPrinting(false);
		}
	};

	// Fall back to standard printing
	const handleStandardPrint = () => {
		if (!settings || !selectedBillId) {
			return;
		}

		const bill = bills.find(b => b.id === selectedBillId);
		if (!bill) {
			return;
		}

		// Show a notification that print is being prepared
		toast.info('Falling back to standard printing...', { autoClose: 2000 });

		// Detect Samsung browser for customized message
		const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
		if (isSamsungBrowser) {
			// Show Samsung-specific instructions after a short delay
			setTimeout(() => {
				toast.info(
					"Samsung tablet detected. If print doesn't appear, check your notification panel for print options.",
					{ autoClose: 5000 }
				);
			}, 2500);
		}

		try {
			printBill(bill, settings);
			setIsDialogOpen(false);
		} catch (error) {
			console.error('Print error:', error);
			toast.error('There was an error printing the bill. Please try again.');
		}
	};

	// Toggle bill payment status
	const handleTogglePayment = (billId: string, currentStatus: boolean) => {
		try {
			dispatch(updateBill({ id: billId, isPaid: !currentStatus }));
			toast.success(`Bill marked as ${!currentStatus ? 'paid' : 'unpaid'}`);
		} catch (error) {
			console.error('Error updating bill payment status:', error);
			toast.error('Failed to update payment status');
		}
	};

	const handleDeleteBill = (billId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this bill? This action cannot be undone.'
			)
		) {
			dispatch(deleteBill(billId));
			toast.success('Bill deleted successfully');
		}
	};

	return (
		<div>
			<main className='container py-8'>
				<div className='flex justify-between items-center mb-6'>
					<div>
						<h1 className='text-2xl font-bold'>Bills</h1>
						<p className='text-muted-foreground'>
							Manage and view customer bills
						</p>
					</div>
					<div className='flex items-center gap-2'>
						{unpaidBillsCount > 0 && (
							<Badge variant='destructive' className='flex items-center gap-1'>
								<Bell className='h-3 w-3' />
								{unpaidBillsCount} {unpaidBillsCount === 1 ? 'Bill' : 'Bills'}{' '}
								Pending Payment
							</Badge>
						)}
						<CreateBillDialog />
					</div>
				</div>

				<div className='space-y-6'>
					{loading && (
						<div className='flex justify-center items-center h-64'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						</div>
					)}

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
							<p>Error: {error}</p>
						</div>
					)}

					{!loading && !error && bills.length === 0 && (
						<div className='text-center p-8 border border-dashed rounded-lg'>
							<p className='text-muted-foreground mb-4'>No bills found</p>
							<CreateBillDialog />
						</div>
					)}

					<div className='grid grid-cols-1 gap-4'>
						{bills.map(bill => (
							<Card key={bill.id} className='overflow-hidden'>
								<CardContent className='p-0'>
									<div className='p-4 sm:p-6'>
										<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
											<div>
												<CardTitle className='mb-1'>
													Bill #{bill.id.substring(0, 8)}
												</CardTitle>
												<p className='text-sm text-muted-foreground'>
													{bill.createdAt
														? format(new Date(bill.createdAt), 'PPP')
														: 'N/A'}
												</p>
											</div>
											<div className='flex items-center gap-2 sm:ml-4'>
												<div className='flex items-center space-x-2 whitespace-nowrap'>
													<Switch
														id={`payment-status-${bill.id}`}
														checked={bill.isPaid === true}
														onCheckedChange={() =>
															handleTogglePayment(bill.id, bill.isPaid === true)
														}
													/>
													<Label
														htmlFor={`payment-status-${bill.id}`}
														className='text-sm min-w-[50px]'>
														{bill.isPaid ? 'Paid' : 'Unpaid'}
													</Label>
												</div>
											</div>
										</div>

										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
											<div>
												<span className='text-sm text-muted-foreground block'>
													Customer
												</span>
												<span className='font-medium'>
													{bill.order?.customerName || 'N/A'}
												</span>
											</div>
											<div>
												<span className='text-sm text-muted-foreground block'>
													Total Amount
												</span>
												<span className='font-medium'>
													{settings?.currency || '₹'}{' '}
													{Number(bill.totalAmount).toFixed(2)}
												</span>
											</div>
										</div>

										<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t gap-3'>
											<Button
												variant='outline'
												size='sm'
												className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
												onClick={() => handleDeleteBill(bill.id)}>
												<Trash className='h-4 w-4 mr-1' />
												Delete
											</Button>
											<div className='flex flex-col xs:flex-row items-center gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewDetails(bill.id)}
													className='w-full xs:w-auto'>
													<Eye className='h-4 w-4 mr-1' />
													View Details
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handlePrintBill(bill.id)}
													disabled={isAutoConnecting}
													className='w-full xs:w-auto'>
													{isAutoConnecting ? (
														<>
															<Loader2 className='h-4 w-4 mr-1 animate-spin' />
															Connecting...
														</>
													) : (
														<>
															<Printer className='h-4 w-4 mr-1' />
															Print
														</>
													)}
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</main>

			{/* Thermal Printer Dialog */}
			<Dialog
				open={isDialogOpen}
				onOpenChange={val => {
					// If closing the dialog, cleanup
					if (!val && selectedPrinter) {
						// Double check to save the printer when closing dialog
						rememberPrinter(selectedPrinter.device, selectedPrinter.name);
					}
					setIsDialogOpen(val);
				}}>
				<DialogContent className='sm:max-w-[500px] max-w-[95vw] overflow-hidden'>
					<DialogHeader>
						<DialogTitle>Print to Thermal Printer</DialogTitle>
						<DialogDescription>
							Connect to a Bluetooth thermal printer to print this bill.
						</DialogDescription>
					</DialogHeader>

					<div className='py-4 overflow-y-auto'>
						{!hasBluetoothSupport ? (
							<div className='flex flex-col space-y-4'>
								<div className='flex items-center p-4 mb-2 border rounded-md bg-yellow-50 text-yellow-700'>
									<AlertCircle className='h-5 w-5 mr-2 flex-shrink-0' />
									<div>
										<p className='font-medium'>
											Bluetooth printing unavailable
										</p>
										<p className='text-sm mt-1'>
											Web Bluetooth API is disabled or not supported in this
											browser.
										</p>
									</div>
								</div>

								<div className='text-sm space-y-3 p-4 border rounded-md'>
									<p className='font-medium'>To enable Web Bluetooth:</p>
									<ol className='list-decimal pl-5 space-y-2'>
										<li>Make sure you&apos;re using Chrome or Edge</li>
										<li>
											Type{' '}
											<span className='font-mono bg-gray-100 px-1 rounded'>
												chrome://flags
											</span>{' '}
											in your address bar
										</li>
										<li>
											Search for &quot;Bluetooth&quot; and enable &quot;Web
											Bluetooth&quot;
										</li>
										<li>Restart your browser</li>
									</ol>
									<p className='italic mt-2 text-muted-foreground'>
										You can use Standard Print as an alternative method.
									</p>
								</div>
							</div>
						) : (
							<>
								<div className='mb-4'>
									<Button
										onClick={scanForPrinters}
										className='w-full mb-4'
										disabled={isScanning}>
										{isScanning ? (
											<>
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
												Scanning...
											</>
										) : (
											<>
												<Bluetooth className='h-4 w-4 mr-2' />
												Scan for Printers
											</>
										)}
									</Button>

									{printers.length === 0 && !isScanning && (
										<p className='text-sm text-gray-500 text-center'>
											No printers found. Click the button above to scan.
										</p>
									)}
								</div>

								{printers.length > 0 && (
									<div className='space-y-3'>
										<Label className='text-sm font-medium'>
											Available Printers
										</Label>
										<div className='space-y-2'>
											{printers.map(printer => (
												<div
													key={printer.device.id}
													className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
														selectedPrinter?.device.id === printer.device.id
															? 'bg-primary/10 border border-primary/30'
															: 'border'
													}`}
													onClick={() => {
														console.log('Selecting printer:', printer);
														setSelectedPrinter(printer);
													}}>
													<div className='flex items-center gap-2'>
														<Printer className='h-4 w-4' />
														<span className='truncate'>{printer.name}</span>
													</div>
													{selectedPrinter?.device.id === printer.device.id && (
														<Check className='h-4 w-4 text-primary' />
													)}
												</div>
											))}
										</div>
									</div>
								)}
							</>
						)}
					</div>

					<DialogFooter className='flex flex-col sm:flex-row gap-2 sm:justify-end'>
						<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						{/* {rememberedPrinter && (
							<Button
								variant='outline'
								onClick={() => {
									// Clear remembered printer
									Cookies.remove(PRINTER_ID_COOKIE, { path: '/' });
									Cookies.remove(PRINTER_NAME_COOKIE, { path: '/' });
									setRememberedPrinter(null);
									toast.info('Forgotten saved printer');
								}}>
								Forget Printer
							</Button>
						)} */}
						<Button variant='outline' onClick={handleStandardPrint}>
							<Printer className='h-4 w-4 mr-2' />
							Standard Print
						</Button>
						<Button
							onClick={printToBluetooth}
							disabled={!selectedPrinter || isPrinting || !hasBluetoothSupport}>
							{isPrinting ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Printing...
								</>
							) : (
								<>
									<Printer className='h-4 w-4 mr-2' />
									Thermal Print
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
