import { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Delivered',
    message: 'Your order from KFC has been delivered successfully!',
    type: 'delivery',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    orderId: 'ord_123',
  },
  {
    id: '2',
    title: 'Special Offer',
    message: '40% off on all items from Burger Embassy. Limited time only!',
    type: 'promotion',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    title: 'Order Confirmed',
    message: 'Your order from Yapona Mama is being prepared',
    type: 'order',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    orderId: 'ord_122',
  },
  {
    id: '4',
    title: 'Driver Assigned',
    message: 'John is on the way to pick up your order',
    type: 'delivery',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    orderId: 'ord_121',
  },
  {
    id: '5',
    title: 'New Restaurant',
    message: 'EVOS just joined! Check out their delicious pizzas',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];
