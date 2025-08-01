import { formatBillForThermalPrinter } from './bill-utils';
import { getGlobalConnectedPrinter, printToBluetooth } from './printer-utils';

/**
 * Print directly to the paired thermal printer (no connection needed)
 */
export async function printDirectlyToThermalPrinter(order: Order, settings: Settings): Promise<boolean> {
  try {
    // Get the globally set printer (already paired)
    const pairedPrinter = getGlobalConnectedPrinter();
    
    if (!pairedPrinter) {
      throw new Error('No thermal printer is set up. Please pair a printer in Settings first.');
    }

    // Format the order for thermal printing
    const content = formatBillForThermalPrinter(order, settings);
    if (!content) {
      throw new Error('Could not format order data for printing');
    }

    // Send print commands directly to paired printer (no connection step)
    const success = await printToBluetooth(pairedPrinter, content);
    
    if (success) {
      return true;
    } else {
      throw new Error('Failed to send print data to thermal printer');
    }
  } catch (error) {
    throw error;
  }
}