import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockOrders } from '@/mocks/orders';
import { MapPin, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useDriver } from '@/contexts/DriverContext';
import { fetchDirections } from '@/lib/googleDirections';
import config from '@/lib/config';
 

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
        {mockOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => setSelected(order.id)}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <Text style={styles.restaurantNameSmall}>{order.restaurant.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.orderTime}>{order.estimatedDeliveryTime}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <MapPin size={14} color="#666" />
              <Text style={styles.addressText}>{order.deliveryAddress.address}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>${order.total.toFixed(2)}</Text>
              <Text style={styles.footerText}>Delivery ${order.deliveryFee.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (() => {
              const o = mockOrders.find(x => x.id === selected)!;
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Image source={{ uri: o.restaurant.logo }} style={styles.modalAvatar} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.modalTitle}>{o.restaurant.name}</Text>
                      <Text style={styles.modalSubtitle}>№ {o.orderNumber} • {o.estimatedDeliveryTime}</Text>
                      <Text style={styles.modalSubtitle}>{o.status.toUpperCase()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: '700' }}>{o.driverName || '—'}</Text>
                      <Text style={{ color: '#666' }}>{o.driverPhone || ''}</Text>
                    </View>
                  </View>

                  <View style={{ height: 220, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' }}>
                    <MapView
                      provider={PROVIDER_DEFAULT}
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: o.deliveryAddress.coordinates.latitude,
                        longitude: o.deliveryAddress.coordinates.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                      }}
                    >
                      {/* Restaurant / Kitchen marker */}
                      {o.restaurant.coordinates && (
                        <Marker coordinate={o.restaurant.coordinates} title={o.restaurant.name} pinColor="#7ED321" />
                      )}

                      {/* Delivery address marker */}
                      <Marker coordinate={o.deliveryAddress.coordinates} title="Delivery" />

                      {/* Driver live location */}
                      {driver?.location && (
                        <Marker coordinate={driver.location} title="Driver" pinColor="#007AFF" />
                      )}

                      {/* Optional route polyline between driver and delivery (fetched from Google Directions) */}
                      {routeCoords && routeCoords.length > 0 && (
                        <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
                      )}
                    </MapView>
                  </View>

                  <ScrollView style={{ paddingHorizontal: 20 }}>
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.sectionLabel}>Estimated arrival</Text>
                      <Text style={styles.modalText}>{directionsLoading ? 'Loading route...' : (etaText || 'Calculating...')}</Text>
                    </View>

                    <Text style={styles.sectionLabel}>Delivery Address</Text>
                    <Text style={styles.modalText}>{o.deliveryAddress.address}</Text>

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
                      <TouchableOpacity style={styles.primaryBtn} onPress={() => { setSelected(null); router.push(`/`); }}>
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
        const res = await fetchDirections(origin, destination, config.GOOGLE_MAPS_API_KEY || undefined);
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
      } catch (e) {
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
  }, [driver?.location]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    marginTop: 6,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700' },
  orderStatus: { color: '#666', marginTop: 6 },
  restaurantNameSmall: { color: '#666' },
  orderTime: { color: '#666' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addressText: { color: '#666', marginLeft: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerText: { color: '#1A1A1A', fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', paddingTop: 12 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  modalAvatar: { width: 56, height: 56, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { color: '#666', marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 12 },
  modalText: { color: '#333', marginTop: 6 },
  itemRowModal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  itemQty: { fontWeight: '700', width: 36 },
  itemNameModal: { flex: 1 },
  itemPrice: { fontWeight: '700' },
  modalFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  modalTotalLabel: { color: '#666' },
  modalTotal: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  primaryBtn: { backgroundColor: '#7ED321', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '700' },
});
