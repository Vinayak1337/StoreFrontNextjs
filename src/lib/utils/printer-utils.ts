// Bluetooth thermal printer utilities

// Global state for connected printer
let globalConnectedPrinter: PrinterDevice | null = null;

/**
 * Debug function to check browser capabilities
 */
export function debugBluetoothSupport(): void {
  console.log('=== Bluetooth Support Debug Info ===');
  console.log('Navigator available:', typeof navigator !== 'undefined');
  
  if (typeof navigator !== 'undefined') {
    console.log('User Agent:', navigator.userAgent);
    console.log('Vendor:', navigator.vendor);
    console.log('Bluetooth in navigator:', 'bluetooth' in navigator);
    
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
    
    console.log('Is Chrome:', isChrome);
    console.log('Is Edge:', isEdge);  
    console.log('Is Firefox:', isFirefox);
    console.log('Is Safari:', isSafari);
  }
  
  if (typeof window !== 'undefined' && window.location) {
    console.log('Protocol:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    console.log('Is HTTPS or localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  }
  
  console.log('Final support check:', isBluetoothSupported());
  console.log('=====================================');
}

export interface PrinterDevice {
  id: string;
  name: string;
  bluetoothDevice?: BluetoothDevice;
  status: 'online' | 'offline' | 'unknown';
  type: 'bluetooth';
}

export interface PrinterConfig {
  name: string;
  deviceId: string;
  autoConnect: boolean;
  connected: boolean;
  paperWidth: number;
  type: 'bluetooth';
}

/**
 * Checks if Web Bluetooth is supported in the current browser
 */
export function isBluetoothSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  // Check for Web Bluetooth API availability
  if (!('bluetooth' in navigator)) {
    return false;
  }
  
  // Additional check for Chrome/Edge browsers
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(navigator.userAgent);
  
  return isChrome || isEdge;
}

/**
 * Scans for available Bluetooth thermal printers
 * Shows original device names or "Unknown" if not available
 */
export async function scanForPrinters(): Promise<PrinterDevice[]> {
  // Detailed Bluetooth support check
  if (typeof navigator === 'undefined') {
    throw new Error('Navigator is not available. Are you running in a browser?');
  }
  
  if (!('bluetooth' in navigator)) {
    throw new Error('Web Bluetooth API is not available. Please use Chrome 56+ or Edge 79+ with HTTPS.');
  }
  
  // Check if we're on HTTPS (required for Web Bluetooth)
  if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    throw new Error('Web Bluetooth requires HTTPS. Please access the site over HTTPS.');
  }
  
  if (!isBluetoothSupported()) {
    const userAgent = navigator.userAgent;
    throw new Error(`Web Bluetooth is not supported in this browser (${userAgent}). Please use Chrome 56+ or Edge 79+.`);
  }

  try {
    // Request Bluetooth device with comprehensive printer service UUIDs
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
        '0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
        '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
        '00001101-0000-1000-8000-00805f9b34fb'  // Serial Port Profile (SPP)
      ]
    });

    if (!device) {
      return [];
    }

    // Return the discovered printer with its original name or "Unknown"
    const printerDevice: PrinterDevice = {
      id: device.id,
      name: device.name || 'Unknown',
      bluetoothDevice: device,
      status: 'online',
      type: 'bluetooth'
    };

    // Automatically save this printer for direct use
    savePrinterForDirectUse(printerDevice);
    console.log('Printer automatically saved for direct use:', printerDevice.name);

    return [printerDevice];
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'NotFoundError') {
        // User cancelled the selection dialog or no device was found
        return [];
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth permission denied. Please allow Bluetooth access.');
      } else if (error.message.includes('globally disabled')) {
        throw new Error('Web Bluetooth API is disabled. Please enable it in your browser settings.');
      }
    }
    
    console.error('Error scanning for Bluetooth printers:', error);
    throw new Error('Failed to scan for printers. Make sure Bluetooth is enabled.');
  }
}

/**
 * Attempts to connect to a specific Bluetooth printer
 */
export async function connectToPrinter(printerDevice: PrinterDevice): Promise<boolean> {
  try {
    if (!printerDevice.bluetoothDevice) {
      throw new Error('No Bluetooth device available for connection');
    }

    const device = printerDevice.bluetoothDevice;
    
    // Connect to the Bluetooth device
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error(`Failed to establish GATT connection with printer ${printerDevice.name}`);
    }

    // Verify connection is established
    if (!server.connected) {
      throw new Error(`Connection to printer ${printerDevice.name} was not successful`);
    }
    
    return true;
  } catch (error) {
    console.error(`Bluetooth printer connection failed for ${printerDevice.name}:`, error);
    throw error;
  }
}

