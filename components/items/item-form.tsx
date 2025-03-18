'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createItem, updateItem } from '@/lib/redux/slices/items.slice';

interface ItemFormProps {
	item?: Item;
	onClose: () => void;
}

export function ItemForm({ item, onClose }: ItemFormProps) {
	const dispatch = useDispatch();
	const [formData, setFormData] = useState({
		name: '',
		price: '',
		weight: '',
		quantity: '1'
	});

	// If we have an item, populate the form
	useEffect(() => {
		if (item) {
			setFormData({
				name: item.name,
				price: String(item.price),
				weight: item.weight ? String(item.weight) : '',
				quantity: String(item.quantity)
			});
		}
	}, [item]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const itemData = {
			name: formData.name,
			price: parseFloat(formData.price),
			weight: formData.weight ? parseFloat(formData.weight) : undefined,
			quantity: parseInt(formData.quantity, 10)
		};

		if (item) {
			// Update existing item
			dispatch(
				updateItem({
					id: item.id,
					data: itemData
				})
			);
		} else {
			// Create new item
			dispatch(createItem(itemData));
		}

		onClose();
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='name'>Name</Label>
				<Input
					id='name'
					name='name'
					value={formData.name}
					onChange={handleChange}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='price'>Price</Label>
				<Input
					id='price'
					name='price'
					type='number'
					step='0.01'
					min='0'
					value={formData.price}
					onChange={handleChange}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='weight'>Weight (kg, optional)</Label>
				<Input
					id='weight'
					name='weight'
					type='number'
					step='0.01'
					min='0'
					value={formData.weight}
					onChange={handleChange}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='quantity'>Quantity</Label>
				<Input
					id='quantity'
					name='quantity'
					type='number'
					min='1'
					value={formData.quantity}
					onChange={handleChange}
					required
				/>
			</div>

			<div className='flex justify-end space-x-2'>
				<Button type='button' variant='outline' onClick={onClose}>
					Cancel
				</Button>
				<Button type='submit'>{item ? 'Update' : 'Create'}</Button>
			</div>
		</form>
	);
}
