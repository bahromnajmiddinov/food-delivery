import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { useDriver } from '@/contexts/DriverContext';
import { Plus, Trash } from 'lucide-react-native';

export default function DriverMapScreen() {
  const { location, setLocation, zones, addZone, removeZone } = useDriver();
  const [region, setRegion] = useState({ latitude: 41.2995, longitude: 69.2401, latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [creatingRadius, setCreatingRadius] = useState('500');
  const [creatingName, setCreatingName] = useState('');

  const handleAddZone = () => {
    const radius = Math.max(50, Number(creatingRadius) || 500);
    const center = location || { latitude: region.latitude, longitude: region.longitude };
    addZone(center, radius, creatingName || `Zone ${zones.length + 1}`);
    setCreatingRadius('500');
    setCreatingName('');
    Alert.alert('Zone added');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Map</Text>
      </View>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={(e) => setLocation && setLocation(e.nativeEvent.coordinate)}
      >
        {location && (
          <Marker coordinate={location} draggable onDragEnd={(e) => setLocation && setLocation(e.nativeEvent.coordinate)}>
            <View style={styles.driverMarker} />
          </Marker>
        )}

        {zones.map((z) => (
          <React.Fragment key={z.id}>
            <Circle center={z.center} radius={z.radiusMeters} strokeColor="rgba(126,211,33,0.4)" fillColor="rgba(126,211,33,0.12)" />
            <Marker coordinate={z.center} />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.controls}>
        <View style={styles.row}>
          <TextInput
            value={creatingName}
            onChangeText={setCreatingName}
            placeholder="Zone name"
            style={styles.input}
          />
          <TextInput
            value={creatingRadius}
            onChangeText={setCreatingRadius}
            keyboardType="numeric"
            style={[styles.input, { width: 110 }]}
            placeholder="Radius m"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddZone}>
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={zones}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.zoneRow}>
              <Text style={styles.zoneText}>{item.name || 'Zone'}</Text>
              <Text style={styles.zoneText}>{item.radiusMeters} m</Text>
              <TouchableOpacity onPress={() => removeZone(item.id)} style={styles.deleteBtn}>
                <Trash size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: '#999',
  },
});
