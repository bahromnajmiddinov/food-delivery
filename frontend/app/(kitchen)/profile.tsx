import React, { useState } from 'react'
import { View, Text, Image, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import {
  UtensilsCrossed,
  Settings,
  List,
  DollarSign,
  MessageCircle,
  RefreshCw,
  Star,
  Award,
  Bell,
  LogOut,
  ChevronRight,
  Target
} from 'lucide-react-native'
import { useAuth } from '../../contexts/AuthContext'

export default function RestaurantProfile() {
  const router = useRouter()
  const { user } = useAuth() || { user: { name: 'Restaurant', phone: '+000000000' } }
  const [isOnline, setIsOnline] = useState(true)

  const stats = {
    pendingOrders: 5,
    todayIncome: 1200000,
    totalOrders: 2847,
    rating: 4.7,
    level: 'Platinum'
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
            <Award width={12} height={12} color="#9C27B0" />
            <Text style={styles.levelText}>{stats.level} Partner</Text>
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
            <List width={18} height={18} color="#FF6B35" />
          </View>
          <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <DollarSign width={18} height={18} color="#5CB338" />
          </View>
          <Text style={styles.statValue}>
            {(stats.todayIncome / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.statLabel}>Income (UZS)</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Star width={18} height={18} color="#FFB800" />
          </View>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Performance Summary */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Target width={18} height={18} color="#666" />
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>
        </View>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>2847</Text>
            <Text style={styles.performanceLabel}>Total orders</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>97%</Text>
            <Text style={styles.performanceLabel}>On-time rate</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>12m</Text>
            <Text style={styles.performanceLabel}>Avg prep time</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>4.8</Text>
            <Text style={styles.performanceLabel}>Avg rating</Text>
          </View>
        </View>
      </View>

      {/* Main Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Menu</Text>
        <View style={styles.menuList}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(kitchen)/dashboard')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF4E6' }]}>
              <DollarSign width={18} height={18} color="#FF9500" />
            </View>
            <Text style={styles.menuItemText}>Dashboard</Text>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(kitchen)/kitchen')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <UtensilsCrossed width={18} height={18} color="#9C27B0" />
            </View>
            <Text style={styles.menuItemText}>Kitchen</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.pendingOrders}</Text>
            </View>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(kitchen)/orders')}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <List width={18} height={18} color="#007AFF" />
            </View>
            <Text style={styles.menuItemText}>Orders</Text>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(kitchen)/notifications')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FCE4EC' }]}>
              <Bell width={18} height={18} color="#E91E63" />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <ChevronRight width={18} height={18} color="#999" />
          </Pressable>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <View style={styles.menuList}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(kitchen)/settings')}>
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
        onPress={() => router.push('/(kitchen)/support')}
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
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C27B0',
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
