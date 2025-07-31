'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OrderDetailNavigationProps {
	variant?: 'icon' | 'button';
}

export function OrderDetailNavigation({ variant = 'icon' }: OrderDetailNavigationProps) {
	const router = useRouter();

	if (variant === 'button') {
		return (
			<Button 
				variant='outline' 
				onClick={() => router.push('/orders')}>
				Back to Orders
			</Button>
		);
	}

	return (
		<Button
			variant='outline'
			size='icon'
			onClick={() => router.push('/orders')}
			className='h-9 w-9'>
			<ArrowLeft className='h-4 w-4' />
		</Button>
	);
}