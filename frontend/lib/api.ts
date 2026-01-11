import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, isAxiosError } from 'axios';

// API Configuration
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000/api/v1' 
  : 'http://localhost:8000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    } catch {
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle unauthorized errors
      if (status === 401) {
        // Token expired or invalid, clear auth data
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      // Handle other errors
      if (status === 403) {
        console.error('Permission denied:', data);
      } else if (status === 404) {
        console.error('Resource not found:', data);
      } else if (status >= 500) {
        console.error('Server error:', data);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
const AuthAPI = {
  sendOTP: (phone: string) => {
    return api.post('/accounts/auth/send-otp/', { phone });
  },
  
  verifyOTP: (phone: string, code: string, name: string, role: string) => {
    return api.post('/accounts/auth/verify-otp/', { phone, code, name, role });
  },
  
  getProfile: () => {
    return api.get('/accounts/profile/');
  },
  
  updateProfile: (profileData: any) => {
    return api.put('/accounts/profile/', profileData);
  },
  
  logout: () => {
    return AsyncStorage.removeItem('authToken');
  },
};

// Restaurant API
const RestaurantAPI = {
  getAllRestaurants: (params: any = {}) => {
    return api.get('/restaurants/restaurants/', { params });
  },
  
  getRestaurantById: (id: number) => {
    return api.get(`/restaurants/restaurants/${id}/`);
  },
  
  getMenuItems: (restaurantId: number) => {
    return api.get(`/restaurants/restaurants/${restaurantId}/menu/`);
  },
  
  getPopularRestaurants: () => {
    return api.get('/restaurants/restaurants/popular/');
  },
  
  searchRestaurants: (query: string) => {
    return api.get('/restaurants/restaurants/', { 
      params: { search: query } 
    });
  },
};

// Order API
const OrderAPI = {
  getOrders: () => {
    return api.get('/orders/orders/');
  },
  
  getOrderById: (id: number) => {
    return api.get(`/orders/orders/${id}/`);
  },
  
  createOrder: (orderData: any) => {
    return api.post('/orders/orders/', orderData);
  },
  
  updateOrderStatus: (orderId: number, status: string) => {
    return api.patch(`/orders/orders/${orderId}/status/`, { status });
  },
  
  getOrderItems: (orderId: number) => {
    return api.get(`/orders/orders/${orderId}/items/`);
  },
  
  addOrderItem: (orderId: number, itemData: any) => {
    return api.post(`/orders/orders/${orderId}/items/`, itemData);
  },
};

// Address API
const AddressAPI = {
  getAddresses: () => {
    return api.get('/accounts/addresses/');
  },
  
  getRecentAddresses: () => {
    return api.get('/accounts/addresses/recent/');
  },
  
  getSavedAddresses: () => {
    return api.get('/accounts/addresses/saved/');
  },
  
  addAddress: (addressData: any) => {
    return api.post('/accounts/addresses/', addressData);
  },
  
  updateAddress: (addressId: number, addressData: any) => {
    return api.put(`/accounts/addresses/${addressId}/`, addressData);
  },
  
  deleteAddress: (addressId: number) => {
    return api.delete(`/accounts/addresses/${addressId}/`);
  },
};

// Kitchen Staff API
const KitchenStaffAPI = {
  getKitchenStaff: () => {
    return api.get('/restaurants/kitchen-staff/');
  },
  
  getMyRestaurantOrders: () => {
    return api.get('/restaurants/my-restaurant-orders/');
  },
  
  updateOrderStatus: (orderId: number, status: string) => {
    return api.patch(`/orders/orders/${orderId}/status/`, { status });
  },
};

// Notification API
const NotificationAPI = {
  getNotifications: () => {
    return api.get('/orders/notifications/');
  },
  
  markAsRead: (notificationId: number) => {
    return api.patch(`/orders/notifications/${notificationId}/`, { read: true });
  },
};

// Review API
const ReviewAPI = {
  getReviews: () => {
    return api.get('/orders/reviews/');
  },
  
  addReview: (reviewData: any) => {
    return api.post('/orders/reviews/', reviewData);
  },
};

// Export all APIs
export {
  api as default,
  API_BASE_URL,
  AuthAPI,
  RestaurantAPI,
  OrderAPI,
  AddressAPI,
  KitchenStaffAPI,
  NotificationAPI,
  ReviewAPI,
};

// Helper function to handle API errors
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (isAxiosError(error)) {
    if (error.response) {
      return error.response.data?.error || error.response.data?.message || defaultMessage;
    } else if (error.request) {
      return 'Network error. Please check your connection.';
    }
  }
  return error.message || defaultMessage;
};

// Helper function to set auth token
export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('authToken', token);
};

// Helper function to get auth token
export const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

// Helper function to clear auth data
export const clearAuthData = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};