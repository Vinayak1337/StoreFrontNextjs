'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bluetooth } from 'lucide-react';
import {
	scanForPrinters,
	isBluetoothSupported,
	savePrinterForDirectUse
} from '@/lib/utils/printer-utils';

export function PairPrinterButton() {
	const [isPairingPrinter, setIsPairingPrinter] = useState(false);
	const [printerSaved, setPrinterSaved] = useState(false);

	const handlePairPrinter = async () => {
		try {
			setIsPairingPrinter(true);
			setPrinterSaved(false);

			if (!isBluetoothSupported()) {
				alert(
					'Bluetooth is not supported in this browser. Please use Chrome or Edge.'
				);
				return;
			}

			const printers = await scanForPrinters();

			if (printers.length === 0) {
				alert('No printer was selected or found. Please try again.');
				return;
			}

			const printer = printers[0];
			savePrinterForDirectUse(printer);
			setPrinterSaved(true);

			setTimeout(() => {
				setPrinterSaved(false);
			}, 3000);

			alert(
				`Thermal printer "${printer.name}" paired successfully! You can now print orders directly.`
			);
		} catch (error) {
			console.error('Error pairing printer:', error);
			alert('Failed to pair printer. Please try again.');
		} finally {
			setIsPairingPrinter(false);
		}
	};

	return (
		<Button
			variant={printerSaved ? 'default' : 'outline'}
			onClick={handlePairPrinter}
			disabled={isPairingPrinter}
			className={`flex items-center gap-2 text-sm md:text-base ${
				printerSaved ? 'bg-green-600 hover:bg-green-700 text-white' : ''
			}`}>
			{isPairingPrinter ? (
				<Loader2 className='h-4 w-4 animate-spin' />
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
	);
}