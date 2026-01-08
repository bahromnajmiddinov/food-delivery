import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { ArrowLeft, MapPin, Check } from 'lucide-react-native';
import { useCart } from '@/contexts/AuthContext';
import { DeliveryAddress } from '@/types';

export default function MapSelectScreen() {
  const { setDeliveryAddress } = useCart();
  const [region, setRegion] = useState({
    latitude: 41.2995,
    longitude: 69.2401,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 41.2995,
    longitude: 69.2401,
  });
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressText, setAddressText] = useState('Tashkent, Amir Temur Street');

  const handleSaveAddress = () => {
    const newAddress: DeliveryAddress = {
      id: Math.random().toString(),
      label: addressLabel,
      address: addressText,
      coordinates: markerPosition,
    };
    setDeliveryAddress(newAddress);
    Alert.alert('Success', 'Address saved successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker
          coordinate={markerPosition}
          draggable
          onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
        >
          <View style={styles.customMarker}>
            <MapPin size={32} color="#7ED321" fill="#7ED321" />
          </View>
        </Marker>
      </MapView>

      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Delivery Address</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <View style={styles.addressForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Label</Text>
            <TextInput
              style={styles.input}
              value={addressLabel}
              onChangeText={setAddressLabel}
              placeholder="e.g., Home, Work, Office"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={addressText}
              onChangeText={setAddressText}
              placeholder="Enter full address"
              placeholderTextColor="#999"
              multiline
            />
          </View>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveAddress}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Confirm Address</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  addressForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#7ED321',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
