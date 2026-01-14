import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKitchenStaffOrders } from '@/hooks/useApi';
import { formatPrice } from '@/lib/format';
import { Clock, ChefHat } from 'lucide-react-native';
import { router } from 'expo-router';

export default function RestaurantOrdersScreen() {
  const { data: ordersData, isLoading, error, refetch } = useKitchenStaffOrders();
  const ordersRaw = ordersData?.results || ordersData || [];
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ChefHat size={28} color="#7ED321" />
        <Text style={styles.title}>Kitchen Orders</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}

        {orders.map((o: any) => (
          <TouchableOpacity key={o.id} style={styles.orderCard} onPress={() => router.push(`/(kitchen)/kitchen?orderId=${o.id}`)}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>#{o.orderNumber}</Text>
                <Text style={styles.metaText}>{o.restaurant?.name || 'Restaurant'}</Text>
              </View>
              <View style={styles.timerContainer}>
                <Clock size={16} color="#FF3B30" />
                <Text style={styles.timerText}>{o.preparation_time || '—'} min</Text>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              <Text style={styles.itemsTitle}>{o.items?.length || 0} items • ${formatPrice(o.total)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#999', fontSize: 16 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F3F3F3' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700' },
  metaText: { color: '#666' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { marginLeft: 6, fontWeight: '700', color: '#FF3B30' },
  itemsContainer: { marginTop: 8 },
  itemsTitle: { color: '#666' },
});
