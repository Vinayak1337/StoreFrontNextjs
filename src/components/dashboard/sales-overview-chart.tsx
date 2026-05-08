'use client';

import {
	Bar,
	CartesianGrid,
	Cell,
	ComposedChart,
	Line,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import {
	BarChart3,
	CalendarDays,
	ReceiptText,
	ShoppingBag,
	Trophy
} from 'lucide-react';

interface SalesOverviewPoint {
	date: string;
	revenue: number;
	orders: number;
	items: number;
}

interface SalesOverviewChartProps {
	data: SalesOverviewPoint[];
	periodLabel: string;
	totalRevenue: number;
	totalOrders: number;
	bestDay: SalesOverviewPoint | null;
}

interface TooltipProps {
	active?: boolean;
	payload?: Array<{
		color?: string;
		dataKey: string;
		value: number;
		payload: SalesOverviewPoint & { trendRevenue: number };
	}>;
	label?: string;
}

const currency = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0
});

const compactCurrency = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	notation: 'compact',
	maximumFractionDigits: 1
});

const shortDate = new Intl.DateTimeFormat('en-IN', {
	day: 'numeric',
	month: 'short'
});

function parseDateKey(dateKey: string) {
	const [year, month, day] = dateKey.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function formatDateLabel(dateKey: string) {
	return shortDate.format(parseDateKey(dateKey));
}

function SalesTooltip({ active, payload, label }: TooltipProps) {
	if (!active || !payload?.length) return null;

	const point = payload[0]?.payload;

	return (
		<div className='min-w-48 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur'>
			<p className='text-sm font-semibold text-gray-900'>
				{label ? formatDateLabel(label) : 'Sales'}
			</p>
			<div className='mt-2 space-y-1.5 text-sm'>
				<div className='flex items-center justify-between gap-6'>
					<span className='flex items-center gap-2 text-gray-500'>
						<span className='h-2 w-2 rounded-full bg-emerald-300' />
						Revenue
					</span>
					<span className='font-semibold text-gray-900'>
						{currency.format(point?.revenue ?? 0)}
					</span>
				</div>
				<div className='flex items-center justify-between gap-6'>
					<span className='flex items-center gap-2 text-gray-500'>
						<span className='h-2 w-2 rounded-full bg-emerald-700' />
						Trend
					</span>
					<span className='font-semibold text-gray-900'>
						{currency.format(point?.trendRevenue ?? 0)}
					</span>
				</div>
				<div className='flex items-center justify-between gap-6'>
					<span className='text-gray-500'>Orders</span>
					<span className='font-semibold text-gray-900'>
						{point?.orders ?? 0}
					</span>
				</div>
				<div className='flex items-center justify-between gap-6'>
					<span className='text-gray-500'>Items</span>
					<span className='font-semibold text-gray-900'>
						{point?.items ?? 0}
					</span>
				</div>
			</div>
		</div>
	);
}

export function SalesOverviewChart({
	data,
	periodLabel,
	totalRevenue,
	totalOrders,
	bestDay
}: SalesOverviewChartProps) {
	const hasRevenue = data.some(point => point.revenue > 0);
	const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
	const averageDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;
	const activeSalesDays = data.filter(point => point.revenue > 0).length;
	const bestDayLabel =
		bestDay && bestDay.revenue > 0 ? formatDateLabel(bestDay.date) : 'No sales';
	const bestDayRevenue =
		bestDay && bestDay.revenue > 0 ? currency.format(bestDay.revenue) : 'yet';
	const chartData = data.map((point, index) => {
		const trailingPoints = data.slice(Math.max(0, index - 2), index + 1);
		const trendRevenue =
			trailingPoints.reduce((sum, item) => sum + item.revenue, 0) /
			trailingPoints.length;

		return {
			...point,
			trendRevenue
		};
	});

	return (
		<div className='max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm shadow-slate-200/70'>
			<div className='grid min-w-0 lg:grid-cols-[240px_minmax(0,1fr)]'>
				<aside className='relative overflow-hidden bg-[linear-gradient(150deg,#064e3b_0%,#0f766e_58%,#115e59_100%)] p-5 text-white'>
					<div className='absolute inset-x-0 top-0 h-px bg-white/30' />
					<div className='flex items-center gap-2'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 text-emerald-100 ring-1 ring-white/15'>
							<BarChart3 className='h-4 w-4' />
						</div>
						<div>
							<h3 className='text-base font-semibold'>Sales Overview</h3>
						</div>
					</div>

					<div className='mt-6'>
						<p className='text-xs font-medium uppercase tracking-[0.16em] text-emerald-100/70'>
							Total Revenue
						</p>
						<p className='mt-2 text-3xl font-bold leading-none tracking-tight'>
							{currency.format(totalRevenue)}
						</p>
						<div className='mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-emerald-50 ring-1 ring-white/15'>
							<CalendarDays className='h-3.5 w-3.5 shrink-0' />
							<span className='truncate'>{periodLabel}</span>
						</div>
					</div>

					<div className='mt-6 grid grid-cols-2 gap-2 text-sm lg:grid-cols-1'>
						<div className='rounded-lg bg-white/10 p-3 ring-1 ring-white/10'>
							<p className='flex items-center gap-2 text-xs text-emerald-100/75'>
								<ShoppingBag className='h-3.5 w-3.5' />
								Orders
							</p>
							<p className='mt-1 text-xl font-semibold'>{totalOrders}</p>
						</div>
						<div className='rounded-lg bg-white/10 p-3 ring-1 ring-white/10'>
							<p className='flex items-center gap-2 text-xs text-emerald-100/75'>
								<ReceiptText className='h-3.5 w-3.5' />
								Avg order
							</p>
							<p className='mt-1 text-xl font-semibold'>
								{currency.format(averageOrderValue)}
							</p>
						</div>
					</div>

					<div className='mt-3 rounded-lg border border-amber-200/20 bg-amber-300/12 p-3'>
						<p className='flex items-center gap-2 text-xs text-amber-50/80'>
							<Trophy className='h-3.5 w-3.5 text-amber-200' />
							Peak day
						</p>
						<div className='mt-1 flex items-end justify-between gap-3 lg:block'>
							<p className='text-lg font-semibold text-white'>{bestDayLabel}</p>
							<p className='text-sm font-medium text-amber-100'>
								{bestDayRevenue}
							</p>
						</div>
					</div>
				</aside>

				<section className='min-w-0 p-4 sm:p-5'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
						<div>
							<p className='text-sm font-semibold text-gray-900'>
								Daily Revenue Momentum
							</p>
						</div>
						<div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600'>
							{activeSalesDays} active sales days
						</div>
					</div>

					<div className='mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500'>
						<span className='inline-flex items-center gap-1.5'>
							<span className='h-2.5 w-2.5 rounded-full bg-emerald-300' />
							Revenue
						</span>
						<span className='inline-flex items-center gap-1.5'>
							<span className='h-0.5 w-4 rounded-full bg-emerald-800' />
							Trend
						</span>
						<span className='inline-flex items-center gap-1.5'>
							<span className='h-2.5 w-2.5 rounded-full bg-amber-400' />
							Peak
						</span>
						{averageDailyRevenue > 0 && (
							<span className='inline-flex items-center gap-1.5'>
								<span className='h-px w-4 border-t border-dashed border-slate-400' />
								Avg {compactCurrency.format(averageDailyRevenue)}
							</span>
						)}
					</div>

					<div className='relative mt-4 h-72 overflow-hidden rounded-xl border border-gray-100 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_72%)] p-2 shadow-inner shadow-slate-200/60 sm:h-[21rem] sm:p-4'>
						{bestDay && bestDay.revenue > 0 && (
							<div className='absolute right-3 top-3 z-10 hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-sm sm:block'>
								<span className='font-semibold'>Peak</span> {bestDayLabel}
							</div>
						)}

						{hasRevenue ? (
							<ResponsiveContainer width='100%' height='100%'>
								<ComposedChart
									data={chartData}
									barCategoryGap='42%'
									margin={{ top: 20, right: 8, bottom: 4, left: 0 }}>
									<CartesianGrid
										stroke='#e2e8f0'
										strokeDasharray='4 7'
										vertical={false}
									/>
									<XAxis
										dataKey='date'
										tickFormatter={formatDateLabel}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
										minTickGap={20}
										fontSize={12}
										tick={{ fill: '#64748b' }}
									/>
									<YAxis
										yAxisId='revenue'
										tickFormatter={value =>
											compactCurrency.format(Number(value))
										}
										axisLine={false}
										tickLine={false}
										tickMargin={8}
										width={56}
										fontSize={12}
										tick={{ fill: '#64748b' }}
									/>
									<Tooltip
										content={<SalesTooltip />}
										cursor={{ fill: '#ecfdf5', opacity: 0.55 }}
									/>
									{averageDailyRevenue > 0 && (
										<ReferenceLine
											yAxisId='revenue'
											y={averageDailyRevenue}
											stroke='#94a3b8'
											strokeDasharray='4 5'
											strokeWidth={1}
										/>
									)}
									<Bar
										yAxisId='revenue'
										dataKey='revenue'
										radius={[7, 7, 2, 2]}
										maxBarSize={15}>
										{chartData.map(point => (
											<Cell
												key={point.date}
												fill={
													point.date === bestDay?.date ? '#f59e0b' : '#86efac'
												}
											/>
										))}
									</Bar>
									<Line
										yAxisId='revenue'
										type='monotone'
										dataKey='trendRevenue'
										stroke='#065f46'
										strokeWidth={3}
										dot={false}
										activeDot={{
											r: 5,
											fill: '#065f46',
											stroke: '#ffffff',
											strokeWidth: 2
										}}
									/>
								</ComposedChart>
							</ResponsiveContainer>
						) : (
							<div className='flex h-full items-center justify-center text-center text-gray-500'>
								<div>
									<BarChart3 className='h-10 w-10 mx-auto mb-2 opacity-50' />
									<p className='font-medium text-gray-700'>No sales data yet</p>
									<p className='text-sm'>
										Orders will appear here as they come in.
									</p>
								</div>
							</div>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
