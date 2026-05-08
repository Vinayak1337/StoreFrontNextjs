import { isBluetoothSupported } from './support';
import { scanForPrinters } from './discovery';
import {
	autoConnectToSavedPrinter,
	getGlobalConnectedPrinter,
	savePrinterForDirectUse
} from './storage';

export async function getPreferredBluetoothPrinter(): Promise<PrinterDevice | null> {
	const currentPrinter = getGlobalConnectedPrinter();
	if (currentPrinter) return currentPrinter;

	const restored = await autoConnectToSavedPrinter();
	return restored ? getGlobalConnectedPrinter() : null;
}

interface PairBluetoothPrinterOptions {
	preferSaved?: boolean;
}

export async function pairBluetoothPrinter({
	preferSaved = true
}: PairBluetoothPrinterOptions = {}): Promise<PrinterDevice | null> {
	if (!isBluetoothSupported()) {
		throw new Error(
			'Bluetooth is not supported in this browser. Please use Chrome or Edge.'
		);
	}

	if (preferSaved) {
		const restoredPrinter = await getPreferredBluetoothPrinter();
		if (restoredPrinter) return restoredPrinter;
	}

	const printers = await scanForPrinters();
	if (printers.length === 0) return null;

	const printer = printers[0];
	savePrinterForDirectUse(printer);
	return printer;
}

export async function requireBluetoothPrinter(): Promise<PrinterDevice> {
	const printer = await pairBluetoothPrinter();

	if (!printer) {
		throw new Error('No printer selected');
	}

	return printer;
}

export function isBluetoothPrinterConnectivityError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return (
		message.includes('no thermal printer') ||
		message.includes('no bluetooth device') ||
		message.includes('not connected') ||
		message.includes('no longer in range') ||
		message.includes('could not connect') ||
		message.includes('gatt') ||
		message.includes('networkerror')
	);
}

export function getBluetoothPrinterErrorMessage(error: unknown): string {
	if (!(error instanceof Error)) {
		return 'Failed to print order. Please try again.';
	}

	const message = error.message;

	if (message.includes('Bluetooth is not supported')) {
		return 'Bluetooth is not supported in this browser. Please use Chrome or Edge.';
	}

	if (message.includes('No printer selected')) {
		return 'No printer was selected. Please try again and select a printer.';
	}

	if (message.toLowerCase().includes('range')) {
		return 'Printer is out of range. Please bring the printer closer and try again.';
	}

	return `Print failed: ${message}`;
}
