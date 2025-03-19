'use client';

import { useState } from 'react';
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

export default function SettingsPage() {
	const [storeSettings, setStoreSettings] = useState({
		storeName: 'StoreFront',
		address: '123 Main Street, City',
		phone: '(123) 456-7890',
		email: 'contact@storefront.com',
		taxRate: '10',
		currency: 'USD'
	});

	const [notifications, setNotifications] = useState({
		lowStock: true,
		newOrders: true,
		orderStatus: true,
		dailyReports: false
	});

	const handleStoreSettingsChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setStoreSettings(prev => ({ ...prev, [name]: value }));
	};

	const handleNotificationChange = (key: keyof typeof notifications) => {
		setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
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
											value={storeSettings.storeName}
											onChange={handleStoreSettingsChange}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='currency'>Currency</Label>
										<Input
											id='currency'
											name='currency'
											value={storeSettings.currency}
											onChange={handleStoreSettingsChange}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										id='address'
										name='address'
										value={storeSettings.address}
										onChange={handleStoreSettingsChange}
									/>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='phone'>Phone</Label>
										<Input
											id='phone'
											name='phone'
											value={storeSettings.phone}
											onChange={handleStoreSettingsChange}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											name='email'
											value={storeSettings.email}
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
										value={storeSettings.taxRate}
										onChange={handleStoreSettingsChange}
									/>
								</div>
							</CardContent>
							<CardFooter>
								<Button>Save Changes</Button>
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
										<Label htmlFor='lowStock'>Low Stock Alerts</Label>
										<p className='text-sm text-muted-foreground'>
											Receive notifications when items are running low
										</p>
									</div>
									<Switch
										id='lowStock'
										checked={notifications.lowStock}
										onCheckedChange={() => handleNotificationChange('lowStock')}
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
										checked={notifications.newOrders}
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
										checked={notifications.orderStatus}
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
										checked={notifications.dailyReports}
										onCheckedChange={() =>
											handleNotificationChange('dailyReports')
										}
									/>
								</div>
							</CardContent>
							<CardFooter>
								<Button>Save Preferences</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
