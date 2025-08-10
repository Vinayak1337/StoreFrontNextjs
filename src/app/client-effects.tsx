'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ClientEffectsProps {
	isProtectedRoute?: boolean;
}

export default function ClientEffects({}: ClientEffectsProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Removed auto-connect attempt for Bluetooth printers due to browser constraints

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const detectKeyboard = () => {
				const initialHeight = window.innerHeight;

				window.addEventListener('resize', () => {
					const heightDifference = initialHeight - window.innerHeight;

					if (heightDifference > initialHeight * 0.2) {
						document.body.classList.add('keyboard-visible');
					} else {
						document.body.classList.remove('keyboard-visible');
					}
				});
			};

			const mediaQuery = window.matchMedia(
				'(min-width: 600px) and (max-width: 1023px) and (orientation: portrait)'
			);

			const handleTabletPortraitMode = (
				e: MediaQueryListEvent | MediaQueryList
			) => {
				if (e.matches) {
					document.body.classList.add('tablet-portrait');
				} else {
					document.body.classList.remove('tablet-portrait');
				}
			};

			handleTabletPortraitMode(mediaQuery);

			mediaQuery.addEventListener('change', handleTabletPortraitMode);

			detectKeyboard();

			return () => {
				mediaQuery.removeEventListener('change', handleTabletPortraitMode);
			};
		}
	}, []);

	// Remove global page-enter animations to match minimal motion theme

	if (!mounted) return null;

	return (
		<ToastContainer
			position='top-right'
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme='light'
			style={{ zIndex: 9999 }}
		/>
	);
}
