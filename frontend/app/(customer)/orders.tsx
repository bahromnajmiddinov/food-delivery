import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserOrders } from '@/hooks/useApi';
import { formatPrice } from '@/lib/format';
import { MapPin, Clock } from 'lucide-react-native';

// Status configuration with Yandex-style colors and icons
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        color: '#FFB800',
        backgroundColor: '#FFF4D6',
        label: 'Order received',
        icon: Clock,
        progressIndex: 0
      };
    case 'preparing':
      return {
        color: '#FF6B35',
        backgroundColor: '#FFE5DC',
        label: 'Restaurant is preparing',
        icon: Clock,
        progressIndex: 1
      };
    case 'ready':
      return {
        color: '#007AFF',
        backgroundColor: '#E3F2FD',
        label: 'Ready for pickup',
        icon: Clock,
        progressIndex: 2
      };
    case 'picking_up':
      return {
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
        label: 'Courier is on the way',
        icon: Clock,
        progressIndex: 2
      };
    case 'delivering':
      return {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        label: 'On the way',
        icon: Clock,
        progressIndex: 3
      };
    case 'delivered':
      return {
        color: '#5CB338',
        backgroundColor: '#E8F5E8',
        label: 'Delivered',
        icon: Clock,
        progressIndex: 4
      };
    default:
      return {
        color: '#666',
        backgroundColor: '#F5F5F5',
        label: status,
        icon: Clock,
        progressIndex: 0
      };
  }
};

export default function CustomerOrdersScreen() {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useUserOrders();

  const ordersRaw = ordersData?.results || ordersData || [];
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

  if (ordersLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7ED321" />
        </View>
      </SafeAreaView>
    );
  }

  if (ordersError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Error loading orders</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load orders. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchOrders()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{orders.length} orders</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 20 }}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => router.push(`/order-detail?orderId=${order.id}`)}>
                {/* Restaurant Header */}
                <View style={styles.restaurantHeader}>
                  {order.restaurant?.logo ? (
                    <Image source={{ uri: order.restaurant.logo }} style={styles.restaurantLogo} />
                  ) : (
                    <View style={[styles.restaurantLogo, styles.logoPlaceholder]}>
                      <Text style={styles.logoPlaceholderText}>{(order.restaurant?.name || 'R').charAt(0)}</Text>
                    </View>
                  )}
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{order.restaurant?.name || 'Restaurant'}</Text>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  </View>
                  <View style={styles.deliveryTimeContainer}>
                    <Clock size={14} color="#999" />
                    <Text style={styles.deliveryTime}>{order.estimatedDeliveryTime}</Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummary}>
                  <Text style={styles.orderItemsText}>
                    {order.items.reduce((total, item) => total + item.quantity, 0)} items
                  </Text>
                  <Text style={styles.orderTotal}>${formatPrice(order.total)}</Text>
                </View>

                {/* Delivery Address */}
                <View style={styles.addressContainer}>
                  <MapPin size={14} color="#999" />
                  <Text style={styles.addressText}>{order.deliveryAddress?.address || 'Address not available'}</Text>
                </View>

                {/* Progress indicator for active orders */}
                {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'picking_up' || order.status === 'delivering') && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { 
                        width: `${((statusConfig.progressIndex + 1) / 5) * 100}%`,
                        backgroundColor: statusConfig.color 
                      }]} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemsText: {
    fontSize: 16,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7ED321',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});