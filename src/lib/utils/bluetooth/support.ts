/**
 * Bluetooth Support Detection Utilities
 */

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

		const isChrome =
			/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
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
		console.log(
			'Is HTTPS or localhost:',
			window.location.protocol === 'https:' ||
				window.location.hostname === 'localhost'
		);
	}

	console.log('Final support check:', isBluetoothSupported());
	console.log('=====================================');
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
	const isChrome =
		/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	const isEdge = /Edg/.test(navigator.userAgent);

	return isChrome || isEdge;
}