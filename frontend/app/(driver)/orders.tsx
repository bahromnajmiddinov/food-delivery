import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MapPin, Clock, Phone, Navigation, CheckCircle, X, MessageCircle } from 'lucide-react-native';
import { mockOrders } from '@/mocks/orders';
import { router } from 'expo-router';

export default function DriverOrdersScreen() {
  const [tab, setTab] = useState<'active' | 'available'>('active');
  const [selected, setSelected] = useState<string | null>(null);

  const activeOrders = mockOrders.filter(order => ['picking_up', 'delivering'].includes(order.status));
  const availableOrders = mockOrders.filter(order => order.status === 'pending');

  const handleAcceptOrder = useCallback((orderId: string) => {
    Alert.alert('Order Accepted', 'You have accepted this order. Navigate to the restaurant to pick it up.');
    setSelected(null);
  }, []);

  const handleRejectOrder = useCallback((orderId: string) => {
    Alert.alert('Order Rejected', 'This order has been rejected.');
    setSelected(null);
  }, []);

  const handleUpdateStatus = useCallback((orderId: string, newStatus: string) => {
    Alert.alert('Status Updated', `Order status updated to: ${newStatus}`);
    setSelected(null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picking_up': return '#FF9500';
      case 'delivering': return '#007AFF';
      case 'pending': return '#FFB800';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'picking_up': return 'Picking Up';
      case 'delivering': return 'Delivering';
      case 'pending': return 'Available';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'picking_up': return Clock;
      case 'delivering': return Navigation;
      case 'pending': return Package;
      default: return Package;
    }
  };

  const list = tab === 'active' ? activeOrders : availableOrders;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>My Orders</Text>
              <Text style={styles.headerSubtitle}>
                {activeOrders.length} active • {availableOrders.length} available
              </Text>
            </View>
            <View style={styles.onlineStatus}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, tab === 'active' && styles.tabActive]}
              onPress={() => setTab('active')}
            >
              <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
                Active ({activeOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, tab === 'available' && styles.tabActive]}
              onPress={() => setTab('available')}
            >
              <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>
                Available ({availableOrders.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Orders List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No {tab === 'active' ? 'Active' : 'Available'} Orders</Text>
            <Text style={styles.emptyText}>
              {tab === 'active' ? 'Orders you accept will appear here' : 'New orders will appear here when available'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {list.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Image source={{ uri: order.restaurant.logo }} style={styles.restaurantLogo} />
                      <View style={styles.orderDetails}>
                        <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                        <Text style={styles.orderMeta}>
                          #{order.orderNumber} • {order.estimatedDeliveryTime} • {Math.round(Math.random() * 3 + 1)} km
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                      <StatusIcon size={16} color={getStatusColor(order.status)} />
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(order.status) }]}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Order Content */}
                  <View style={styles.orderContent}>
                    <View style={styles.addressRow}>
                      <MapPin size={16} color="#999" />
                      <Text style={styles.addressText}>{order.deliveryAddress.address}</Text>
                    </View>
                    
                    <View style={styles.orderFooter}>
                      <View style={styles.orderStats}>
                        <Text style={styles.orderAmount}>${order.total.toFixed(2)}</Text>
                        <Text style={styles.deliveryFee}>+${order.deliveryFee.toFixed(2)} delivery</Text>
                      </View>
                      
                      <View style={styles.actionButtons}>
                        {tab === 'available' ? (
                          <>
                            <TouchableOpacity 
                              style={styles.rejectButton}
                              onPress={() => handleRejectOrder(order.id)}
                            >
                              <X size={16} color="#FF4444" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.acceptButton}
                              onPress={() => handleAcceptOrder(order.id)}
                            >
                              <CheckCircle size={16} color="#fff" />
                              <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity 
                              style={styles.messageButton}
                              onPress={() => {}}
                            >
                              <MessageCircle size={16} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.navigateButton}
                              onPress={() => router.push(`/(driver)/map?orderId=${order.id}`)}
                            >
                              <Navigation size={16} color="#fff" />
                              <Text style={styles.navigateButtonText}>Navigate</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Quick Actions for Active Orders */}
                  {tab === 'active' && (
                    <View style={styles.quickActions}>
                      {order.status === 'picking_up' && (
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => handleUpdateStatus(order.id, 'ready')}
                        >
                          <Text style={styles.quickActionText}>Mark as Picked Up</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'delivering' && (
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => handleUpdateStatus(order.id, 'delivered')}
                        >
                          <Text style={styles.quickActionText}>Mark as Delivered</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (() => {
              const o = mockOrders.find(x => x.id === selected)!;
              const StatusIcon = getStatusIcon(o.status);
              
              return (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <View style={styles.modalHandle} />
                    </TouchableOpacity>
                    
                    <View style={styles.modalTitleSection}>
                      <View style={styles.modalHeaderInfo}>
                        <Image source={{ uri: o.restaurant.logo }} style={styles.modalRestaurantLogo} />
                        <View style={styles.modalRestaurantInfo}>
                          <Text style={styles.modalRestaurantName}>{o.restaurant.name}</Text>
                          <Text style={styles.modalOrderInfo}>#{o.orderNumber} • {o.estimatedDeliveryTime}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(o.status) + '20' }]}>
                          <StatusIcon size={18} color={getStatusColor(o.status)} />
                          <Text style={[styles.statusBadgeText, { color: getStatusColor(o.status) }]}>
                            {getStatusText(o.status)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Customer Information */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Customer Information</Text>
                    <View style={styles.customerInfo}>
                      <View style={styles.customerAvatar}>
                        <Text style={styles.customerAvatarText}>
                          {o.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.customerDetails}>
                        <Text style={styles.customerName}>{o.customerName}</Text>
                        <Text style={styles.customerPhone}>{o.customerPhone}</Text>
                      </View>
                      <TouchableOpacity style={styles.callButton}>
                        <Phone size={20} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Delivery Address */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Delivery Address</Text>
                    <View style={styles.addressInfo}>
                      <MapPin size={20} color="#999" />
                      <Text style={styles.addressText}>{o.deliveryAddress.address}</Text>
                    </View>
                  </View>

                  {/* Order Items */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Order Items ({o.items.reduce((total, item) => total + item.quantity, 0)} items)</Text>
                    <View style={styles.itemsContainer}>
                      {o.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                            <View style={styles.itemDetails}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                          </View>
                          <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Special Instructions */}
                  {o.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Special Instructions</Text>
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>{o.notes}</Text>
                      </View>
                    </View>
                  )}

                  {/* Payment Summary */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Payment</Text>
                    <View style={styles.paymentSummary}>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Subtotal</Text>
                        <Text style={styles.paymentValue}>${(o.total - o.deliveryFee).toFixed(2)}</Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Delivery Fee</Text>
                        <Text style={styles.paymentValue}>${o.deliveryFee.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.paymentRow, styles.paymentTotalRow]}>
                        <Text style={styles.paymentTotalLabel}>Total</Text>
                        <Text style={styles.paymentTotalValue}>${o.total.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Modal Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.secondaryAction}
                      onPress={() => setSelected(null)}
                    >
                      <Text style={styles.secondaryActionText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.primaryAction, { backgroundColor: getStatusColor(o.status) }]}
                      onPress={() => {
                        setSelected(null);
                        router.push(`/(driver)/map?orderId=${o.id}`);
                      }}
                    >
                      <Navigation size={20} color="#fff" />
                      <Text style={styles.primaryActionText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
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
    backgroundColor: '#F8F9FA',
  },
  
  // Safe Area
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5CB338',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5CB338',
  },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1A1A1A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Orders List
  ordersList: {
    padding: 20,
  },
  
  // Order Card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    overflow: 'hidden',
  },
  
  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  restaurantLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  orderDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  orderMeta: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Order Content
  orderContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Order Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStats: {
    flex: 1,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  deliveryFee: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5CB338',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitleSection: {
    width: '100%',
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalRestaurantLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  modalRestaurantInfo: {
    flex: 1,
  },
  modalRestaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalOrderInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // Modal Sections
  modalSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  // Customer Info
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Address Info
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  
  // Items Container
  itemsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  // Notes Container
  notesContainer: {
    backgroundColor: '#FFF4E6',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  notesText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  
  // Payment Summary
  paymentSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#666',
  },
  paymentValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  paymentTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  paymentTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  primaryAction: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Legacy styles for compatibility
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerSubtitleLegacy: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  modalHeaderLegacy: {
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
  modalFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  modalTotalLabel: { color: '#666' },
  modalTotal: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  primaryBtn: { backgroundColor: '#7ED321', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '700' },
})
