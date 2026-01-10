import React from 'react'
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Coffee, Settings, List, DollarSign, MessageCircle, RefreshCw } from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'

export default function RestaurantProfile() {
  const router = useRouter()
  const { user } = useAuth() || { user: { name: 'Restaurant', phone: '+000000000' } }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Image source={{ uri: user?.avatar || 'https://placehold.co/100x100' }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>
        <Pressable style={styles.refresh} onPress={() => {}}>
          <RefreshCw width={20} height={20} />
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pending orders</Text>
          <Text style={styles.infoValue}>5</Text>
        </View>
        <View style={styles.infoCardAlt}>
          <Text style={styles.infoTitle}>Income today</Text>
          <Text style={[styles.infoValue, { color: '#16a34a' }]}>1 200 000 UZS</Text>
        </View>
      </View>

      <View style={styles.sectionsList}>
        <Pressable style={styles.item} onPress={() => router.push('/(kitchen)/dashboard')}>
          <Coffee width={18} height={18} />
          <Text style={styles.itemText}>Dashboard</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(kitchen)/kitchen')}>
          <List width={18} height={18} />
          <Text style={styles.itemText}>Kitchen</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(kitchen)/orders')}>
          <List width={18} height={18} />
          <Text style={styles.itemText}>Orders</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(kitchen)/settings')}>
          <Settings width={18} height={18} />
          <Text style={styles.itemText}>Settings</Text>
        </Pressable>
      </View>

      <Pressable style={styles.helperButton} onPress={() => router.push('/(kitchen)/support') }>
        <MessageCircle width={18} height={18} color="#fff" />
        <Text style={styles.helperText}>Online helper</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  headerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  headerText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  phone: { fontSize: 13, color: '#6b7280' },
  refresh: { padding: 8 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  infoCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  infoCardAlt: { flex: 1, backgroundColor: '#f7fff7', padding: 12, borderRadius: 10 },
  infoTitle: { fontSize: 12, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  sectionsList: { marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8 },
  itemText: { marginLeft: 12, fontSize: 15 },
  helperButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', padding: 14, borderRadius: 999, marginTop: 12 },
  helperText: { color: '#fff', marginLeft: 8, fontWeight: '700' }
})