/**
 * Tests Bluetooth printer connection by sending a test print
 */
export async function testPrinter(printerDevice: PrinterDevice): Promise<boolean> {
  try {
    if (!printerDevice.bluetoothDevice) {
      throw new Error('No Bluetooth device available for testing');
    }

    const device = printerDevice.bluetoothDevice;
    
    // Connect to the device if not already connected
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error('Failed to connect to printer for testing');
    }

    // Try to find services and characteristics
    const services = await server.getPrimaryServices();
    
    let testSuccessful = false;
    for (const service of services) {
      try {
        const characteristics = await service.getCharacteristics();
        
        // Find a writable characteristic
        for (const characteristic of characteristics) {
          if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
            // Send a simple test command (line feed)
            const testData = new TextEncoder().encode('\n\n--- Test Print ---\n\n');
            await characteristic.writeValue(testData);
            testSuccessful = true;
            break;
          }
        }
        
        if (testSuccessful) break;
      } catch (e) {
        // Continue trying other services
        console.log('Service test failed, trying next service:', e);
      }
    }
    
    // Disconnect after test
    if (device.gatt?.connected) {
      device.gatt.disconnect();
    }
    
    if (!testSuccessful) {
      throw new Error('Could not find a way to send test data to printer');
    }
    
    return true;
  } catch (error) {
    console.error('Bluetooth printer test failed:', error);
    throw error;
  }
}

/**
 * Auto-connects to printer if auto-connect is enabled and printer config exists
 * Note: Bluetooth auto-connect is limited due to browser security restrictions
 */
export async function autoConnectPrinter(): Promise<boolean> {
  try {
    // Bluetooth devices cannot be auto-connected due to browser security restrictions
    // User must manually initiate the connection through the UI
    console.log('Auto-connect is not supported for Bluetooth printers due to browser security restrictions');
    return false;
  } catch (error) {
    console.error('Auto-connect failed:', error);
    return false;
  }
}

/**
 * Validates Bluetooth printer configuration
 */
export function validatePrinterConfig(config: Partial<PrinterConfig>): boolean {
  if (!config.deviceId || !config.name) {
    return false;
  }
  
  // Check if type is bluetooth
  if (config.type !== 'bluetooth') {
    return false;
  }
  
  return true;
}

/**
 * Gets Bluetooth printer status
 */
export async function getPrinterStatus(printerDevice: PrinterDevice): Promise<'online' | 'offline' | 'error'> {
  try {
    if (!printerDevice.bluetoothDevice) {
      return 'error';
    }
    
    const device = printerDevice.bluetoothDevice;
    
    // Check if device is already connected
    if (device.gatt?.connected) {
      return 'online';
    }
    
    // Try to connect briefly to check status
    try {
      const server = await device.gatt?.connect();
      if (server && server.connected) {
        // Disconnect immediately after checking
        device.gatt?.disconnect();
        return 'online';
      }
    } catch (error) {
      console.log('Connection test failed:', error);
      return 'offline';
    }
    
    return 'offline';
  } catch (error) {
    console.error('Failed to get Bluetooth printer status:', error);
    return 'error';
  }
}

/**
 * Generate specialized print data based on printer name
 */
function generateSpecializedPrintData(content: string, printerName: string): Uint8Array {
  console.log('Using specialized print data generator for:', printerName);
  const encoder = new TextEncoder();

  // AT POS thermal printer specific support
  if (
    printerName.toLowerCase().includes('at') ||
    printerName.toLowerCase().includes('pos') ||
    printerName.toLowerCase().includes('thermal')
  ) {
    console.log('Using AT POS thermal printer format');
    return encoder.encode(content);
  }

  // Epson-specific commands
  if (printerName.toLowerCase().includes('epson')) {
    console.log('Using Epson-specific format');
    return encoder.encode(content);
  }

  // Star Micronics-specific
  if (printerName.toLowerCase().includes('star')) {
    console.log('Using Star Micronics format');
    return encoder.encode(
      content
        .replace('\x1B\x61\x01', '\x1B\x1D\x61\x01') // Center align
        .replace('\x1B\x61\x00', '\x1B\x1D\x61\x00') // Left align
        .replace('\x1D\x56\x42', '\x1B\x64\x02') // Cut paper
    );
  }

  // Generic implementation for unknown printers
  console.log('Using generic printer format');
  return encoder.encode(content);
}

/**
 * Prints content to a Bluetooth thermal printer with advanced service discovery
 */
