'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';
import { toast } from 'react-toastify';
import {
	Package,
	IndianRupee,
	Scale,
	ShoppingBag,
	Save,
	X
} from 'lucide-react';

interface ItemFormProps {
	item?: Item;
	onClose: () => void;
}

type WeightUnit = 'kg' | 'g' | 'l' | 'ml';

export function ItemForm({ item, onClose }: ItemFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: '',
		price: '',
		weight: '',
		weightUnit: 'kg' as WeightUnit,
		quantity: '1',
		inStock: true
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (item) {
			setFormData({
				name: item.name,
				price: String(item.price),
				weight: item.weight ? String(item.weight) : '',
				weightUnit: (item.weightUnit || 'kg') as WeightUnit,
				quantity: String(item.quantity),
				inStock: item.inStock !== undefined ? item.inStock : true
			});
		}
	}, [item]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleWeightUnitChange = (value: WeightUnit) => {
		setFormData(prev => ({ ...prev, weightUnit: value }));
	};

	const handleInStockChange = (checked: boolean) => {
		setFormData(prev => ({ ...prev, inStock: checked }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const itemData = {
			name: formData.name,
			price: parseFloat(formData.price),
			weight: formData.weight ? parseFloat(formData.weight) : undefined,
			weightUnit: formData.weight ? formData.weightUnit : null,
			quantity: parseInt(formData.quantity, 10),
			inStock: formData.inStock
		};

		try {
			if (item) {
				await api.updateItem(item.id, itemData);
				toast.success('Item updated successfully!');
			} else {
				await api.createItem(itemData);
				toast.success('Item created successfully!');
			}
			router.refresh();
			onClose();
		} catch (error) {
			console.error('Error saving item:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to save item. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-5 max-w-3xl mx-auto md:px-4'>
			<div className='space-y-2'>
				<Label htmlFor='name' className='text-sm font-medium flex items-center gap-2'>
					<Package className='h-4 w-4 text-primary' />
					Product Name
				</Label>
				<Input
					id='name'
					name='name'
					value={formData.name}
					onChange={handleChange}
					required
					className='transition-colors focus-visible:ring-primary'
					placeholder='Enter product name'
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='price' className='text-sm font-medium flex items-center gap-2'>
					<IndianRupee className='h-4 w-4 text-primary' />
					Price
				</Label>
				<Input
					id='price'
					name='price'
					type='number'
					step='0.01'
					min='0'
					value={formData.price}
					onChange={handleChange}
					required
					className='transition-colors focus-visible:ring-primary'
					icon={<IndianRupee className='h-4 w-4 text-muted-foreground' />}
					placeholder='0.00'
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='weight' className='text-sm font-medium flex items-center gap-2'>
					<Scale className='h-4 w-4 text-primary' />
					Weight
				</Label>
				<div className='flex gap-2'>
					<Input
						id='weight'
						name='weight'
						type='number'
						step='0.01'
						min='0'
						value={formData.weight}
						onChange={handleChange}
						className='transition-colors focus-visible:ring-primary flex-1'
						placeholder='Enter weight'
					/>
					<Select value={formData.weightUnit} onValueChange={handleWeightUnitChange}>
						<SelectTrigger className='w-[120px]'>
							<SelectValue placeholder='Unit' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='kg'>Kilograms (kg)</SelectItem>
							<SelectItem value='g'>Grams (gm)</SelectItem>
							<SelectItem value='l'>Liters (ltr)</SelectItem>
							<SelectItem value='ml'>Milliliters (ml)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='quantity' className='text-sm font-medium flex items-center gap-2'>
					<ShoppingBag className='h-4 w-4 text-primary' />
					Serving Quantity
				</Label>
				<Input
					id='quantity'
					name='quantity'
					type='number'
					min='0'
					value={formData.quantity}
					onChange={handleChange}
					required
					className='transition-colors focus-visible:ring-primary'
					placeholder='e.g., 1 piece, 2 cups, 500 grams'
				/>
				<p className='text-xs text-muted-foreground mt-1'>
					How much the customer gets per order (for description only, not inventory tracking)
				</p>
			</div>

			<div className='flex justify-between gap-2'>
				<Label htmlFor='in-stock' className='text-sm font-medium flex items-center gap-2'>
					<ShoppingBag className='h-4 w-4 text-warning' />
					In Stock
				</Label>
				<div className='flex items-center gap-2'>
					<Switch id='in-stock' checked={formData.inStock} onCheckedChange={handleInStockChange} />
					<span className='cursor-pointer select-none' onClick={() => handleInStockChange(!formData.inStock)}>
						{formData.inStock ? 'Yes' : 'No'}
					</span>
				</div>
			</div>

			<div className='flex justify-end space-x-3 pt-2'>
				<Button
					type='button'
					variant='outline'
					onClick={onClose}
					leftIcon={<X className='h-4 w-4' />}
					className='hover:bg-destructive/10 hover:text-destructive hover:border-destructive py-2.5 md:py-2'>
					Cancel
				</Button>
				<Button
					type='submit'
					variant='default'
					leftIcon={<Save className='h-4 w-4' />}
					isLoading={isSubmitting}
					className='py-2.5 md:py-2'>
					{item ? 'Update Item' : 'Create Item'}
				</Button>
			</div>
		</form>
	);
}
