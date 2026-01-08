import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockOrders } from '@/mocks/orders';
import { MapPin, Clock, CheckCircle, Truck, Package, ChefHat } from 'lucide-react-native';
import { router } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useDriver } from '@/contexts/DriverContext';
import { fetchDirections } from '@/lib/googleDirections';
import { GOOGLE_MAPS_API_KEY } from '@/lib/config';

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
        icon: ChefHat,
        progressIndex: 1
      };
    case 'ready':
      return {
        color: '#007AFF',
        backgroundColor: '#E3F2FD',
        label: 'Ready for pickup',
        icon: Package,
        progressIndex: 2
      };
    case 'picking_up':
      return {
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
        label: 'Courier is on the way',
        icon: Truck,
        progressIndex: 2
      };
    case 'delivering':
      return {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        label: 'On the way',
        icon: Truck,
        progressIndex: 3
      };
    case 'delivered':
      return {
        color: '#5CB338',
        backgroundColor: '#E8F5E8',
        label: 'Delivered',
        icon: CheckCircle,
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
  const [selected, setSelected] = useState<string | null>(null);
  const driver = useDriver();
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[] | null>(null);
  const [etaText, setEtaText] = useState<string | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  // wire effects
  useDirectionsEffects(driver, selected, setRouteCoords, setEtaText, setDirectionsLoading);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{mockOrders.length} orders</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 20 }}>
        {mockOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => setSelected(order.id)}>
              {/* Restaurant Header */}
              <View style={styles.restaurantHeader}>
                <Image source={{ uri: order.restaurant.logo }} style={styles.restaurantLogo} />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                </View>
                <View style={styles.deliveryTimeContainer}>
                  <Clock size={14} color="#999" />
                  <Text style={styles.deliveryTime}>{order.estimatedDeliveryTime}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                <StatusIcon size={16} color={statusConfig.color} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <Text style={styles.orderItemsText}>
                  {order.items.reduce((total, item) => total + item.quantity, 0)} items
                </Text>
                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
              </View>

              {/* Delivery Address */}
              <View style={styles.addressContainer}>
                <MapPin size={14} color="#999" />
                <Text style={styles.addressText}>{order.deliveryAddress.address}</Text>
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
        })}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (() => {
              const o = mockOrders.find(x => x.id === selected)!;
              const statusConfig = getStatusConfig(o.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <View style={styles.modalHandle} />
                    </TouchableOpacity>
                    
                    <View style={styles.modalTitleSection}>
                      <Text style={styles.modalTitle}>Order #{o.orderNumber}</Text>
                      <Text style={styles.modalSubtitle}>{o.restaurant.name}</Text>
                    </View>
                  </View>

                  {/* Status Section */}
                  <View style={[styles.statusSection, { backgroundColor: statusConfig.backgroundColor }]}>
                    <StatusIcon size={24} color={statusConfig.color} />
                    <Text style={[styles.statusSectionText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                    <Text style={styles.etaText}>
                      ETA: {o.estimatedDeliveryTime}
                    </Text>
                  </View>

                  {/* Order Timeline */}
                  <View style={styles.timelineContainer}>
                    <Text style={styles.timelineTitle}>Order Progress</Text>
                    <View style={styles.timeline}>
                      {[
                        { label: 'Order received', status: o.status === 'pending' || ['preparing', 'ready', 'picking_up', 'delivering', 'delivered'].includes(o.status) },
                        { label: 'Preparing', status: ['preparing', 'ready', 'picking_up', 'delivering', 'delivered'].includes(o.status) },
                        { label: 'Ready', status: ['ready', 'picking_up', 'delivering', 'delivered'].includes(o.status) },
                        { label: 'On the way', status: ['picking_up', 'delivering', 'delivered'].includes(o.status) },
                        { label: 'Delivered', status: o.status === 'delivered' }
                      ].map((step, index) => (
                        <View key={index} style={styles.timelineStep}>
                          <View style={[
                            styles.timelineDot,
                            step.status ? styles.timelineDotActive : styles.timelineDotInactive
                          ]}>
                            {step.status && <CheckCircle size={12} color="#fff" />}
                          </View>
                          <Text style={[
                            styles.timelineLabel,
                            step.status ? styles.timelineLabelActive : styles.timelineLabelInactive
                          ]}>
                            {step.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Map Section */}
                  <View style={styles.mapContainer}>
                    <MapView
                      provider={PROVIDER_DEFAULT}
                      style={styles.map}
                      initialRegion={{
                        latitude: o.deliveryAddress.coordinates.latitude,
                        longitude: o.deliveryAddress.coordinates.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                      }}
                    >
                      {/* Restaurant marker */}
                      {o.restaurant.coordinates && (
                        <Marker coordinate={o.restaurant.coordinates} title={o.restaurant.name} pinColor="#5CB338" />
                      )}

                      {/* Delivery address marker */}
                      <Marker coordinate={o.deliveryAddress.coordinates} title="Delivery location" />

                      {/* Driver location */}
                      {driver?.location && (
                        <Marker coordinate={driver.location} title="Driver" pinColor="#007AFF" />
                      )}

                      {/* Route polyline */}
                      {routeCoords && routeCoords.length > 0 && (
                        <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
                      )}
                    </MapView>
                    
                    {/* Map Info Overlay */}
                    <View style={styles.mapOverlay}>
                      <View style={styles.mapInfo}>
                        <Text style={styles.mapInfoText}>
                          {directionsLoading ? 'Loading route...' : (etaText || 'Calculating...')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    {/* Order Items Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Order Details</Text>
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

                    {/* Delivery Information */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Delivery Information</Text>
                      <View style={styles.infoRow}>
                        <MapPin size={16} color="#999" />
                        <Text style={styles.infoText}>{o.deliveryAddress.address}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Clock size={16} color="#999" />
                        <Text style={styles.infoText}>Estimated delivery: {o.estimatedDeliveryTime}</Text>
                      </View>
                    </View>

                    {/* Payment Summary */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Payment Summary</Text>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Subtotal</Text>
                        <Text style={styles.paymentValue}>${(o.total - o.deliveryFee).toFixed(2)}</Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Delivery fee</Text>
                        <Text style={styles.paymentValue}>${o.deliveryFee.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.paymentRow, styles.paymentTotalRow]}>
                        <Text style={styles.paymentTotalLabel}>Total</Text>
                        <Text style={styles.paymentTotalValue}>${o.total.toFixed(2)}</Text>
                      </View>
                    </View>

                    {/* Driver Information (if available) */}
                    {o.driverName && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Driver Information</Text>
                        <View style={styles.driverInfo}>
                          <View style={styles.driverAvatar}>
                            <Text style={styles.driverAvatarText}>
                              {o.driverName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.driverDetails}>
                            <Text style={styles.driverName}>{o.driverName}</Text>
                            <Text style={styles.driverRating}>★ {o.driverRating}</Text>
                          </View>
                          <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.callButtonText}>Call</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Special Notes */}
                    {o.notes && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Special Instructions</Text>
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesText}>{o.notes}</Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>

                  {/* Modal Footer */}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setSelected(null)}>
                      <Text style={styles.actionButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.primaryActionButton, { backgroundColor: statusConfig.color }]} onPress={() => { setSelected(null); router.push(`/`); }}>
                      <Text style={styles.primaryActionButtonText}>Track Order</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )
            })()}
          </View>
        </View>
      </Modal>
      {/* Re-fetch directions when selected or driver.location changes */}
      <>
        {/** triggered effect below */}
      </>
    </SafeAreaView>
  );
}

// Effects: fetch directions when driver location or selected order changes

export function useDirectionsEffects(driver: ReturnType<typeof useDriver>, selectedId: string | null, setRouteCoords: (v: any) => void, setEtaText: (v: any) => void, setDirectionsLoading: (v: any) => void) {
  const fetchForOrder = useCallback(async () => {
    if (!selectedId) return;
    try {
      setDirectionsLoading(true);
      const o = mockOrders.find(x => x.id === selectedId);
      if (!o) return;
      const origin = driver?.location ?? (o.restaurant.coordinates ?? o.deliveryAddress.coordinates);
      const destination = o.deliveryAddress.coordinates;
      try {
        const res = await fetchDirections(origin, destination, GOOGLE_MAPS_API_KEY || undefined);
        if (res && res.coords) {
          setRouteCoords(res.coords);
        }
        if (res && res.durationSeconds != null) {
          const mins = Math.round(res.durationSeconds / 60);
          const km = res.distanceMeters ? (res.distanceMeters / 1000).toFixed(2) : null;
          setEtaText(`${mins} min${km ? ` — ${km} km` : ''}`);
        } else {
          // fallback to internal estimate
          if (driver?.estimateETA) {
            const e = driver.estimateETA(destination, o.preparationTime || 0);
            setEtaText(e.minutes !== null ? `${e.minutes} min — ${e.distanceKm} km` : 'Calculating...');
          }
        }
      } catch {
        // on error, fallback
        if (driver?.estimateETA) {
          const e = driver.estimateETA(destination, o.preparationTime || 0);
          setEtaText(e.minutes !== null ? `${e.minutes} min — ${e.distanceKm} km` : 'Calculating...');
        }
      }
    } finally {
      setDirectionsLoading(false);
    }
  }, [driver, selectedId, setRouteCoords, setEtaText, setDirectionsLoading]);

  useEffect(() => {
    fetchForOrder();
  }, [fetchForOrder]);

  // re-run when driver moves
  useEffect(() => {
    if (!selectedId) return;
    fetchForOrder();
  }, [selectedId, driver?.location, fetchForOrder]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Order Summary
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  // Address
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Progress Bar
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Status Section
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusSectionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  etaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Timeline
  timelineContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timelineDotActive: {
    backgroundColor: '#5CB338',
  },
  timelineDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#5CB338',
  },
  timelineLabelInactive: {
    color: '#999',
  },

  // Map
  mapContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    height: 200,
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  mapInfo: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  mapInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Modal Content
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  // Items
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

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },

  // Payment
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

  // Driver Info
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  driverRating: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Notes
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

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  primaryActionButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