export async function printToBluetooth(printerDevice: PrinterDevice, content: string): Promise<boolean> {
  try {
    if (!printerDevice.bluetoothDevice) {
      throw new Error('No Bluetooth device available');
    }

    const device = printerDevice.bluetoothDevice;
    console.log('Starting print process with printer:', printerDevice.name);
    
    // Connect to the printer
    const server = await device.gatt?.connect();
    if (!server) {
      throw new Error('Could not connect to printer');
    }

    console.log('GATT connection successful, getting services...');

    // Generate specialized print data for this printer
    const printData = generateSpecializedPrintData(content, printerDevice.name);
    console.log('Print data prepared, size:', printData.length, 'bytes');

    // Try to find a service for sending data
    console.log('Discovering available services...');
    const services = await server.getPrimaryServices();
    console.log(`Found ${services.length} services`);

    // Common printer service UUIDs to try first (priority order)
    const priorityServiceUUIDs = [
      '49535343-fe7d-4ae5-8fa9-9fafd205e455', // AT POS / ISSC service (highest priority)
      '49535343-1e4d-4bd9-ba61-23c647249616', // ISSC Transparent UART
      '0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE UART service
      '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // ESC/POS service
      '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile (SPP)
      '0000fff0-0000-1000-8000-00805f9b34fb', // Common printer service
      '0000ff00-0000-1000-8000-00805f9b34fb', // Another printer service
      '03b7e958-aed3-4d18-a30e-c6313ad7d9dd'  // Another printer service
    ];

    // Sort services to try priority ones first
    const sortedServices = [...services].sort((a, b) => {
      const aIsPriority = priorityServiceUUIDs.includes(a.uuid.toLowerCase());
      const bIsPriority = priorityServiceUUIDs.includes(b.uuid.toLowerCase());
      return bIsPriority ? 1 : aIsPriority ? -1 : 0;
    });

    let success = false;

    for (const service of sortedServices) {
      if (success) break;

      try {
        console.log(`Trying service: ${service.uuid}`);
        const characteristics = await service.getCharacteristics();
        console.log(`Found ${characteristics.length} characteristics for service ${service.uuid}`);

        // First try specific AT POS printer characteristic UUIDs
        const atPosCharUUIDs = [
          '49535343-8841-43f4-a8d4-ecbe34729bb3', // AT POS/ISSC write characteristic
          '49535343-1e4d-4bd9-ba61-23c647249616', // ISSC UART write
          '0000ffe1-0000-1000-8000-00805f9b34fb', // Common BLE UART characteristic
          '0000fff1-0000-1000-8000-00805f9b34fb', // Common printer characteristic
          '0000ff01-0000-1000-8000-00805f9b34fb'  // Another printer characteristic
        ];

        // Try to find specific known characteristics first
        for (const charUUID of atPosCharUUIDs) {
          if (success) break;

          try {
            const specificChar = await service.getCharacteristic(charUUID);
            console.log(`Found specific characteristic: ${charUUID}`);

            if (specificChar.properties.write || specificChar.properties.writeWithoutResponse) {
              try {
                console.log(`Writing to specific characteristic: ${specificChar.uuid}`);

                // Small test write first (printer initialization)
                const initSeq = new Uint8Array([0x1b, 0x40]); // ESC @ - Initialize printer
                await specificChar.writeValue(initSeq);
                console.log('Init sequence successfully sent');

                // Send the full print data in chunks
                const mtu = 512;
                if (printData.length <= mtu) {
                  await specificChar.writeValue(printData);
                } else {
                  for (let offset = 0; offset < printData.length; offset += mtu) {
                    const chunk = printData.slice(offset, offset + mtu);
                    console.log(`Sending chunk ${offset}-${offset + chunk.length} (${chunk.length} bytes)`);
                    await specificChar.writeValue(chunk);
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                }

                success = true;
                console.log('Successfully wrote to specific characteristic');
                break;
              } catch (writeError) {
                console.log(`Error writing to specific characteristic ${specificChar.uuid}:`, writeError);
              }
            }
          } catch {
            // Continue if this characteristic is not found
            console.log(`Specific characteristic ${charUUID} not found, trying others...`);
          }
        }

        // If specific characteristic approach didn't work, try all characteristics
        if (!success) {
          for (const characteristic of characteristics) {
            if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
              try {
                console.log(`Writing to characteristic: ${characteristic.uuid}`);

                const mtu = 512;
                if (printData.length <= mtu) {
                  await characteristic.writeValue(printData);
                  console.log('Write successful!');
                  success = true;
                } else {
                  console.log(`Data too large (${printData.length} bytes), sending in chunks of ${mtu} bytes`);
                  for (let offset = 0; offset < printData.length; offset += mtu) {
                    const chunk = printData.slice(offset, offset + mtu);
                    console.log(`Sending chunk ${offset}-${offset + chunk.length} (${chunk.length} bytes)`);
                    await characteristic.writeValue(chunk);
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                  console.log('All chunks sent successfully!');
                  success = true;
                }
                break;
              } catch (writeError) {
                console.log(`Error writing to characteristic ${characteristic.uuid}:`, writeError);
              }
            }
          }
        }
      } catch (e) {
        console.log(`Error with service ${service.uuid}:`, e);
      }
    }

    // Disconnect from the device
    if (device.gatt?.connected) {
      device.gatt.disconnect();
      console.log('Disconnected from device');
    }

    if (!success) {
      throw new Error('Could not find a way to send data to this printer. Please see console for details.');
    }

    return true;
  } catch (error) {
    console.error('Error printing to Bluetooth printer:', error);
    throw error;
  }
}

/**
 * Save printer selection to both localStorage and cookies for cross-page consistency
 */
export function savePrinterForDirectUse(printerDevice: PrinterDevice): void {
  try {
    // Save to localStorage (for orders page)
    localStorage.setItem('thermal_printer_id', printerDevice.id);
    localStorage.setItem('thermal_printer_name', printerDevice.name);
    
    // Also save to cookies (for bills page compatibility)
    if (typeof document !== 'undefined') {
      document.cookie = `preferred_printer_id=${printerDevice.id}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
      document.cookie = `preferred_printer_name=${printerDevice.name}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
    }
    
    // Set as global printer
    setGlobalConnectedPrinter(printerDevice);
    
    console.log('Printer saved for direct use across all pages:', printerDevice.name);
    console.log('Saved to localStorage and cookies');
  } catch (error) {
    console.error('Failed to save printer:', error);
  }
}

/**
 * Set the globally connected printer
 */
export function setGlobalConnectedPrinter(printer: PrinterDevice | null): void {
  globalConnectedPrinter = printer;
  console.log('Global printer set:', printer?.name || 'none');
}

/**
 * Get the globally connected printer
 */
export function getGlobalConnectedPrinter(): PrinterDevice | null {
  return globalConnectedPrinter;
}

/**
 * Auto-load saved printer on app start (no connection needed - already paired)
 */
export async function autoConnectToSavedPrinter(): Promise<boolean> {
  try {
    // Check if we already have a printer set
    if (globalConnectedPrinter) {
      console.log('Already have printer ready:', globalConnectedPrinter.name);
      return true;
    }

    // Try to get saved printer from localStorage first, then cookies as fallback
    let savedPrinterId = localStorage.getItem('thermal_printer_id');
    let savedPrinterName = localStorage.getItem('thermal_printer_name');
    
    // Fallback to cookies if localStorage is empty (bills page compatibility)
    if (!savedPrinterId && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      savedPrinterId = cookies['preferred_printer_id'];
      savedPrinterName = cookies['preferred_printer_name'];
      
      // If found in cookies, also save to localStorage for consistency
      if (savedPrinterId && savedPrinterName) {
        localStorage.setItem('thermal_printer_id', savedPrinterId);
        localStorage.setItem('thermal_printer_name', savedPrinterName);
        console.log('Migrated printer from cookies to localStorage');
      }
    }

    if (!savedPrinterId || !savedPrinterName) {
      console.log('No saved printer found');
      return false;
    }

    console.log('Loading saved printer for direct use:', savedPrinterName);

    // Use the browser's getDevices to find previously paired devices
    if (!isBluetoothSupported() || !navigator.bluetooth) {
      return false;
    }

    try {
      // Get available paired devices
      const availableDevices = await (navigator.bluetooth as typeof navigator.bluetooth & { getDevices(): Promise<BluetoothDevice[]> }).getDevices();
      console.log('Available paired devices:', availableDevices);

      // Find our saved printer
      const matchedDevice = availableDevices.find((device: BluetoothDevice) => device.id === savedPrinterId);

      if (matchedDevice) {
        console.log('Found saved printer in paired devices:', matchedDevice);

        // Create printer device object - just set as available for direct use
        const printer: PrinterDevice = {
          id: matchedDevice.id,
          name: matchedDevice.name || savedPrinterName,
          bluetoothDevice: matchedDevice,
          status: 'online',
          type: 'bluetooth'
        };

        // Set as global printer for direct printing (no connection step)
        setGlobalConnectedPrinter(printer);
        console.log('Saved printer ready for direct printing:', printer.name);
        return true;
      } else {
        console.log('Saved printer not found in paired devices, clearing saved data');
        localStorage.removeItem('thermal_printer_id');
        localStorage.removeItem('thermal_printer_name');
        return false;
      }
    } catch (error) {
      console.error('Error getting paired devices:', error);
      return false;
    }
  } catch (error) {
    console.error('Error loading saved printer:', error);
    return false;
  }
}