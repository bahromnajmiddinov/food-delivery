import React from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Coffee, List, DollarSign } from 'lucide-react-native'
import orders from '../../mocks/orders'

export default function RestaurantDashboard() {
  const router = useRouter()
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing')

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restaurant dashboard</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Coffee width={28} height={28} />
          <Text style={styles.cardLabel}>Pending</Text>
          <Text style={styles.cardValue}>{pending.length}</Text>
        </View>
        <View style={styles.card}>
          <List width={28} height={28} />
          <Text style={styles.cardLabel}>Orders today</Text>
          <Text style={styles.cardValue}>34</Text>
        </View>
        <View style={styles.card}>
          <DollarSign width={28} height={28} />
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.cardValue}>1 200 000</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending orders</Text>
        {pending.slice(0, 6).map(o => (
          <Pressable key={o.id} style={styles.row} onPress={() => router.push(`/(restaurant)/orders/${o.id}`)}>
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
