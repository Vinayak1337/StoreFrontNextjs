import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		variant?: 'default' | 'interactive' | 'outline' | 'transparent';
	}
>(({ className, variant = 'default', ...props }, ref) => {
	const variantStyles = {
		default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
		interactive:
			'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md card-hover',
		outline: 'rounded-lg border bg-transparent text-card-foreground',
		transparent: 'rounded-lg bg-transparent text-card-foreground'
	};

	return (
		<div
			ref={ref}
			className={cn(
				variantStyles[variant],
				variant === 'interactive' &&
					'transition-all duration-300 animate-scale',
				className
			)}
			{...props}
		/>
	);
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col space-y-1.5 p-6', className)}
		{...props}
	/>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement> & {
		icon?: React.ReactNode;
	}
>(({ className, icon, children, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			'text-2xl font-semibold leading-none tracking-tight flex items-center gap-2',
			className
		)}
		{...props}>
		{icon && <span className='text-primary'>{icon}</span>}
		{children}
	</h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center p-6 pt-0', className)}
		{...props}
	/>
));
CardFooter.displayName = 'CardFooter';

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent
};
