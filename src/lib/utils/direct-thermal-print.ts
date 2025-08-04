import { getGlobalConnectedPrinter, printToBluetooth } from './printer-utils';

/**
 * Format order content specifically for thermal printers
 * This creates a plain text representation that can be used with ESC/POS commands
 */
export const formatOrderForThermalPrinter = (
	order: Order,
	settings: Settings
): string => {
	if (!order || !settings) return '';

	// ESC/POS Commands
	const ESC = '\x1B'; // Escape character
	const GS = '\x1D'; // Group separator

	// Text formatting commands
	const CENTER = `${ESC}\x61\x01`; // Center alignment
	const LEFT = `${ESC}\x61\x00`; // Left alignment
	const BOLD_ON = `${ESC}E\x01`; // Bold on
	const BOLD_OFF = `${ESC}E\x00`; // Bold off
	const DOUBLE_SIZE = `${ESC}!\x30`; // Double width & height
	const NORMAL_SIZE = `${ESC}!\x00`; // Normal size

	// Line feed and paper cut
	const LF = '\n'; // Line feed
	const INIT = `${ESC}@`; // Initialize printer
	const CUT = `${GS}V\x42\x00`; // Cut paper command

	// Receipt constants
	// For 58mm thermal printers (common width is 32-36 chars)
	const WIDTH = 32; // Total width of paper in characters
	const SEPARATOR = '-'.repeat(WIDTH);

	// Column widths for perfect alignment
	// The total must sum to WIDTH (32 characters)
	const COLS = {
		item: 14, // 14 chars for item name
		qty: 4, // 4 chars for quantity
		rate: 6, // 6 chars for rate/price (up to "999.99")
		amount: 8 // 8 chars for amount/total (up to "99999.99" or "999999")
	};

	// Helper function to format a number with NO currency symbol
	function money(n: number): string {
		return n % 1 === 0 ? String(n) : n.toFixed(2); // "125" or "125.50"
	}

	// Helper function to create a perfectly aligned row
	const row = (
		item: string,
		qty: string,
		rate: string,
		amount: string
	): string => {
		return (
			item.padEnd(COLS.item).slice(0, COLS.item) + // clamp name
			qty.padStart(COLS.qty) +
			rate.padStart(COLS.rate) +
			amount.padStart(COLS.amount) +
			LF
		);
	};

	// Helper function to create right-aligned data with label
	const dataRow = (label: string, value: string): string => {
		return label + ' '.repeat(WIDTH - label.length - value.length) + value + LF;
	};

	// Format the order content with ESC/POS commands
	let content = INIT;

	// Store branding and header (centered, prominent)
	content += CENTER + BOLD_ON + DOUBLE_SIZE;
	content += settings.storeName.toUpperCase() + LF; // BIG & BOLD
	content += NORMAL_SIZE;
	content += settings.address + LF;
	content += `${settings.phone}` + LF;
	if (settings.email) {
		content += settings.email + LF;
	}

	content += SEPARATOR + LF;

	// Order header - improved date format for India (DD-MM-YYYY)
	const createdDate = new Date(order.createdAt);
	const formattedDate = `${String(createdDate.getDate()).padStart(
		2,
		'0'
	)}-${String(createdDate.getMonth() + 1).padStart(
		2,
		'0'
	)}-${createdDate.getFullYear()}`;
	const formattedTime = `${String(createdDate.getHours()).padStart(
		2,
		'0'
	)}:${String(createdDate.getMinutes()).padStart(2, '0')} (IST)`;

	// Invoice number and date on separate lines to avoid collision
	content += LEFT;
	content += dataRow('Invoice# ' + order.id.slice(0, 6), '');
	content += dataRow('Date', formattedDate + ' ' + formattedTime);

	// Customer on separate line
	const customer = order.customerName?.split(' ')[0] || 'Customer';
	content += dataRow('Customer: ' + customer, '');
	content += LF; // Extra line before separator

	content += SEPARATOR + LF;

	// Items header - fixed column widths for proper alignment
	content += BOLD_ON;
	content += row('ITEM'.padEnd(COLS.item), 'QTY', 'RATE', 'AMT');
	content += BOLD_OFF;

	// Items with precise column alignment
	if (order.orderItems) {
		order.orderItems.forEach(item => {
			// Item name - truncating as needed
			const itemName = item.item?.name || 'Unknown';

			// Price without currency symbol
			const price = Number(item.price || 0);
			const priceStr = money(price);

			// Total amount without currency symbol
			const total = price * item.quantity;
			const totalStr = money(total);

			content += row(itemName, String(item.quantity), priceStr, totalStr);
		});
	}

	content += SEPARATOR + LF;

	// Calculate total from order items
	const orderTotal = order.orderItems?.reduce((sum, item) => {
		return sum + (Number(item.price) * item.quantity);
	}, 0) || 0;

	// Total with prominent formatting
	content += BOLD_ON;
	content += dataRow('TOTAL', money(orderTotal));
	content += BOLD_OFF;

	// Payment method - default to CASH
	content += `Paid by: CASH` + LF;

	content += LF + SEPARATOR + LF;

	// Footer with thank you message - centered
	content += CENTER + BOLD_ON;
	content += LF;
	content += BOLD_OFF;
	content +=
		'Visit again' + (settings.footer ? ` - ${settings.footer}` : '') + LF;

	// Add more spacing before cutting
	content += LF + LF + LF + LF;

	// Cut the paper
	content += CUT;

	return content;
};

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
    const content = formatOrderForThermalPrinter(order, settings);
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