import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MapPin, Clock, User, Phone, MoreHorizontal, DollarSign } from 'lucide-react-native';
import { mockOrders } from '@/mocks/orders';
import { router } from 'expo-router';

export default function DriverOrdersScreen() {
  const [tab, setTab] = useState<'active' | 'available'>('active');
  const [selected, setSelected] = useState<string | null>(null);

  const activeOrders = mockOrders.filter(order => ['picking_up', 'delivering'].includes(order.status));
  const availableOrders = mockOrders.filter(order => order.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picking_up': return '#FF9500';
      case 'delivering': return '#007AFF';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'picking_up': return 'Picking Up';
      case 'delivering': return 'Delivering';
      default: return status;
    }
  };

  const list = tab === 'active' ? activeOrders : availableOrders;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.headerSubtitle}>{activeOrders.length} active orders</Text>
          </View>
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setTab('active')} style={[styles.tab, tab === 'active' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('available')} style={[styles.tab, tab === 'available' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>Available orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {list.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No Orders</Text>
            <Text style={styles.emptyText}>Orders will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => setSelected(item.id)}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarAndInfo}>
                    <Image source={{ uri: item.restaurant.logo }} style={styles.avatar} />
                    <View>
                      <Text style={styles.cardTitle}>{item.restaurant.name}</Text>
                      <Text style={styles.cardSubtitle}>№ {item.orderNumber}  •  {item.estimatedDeliveryTime}  •  {item.deliveryAddress && `${Math.round(Math.random()*3+1)} km`}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreBtn}>
                    <MoreHorizontal size={18} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.addressLine}>{item.deliveryAddress.address}</Text>
                  <View style={styles.rowBetweenSmall}>
                    <View style={styles.statsRow}>
                      <DollarSign size={16} color="#1A1A1A" />
                      <Text style={styles.statText}> ${item.total.toFixed(2)}</Text>
                      <Text style={styles.statText}>  •  ${item.deliveryFee.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.navigateSmall} onPress={() => router.push(`/(driver)/map?orderId=${item.id}`)}>
                      <MapPin size={16} color="#FFF" />
                      <Text style={styles.navigateSmallText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (() => {
              const o = mockOrders.find(x => x.id === selected)!
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Image source={{ uri: o.restaurant.logo }} style={styles.modalAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.modalTitle}>{o.restaurant.name}</Text>
                      <Text style={styles.modalSubtitle}>№ {o.orderNumber}  •  {o.estimatedDeliveryTime}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <MoreHorizontal size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.sectionLabel}>Customer</Text>
                    <Text style={styles.modalText}>{o.customerName} • {o.customerPhone}</Text>

                    <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Address</Text>
                    <Text style={styles.modalText}>{o.deliveryAddress.address}</Text>

                    <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Items</Text>
                    {o.items.map((it, i) => (
                      <View key={i} style={styles.itemRowModal}>
                        <Text style={styles.itemQty}>{it.quantity}x</Text>
                        <Text style={styles.itemNameModal}>{it.name}</Text>
                        <Text style={styles.itemPrice}>${(it.price * it.quantity).toFixed(2)}</Text>
                      </View>
                    ))}

                    {o.notes && (
                      <>
                        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Notes</Text>
                        <Text style={styles.modalText}>{o.notes}</Text>
                      </>
                    )}

                    <View style={styles.modalFooterRow}>
                      <View>
                        <Text style={styles.modalTotalLabel}>Order</Text>
                        <Text style={styles.modalTotal}>${o.total.toFixed(2)}</Text>
                      </View>
                      <TouchableOpacity style={styles.primaryBtn} onPress={() => { setSelected(null); router.push(`/(driver)/map?orderId=${o.id}`); }}>
                        <Text style={styles.primaryBtnText}>Navigate</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              )
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  badge: {
    backgroundColor: '#7ED321',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  tabActive: {
    backgroundColor: '#1A1A1A',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarAndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  moreBtn: {
    padding: 6,
    borderRadius: 8,
  },
  cardBody: {
    marginTop: 6,
  },
  addressLine: {
    color: '#666',
    marginBottom: 8,
  },
  rowBetweenSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#333',
    fontWeight: '600',
  },
  navigateSmall: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigateSmallText: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginTop: 12,
  },
  modalText: {
    color: '#333',
    marginTop: 6,
  },
  itemRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemQty: { fontWeight: '700', width: 36 },
  itemNameModal: { flex: 1 },
  itemPrice: { fontWeight: '700' },
  modalFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  modalTotalLabel: { color: '#666' },
  modalTotal: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  primaryBtn: { backgroundColor: '#7ED321', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '700' },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
  ordersContainer: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7ED321',
  },
  restaurantSection: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  customerSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED321',
  },
  addressSection: {},
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
