'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import {
	fetchSettings,
	updateSettings
} from '@/lib/redux/slices/settings.slice';
import { Settings } from '@/types';
import {
	scanForPrinters,
	connectToPrinter,
	testPrinter,
	autoConnectPrinter,
	debugBluetoothSupport,
	type PrinterDevice
} from '@/lib/utils/printer-utils';
import {
	Loader2,
	Printer,
	Wifi,
	WifiOff,
	Settings as SettingsIcon,
	Bell,
	Store,
	CheckCircle2,
	AlertCircle,
	Search
} from 'lucide-react';
import { toast } from 'react-toastify';

// Default settings used as fallback
const defaultSettings: Settings = {
	storeName: 'StoreFront',
	address: '123 Main Street, City',
	phone: '(123) 456-7890',
	email: 'contact@storefront.com',
	taxRate: 10,
	currency: 'INR',
	footer: 'Thank you for your business!',
	notifications: {
		outOfStock: true,
		newOrders: true,
		orderStatus: true,
		dailyReports: false
	},
	printer: {
		name: '',
		deviceId: '',
		type: 'bluetooth' as const,
		autoConnect: false,
		connected: false,
		paperWidth: 80
	}
};

export default function SettingsPage() {
	const dispatch = useAppDispatch();
	const { settings, loading } = useAppSelector(
		(state: RootState) => state.settings
	);
	const [formState, setFormState] = useState<Settings>(defaultSettings);
	const [printerLoading, setPrinterLoading] = useState(false);
	const [availablePrinters, setAvailablePrinters] = useState<PrinterDevice[]>(
		[]
	);
	const [printerStatus, setPrinterStatus] = useState<
		'online' | 'offline' | 'error' | 'checking'
	>('offline');

	// Load settings on component mount
	useEffect(() => {
		dispatch(fetchSettings());
	}, [dispatch]);

	// Auto-connect function
	const handleAutoConnect = useCallback(async () => {
		if (!settings?.printer?.autoConnect || !settings.printer.deviceId) {
			return;
		}

		setPrinterStatus('checking');
		try {
			const connected = await autoConnectPrinter();
			if (connected) {
				const updatedSettings = {
					...settings,
					printer: {
						...settings.printer,
						connected: true
					}
				};

				setFormState(prev => ({
					...prev,
					printer: {
						...prev.printer,
						connected: true
					}
				}));
				setPrinterStatus('online');

				// Save the connected state to database
				try {
					await dispatch(updateSettings(updatedSettings)).unwrap();
				} catch (saveError) {
					console.error('Failed to save printer connection state:', saveError);
				}
			} else {
				setPrinterStatus('offline');
			}
		} catch (error) {
			console.error('Auto-connect failed:', error);
			setPrinterStatus('error');
		}
	}, [settings, dispatch]);

	// Auto-connect to printer when settings are loaded
	useEffect(() => {
		if (settings && settings.printer?.autoConnect) {
			handleAutoConnect();
		}
	}, [settings, handleAutoConnect]);

	// Update local state when settings are loaded
	useEffect(() => {
		if (settings) {
			// Make sure all required fields have values
			const safeSettings = {
				...defaultSettings,
				...settings,
				// Ensure taxRate is a valid number
				taxRate: isNaN(Number(settings.taxRate)) ? 0 : Number(settings.taxRate),
				// Ensure notifications object exists
				notifications: {
					...defaultSettings.notifications,
					...(settings.notifications || {})
				},
				// Ensure printer object exists
				printer: {
					...defaultSettings.printer,
					...(settings.printer || {})
				}
			};
			setFormState(safeSettings);

			// Set initial printer status
			if (safeSettings.printer?.connected && safeSettings.printer?.deviceId) {
				setPrinterStatus('online');
			} else {
				setPrinterStatus('offline');
			}
		}
	}, [settings]);

	const handleStoreSettingsChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setFormState(prev => ({
			...prev,
			[name]:
				name === 'taxRate'
					? isNaN(parseFloat(value))
						? 0
						: parseFloat(value)
					: value
		}));
	};

	const handleNotificationChange = (
		key: keyof typeof formState.notifications
	) => {
		setFormState(prev => ({
			...prev,
			notifications: {
				...prev.notifications,
				[key]: !prev.notifications[key]
			}
		}));
	};

	const handlePrinterSettingsChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setFormState(prev => ({
			...prev,
			printer: {
				...prev.printer,
				[name]:
					name === 'port' || name === 'paperWidth'
						? isNaN(parseInt(value))
							? 0
							: parseInt(value)
						: value
			}
		}));
	};

	const handlePrinterToggle = (key: 'autoConnect') => {
		setFormState(prev => ({
			...prev,
			printer: {
				...prev.printer,
				[key]: !prev.printer[key]
			}
		}));
	};

	const handleScanPrinters = async () => {
		setPrinterLoading(true);
		try {
			// Debug bluetooth support before scanning
			debugBluetoothSupport();

			const discoveredPrinters = await scanForPrinters();
			setAvailablePrinters(discoveredPrinters);
			toast.success(`Found ${discoveredPrinters.length} available printers`);
		} catch (error) {
			console.error('Printer scan failed:', error);

			// Show detailed error message
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('Failed to scan for printers: Unknown error');
			}
		} finally {
			setPrinterLoading(false);
		}
	};

	const handleConnectPrinter = async (printer: PrinterDevice) => {
		setPrinterLoading(true);
		try {
			// Use the printer device directly

			const connected = await connectToPrinter(printer);

			if (connected) {
				setFormState(prev => ({
					...prev,
					printer: {
						...prev.printer,
						name: printer.name,
						deviceId: printer.id,
						connected: true
					}
				}));
				setPrinterStatus('online');
				toast.success(`Connected to ${printer.name}`);
			}
		} catch (error) {
			console.error('Printer connection failed:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to connect to printer'
			);
		} finally {
			setPrinterLoading(false);
		}
	};

	const handleTestPrint = async () => {
		setPrinterLoading(true);
		try {
			if (!formState.printer?.connected || !formState.printer.deviceId) {
				throw new Error('Printer is not connected');
			}

			// For testing, we need to create a printer device based on available printers
			const connectedPrinter = availablePrinters.find(
				p => p.id === formState.printer?.deviceId
			);
			if (!connectedPrinter) {
				throw new Error('Connected printer not found in available printers');
			}

			await testPrinter(connectedPrinter);
			toast.success('Test print sent successfully');
		} catch (error) {
			console.error('Test print failed:', error);
			toast.error(error instanceof Error ? error.message : 'Test print failed');
		} finally {
			setPrinterLoading(false);
		}
	};

	const handleSaveSettings = async () => {
		try {
			await dispatch(updateSettings(formState)).unwrap();
			toast.success('Settings saved successfully');

			// If auto-connect is enabled and we have printer settings, try to connect
			if (
				formState.printer?.autoConnect &&
				formState.printer?.deviceId &&
				!formState.printer?.connected
			) {
				handleAutoConnect();
			}
		} catch (err) {
			console.error('Failed to save settings:', err);
			toast.error('Failed to save settings: ' + (err || 'Unknown error'));
		}
	};

	return (
		<div className='space-y-4 lg:space-y-6 pb-4 lg:pb-6'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
				<div>
					<h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
						Settings
					</h1>
					<p className='text-gray-600 mt-1'>
						Configure your store, printers, and preferences
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<Button
						onClick={handleSaveSettings}
						disabled={loading}
						className='gap-2'>
						{loading ? (
							<>
								<Loader2 className='h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							<>
								<SettingsIcon className='h-4 w-4' />
								Save All Changes
							</>
						)}
					</Button>
				</div>
			</div>

			<Tabs defaultValue='store' className='w-full'>
				<TabsList className='grid w-full grid-cols-3 mb-4 md:mb-6'>
					<TabsTrigger
						value='store'
						className='text-xs md:text-sm gap-1 md:gap-2'>
						<Store className='h-3 w-3 md:h-4 md:w-4' />
						<span className='hidden sm:inline'>Store</span>
					</TabsTrigger>
					<TabsTrigger
						value='printer'
						className='text-xs md:text-sm gap-1 md:gap-2'>
						<Printer className='h-3 w-3 md:h-4 md:w-4' />
						<span className='hidden sm:inline'>Printer</span>
					</TabsTrigger>
					<TabsTrigger
						value='notifications'
						className='text-xs md:text-sm gap-1 md:gap-2'>
						<Bell className='h-3 w-3 md:h-4 md:w-4' />
						<span className='hidden sm:inline'>Notifications</span>
					</TabsTrigger>
				</TabsList>

				{/* Store Settings Tab */}
				<TabsContent value='store' className='space-y-4 lg:space-y-6'>
					<Card className='border-gray-200'>
						<CardHeader className='border-b border-gray-100'>
							<CardTitle className='text-lg lg:text-xl flex items-center gap-2'>
								<Store className='h-5 w-5 text-emerald-600' />
								Store Information
							</CardTitle>
							<CardDescription>
								Configure your store details and business information
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 lg:p-6'>
							<div className='space-y-6'>
								{/* Store Name & Currency */}
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='storeName' className='text-sm font-medium'>
											Store Name *
										</Label>
										<Input
											id='storeName'
											name='storeName'
											value={formState.storeName || ''}
											onChange={handleStoreSettingsChange}
											placeholder='Enter store name'
											className='h-10'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='currency' className='text-sm font-medium'>
											Currency
										</Label>
										<Input
											id='currency'
											name='currency'
											value={formState.currency || ''}
											onChange={handleStoreSettingsChange}
											placeholder='INR'
											className='h-10'
										/>
									</div>
								</div>

								{/* Address */}
								<div className='space-y-2'>
									<Label htmlFor='address' className='text-sm font-medium'>
										Business Address
									</Label>
									<Input
										id='address'
										name='address'
										value={formState.address || ''}
										onChange={handleStoreSettingsChange}
										placeholder='Enter full business address'
										className='h-10'
									/>
								</div>

								{/* Contact Info */}
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='phone' className='text-sm font-medium'>
											Phone Number
										</Label>
										<Input
											id='phone'
											name='phone'
											value={formState.phone || ''}
											onChange={handleStoreSettingsChange}
											placeholder='(123) 456-7890'
											className='h-10'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='email' className='text-sm font-medium'>
											Email Address
										</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formState.email || ''}
											onChange={handleStoreSettingsChange}
											placeholder='contact@store.com'
											className='h-10'
										/>
									</div>
								</div>

								{/* Tax & Footer */}
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='taxRate' className='text-sm font-medium'>
											Default Tax Rate (%)
										</Label>
										<Input
											id='taxRate'
											name='taxRate'
											type='number'
											min='0'
											max='100'
											step='0.1'
											value={
												formState.taxRate !== undefined &&
												!isNaN(Number(formState.taxRate))
													? String(formState.taxRate)
													: '0'
											}
											onChange={handleStoreSettingsChange}
											placeholder='10.5'
											className='h-10'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='footer' className='text-sm font-medium'>
											Receipt Footer Message
										</Label>
										<Input
											id='footer'
											name='footer'
											value={formState.footer || ''}
											onChange={handleStoreSettingsChange}
											placeholder='Thank you for your business!'
											className='h-10'
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Printer Settings Tab */}
				<TabsContent value='printer' className='space-y-4 lg:space-y-6'>
					{/* Current Printer Status */}
					<Card className='border-gray-200'>
						<CardHeader className='border-b border-gray-100'>
							<CardTitle className='text-lg lg:text-xl flex items-center gap-2'>
								<Printer className='h-5 w-5 text-green-600' />
								Thermal Printer Status
								{printerStatus === 'online' || formState.printer?.connected ? (
									<Badge variant='default' className='ml-2 gap-1'>
										<CheckCircle2 className='h-3 w-3' />
										Connected
									</Badge>
								) : printerStatus === 'checking' ? (
									<Badge variant='outline' className='ml-2 gap-1'>
										<Loader2 className='h-3 w-3 animate-spin' />
										Connecting...
									</Badge>
								) : printerStatus === 'error' ? (
									<Badge variant='destructive' className='ml-2 gap-1'>
										<AlertCircle className='h-3 w-3' />
										Error
									</Badge>
								) : (
									<Badge variant='secondary' className='ml-2 gap-1'>
										<AlertCircle className='h-3 w-3' />
										Disconnected
									</Badge>
								)}
							</CardTitle>
							<CardDescription>
								Manage thermal printer connection and settings
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 lg:p-6'>
							{formState.printer?.connected ? (
								<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<h3 className='font-medium text-green-900'>
												{formState.printer.name || 'Connected Printer'}
											</h3>
											<p className='text-sm text-green-700 mt-1'>
												Device ID: {formState.printer.deviceId}
											</p>
										</div>
										<div className='flex items-center gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={handleTestPrint}
												disabled={printerLoading}>
												{printerLoading ? (
													<Loader2 className='h-4 w-4 animate-spin' />
												) : (
													'Test Print'
												)}
											</Button>
										</div>
									</div>
								</div>
							) : (
								<div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
									<div className='text-center'>
										<Printer className='h-12 w-12 mx-auto text-gray-400 mb-3' />
										<h3 className='font-medium text-gray-900 mb-1'>
											No Printer Connected
										</h3>
										<p className='text-sm text-gray-600'>
											Scan for available thermal printers on your network
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Printer Discovery */}
					<Card className='border-gray-200'>
						<CardHeader className='border-b border-gray-100'>
							<CardTitle className='text-lg lg:text-xl flex items-center gap-2'>
								<Search className='h-5 w-5 text-emerald-600' />
								Discover Printers
							</CardTitle>
							<CardDescription>
								Scan your network for available thermal printers
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 lg:p-6'>
							<div className='space-y-4'>
								<Button
									onClick={handleScanPrinters}
									disabled={printerLoading}
									className='w-full sm:w-auto gap-2'>
									{printerLoading ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											Scanning...
										</>
									) : (
										<>
											<Search className='h-4 w-4' />
											Scan for Printers
										</>
									)}
								</Button>

								{availablePrinters.length > 0 && (
									<div className='space-y-3'>
										<h4 className='font-medium text-gray-900'>
											Available Printers:
										</h4>
										{availablePrinters.map((printer, index) => (
											<div
												key={index}
												className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
												<div className='flex items-center gap-3'>
													{printer.status === 'online' ? (
														<Wifi className='h-4 w-4 text-green-500' />
													) : (
														<WifiOff className='h-4 w-4 text-red-500' />
													)}
													<div>
														<p className='font-medium text-gray-900'>
															{printer.name}
														</p>
														<p className='text-sm text-gray-600'>
															{printer.id}
														</p>
													</div>
													<Badge
														variant={
															printer.status === 'online'
																? 'default'
																: 'destructive'
														}
														className='text-xs'>
														{printer.status}
													</Badge>
												</div>
												<Button
													size='sm'
													onClick={() => handleConnectPrinter(printer)}
													disabled={
														printer.status === 'offline' || printerLoading
													}>
													Connect
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Manual Printer Configuration */}
					<Card className='border-gray-200'>
						<CardHeader className='border-b border-gray-100'>
							<CardTitle className='text-lg lg:text-xl flex items-center gap-2'>
								<SettingsIcon className='h-5 w-5 text-emerald-600' />
								Manual Configuration
							</CardTitle>
							<CardDescription>
								Manually configure printer connection settings
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 lg:p-6'>
							<div className='space-y-4'>
								{/* Printer Name & IP */}
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label
											htmlFor='printerName'
											className='text-sm font-medium'>
											Printer Name
										</Label>
										<Input
											id='printerName'
											name='name'
											value={formState.printer?.name || ''}
											onChange={handlePrinterSettingsChange}
											placeholder='ThermalPrinter-001'
											className='h-10'
										/>
									</div>
									<div className='space-y-2'>
										<Label
											htmlFor='printerDeviceId'
											className='text-sm font-medium'>
											Printer Device ID
										</Label>
										<Input
											id='printerDeviceId'
											name='deviceId'
											value={formState.printer?.deviceId || ''}
											onChange={handlePrinterSettingsChange}
											placeholder='Device ID from paired printer'
											className='h-10'
											readOnly
										/>
										<p className='text-xs text-gray-500'>
											Device ID is automatically set when you connect to a
											emeraldtooth printer above.
										</p>
									</div>
								</div>

								{/* Paper Width */}
								<div className='grid grid-cols-1 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='paperWidth' className='text-sm font-medium'>
											Paper Width (mm)
										</Label>
										<Input
											id='paperWidth'
											name='paperWidth'
											type='number'
											value={formState.printer?.paperWidth || 80}
											onChange={handlePrinterSettingsChange}
											placeholder='80'
											className='h-10'
										/>
									</div>
								</div>

								{/* Auto Connect */}
								<div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
									<div className='space-y-0.5'>
										<Label
											htmlFor='autoConnect'
											className='text-sm font-medium'>
											Auto-Connect on Startup
										</Label>
										<p className='text-xs text-gray-600'>
											Automatically connect to this printer when the app starts
										</p>
									</div>
									<Switch
										id='autoConnect'
										checked={!!formState.printer?.autoConnect}
										onCheckedChange={() => handlePrinterToggle('autoConnect')}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notifications Tab */}
				<TabsContent value='notifications' className='space-y-4 lg:space-y-6'>
					<Card className='border-gray-200'>
						<CardHeader className='border-b border-gray-100'>
							<CardTitle className='text-lg lg:text-xl flex items-center gap-2'>
								<Bell className='h-5 w-5 text-yellow-600' />
								Notification Preferences
							</CardTitle>
							<CardDescription>
								Configure when and how you want to be notified about store
								events
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 lg:p-6'>
							<div className='space-y-6'>
								{/* Out of Stock Alerts */}
								<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='outOfStock' className='text-sm font-medium'>
											Out of Stock Alerts
										</Label>
										<p className='text-xs text-gray-600'>
											Receive notifications when items are running low or out of
											stock
										</p>
									</div>
									<Switch
										id='outOfStock'
										checked={!!formState.notifications?.outOfStock}
										onCheckedChange={() =>
											handleNotificationChange('outOfStock')
										}
									/>
								</div>

								{/* New Order Notifications */}
								<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='newOrders' className='text-sm font-medium'>
											New Order Notifications
										</Label>
										<p className='text-xs text-gray-600'>
											Get notified immediately when new orders are placed
										</p>
									</div>
									<Switch
										id='newOrders'
										checked={!!formState.notifications?.newOrders}
										onCheckedChange={() =>
											handleNotificationChange('newOrders')
										}
									/>
								</div>

								{/* Order Status Updates */}
								<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label
											htmlFor='orderStatus'
											className='text-sm font-medium'>
											Order Status Updates
										</Label>
										<p className='text-xs text-gray-600'>
											Receive notifications when order status changes
											(completed, cancelled, etc.)
										</p>
									</div>
									<Switch
										id='orderStatus'
										checked={!!formState.notifications?.orderStatus}
										onCheckedChange={() =>
											handleNotificationChange('orderStatus')
										}
									/>
								</div>

								{/* Daily Sales Reports */}
								<div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label
											htmlFor='dailyReports'
											className='text-sm font-medium'>
											Daily Sales Reports
										</Label>
										<p className='text-xs text-gray-600'>
											Receive daily summary reports of sales performance and
											analytics
										</p>
									</div>
									<Switch
										id='dailyReports'
										checked={!!formState.notifications?.dailyReports}
										onCheckedChange={() =>
											handleNotificationChange('dailyReports')
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
