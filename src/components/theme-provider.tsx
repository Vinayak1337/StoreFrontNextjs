'use client';

import * as React from 'react';
import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps as NextThemeProviderProps
} from 'next-themes';

export interface ThemeProviderProps
	extends Omit<NextThemeProviderProps, 'children'> {
	children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider {...props} forcedTheme='light'>
			{children}
		</NextThemesProvider>
	);
}
