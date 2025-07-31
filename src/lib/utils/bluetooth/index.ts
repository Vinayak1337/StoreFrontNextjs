/**
 * Bluetooth Printer Utilities - Main Export File
 * 
 * This module provides a clean API for working with Bluetooth thermal printers.
 * It's organized into focused sub-modules for better maintainability.
 * 
 * Type definitions are available globally via @/types/index.d.ts
 */

// Support detection
export {
	isBluetoothSupported,
	debugBluetoothSupport
} from './support';

// Device discovery
export {
	scanForPrinters
} from './discovery';

// Connection management
export {
	connectToPrinter,
	testPrinter,
	autoConnectPrinter,
	getPrinterStatus
} from './connection';

// Printing functionality
export {
	printToBluetooth
} from './printing';

// Storage and state management
export {
	savePrinterForDirectUse,
	setGlobalConnectedPrinter,
	getGlobalConnectedPrinter,
	autoConnectToSavedPrinter,
	validatePrinterConfig
} from './storage';