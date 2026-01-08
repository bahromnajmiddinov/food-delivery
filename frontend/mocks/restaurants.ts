import { Restaurant, MenuItem } from '@/types';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'KFC',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
    logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200',
    rating: 4.5,
    deliveryTime: '45-55 min',
    tags: ['Free delivery', '40% off select items'],
    distance: '1.3 km'
    ,
    coordinates: { latitude: 41.3035, longitude: 69.2800 }
  },
  {
    id: '2',
    name: 'Yapona Mama',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
    rating: 4.4,
    deliveryTime: '40-50 min',
    tags: ['30% off select items'],
    distance: '2.1 km',
    coordinates: { latitude: 41.3050, longitude: 69.2850 }
  },
  {
    id: '3',
    name: 'Burger Embassy',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    rating: 4.4,
    deliveryTime: '45-55 min',
    tags: ['-40% on a number of dishes', '30% off select items'],
    distance: '1.8 km',
    coordinates: { latitude: 41.3070, longitude: 69.2820 }
  },
  {
    id: '4',
    name: 'EVOS',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
    rating: 4.6,
    deliveryTime: '40-50 min',
    tags: ['Free delivery'],
    distance: '2.5 km',
    coordinates: { latitude: 41.3005, longitude: 69.2950 }
  },
  {
    id: '5',
    name: 'Gumma xonim',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    logo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200',
    rating: 4.3,
    deliveryTime: '95-105 min',
    tags: ['Free delivery'],
    distance: '3.2 km',
    coordinates: { latitude: 41.3150, longitude: 69.3000 }
  },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 'm1',
    restaurantId: '1',
    name: 'Fried Chicken Bucket',
    description: '8 pieces of crispy fried chicken',
    price: 34.00,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    category: 'Main Course'
  },
  {
    id: 'm2',
    restaurantId: '1',
    name: 'Chicken Burger',
    description: 'Crispy chicken burger with lettuce and mayo',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    category: 'Burgers'
  },
  {
    id: 'm6',
    restaurantId: '1',
    name: 'Hot Wings',
    description: 'Spicy chicken wings with dipping sauce',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
    category: 'Appetizers'
  },
  {
    id: 'm7',
    restaurantId: '1',
    name: 'Chicken Nuggets',
    description: 'Golden crispy chicken nuggets',
    price: 9.50,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
    category: 'Appetizers'
  },
  {
    id: 'm3',
    restaurantId: '2',
    name: 'Sushi Roll Set',
    description: 'Assorted sushi rolls with wasabi and ginger',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    category: 'Sushi'
  },
  {
    id: 'm8',
    restaurantId: '2',
    name: 'Ramen Bowl',
    description: 'Traditional Japanese ramen with pork and egg',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    category: 'Noodles'
  },
  {
    id: 'm4',
    restaurantId: '3',
    name: 'Double Beef Burger',
    description: 'Double patty beef burger with cheese and special sauce',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Burgers'
  },
  {
    id: 'm9',
    restaurantId: '3',
    name: 'Classic Fries',
    description: 'Crispy golden french fries',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    category: 'Sides'
  },
  {
    id: 'm5',
    restaurantId: '4',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    category: 'Pizza'
  },
  {
    id: 'm10',
    restaurantId: '4',
    name: 'Pepperoni Pizza',
    description: 'Pizza topped with pepperoni and cheese',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    category: 'Pizza'
  },
];
