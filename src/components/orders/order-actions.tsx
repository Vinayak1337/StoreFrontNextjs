'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import api from '@/lib/services/api';
import {
  Eye,
  ChevronUp,
  Trash,
  Printer,
  Loader2
} from 'lucide-react';
import { printDirectlyToThermalPrinter } from '@/lib/utils/direct-thermal-print';

interface OrderActionsProps {
  order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector(
    (state: RootState) => state.settings || { settings: null }
  );
  const [isPrintingThermal, setIsPrintingThermal] = useState(false);
  const [expandedOrders] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleThermalPrint = async (orderId: string) => {
    try {
      setIsPrintingThermal(true);

      const total = order.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let billToUse = order.bill;

      if (!billToUse) {
        const billResult = await api.createBill({
          orderId,
          totalAmount: total,
          taxes: 0,
          paymentMethod: 'Cash'
        });

        if (billResult) {
          billToUse = billResult;
          router.refresh();
        } else {
          alert('Failed to create bill for printing');
          return;
        }
      } else {
        if (!billToUse.order) {
          billToUse = await api.getBillById(billToUse.id);
        }
      }

      const settingsToUse = settings || {
        storeName: 'Store',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        currency: '₹',
        footer: 'Thank you for your business!',
        taxRate: 0,
        notifications: {
          outOfStock: false,
          newOrders: false,
          orderStatus: false,
          dailyReports: false
        },
        printer: {
          name: '',
          deviceId: '',
          type: 'bluetooth' as const,
          autoConnect: false,
          connected: false,
          paperWidth: 58
        }
      };

      if (billToUse) {
        await printDirectlyToThermalPrinter(billToUse, settingsToUse);
      } else {
        alert('Failed to create or find bill for printing.');
      }
    } catch (error) {
      console.error('Error with thermal print:', error);
      alert('Failed to print order. Please try again.');
    } finally {
      setIsPrintingThermal(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this order? This action cannot be undone.'
      )
    ) {
      try {
        await api.deleteOrder(orderId);
        router.refresh();
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className='flex flex-col gap-2 mt-4 pt-4 border-t'>
      <Button
        variant='ghost'
        size='sm'
        className='text-red-500 hover:text-red-700 hover:bg-red-50 self-start'
        onClick={() => handleDeleteOrder(order.id)}>
        <Trash className='h-4 w-4 mr-1' />
        Delete
      </Button>

      <div className='flex flex-col sm:flex-row gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleViewDetails(order.id)}
          className='flex-1'>
          {expandedOrders.includes(order.id) ? (
            <ChevronUp className='h-4 w-4 mr-1' />
          ) : (
            <Eye className='h-4 w-4 mr-1' />
          )}
          <span className='hidden sm:inline'>
            {expandedOrders.includes(order.id)
              ? 'Hide Details'
              : 'View Details'}
          </span>
          <span className='sm:hidden'>
            {expandedOrders.includes(order.id)
              ? 'Hide'
              : 'View'}
          </span>
        </Button>

        <Button
          size='sm'
          onClick={() => handleThermalPrint(order.id)}
          disabled={isPrintingThermal}
          className='flex-1 sm:flex-none gap-1 bg-emerald-600 hover:bg-emerald-700 text-white'>
          {isPrintingThermal ? (
            <>
              <Loader2 className='h-3 w-3 animate-spin' />
              <span className='hidden sm:inline'>
                Printing...
              </span>
            </>
          ) : (
            <>
              <Printer className='h-3 w-3' />
              <span className='hidden sm:inline'>
                Thermal Print
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}