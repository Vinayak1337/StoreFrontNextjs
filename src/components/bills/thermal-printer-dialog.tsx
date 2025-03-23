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
import { formatBillForThermalPrinter } from '@/lib/utils/bill-utils';

// Define printer device interface
interface PrinterDevice {
	device: BluetoothDevice;
	name: string;
}

interface ThermalPrinterDialogProps {
	bill: Bill;
	settings: Settings;
}

export function ThermalPrinterDialog({
	bill,
	settings
}: ThermalPrinterDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isScanning, setIsScanning] = useState(false);
	const [printers, setPrinters] = useState<PrinterDevice[]>([]);
	const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(
		null
	);
	const [isPrinting, setIsPrinting] = useState(false);
	const [hasBluetoothSupport, setHasBluetoothSupport] = useState(true);

	// Check if Web Bluetooth is supported
	useEffect(() => {
		if (typeof navigator !== 'undefined') {
			try {
				// Try to check if bluetooth is available and not disabled
				setHasBluetoothSupport('bluetooth' in navigator);
			} catch (error) {
				console.error('Bluetooth API check error:', error);
				setHasBluetoothSupport(false);
			}
		}
	}, []);

	// Scan for Bluetooth printers
	const scanForPrinters = async () => {
		if (!hasBluetoothSupport) {
			toast.error('Bluetooth is not supported or is disabled in this browser');
			return;
		}

		try {
			setIsScanning(true);
			setPrinters([]);

			// Request Bluetooth device with printer service
			const device = await navigator.bluetooth?.requestDevice({
				// To see all available printers, we don't filter by services
				// Some printers might not advertise standard services
				acceptAllDevices: true,
				optionalServices: ['generic_access']
			});

			if (!device) {
				throw new Error('No device selected');
			}

			// Add the discovered printer
			setPrinters(prev => [
				...prev,
				{ device, name: device.name || 'Unknown Printer' }
			]);
			setSelectedPrinter({ device, name: device.name || 'Unknown Printer' });

			toast.success(`Found printer: ${device.name || 'Unknown Printer'}`);
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

	// Print to the selected printer
	const printToBluetooth = async () => {
		if (!selectedPrinter) {
			toast.error('Please select a printer first');
			return;
		}

		try {
			setIsPrinting(true);
			const device = selectedPrinter.device;

			toast.info('Connecting to printer...');

			// Connect to the printer
			const server = await device.gatt?.connect();
			if (!server) {
				throw new Error('Could not connect to printer');
			}

			// Format the bill data for printing
			const content = formatBillForThermalPrinter(bill, settings);
			if (!content) {
				throw new Error('Could not format bill data');
			}

			// Convert the content to bytes that the printer can understand
			const printData = generatePrintData(content);

			// Try to find a service for sending data
			// Different printers might use different services, this is a generic approach
			// Discovering available services
			const services = await server.getPrimaryServices();

			let success = false;
			for (const service of services) {
				try {
					const characteristics = await service.getCharacteristics();

					// Find a writable characteristic
					for (const characteristic of characteristics) {
						if (
							characteristic.properties.write ||
							characteristic.properties.writeWithoutResponse
						) {
							// Send the print data
							await characteristic.writeValue(printData);
							success = true;
							break;
						}
					}

					if (success) break;
				} catch (e) {
					console.log('Error with service:', e);
					// Continue trying other services
				}
			}

			if (success) {
				toast.success('Print sent to thermal printer successfully');
			} else {
				toast.error('Could not find a way to send data to this printer');
			}

			// Disconnect from the device
			if (device.gatt?.connected) {
				device.gatt.disconnect();
			}

			setIsOpen(false);
		} catch (error) {
			console.error('Error printing to Bluetooth printer:', error);
			toast.error('Failed to print. Please check printer connection.');
		} finally {
			setIsPrinting(false);
		}
	};

	// Generate print data using ESC/POS commands
	const generatePrintData = (content: string) => {
		try {
			// This is where you'd use the escpos-browser library
			// For now, we'll create a simple text representation of the bill
			const encoder = new TextEncoder();

			// Convert content to bytes
			return encoder.encode(content);
		} catch (error) {
			console.error('Error generating print data:', error);
			throw new Error('Failed to generate print data');
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant='default'
					size='sm'
					className='flex items-center gap-2'
					onClick={() => setIsOpen(true)}
					disabled={!hasBluetoothSupport}>
					<Printer className='h-4 w-4' />
					Thermal Print
				</Button>
			</DialogTrigger>

			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Print to Thermal Printer</DialogTitle>
					<DialogDescription>
						Connect to a Bluetooth thermal printer to print this bill.
					</DialogDescription>
				</DialogHeader>

				<div className='py-4'>
					{!hasBluetoothSupport ? (
						<div className='flex items-center p-4 mb-4 border rounded-md bg-yellow-50 text-yellow-700'>
							<AlertCircle className='h-5 w-5 mr-2' />
							<p>
								Web Bluetooth is not supported in this browser. Try Chrome or
								Edge.
							</p>
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
												onClick={() => setSelectedPrinter(printer)}>
												<div className='flex items-center gap-2'>
													<Printer className='h-4 w-4' />
													<span>{printer.name}</span>
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

				<DialogFooter>
					<Button variant='outline' onClick={() => setIsOpen(false)}>
						Cancel
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
								Print
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
