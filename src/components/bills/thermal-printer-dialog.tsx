'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
	DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Printer, Bluetooth, AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Bill, Settings } from '@/types';
import { formatBillForThermalPrinter, printBill } from '@/lib/utils/bill-utils';
import { 
	scanForPrinters, 
	isBluetoothSupported, 
	printToBluetooth,
	debugBluetoothSupport,
	PrinterDevice,
	savePrinterForDirectUse 
} from '@/lib/utils/printer-utils';

interface ThermalPrinterDialogProps {
	bill: Bill;
	settings: Settings;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ThermalPrinterDialog({
	bill,
	settings,
	open,
	onOpenChange
}: ThermalPrinterDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	
	// Use external control if provided, otherwise use internal state
	const dialogOpen = open !== undefined ? open : isOpen;
	const setDialogOpen = onOpenChange !== undefined ? onOpenChange : setIsOpen;
	const [isScanning, setIsScanning] = useState(false);
	const [printers, setPrinters] = useState<PrinterDevice[]>([]);
	const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(
		null
	);
	const [isPrinting, setIsPrinting] = useState(false);
	const [hasBluetoothSupport, setHasBluetoothSupport] = useState(true);

	// Check if Web Bluetooth is supported
	useEffect(() => {
		setHasBluetoothSupport(isBluetoothSupported());
	}, []);

	// Scan for Bluetooth printers using the utility function
	const handleScanForPrinters = async () => {
		if (!hasBluetoothSupport) {
			toast.error('Bluetooth is not supported or is disabled in this browser');
			return;
		}

		try {
			setIsScanning(true);
			setPrinters([]);

			// Debug bluetooth support
			debugBluetoothSupport();

			const discoveredPrinters = await scanForPrinters();
			
			if (discoveredPrinters.length === 0) {
				toast.info('No printer was selected or found. Please try again.');
				return;
			}

			setPrinters(discoveredPrinters);
			// Auto-select the first printer if only one is found
			if (discoveredPrinters.length === 1) {
				setSelectedPrinter(discoveredPrinters[0]);
				// Automatically save the printer for direct use
				savePrinterForDirectUse(discoveredPrinters[0]);
			}

			toast.success(`Found ${discoveredPrinters.length} printer(s)`);
		} catch (error: unknown) {
			console.error('Error scanning for printers:', error);
			
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('Failed to scan for printers. Make sure Bluetooth is enabled.');
			}
		} finally {
			setIsScanning(false);
		}
	};

	// Print to the selected printer using the utility function
	const handlePrintToBluetooth = async () => {
		if (!selectedPrinter) {
			toast.error('Please select a printer first');
			return;
		}

		try {
			setIsPrinting(true);
			toast.info('Connecting to printer...');

			// Format the bill data for printing
			const content = formatBillForThermalPrinter(bill, settings);
			if (!content) {
				throw new Error('Could not format bill data');
			}

			// Use the utility function to print
			const success = await printToBluetooth(selectedPrinter, content);
			
			if (success) {
				toast.success('Print sent to thermal printer successfully');
				setDialogOpen(false);
			}
		} catch (error) {
			console.error('Error printing to Bluetooth printer:', error);
			
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('Failed to print. Please check printer connection.');
			}
		} finally {
			setIsPrinting(false);
		}
	};

	// Fall back to standard printing
	const handleStandardPrint = () => {
		try {
			// Show a notification that print is being prepared
			toast.info('Using standard printing...', { autoClose: 2000 });

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

			printBill(bill, settings);
			setDialogOpen(false);
		} catch (error) {
			console.error('Print error:', error);
			toast.error('There was an error printing the bill. Please try again.');
		}
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			{/* Only show trigger button if not controlled externally */}
			{open === undefined && (
				<DialogTrigger asChild>
					<Button
						variant='default'
						size='sm'
						className='flex items-center gap-2'
						onClick={() => setDialogOpen(true)}
						disabled={!hasBluetoothSupport}>
						<Printer className='h-4 w-4' />
						Thermal Print
					</Button>
				</DialogTrigger>
			)}

			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Print to Thermal Printer</DialogTitle>
					<DialogDescription>
						Connect to a Bluetooth thermal printer to print this bill.
					</DialogDescription>
				</DialogHeader>

				<div className='py-4 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]'>
					{!hasBluetoothSupport ? (
						<div className='flex flex-col space-y-4'>
							<div className='flex items-start p-4 mb-2 border rounded-md bg-yellow-50 text-yellow-700'>
								<AlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
								<div className='min-w-0 flex-1'>
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
										<span className='font-mono bg-gray-100 px-1 rounded text-xs'>
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
									onClick={handleScanForPrinters}
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
												key={printer.id}
												className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
													selectedPrinter?.id === printer.id
														? 'bg-primary/10 border border-primary/30'
														: 'border'
												}`}
												onClick={() => setSelectedPrinter(printer)}>
												<div className='flex items-center gap-2'>
													<Printer className='h-4 w-4' />
													<span>{printer.name}</span>
													{printer.status && (
														<span className={`text-xs px-2 py-1 rounded ${
															printer.status === 'online' 
																? 'bg-green-100 text-green-600' 
																: printer.status === 'offline'
																? 'bg-red-100 text-red-600'
																: 'bg-gray-100 text-gray-600'
														}`}>
															{printer.status}
														</span>
													)}
												</div>
												{selectedPrinter?.id === printer.id && (
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

				<DialogFooter className='flex flex-col gap-2 sm:flex-row sm:gap-2 sm:justify-end'>
					<Button 
						variant='outline' 
						onClick={() => setDialogOpen(false)}
						className='w-full sm:w-auto order-last sm:order-first'>
						Cancel
					</Button>
					<Button 
						variant='outline' 
						onClick={handleStandardPrint}
						className='w-full sm:w-auto'>
						<Printer className='h-4 w-4 mr-2' />
						Standard Print
					</Button>
					<Button
						onClick={handlePrintToBluetooth}
						disabled={!selectedPrinter || isPrinting || !hasBluetoothSupport}
						className='w-full sm:w-auto'>
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
	);
}
