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
		<div className='flex-1 p-6'>
			<div className='space-y-6'>
				<Tabs defaultValue='general' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='general'>General</TabsTrigger>
						<TabsTrigger value='notifications'>Notifications</TabsTrigger>
					</TabsList>

					<TabsContent value='general' className='space-y-4 mt-4'>
						<Card>
							<CardHeader>
								<CardTitle>Store Information</CardTitle>
								<CardDescription>
									Manage your store details and preferences
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='storeName'>Store Name</Label>
										<Input
											id='storeName'
											name='storeName'
											value={formState.storeName || ''}
											onChange={handleStoreSettingsChange}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='currency'>Currency</Label>
										<Input
											id='currency'
											name='currency'
											value={formState.currency || ''}
											onChange={handleStoreSettingsChange}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										id='address'
										name='address'
										value={formState.address || ''}
										onChange={handleStoreSettingsChange}
									/>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='phone'>Phone</Label>
										<Input
											id='phone'
											name='phone'
											value={formState.phone || ''}
											onChange={handleStoreSettingsChange}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											name='email'
											value={formState.email || ''}
											onChange={handleStoreSettingsChange}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='taxRate'>Default Tax Rate (%)</Label>
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
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='footer'>Invoice Footer Message</Label>
									<Input
										id='footer'
										name='footer'
										value={formState.footer || ''}
										onChange={handleStoreSettingsChange}
										placeholder='Thank you for your business!'
									/>
								</div>
							</CardContent>
							<CardFooter>
								<Button onClick={handleSaveSettings} disabled={loading}>
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
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>
									Configure when and how you want to be notified
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='outOfStock'>Out of Stock Alerts</Label>
										<p className='text-sm text-muted-foreground'>
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

								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='newOrders'>New Order Notifications</Label>
										<p className='text-sm text-muted-foreground'>
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

								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='orderStatus'>Order Status Updates</Label>
										<p className='text-sm text-muted-foreground'>
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

								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='dailyReports'>Daily Sales Reports</Label>
										<p className='text-sm text-muted-foreground'>
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
							<CardFooter>
								<Button onClick={handleSaveSettings} disabled={loading}>
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
