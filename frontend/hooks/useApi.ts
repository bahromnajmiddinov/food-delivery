import { useState, useEffect } from 'react';
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api, handleApiError } from '@/lib/api';
import { Alert } from 'react-native';

// Custom hook for API requests
export const useApiRequest = <T>(
  requestFn: () => Promise<T>,
  key: string[],
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    showErrorAlert?: boolean;
    errorMessage?: string;
  } = {}
): UseQueryResult<T, Error> => {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: requestFn,
    enabled: options.enabled !== undefined ? options.enabled : true,
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, options.errorMessage || 'Request failed');
      if (options.showErrorAlert !== false) {
        Alert.alert('Error', errorMessage);
      }
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

// Custom hook for API mutations
export const useApiMutation = <T, U>(
  mutationFn: (variables: U) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): UseMutationResult<T, Error, U> => {
  return useMutation<T, Error, U>({
    mutationFn,
    onSuccess: (data) => {
      if (options.successMessage) {
        Alert.alert('Success', options.successMessage);
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error, options.errorMessage || 'Request failed');
      Alert.alert('Error', errorMessage);
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

// Custom hook for restaurant data
export const useRestaurants = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/restaurants/restaurants/').then(res => res.data),
    ['restaurants'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for popular restaurants
export const usePopularRestaurants = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/restaurants/restaurants/popular/').then(res => res.data),
    ['popular-restaurants'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for restaurant details
export const useRestaurantDetail = (restaurantId: number | null, enabled: boolean = true) => {
  return useApiRequest(
    () => api.get(`/restaurants/restaurants/${restaurantId}/`).then(res => res.data),
    ['restaurant-detail', restaurantId],
    { enabled: enabled && !!restaurantId, showErrorAlert: true }
  );
};

// Custom hook for menu items
export const useMenuItems = (restaurantId: number | null, enabled: boolean = true) => {
  return useApiRequest(
    () => api.get(`/restaurants/restaurants/${restaurantId}/menu/`).then(res => res.data),
    ['menu-items', restaurantId],
    { enabled: enabled && !!restaurantId, showErrorAlert: true }
  );
};

// Custom hook for user orders
export const useUserOrders = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/orders/orders/').then(res => res.data),
    ['user-orders'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for addresses
export const useAddresses = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/accounts/addresses/').then(res => res.data),
    ['addresses'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for recent addresses
export const useRecentAddresses = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/accounts/addresses/recent/').then(res => res.data),
    ['recent-addresses'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for saved addresses
export const useSavedAddresses = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/accounts/addresses/saved/').then(res => res.data),
    ['saved-addresses'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for notifications
export const useNotifications = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/orders/notifications/').then(res => res.data),
    ['notifications'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for kitchen staff orders
export const useKitchenStaffOrders = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/restaurants/my-restaurant-orders/').then(res => res.data),
    ['kitchen-staff-orders'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for creating orders
export const useCreateOrder = () => {
  return useApiMutation(
    (orderData: any) => api.post('/orders/orders/', orderData).then(res => res.data),
    {
      successMessage: 'Order created successfully!',
      errorMessage: 'Failed to create order'
    }
  );
};

// Custom hook for updating order status
export const useUpdateOrderStatus = () => {
  return useApiMutation(
    ({ orderId, status }: { orderId: number; status: string }) => 
      api.patch(`/orders/orders/${orderId}/status/`, { status }).then(res => res.data),
    {
      successMessage: 'Order status updated!',
      errorMessage: 'Failed to update order status'
    }
  );
};

// Custom hook for OTP authentication
export const useOTPAuth = () => {
  const sendOTP = useApiMutation(
    (phone: string) => api.post('/accounts/auth/send-otp/', { phone }).then(res => res.data),
    {
      successMessage: 'OTP sent successfully!',
      errorMessage: 'Failed to send OTP'
    }
  );

  const verifyOTP = useApiMutation(
    (data: { phone: string; code: string; name: string; role: string }) => 
      api.post('/accounts/auth/verify-otp/', data).then(res => res.data),
    {
      successMessage: 'Login successful!',
      errorMessage: 'Failed to verify OTP'
    }
  );

  return { sendOTP, verifyOTP };
};

// Custom hook for user profile
export const useUserProfile = (enabled: boolean = true) => {
  return useApiRequest(
    () => api.get('/accounts/profile/').then(res => res.data),
    ['user-profile'],
    { enabled, showErrorAlert: true }
  );
};

// Custom hook for updating user profile
export const useUpdateProfile = () => {
  return useApiMutation(
    (profileData: any) => api.put('/accounts/profile/', profileData).then(res => res.data),
    {
      successMessage: 'Profile updated successfully!',
      errorMessage: 'Failed to update profile'
    }
  );
};

// Custom hook for adding addresses
export const useAddAddress = () => {
  return useApiMutation(
    (addressData: any) => api.post('/accounts/addresses/', addressData).then(res => res.data),
    {
      successMessage: 'Address added successfully!',
      errorMessage: 'Failed to add address'
    }
  );
};

// Custom hook for updating addresses
export const useUpdateAddress = () => {
  return useApiMutation(
    ({ addressId, addressData }: { addressId: number; addressData: any }) => 
      api.put(`/accounts/addresses/${addressId}/`, addressData).then(res => res.data),
    {
      successMessage: 'Address updated successfully!',
      errorMessage: 'Failed to update address'
    }
  );
};

// Custom hook for deleting addresses
export const useDeleteAddress = () => {
  return useApiMutation(
    (addressId: number) => api.delete(`/accounts/addresses/${addressId}/`).then(res => res.data),
    {
      successMessage: 'Address deleted successfully!',
      errorMessage: 'Failed to delete address'
    }
  );
};