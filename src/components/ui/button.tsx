import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md',
				ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				glass:
					'bg-background/40 backdrop-blur-md border border-border/30 hover:bg-background/60 shadow-sm hover:shadow-md',
				gradient:
					'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-sm hover:shadow-md',
				success:
					'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md',
				warning:
					'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
				xl: 'h-12 rounded-md px-10 text-base'
			},
			animation: {
				none: '',
				pulse: 'animate-pulse',
				bounce: 'hover:animate-bounce',
				scale: 'hover:scale-105',
				glow: 'hover-glow',
				raise: 'hover-raise'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			animation: 'none'
		}
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			animation,
			asChild = false,
			isLoading,
			leftIcon,
			rightIcon,
			children,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, animation, className }))}
				ref={ref}
				disabled={isLoading || props.disabled}
				{...props}>
				{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				{!isLoading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
				{children}
				{!isLoading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
			</Comp>
		);
	}
);
Button.displayName = 'Button';

export { Button, buttonVariants };
