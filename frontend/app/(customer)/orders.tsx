import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockOrders } from '@/mocks/orders';
import { MapPin, Clock, CheckCircle, Truck, Package, ChefHat, Navigation, Zap } from 'lucide-react-native';
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
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [driverSpeed, setDriverSpeed] = useState<number>(0);
  const [distanceRemaining, setDistanceRemaining] = useState<string>('Calculating...');
  const [estimatedArrival, setEstimatedArrival] = useState<string>('Calculating...');
  
  const mapRef = useRef<MapView>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const driverPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  
  const driver = useDriver();
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[] | null>(null);
  
  // Stop live tracking
  const stopLiveTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsLiveTracking(false);
    setDriverSpeed(0);
  }, []);
  
  // Start live tracking
  const startLiveTracking = useCallback((order: any) => {
    if (!order.driverName || !driver.location) return;
    
    setIsLiveTracking(true);
    
    // Initialize driver position
    if (driver.location) {
      driverPositionRef.current = driver.location;
    }
    
    // Set up interval for location updates
    trackingIntervalRef.current = setInterval(() => {
      // Simulate driver movement towards destination
      if (driverPositionRef.current && order.deliveryAddress.coordinates) {
        const current = driverPositionRef.current;
        const destination = order.deliveryAddress.coordinates;
        
        // Calculate new position (simplified movement simulation)
        const distance = Math.sqrt(
          Math.pow(destination.latitude - current.latitude, 2) + 
          Math.pow(destination.longitude - current.longitude, 2)
        );
        
        if (distance > 0.0001) { // If not at destination
          const speed = 0.00005 + Math.random() * 0.00002; // Random speed
          const newLat = current.latitude + (destination.latitude - current.latitude) * speed / distance;
          const newLng = current.longitude + (destination.longitude - current.longitude) * speed / distance;
          
          const newPosition = { latitude: newLat, longitude: newLng };
          driverPositionRef.current = newPosition;
          
          // Update driver speed (simulate realistic speed)
          setDriverSpeed(25 + Math.random() * 20); // 25-45 km/h
          
          // Calculate remaining distance
          const remainingDistance = distance * 111; // Rough km conversion
          setDistanceRemaining(`${remainingDistance.toFixed(1)} km`);
          
          // Update ETA
          const etaMinutes = remainingDistance / 30 * 60; // Assume 30 km/h average
          const arrivalTime = new Date(Date.now() + etaMinutes * 60000);
          setEstimatedArrival(arrivalTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
          
          // Follow driver on map
          mapRef.current?.animateToRegion({
            ...newPosition,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }, 1000);
        } else {
          // Driver has arrived
          stopLiveTracking();
          setDistanceRemaining('Arrived');
          setEstimatedArrival('Delivered');
        }
      }
    }, 2000); // Update every 2 seconds
  }, [driver, stopLiveTracking]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveTracking();
    };
  }, [stopLiveTracking]);
  
  // Start tracking when modal opens
  useEffect(() => {
    if (selected) {
      const order = mockOrders.find(x => x.id === selected);
      if (order && (order.status === 'picking_up' || order.status === 'delivering')) {
        setTimeout(() => startLiveTracking(order), 1000);
      }
    } else {
      stopLiveTracking();
    }
  }, [selected, startLiveTracking, stopLiveTracking]);
  
  // wire effects
  useDirectionsEffects(driver, selected, setRouteCoords, null, null);

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

                  {/* Enhanced Map Section */}
                  <View style={styles.mapContainer}>
                    {/* Live Tracking Header */}
                    <View style={styles.trackingHeader}>
                      <View style={styles.trackingInfo}>
                        {isLiveTracking ? (
                          <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                          </View>
                        ) : (
                          <View style={styles.staticIndicator}>
                            <Navigation size={14} color="#666" />
                            <Text style={styles.staticText}>Static view</Text>
                          </View>
                        )}
                        {isLiveTracking && (
                          <View style={styles.trackingStats}>
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>{driverSpeed.toFixed(0)}</Text>
                              <Text style={styles.statLabel}>km/h</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>{distanceRemaining}</Text>
                              <Text style={styles.statLabel}>remaining</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>{estimatedArrival}</Text>
                              <Text style={styles.statLabel}>ETA</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.trackingToggle}
                        onPress={() => isLiveTracking ? stopLiveTracking() : startLiveTracking(o)}
                      >
                        {isLiveTracking ? (
                          <Zap size={16} color="#5CB338" />
                        ) : (
                          <Navigation size={16} color="#007AFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    <MapView
                      ref={mapRef}
                      provider={PROVIDER_DEFAULT}
                      style={styles.map}
                      initialRegion={{
                        latitude: o.deliveryAddress.coordinates.latitude,
                        longitude: o.deliveryAddress.coordinates.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                      }}
                      showsUserLocation={true}
                      followsUserLocation={isLiveTracking}
                      showsTraffic={true}
                    >
                      {/* Kitchen/Restaurant Marker */}
                      {o.restaurant.coordinates && (
                        <Marker 
                          coordinate={o.restaurant.coordinates} 
                          title={`${o.restaurant.name} (Kitchen)`}
                          pinColor="#5CB338"
                        >
                          <View style={styles.kitchenMarker}>
                            <ChefHat size={20} color="#fff" />
                          </View>
                        </Marker>
                      )}

                      {/* Customer Location Marker */}
                      <Marker 
                        coordinate={o.deliveryAddress.coordinates} 
                        title="Delivery Location"
                        pinColor="#FF6B35"
                      >
                        <View style={styles.customerMarker}>
                          <MapPin size={20} color="#fff" />
                        </View>
                      </Marker>

                      {/* Driver Location Marker with Live Animation */}
                      {(driver?.location || driverPositionRef.current) && (
                        <Marker
                          coordinate={driverPositionRef.current || driver.location!}
                          title="Driver"
                          pinColor="#007AFF"
                          anchor={{ x: 0.5, y: 0.5 }}
                        >
                          <View style={[
                            styles.driverMarkerContainer,
                            isLiveTracking && styles.driverMarkerLiveContainer
                          ]}>
                            <View style={[
                              styles.driverMarkerInner,
                              isLiveTracking && styles.driverMarkerLive
                            ]}>
                              <Truck size={18} color="#fff" />
                              {isLiveTracking && (
                                <View style={styles.driverPulse} />
                              )}
                            </View>
                          </View>
                        </Marker>
                      )}

                      {/* Dynamic Route Polyline */}
                      {routeCoords && routeCoords.length > 0 && (
                        <Polyline 
                          coordinates={routeCoords} 
                          strokeColor="#007AFF" 
                          strokeWidth={4}
                          lineDashPattern={[5, 5]}
                        />
                      )}
                      
                      {/* Alternative route from driver's current position */}
                      {(isLiveTracking && driverPositionRef.current) && (
                        <Polyline
                          coordinates={[
                            driverPositionRef.current,
                            o.deliveryAddress.coordinates
                          ]}
                          strokeColor="#FFB800"
                          strokeWidth={3}
                          lineDashPattern={[10, 10]}
                        />
                      )}
                    </MapView>
                    
                    {/* Map Legend */}
                    <View style={styles.mapLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendMarker, { backgroundColor: '#5CB338' }]} />
                        <Text style={styles.legendText}>Kitchen</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendMarker, { backgroundColor: '#FF6B35' }]} />
                        <Text style={styles.legendText}>Customer</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendMarker, { backgroundColor: '#007AFF' }]} />
                        <Text style={styles.legendText}>Driver</Text>
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
                    <TouchableOpacity 
                      style={[
                        styles.primaryActionButton, 
                        { backgroundColor: isLiveTracking ? '#5CB338' : statusConfig.color }
                      ]} 
                      onPress={() => isLiveTracking ? stopLiveTracking() : startLiveTracking(o)}
                    >
                      <Text style={styles.primaryActionButtonText}>
                        {isLiveTracking ? 'Stop Tracking' : 'Track Live'}
                      </Text>
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
  
  // Live Tracking Header
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  trackingInfo: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF4444',
    letterSpacing: 0.5,
  },
  staticIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  staticText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  trackingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  trackingToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Custom Markers
  kitchenMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5CB338',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerLiveContainer: {
    transform: [{ scale: 1.1 }],
  },
  driverMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
  },
  driverMarkerLive: {
    backgroundColor: '#5CB338',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverPulse: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#5CB338',
    opacity: 0.6,
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

  // Map Legend
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
