'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import {
	fetchSettings,
	updateSettings
} from '@/lib/redux/slices/settings.slice';
import { Settings } from '@/types';
import { Loader2 } from 'lucide-react';
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
	}
};

export default function SettingsPage() {
	const dispatch = useAppDispatch();
	const { settings, loading } = useAppSelector(
		(state: RootState) => state.settings
	);
	const [formState, setFormState] = useState<Settings>(defaultSettings);

	// Load settings on component mount
	useEffect(() => {
		dispatch(fetchSettings());
	}, [dispatch]);

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
				}
			};
			setFormState(safeSettings);
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

	const handleSaveSettings = () => {
		dispatch(updateSettings(formState))
			.unwrap()
			.then(() => {
				toast.success('Settings saved successfully');
			})
			.catch(err => {
				toast.error('Failed to save settings: ' + (err || 'Unknown error'));
			});
	};

	return (
		<div className='flex-1 p-4 md:p-6'>
			<div className='space-y-4 md:space-y-6 max-w-4xl'>
				<div className='mb-4 md:mb-6'>
					<h1 className='text-2xl md:text-3xl font-bold'>Settings</h1>
					<p className='text-muted-foreground mt-1'>Manage your store configuration and preferences</p>
				</div>

				<Tabs defaultValue='general' className='w-full'>
					<TabsList className='grid w-full grid-cols-2 mb-4 md:mb-6'>
						<TabsTrigger value='general' className='text-sm md:text-base'>General</TabsTrigger>
						<TabsTrigger value='notifications' className='text-sm md:text-base'>Notifications</TabsTrigger>
					</TabsList>

					<TabsContent value='general' className='space-y-4 mt-4'>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg md:text-xl'>Store Information</CardTitle>
								<CardDescription className='text-sm md:text-base'>
									Manage your store details and preferences
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4 md:space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='storeName' className='text-sm md:text-base'>Store Name</Label>
										<Input
											id='storeName'
											name='storeName'
											value={formState.storeName || ''}
											onChange={handleStoreSettingsChange}
											className='h-10 md:h-11'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='currency' className='text-sm md:text-base'>Currency</Label>
										<Input
											id='currency'
											name='currency'
											value={formState.currency || ''}
											onChange={handleStoreSettingsChange}
											className='h-10 md:h-11'
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='address' className='text-sm md:text-base'>Address</Label>
									<Input
										id='address'
										name='address'
										value={formState.address || ''}
										onChange={handleStoreSettingsChange}
										className='h-10 md:h-11'
									/>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='phone' className='text-sm md:text-base'>Phone</Label>
										<Input
											id='phone'
											name='phone'
											value={formState.phone || ''}
											onChange={handleStoreSettingsChange}
											className='h-10 md:h-11'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='email' className='text-sm md:text-base'>Email</Label>
										<Input
											id='email'
											name='email'
											value={formState.email || ''}
											onChange={handleStoreSettingsChange}
											className='h-10 md:h-11'
										/>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
									<div className='space-y-2'>
										<Label htmlFor='taxRate' className='text-sm md:text-base'>Default Tax Rate (%)</Label>
										<Input
											id='taxRate'
											name='taxRate'
											type='number'
											value={
												formState.taxRate !== undefined &&
												!isNaN(Number(formState.taxRate))
													? String(formState.taxRate)
													: '0'
											}
											onChange={handleStoreSettingsChange}
											className='h-10 md:h-11'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='footer' className='text-sm md:text-base'>Invoice Footer Message</Label>
										<Input
											id='footer'
											name='footer'
											value={formState.footer || ''}
											onChange={handleStoreSettingsChange}
											placeholder='Thank you for your business!'
											className='h-10 md:h-11'
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className='flex justify-end'>
								<Button onClick={handleSaveSettings} disabled={loading} className='w-full sm:w-auto'>
									{loading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										'Save Changes'
									)}
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value='notifications' className='space-y-4 mt-4'>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg md:text-xl'>Notification Preferences</CardTitle>
								<CardDescription className='text-sm md:text-base'>
									Configure when and how you want to be notified
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4 md:space-y-6'>
								<div className='flex items-center justify-between py-3 border-b border-border last:border-b-0'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='outOfStock' className='text-sm md:text-base font-medium'>Out of Stock Alerts</Label>
										<p className='text-xs md:text-sm text-muted-foreground'>
											Receive notifications when items are out of stock
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

								<div className='flex items-center justify-between py-3 border-b border-border last:border-b-0'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='newOrders' className='text-sm md:text-base font-medium'>New Order Notifications</Label>
										<p className='text-xs md:text-sm text-muted-foreground'>
											Get notified when new orders are placed
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

								<div className='flex items-center justify-between py-3 border-b border-border last:border-b-0'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='orderStatus' className='text-sm md:text-base font-medium'>Order Status Updates</Label>
										<p className='text-xs md:text-sm text-muted-foreground'>
											Receive notifications when order status changes
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

								<div className='flex items-center justify-between py-3 border-b border-border last:border-b-0'>
									<div className='space-y-0.5 flex-1 pr-4'>
										<Label htmlFor='dailyReports' className='text-sm md:text-base font-medium'>Daily Sales Reports</Label>
										<p className='text-xs md:text-sm text-muted-foreground'>
											Receive daily summary of sales and performance
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
							</CardContent>
							<CardFooter className='flex justify-end'>
								<Button onClick={handleSaveSettings} disabled={loading} className='w-full sm:w-auto'>
									{loading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Saving...
										</>
									) : (
										'Save Preferences'
									)}
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
