import React from 'react'
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { User, Settings, List, DollarSign, MessageCircle, RefreshCw } from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'

export default function CustomerProfile() {
  const router = useRouter()
  const { user } = useAuth() || { user: { name: 'Guest', phone: '+000000000' } }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Image
          source={{ uri: user?.avatar || 'https://placehold.co/100x100' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.name || 'Unnamed'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
        </View>
        <Pressable style={styles.refresh} onPress={() => {}}>
          <RefreshCw width={20} height={20} />
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Balans</Text>
          <Text style={styles.infoValue}>450 000 UZS</Text>
        </View>
        <View style={styles.infoCardAlt}>
          <Text style={styles.infoTitle}>Oxirgi tushum</Text>
          <Text style={[styles.infoValue, { color: '#16a34a' }]}>+65 000 UZS</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Pressable onPress={() => router.push('/(customer)/notifications')}>
            <Text style={{ color: '#2563eb' }}>All</Text>
          </Pressable>
        </View>
        <View style={styles.notificationBox}>
          <Text style={styles.notificationDate}>June 24</Text>
          <Text style={styles.notificationText}>Check your settings you have notifications turned off</Text>
          <Pressable>
            <Text style={styles.more}>More</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionsList}>
        <Pressable style={styles.item} onPress={() => router.push('/(customer)/profile-settings')}>
          <User width={18} height={18} />
          <Text style={styles.itemText}>Profile settings</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(customer)/settings')}>
          <Settings width={18} height={18} />
          <Text style={styles.itemText}>Settings</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(customer)/orders')}>
          <List width={18} height={18} />
          <Text style={styles.itemText}>Orders</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push('/(customer)/income')}>
          <DollarSign width={18} height={18} />
          <Text style={styles.itemText}>Income</Text>
        </Pressable>
      </View>

      <Pressable style={styles.helperButton} onPress={() => router.push('/(customer)/support') }>
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
  sectionCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  notificationBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginTop: 6 },
  notificationDate: { fontSize: 12, color: '#9ca3af' },
  notificationText: { marginTop: 6, color: '#374151' },
  more: { color: '#2563eb', marginTop: 8 },
  sectionsList: { marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8 },
  itemText: { marginLeft: 12, fontSize: 15 },
  helperButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', padding: 14, borderRadius: 999, marginTop: 12 },
  helperText: { color: '#fff', marginLeft: 8, fontWeight: '700' }
})

