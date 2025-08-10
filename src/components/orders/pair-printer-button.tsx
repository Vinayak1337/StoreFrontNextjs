'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Loader2, Bluetooth, BluetoothConnected } from 'lucide-react';
import {
	scanForPrinters,
	isBluetoothSupported,
	savePrinterForDirectUse,
	getGlobalConnectedPrinter
} from '@/lib/utils/printer-utils';

export function PairPrinterButton() {
	const [isPairingPrinter, setIsPairingPrinter] = useState(false);
	const [printerSaved, setPrinterSaved] = useState(false);
	const [isConnectedPrinter, setIsConnectedPrinter] = useState(false);
	const [connectedPrinterName, setConnectedPrinterName] = useState<
		string | null
	>(null);
	const [isAutoConnecting, setIsAutoConnecting] = useState(false);

	// Removed auto-connect on mount for reliability and UX clarity

	const handlePairPrinter = async () => {
		try {
			setIsPairingPrinter(true);
			setPrinterSaved(false);

			if (!isBluetoothSupported()) {
				toast.error(
					'Bluetooth is not supported in this browser. Use Chrome or Edge.'
				);
				return;
			}

			const printers = await scanForPrinters();

			if (printers.length === 0) {
				toast.info('No printer selected. Please try again.');
				return;
			}

			const printer = printers[0];
			savePrinterForDirectUse(printer);
			setPrinterSaved(true);
			setIsConnectedPrinter(true);
			setConnectedPrinterName(printer.name);

			setTimeout(() => {
				setPrinterSaved(false);
			}, 3000);

			// Paired successfully
		} catch (error) {
			console.error('Error pairing printer:', error);
			toast.error('Failed to pair printer. Please try again.');
		} finally {
			setIsPairingPrinter(false);
		}
	};

	const getButtonState = () => {
		if (isAutoConnecting) {
			return {
				variant: 'outline' as const,
				icon: <Loader2 className='h-4 w-4 animate-spin' />,
				text: 'Connecting...',
				shortText: 'Connecting...',
				className: '',
				disabled: true
			};
		}

		if (isPairingPrinter) {
			return {
				variant: 'outline' as const,
				icon: <Loader2 className='h-4 w-4 animate-spin' />,
				text: 'Pairing...',
				shortText: 'Pairing...',
				className: '',
				disabled: true
			};
		}

		if (printerSaved) {
			return {
				variant: 'default' as const,
				icon: <BluetoothConnected className='h-4 w-4' />,
				text: 'Printer Saved',
				shortText: 'Saved',
				className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
				disabled: false
			};
		}

		if (isConnectedPrinter && connectedPrinterName) {
			return {
				variant: 'default' as const,
				icon: <BluetoothConnected className='h-4 w-4' />,
				text: connectedPrinterName,
				shortText: 'Connected',
				className: 'bg-blue-600 hover:bg-blue-700 text-white',
				disabled: false
			};
		}

		return {
			variant: 'outline' as const,
			icon: <Bluetooth className='h-4 w-4' />,
			text: 'Pair Printer',
			shortText: 'Pair',
			className: '',
			disabled: false
		};
	};

	const buttonState = getButtonState();

	return (
		<Button
			variant={buttonState.variant}
			onClick={handlePairPrinter}
			disabled={buttonState.disabled}
			className={`flex items-center gap-2 text-sm md:text-base ${buttonState.className}`}
			title={
				isConnectedPrinter && connectedPrinterName
					? `Connected to: ${connectedPrinterName}`
					: undefined
			}>
			{buttonState.icon}
			<span className='hidden sm:inline'>{buttonState.text}</span>
			<span className='sm:hidden'>{buttonState.shortText}</span>
		</Button>
	);
}
