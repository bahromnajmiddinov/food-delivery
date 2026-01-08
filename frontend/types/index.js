export type UserRole = 'customer' | 'driver' | 'restaurant';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  tags: string[];
  logo: string;
  distance?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picking_up' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card';

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: DeliveryAddress;
  customerPhone: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  estimatedDeliveryTime: string;
  preparationTime?: number;
  notes?: string;
  createdAt: Date;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  plateNumber: string;
  color: string;
  avatar?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  images?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  read: boolean;
  createdAt: Date;
  orderId?: string;
}
