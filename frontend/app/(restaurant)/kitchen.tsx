import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChefHat, Clock, CheckCircle } from 'lucide-react-native';
import { mockOrders } from '@/mocks/orders';
import { Order } from '@/types';

export default function KitchenScreen() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
  );
  const [selected, setSelected] = useState<string | null>(null);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#FF9500', text: 'New Order', action: 'Start Preparing' };
      case 'preparing':
        return { color: '#007AFF', text: 'Preparing', action: 'Mark Ready' };
      case 'ready':
        return { color: '#7ED321', text: 'Ready for Pickup', action: 'Complete' };
      default:
        return { color: '#666', text: status, action: 'Update' };
    }
  };

  const getNextStatus = (currentStatus: string): Order['status'] => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'picking_up';
      default: return 'pending';
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const renderOrderCard = (order: Order) => {
    const statusInfo = getStatusInfo(order.status);
    const prepTime = order.preparationTime || 25;

    return (
      <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => setSelected(order.id)}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Clock size={16} color="#FF3B30" />
            <Text style={styles.timerText}>{prepTime} min</Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Items:</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
        </View>

        {order.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        <View style={{ marginTop: 12 }}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: statusInfo.color }]}
            onPress={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{statusInfo.action}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <ChefHat size={28} color="#7ED321" />
          <Text style={styles.headerTitle}>Kitchen</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{orders.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.sectionTitle}>New Orders ({pendingOrders.length})</Text>
            </View>
            {pendingOrders.map(renderOrderCard)}
          </View>
        )}

        {preparingOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.sectionTitle}>Preparing ({preparingOrders.length})</Text>
            </View>
            {preparingOrders.map(renderOrderCard)}
          </View>
        )}

        {readyOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: '#7ED321' }]} />
              <Text style={styles.sectionTitle}>Ready ({readyOrders.length})</Text>
            </View>
            {readyOrders.map(renderOrderCard)}
          </View>
        )}

        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <ChefHat size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No Active Orders</Text>
            <Text style={styles.emptyText}>New orders will appear here</Text>
          </View>
        )}
      </ScrollView>
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (() => {
              const o = orders.find(x => x.id === selected) || mockOrders.find(x => x.id === selected)!;
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Image source={{ uri: o.restaurant.logo }} style={styles.modalAvatar} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.modalTitle}>{o.restaurant.name}</Text>
                      <Text style={styles.modalSubtitle}>№ {o.orderNumber} • {o.estimatedDeliveryTime}</Text>
                    </View>
                  </View>

                  <ScrollView style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.sectionLabel}>Items</Text>
                    {o.items.map((it, i) => (
                      <View key={i} style={styles.itemRowModal}>
                        <Text style={styles.itemQty}>{it.quantity}x</Text>
                        <Text style={styles.itemNameModal}>{it.name}</Text>
                        <Text style={styles.itemPrice}>${(it.price * it.quantity).toFixed(2)}</Text>
                      </View>
                    ))}

                    {o.notes && (
                      <>
                        <Text style={styles.sectionLabel}>Notes</Text>
                        <Text style={styles.modalText}>{o.notes}</Text>
                      </>
                    )}

                    <View style={styles.modalFooterRow}>
                      <View>
                        <Text style={styles.modalTotalLabel}>Total</Text>
                        <Text style={styles.modalTotal}>${o.total.toFixed(2)}</Text>
                      </View>
                      <TouchableOpacity style={styles.primaryBtn} onPress={() => { setSelected(null); }}>
                        <Text style={styles.primaryBtnText}>Close</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
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
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  itemsContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7ED321',
    width: 40,
  },
  itemName: {
    fontSize: 15,
    color: '#1A1A1A',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingTop: 12,
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
});
