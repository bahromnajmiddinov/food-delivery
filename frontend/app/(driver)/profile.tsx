import React, { useState } from 'react'
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ShieldCheck,
  Settings,
  MapPin,
  List,
  MessageCircle,
  RefreshCw,
  Car,
  Star,
  Award,
  Bell,
  TrendingUp,
  LogOut,
  ChevronRight
} from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'

export default function DriverProfile() {
  const router = useRouter()
  const { user } = useAuth() || { user: { name: 'Driver', phone: '+000000000' } }
  const [isOnline, setIsOnline] = useState(true)

  const stats = {
    activeOrders: 3,
    todayEarnings: 120000,
    totalDeliveries: 847,
    rating: 4.8,
    level: 'Gold'
  }

  const vehicle = {
    type: 'Car',
    brand: 'Toyota',
    model: 'Camry',
    plate: '01A123AA',
    color: 'Silver'
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with online status */}
      <View style={styles.headerCard}>
        <Image
          source={{ uri: user?.avatar || 'https://placehold.co/100x100' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          <View style={styles.levelBadge}>
            <Award width={12} height={12} color="#FFB800" />
            <Text style={styles.levelText}>{stats.level} Driver</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.onlineToggle, isOnline && styles.onlineToggleActive]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.onlineDot, isOnline && styles.onlineDotActive]} />
          </TouchableOpacity>
          <Pressable style={styles.refresh} onPress={() => {}}>
            <RefreshCw width={20} height={20} color="#666" />
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <List width={18} height={18} color="#5CB338" />
          </View>
          <Text style={styles.statValue}>{stats.activeOrders}</Text>
          <Text style={styles.statLabel}>Active orders</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <TrendingUp width={18} height={18} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>
            {(stats.todayEarnings / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.statLabel}>Earnings (UZS)</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Star width={18} height={18} color="#FFB800" />
          </View>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Vehicle Info */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Car width={18} height={18} color="#666" />
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
          </View>
          <Pressable onPress={() => router.push('/(driver)/settings')}>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
        </View>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleDetail}>
            <Text style={styles.vehicleLabel}>Type</Text>
            <Text style={styles.vehicleValue}>{vehicle.brand} {vehicle.model}</Text>
          </View>
          <View style={styles.vehicleDetail}>
            <Text style={styles.vehicleLabel}>Color</Text>
            <Text style={styles.vehicleValue}>{vehicle.color}</Text>
          </View>
          <View style={styles.vehicleDetail}>
            <Text style={styles.vehicleLabel}>Plate</Text>
            <Text style={styles.vehicleValue}>{vehicle.plate}</Text>
          </View>
        </View>
      </View>

      {/* Performance Summary */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Award width={18} height={18} color="#666" />
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>
        </View>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>847</Text>
            <Text style={styles.performanceLabel}>Total deliveries</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>99%</Text>
            <Text style={styles.performanceLabel}>On-time rate</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>18m</Text>
            <Text style={styles.performanceLabel}>Avg delivery</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>3.2M</Text>
            <Text style={styles.performanceLabel}>Total earned</Text>
          </View>
        </View>
      </View>

      {/* Main Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Menu</Text>
        <View style={styles.menuList}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(driver)/dashboard')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E8' }]}>
              <ShieldCheck width={18} height={18} color="#5CB338" />
            </View>
            <Text style={styles.menuItemText}>Dashboard</Text>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(driver)/orders')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <List width={18} height={18} color="#007AFF" />
            </View>
            <Text style={styles.menuItemText}>Orders</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.activeOrders}</Text>
            </View>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(driver)/map')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF4E6' }]}>
              <MapPin width={18} height={18} color="#FF9500" />
            </View>
            <Text style={styles.menuItemText}>Map / Zones</Text>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(driver)/notifications')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FCE4EC' }]}>
              <Bell width={18} height={18} color="#E91E63" />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <View style={styles.menuList}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(driver)/settings')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F5F5' }]}>
              <Settings width={18} height={18} color="#666" />
            </View>
            <Text style={styles.menuItemText}>Settings</Text>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
        </View>
      </View>

      {/* Support Button */}
      <Pressable
        style={styles.supportButton}
        onPress={() => router.push('/(driver)/support')}
      >
        <MessageCircle width={18} height={18} color="#fff" />
        <Text style={styles.supportButtonText}>Online helper</Text>
      </Pressable>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton}>
        <LogOut width={18} height={18} color="#DC2626" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32
  },

  // Header
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12
  },
  headerText: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  phone: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFB800',
    marginLeft: 4
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  onlineToggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingLeft: 2
  },
  onlineToggleActive: {
    backgroundColor: '#E8F5E8'
  },
  onlineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#999'
  },
  onlineDotActive: {
    backgroundColor: '#5CB338'
  },
  refresh: {
    padding: 8
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center'
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A'
  },

  // Vehicle Info
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  vehicleDetail: {
    flex: 1
  },
  vehicleLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A'
  },

  // Performance Grid
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2
  },
  performanceLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center'
  },

  // Menu Sections
  menuSection: {
    marginBottom: 16
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4
  },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A'
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff'
  },

  // Buttons
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8
  },
  supportButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 15
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  logoutText: {
    color: '#DC2626',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 15
  }
})
