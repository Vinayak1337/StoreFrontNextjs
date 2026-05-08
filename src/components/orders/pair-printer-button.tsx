'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Loader2, Bluetooth, BluetoothConnected } from 'lucide-react';
import {
	getBluetoothPrinterErrorMessage,
	getPreferredBluetoothPrinter,
	pairBluetoothPrinter
} from '@/lib/utils/bluetooth';

export function PairPrinterButton() {
	const [isPairingPrinter, setIsPairingPrinter] = useState(false);
	const [printerSaved, setPrinterSaved] = useState(false);
	const [isConnectedPrinter, setIsConnectedPrinter] = useState(false);
	const [connectedPrinterName, setConnectedPrinterName] = useState<
		string | null
	>(null);

	useEffect(() => {
		getPreferredBluetoothPrinter()
			.then(printer => {
				if (!printer) return;
				setIsConnectedPrinter(true);
				setConnectedPrinterName(printer.name);
			})
			.catch(console.error);
	}, []);

	const handlePairPrinter = async () => {
		try {
			setIsPairingPrinter(true);
			setPrinterSaved(false);

			const printer = await pairBluetoothPrinter({ preferSaved: false });
			if (!printer) {
				toast.info('No printer selected. Please try again.');
				return;
			}

			setPrinterSaved(true);
			setIsConnectedPrinter(true);
			setConnectedPrinterName(printer.name);

			setTimeout(() => {
				setPrinterSaved(false);
			}, 3000);

			// Paired successfully
		} catch (error) {
			toast.error(getBluetoothPrinterErrorMessage(error));
		} finally {
			setIsPairingPrinter(false);
		}
	};

	const getButtonState = () => {
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
