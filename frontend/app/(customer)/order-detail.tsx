import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, ChefHat, Navigation, Zap, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { useDriver } from '@/contexts/DriverContext';
import { useUserOrders } from '@/hooks/useApi';
import { formatPrice } from '@/lib/format';

// Status configuration with Yandex-style colors and icons
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        color: '#FFB800',
        backgroundColor: '#FFF4D6',
        borderColor: '#FFB800',
        label: 'Order received',
        icon: Clock,
        progressIndex: 0
      };
    case 'preparing':
      return {
        color: '#FF6B35',
        backgroundColor: '#FFE5DC',
        borderColor: '#FF6B35',
        label: 'Restaurant is preparing',
        icon: ChefHat,
        progressIndex: 1
      };
    case 'ready':
      return {
        color: '#007AFF',
        backgroundColor: '#E3F2FD',
        borderColor: '#007AFF',
        label: 'Ready for pickup',
        icon: Package,
        progressIndex: 2
      };
    case 'picking_up':
      return {
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
        borderColor: '#9C27B0',
        label: 'Courier is on the way',
        icon: Truck,
        progressIndex: 2
      };
    case 'delivering':
      return {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
        label: 'On the way',
        icon: Truck,
        progressIndex: 3
      };
    case 'delivered':
      return {
        color: '#5CB338',
        backgroundColor: '#E8F5E8',
        borderColor: '#5CB338',
        label: 'Delivered',
        icon: CheckCircle,
        progressIndex: 4
      };
    default:
      return {
        color: '#666',
        backgroundColor: '#F5F5F5',
        borderColor: '#666',
        label: status,
        icon: Clock,
        progressIndex: 0
      };
  }
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { data: ordersData } = useUserOrders();
  const driver = useDriver();
  
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [driverSpeed, setDriverSpeed] = useState<number>(0);
  const [distanceRemaining, setDistanceRemaining] = useState<string>('Calculating...');
  const [estimatedArrival, setEstimatedArrival] = useState<string>('Calculating...');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const driverPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const ordersRaw = ordersData?.results || ordersData || [];
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];
  const order = orders.find(x => String(x.id) === String(orderId));

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
  const startLiveTracking = useCallback((orderParam: any) => {
    if (!orderParam.driverName || !driver.location) return;
    
    setIsLiveTracking(true);
    
    // Initialize driver position
    if (driver.location) {
      driverPositionRef.current = driver.location;
    }
    
    // Set up interval for location updates
    trackingIntervalRef.current = setInterval(() => {
      // Simulate driver movement towards destination
      if (driverPositionRef.current && orderParam.deliveryAddress?.coordinates) {
        const current = driverPositionRef.current;
        const destination = orderParam.deliveryAddress.coordinates;
        
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

  // Initialize map region
  useEffect(() => {
    if (order?.deliveryAddress?.coordinates) {
      setMapRegion({
        latitude: order.deliveryAddress.coordinates.latitude,
        longitude: order.deliveryAddress.coordinates.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    } else if (order?.restaurant?.coordinates) {
      setMapRegion({
        latitude: order.restaurant.coordinates.latitude,
        longitude: order.restaurant.coordinates.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }
  }, [order]);

  // Start tracking when appropriate
  useEffect(() => {
    if (order && (order.status === 'picking_up' || order.status === 'delivering')) {
      setTimeout(() => startLiveTracking(order), 1000);
    }
    
    return () => {
      stopLiveTracking();
    };
  }, [order, startLiveTracking, stopLiveTracking]);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [navigation]);

  // Get all coordinates for map bounds
  const getMapCoordinates = () => {
    const coords = [];
    if (order?.restaurant?.coordinates) coords.push(order.restaurant.coordinates);
    if (order?.deliveryAddress?.coordinates) coords.push(order.deliveryAddress.coordinates);
    if (driver?.location || driverPositionRef.current) {
      coords.push(driverPositionRef.current || driver.location!);
    }
    return coords;
  };

  // Fit map to show all markers
  const fitMapToMarkers = () => {
    const coordinates = getMapCoordinates();
    if (coordinates.length === 0) return;

    if (coordinates.length === 1) {
      const coord = coordinates[0];
      setMapRegion({
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    } else {
      // Calculate bounds
      let minLat = coordinates[0].latitude;
      let maxLat = coordinates[0].latitude;
      let minLng = coordinates[0].longitude;
      let maxLng = coordinates[0].longitude;

      coordinates.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
      });

      const latDelta = (maxLat - minLat) * 1.2 + 0.01;
      const lngDelta = (maxLng - minLng) * 1.2 + 0.01;

      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found or no longer available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.restaurantName}>{order.restaurant?.name || 'Restaurant'}</Text>
        </View>
        <TouchableOpacity style={styles.contactButton}>
          <Phone size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Full-Screen Map */}
      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsTraffic={true}
            onMapReady={fitMapToMarkers}
          >
            {/* Restaurant Marker */}
            {order.restaurant?.coordinates && (
              <Marker 
                coordinate={order.restaurant.coordinates} 
                title={`${order.restaurant?.name || 'Restaurant'} (Kitchen)`}
                pinColor="#5CB338"
              >
                <View style={styles.kitchenMarker}>
                  <ChefHat size={24} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Customer Location Marker */}
            {order.deliveryAddress?.coordinates && (
              <Marker 
                coordinate={order.deliveryAddress.coordinates} 
                title="Delivery Location"
                pinColor="#FF6B35"
              >
                <View style={styles.customerMarker}>
                  <MapPin size={24} color="#fff" />
                </View>
              </Marker>
            )}

            {/* Driver Location Marker */}
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
                    <Truck size={20} color="#fff" />
                    {isLiveTracking && (
                      <View style={styles.driverPulse} />
                    )}
                  </View>
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Map Overlay - Live Tracking Controls */}
        <View style={styles.mapOverlay}>
          <View style={styles.trackingCard}>
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
                onPress={() => isLiveTracking ? stopLiveTracking() : startLiveTracking(order)}
              >
                {isLiveTracking ? (
                  <Zap size={18} color="#5CB338" />
                ) : (
                  <Navigation size={18} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor, borderColor: statusConfig.borderColor }]}>
              <StatusIcon size={16} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              <Text style={styles.etaText}>
                ETA: {order.estimatedDeliveryTime}
              </Text>
            </View>
          </View>
        </View>

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

      {/* Content Below Map */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Order Progress</Text>
          <View style={styles.timeline}>
            {[
              { label: 'Order received', status: order.status === 'pending' || ['preparing', 'ready', 'picking_up', 'delivering', 'delivered'].includes(order.status) },
              { label: 'Preparing', status: ['preparing', 'ready', 'picking_up', 'delivering', 'delivered'].includes(order.status) },
              { label: 'Ready', status: ['ready', 'picking_up', 'delivering', 'delivered'].includes(order.status) },
              { label: 'On the way', status: ['picking_up', 'delivering', 'delivered'].includes(order.status) },
              { label: 'Delivered', status: order.status === 'delivered' }
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

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>${formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <MapPin size={16} color="#999" />
            <Text style={styles.addressText}>{order.deliveryAddress?.address || 'Address not available'}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${formatPrice(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${formatPrice(order.deliveryFee || 0)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Driver Info */}
        {order.driverName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver</Text>
            <View style={styles.driverContainer}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {order.driverName.charAt(0)}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{order.driverName}</Text>
                <Text style={styles.driverVehicle}>{order.driverVehicle || 'Vehicle info'}</Text>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.driverActionButton}>
                  <Phone size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.driverActionButton}>
                  <MessageCircle size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 400,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1,
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackingInfo: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5CB338',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5CB338',
  },
  staticIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  staticText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  trackingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  trackingToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 12,
  },
  etaText: {
    fontSize: 12,
    color: '#666',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#333',
    fontWeight: '600',
  },
  timelineLabelInactive: {
    color: '#999',
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  driverVehicle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  driverActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Marker styles
  kitchenMarker: {
    backgroundColor: '#5CB338',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  customerMarker: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverMarkerContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverMarkerLiveContainer: {
    backgroundColor: '#5CB338',
  },
  driverMarkerInner: {
    position: 'relative',
  },
  driverMarkerLive: {
    transform: [{ scale: 1.1 }],
  },
  driverPulse: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5CB338',
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});