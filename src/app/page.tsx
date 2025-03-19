import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
	return (
		<div className='flex min-h-screen flex-col'>
			<main className='flex-1'>
				<section className='w-full py-12 md:py-24 lg:py-32'>
					<div className='container px-4 md:px-6'>
						<div className='flex flex-col items-center justify-center space-y-4 text-center'>
							<div className='space-y-2'>
								<h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
									Welcome to StoreFront
								</h1>
								<p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
									Manage your store with ease. Track inventory, process orders,
									and analyze sales.
								</p>
							</div>
						</div>
					</div>
				</section>
				<section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100'>
					<div className='container px-4 md:px-6'>
						<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							<Link href='/items'>
								<Card className='h-full cursor-pointer hover:bg-gray-50 transition-colors'>
									<CardHeader>
										<CardTitle>Items</CardTitle>
										<CardDescription>Manage your inventory</CardDescription>
									</CardHeader>
									<CardContent>
										<p>Add, edit, and track your store items.</p>
									</CardContent>
								</Card>
							</Link>
							<Link href='/orders'>
								<Card className='h-full cursor-pointer hover:bg-gray-50 transition-colors'>
									<CardHeader>
										<CardTitle>Orders</CardTitle>
										<CardDescription>Process customer orders</CardDescription>
									</CardHeader>
									<CardContent>
										<p>Create and manage customer orders.</p>
									</CardContent>
								</Card>
							</Link>
							<Link href='/bills'>
								<Card className='h-full cursor-pointer hover:bg-gray-50 transition-colors'>
									<CardHeader>
										<CardTitle>Bills</CardTitle>
										<CardDescription>
											Handle billing and payments
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p>Generate bills and track payments.</p>
									</CardContent>
								</Card>
							</Link>
							<Link href='/analytics'>
								<Card className='h-full cursor-pointer hover:bg-gray-50 transition-colors'>
									<CardHeader>
										<CardTitle>Analytics</CardTitle>
										<CardDescription>View sales insights</CardDescription>
									</CardHeader>
									<CardContent>
										<p>Analyze sales data and trends.</p>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>
				</section>
			</main>
			<footer className='border-t py-6 md:py-0'>
				<div className='container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row'>
					<p className='text-center text-sm leading-loose text-muted-foreground md:text-left'>
						&copy; {new Date().getFullYear()} StoreFront. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
