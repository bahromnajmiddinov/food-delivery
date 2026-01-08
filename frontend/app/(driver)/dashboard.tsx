import React from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MapPin, Truck, Clock } from 'lucide-react-native'
import orders from '../../mocks/orders'

export default function DriverDashboard() {
  const router = useRouter()
  const active = orders.filter(o => o.status === 'assigned' || o.status === 'on_the_way')

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Driver dashboard</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Truck width={28} height={28} />
          <Text style={styles.cardLabel}>Active</Text>
          <Text style={styles.cardValue}>{active.length}</Text>
        </View>
        <View style={styles.card}>
          <MapPin width={28} height={28} />
          <Text style={styles.cardLabel}>Zones</Text>
          <Text style={styles.cardValue}>2</Text>
        </View>
        <View style={styles.card}>
          <Clock width={28} height={28} />
          <Text style={styles.cardLabel}>Earnings today</Text>
          <Text style={styles.cardValue}>120 000</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent orders</Text>
        {active.slice(0, 4).map(o => (
          <Pressable key={o.id} style={styles.row} onPress={() => router.push(`/(driver)/orders/${o.id}`)}>
            <Text style={styles.rowText}>{o.id} — {o.status}</Text>
            <Text style={styles.rowSub}>{o.customer?.name || o.address}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#fff', padding: 12, marginRight: 8, borderRadius: 10, alignItems: 'center' },
  cardLabel: { marginTop: 8, color: '#6b7280' },
  cardValue: { marginTop: 6, fontWeight: '700', fontSize: 16 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8 },
  rowText: { fontWeight: '600' },
  rowSub: { color: '#6b7280', marginTop: 4 }
})
