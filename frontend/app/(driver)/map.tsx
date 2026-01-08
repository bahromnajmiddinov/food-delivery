import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useDriver } from '@/contexts/DriverContext';
import { mockOrders } from '@/mocks/orders';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Route,
  DollarSign
} from 'lucide-react-native';

export default function DriverMapScreen() {
  const { location } = useDriver();
  const [region, setRegion] = useState({ 
    latitude: 41.2995, 
    longitude: 69.2401, 
    latitudeDelta: 0.05, 
    longitudeDelta: 0.05 
  });
  const [currentOrder, setCurrentOrder] = useState(mockOrders.find(o => ['picking_up', 'delivering'].includes(o.status)));
  const [isNavigating, setIsNavigating] = useState(false);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (location && mapRef.current) {
      // Center map on driver location
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  }, [location]);

  const startNavigation = () => {
    setIsNavigating(true);
    Alert.alert(
      'Navigation Started',
      'Turn-by-turn navigation has begun. Follow the route to your destination.',
      [{ text: 'OK' }]
    );
  };

  const completeOrder = () => {
    Alert.alert(
      'Order Complete',
      'Mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => {
          Alert.alert('Success', 'Order marked as completed!');
          setIsNavigating(false);
          setCurrentOrder(null);
        }}
      ]
    );
  };

  const getCurrentDestination = () => {
    if (!currentOrder) return null;
    
    if (currentOrder.status === 'picking_up') {
      return {
        coordinate: currentOrder.restaurant.coordinates,
        title: `Pick up from ${currentOrder.restaurant.name}`,
        type: 'restaurant'
      };
    } else {
      return {
        coordinate: currentOrder.deliveryAddress.coordinates,
        title: `Deliver to ${currentOrder.customerName}`,
        type: 'customer'
      };
    }
  };

  const destination = getCurrentDestination();
  const routeCoordinates = location && destination ? [
    location,
    destination.coordinate
  ] : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Navigation</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        
        {currentOrder && (
          <View style={styles.orderBanner}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#{currentOrder.orderNumber}</Text>
              <Text style={styles.restaurantName}>{currentOrder.restaurant.name}</Text>
            </View>
            <View style={styles.orderStats}>
              <View style={styles.statItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.statText}>{eta}</Text>
              </View>
              <View style={styles.statItem}>
                <Route size={14} color="#666" />
                <Text style={styles.statText}>{distance}</Text>
              </View>
              <View style={styles.statItem}>
                <DollarSign size={14} color="#666" />
                <Text style={styles.statText}>${currentOrder.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          followsUserLocation={isNavigating}
          showsTraffic={true}
        >
          {/* Driver location */}
          {location && (
            <Marker coordinate={location} title="Your location">
              <View style={styles.driverMarker}>
                <Navigation size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Restaurant marker */}
          {currentOrder?.restaurant.coordinates && currentOrder.status === 'picking_up' && (
            <Marker 
              coordinate={currentOrder.restaurant.coordinates} 
              title={`Pick up: ${currentOrder.restaurant.name}`}
              pinColor="#5CB338"
            >
              <View style={styles.restaurantMarker}>
                <MapPin size={24} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Customer marker */}
          {currentOrder?.deliveryAddress.coordinates && (
            <Marker 
              coordinate={currentOrder.deliveryAddress.coordinates} 
              title={`Deliver to: ${currentOrder.customerName}`}
              pinColor="#FF6B35"
            >
              <View style={styles.customerMarker}>
                <MapPin size={24} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Route polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              coordinates={routeCoordinates}
              strokeColor="#007AFF"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>

        {/* Navigation Overlay */}
        {isNavigating && destination && (
          <View style={styles.navigationOverlay}>
            <View style={styles.navigationCard}>
              <View style={styles.navigationHeader}>
                <View style={styles.navigationIcon}>
                  <Navigation size={24} color="#007AFF" />
                </View>
                <View style={styles.navigationInfo}>
                  <Text style={styles.navigationTitle}>
                    {navigationStep === 0 ? 'Head to pickup' : 'Head to delivery'}
                  </Text>
                  <Text style={styles.navigationSubtitle}>{destination.title}</Text>
                </View>
                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>{eta}</Text>
                </View>
              </View>
              
              <View style={styles.navigationProgress}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>
                  {navigationStep === 0 ? '40% complete' : '80% complete'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {currentOrder ? (
          <>
            {/* Order Actions */}
            <View style={styles.actionContainer}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryAction}>
                  <Phone size={20} color="#007AFF" />
                  <Text style={styles.secondaryActionText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.primaryAction}
                  onPress={isNavigating ? completeOrder : startNavigation}
                >
                  {isNavigating ? (
                    <>
                      <CheckCircle size={20} color="#fff" />
                      <Text style={styles.primaryActionText}>Complete Order</Text>
                    </>
                  ) : (
                    <>
                      <Navigation size={20} color="#fff" />
                      <Text style={styles.primaryActionText}>Start Navigation</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>
                {currentOrder.status === 'picking_up' ? 'Pickup Details' : 'Delivery Details'}
              </Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer:</Text>
                <Text style={styles.detailValue}>{currentOrder.customerName}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {currentOrder.deliveryAddress.address}
                </Text>
              </View>
              
              {currentOrder.notes && (
                <View style={styles.notesSection}>
                  <View style={styles.notesHeader}>
                    <AlertCircle size={16} color="#FFB800" />
                    <Text style={styles.notesTitle}>Special Instructions</Text>
                  </View>
                  <Text style={styles.notesText}>{currentOrder.notes}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noOrderContainer}>
            <MapPin size={48} color="#CCCCCC" />
            <Text style={styles.noOrderTitle}>No Active Orders</Text>
            <Text style={styles.noOrderText}>
              Orders assigned to you will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
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

  // Order Banner
  orderBanner: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  orderInfo: {
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5CB338',
  },
  orderStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Map Container
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },

  // Custom Markers
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
  restaurantMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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

  // Navigation Overlay
  navigationOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  navigationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navigationInfo: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  navigationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  etaBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navigationProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Bottom Controls
  bottomControls: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 20,
  },

  // Action Container
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  primaryAction: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5CB338',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Details Container
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 20,
  },

  // Notes Section
  notesSection: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // No Order State
  noOrderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noOrderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  noOrderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Legacy styles for compatibility
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#999',
  },
})
