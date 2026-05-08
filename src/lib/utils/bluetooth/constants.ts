export const BLUETOOTH_PRINTER_SERVICE_UUIDS = [
	'00001800-0000-1000-8000-00805f9b34fb', // Generic Access
	'00001801-0000-1000-8000-00805f9b34fb', // Generic Attribute
	'00001812-0000-1000-8000-00805f9b34fb', // Human Interface Device
	'03b7e958-aed3-4d18-a30e-c6313ad7d9dd', // Another printer service
	'49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service
	'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
	'0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
	'0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
	'0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
	'000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
	'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
	'00001101-0000-1000-8000-00805f9b34fb' // Serial Port Profile (SPP)
] as const;

export const PRIORITY_PRINTER_SERVICE_UUIDS = [
	'49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service
	'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
	'0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
	'000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
	'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
	'00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
	'0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
	'0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
	'03b7e958-aed3-4d18-a30e-c6313ad7d9dd' // Another printer service
] as const;

export const PRINTER_WRITE_CHARACTERISTIC_UUIDS = [
	'49535343-8841-43f4-a8d4-ecbe34729bb3', // AT POS/ISSC write characteristic
	'49535343-1e4d-4bd9-ba61-23c647249616', // ISSC UART write
	'0000ffe1-0000-1000-8000-00805f9b34fb', // Common BLE UART characteristic
	'0000fff1-0000-1000-8000-00805f9b34fb', // Common printer characteristic
	'0000ff01-0000-1000-8000-00805f9b34fb' // Another printer characteristic
] as const;

export const PRINTER_WRITE_CHUNK_SIZE = 512;
export const PRINTER_WRITE_CHUNK_DELAY_MS = 100;
