'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	clearable?: boolean;
	onClear?: () => void;
	containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			icon,
			iconPosition = 'left',
			clearable = true,
			onClear,
			containerClassName,
			...props
		},
		ref
	) => {
		const [value, setValue] = React.useState(
			props.value || props.defaultValue || ''
		);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
			props.onChange?.(e);
		};

		const handleClear = () => {
			setValue('');
			onClear?.();

			// Create a synthetic event to trigger onChange
			const event = {
				target: { value: '' }
			} as React.ChangeEvent<HTMLInputElement>;
			props.onChange?.(event);
		};

		return (
			<div
				className={cn(
					'relative flex items-center transition-all duration-300',
					containerClassName
				)}>
				{icon && iconPosition === 'left' && (
					<div className='absolute left-3 text-muted-foreground'>{icon}</div>
				)}
				<input
					type={type}
					className={cn(
						'flex h-10 w-full rounded-md border border-input bg-background px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
						'md:h-9 md:py-1.5 md:text-sm', // Tablet-specific adjustments
						icon && iconPosition === 'left' ? 'px-10 py-2' : 'px-3 py-2',
						clearable || (icon && iconPosition === 'right') ? 'pr-10' : '',
						className
					)}
					ref={ref}
					value={props.value !== undefined ? props.value : value}
					onChange={handleChange}
					{...props}
				/>
				{icon && iconPosition === 'right' && (
					<div
						className={cn(
							'absolute text-muted-foreground',
							clearable && value && !props.disabled && !props.readOnly
								? 'right-10'
								: 'right-3'
						)}>
						{icon}
					</div>
				)}
				{clearable && value && !props.disabled && !props.readOnly && (
					<button
						type='button'
						onClick={handleClear}
						className='absolute right-3 text-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center'
						aria-label='Clear input'>
						<X className='h-4 w-4' />
					</button>
				)}
			</div>
		);
	}
);
Input.displayName = 'Input';

const SearchInput = React.forwardRef<
	HTMLInputElement,
	Omit<InputProps, 'icon' | 'type'>
>((props, ref) => {
	return (
		<Input
			{...props}
			ref={ref}
			type='search'
			icon={<Search className='h-4 w-4' />}
			clearable={props.clearable !== false}
		/>
	);
});
SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };
