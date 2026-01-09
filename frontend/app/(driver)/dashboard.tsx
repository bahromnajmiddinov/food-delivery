import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { MapPin, Truck, Clock, Star, DollarSign, Navigation, ArrowRight } from 'lucide-react-native'
import { mockOrders } from '@/mocks/orders'

export default function DriverDashboard() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  
  const activeOrders = mockOrders.filter(o => ['picking_up', 'delivering'].includes(o.status))
  const completedOrders = mockOrders.filter(o => o.status === 'delivered')
  const todayEarnings = completedOrders.reduce((total, order) => total + order.deliveryFee, 0)
  const weeklyEarnings = todayEarnings * 7 // Mock calculation
  
  const stats = {
    todayDeliveries: completedOrders.length,
    weeklyDeliveries: completedOrders.length * 7,
    todayEarnings,
    weeklyEarnings,
    rating: 4.8,
    acceptanceRate: 98
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.driverName}>Alex Driver</Text>
          </View>
          <View style={styles.onlineToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, isOnline && styles.toggleButtonActive]}
              onPress={() => setIsOnline(!isOnline)}
            >
              <View style={[styles.toggleIndicator, isOnline && styles.toggleIndicatorActive]} />
              <Text style={[styles.toggleText, isOnline && styles.toggleTextActive]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {isOnline && activeOrders.length > 0 && (
          <View style={styles.activeOrderBanner}>
            <View style={styles.bannerLeft}>
              <Truck size={20} color="#5CB338" />
              <Text style={styles.bannerText}>
                {activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.viewOrdersBtn}
              onPress={() => router.push('/(driver)/orders')}
            >
              <Text style={styles.viewOrdersText}>View</Text>
              <ArrowRight size={16} color="#5CB338" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statHeader}>
            <DollarSign size={24} color="#5CB338" />
            <Text style={styles.statLabel}>Today&apos;s Earnings</Text>
          </View>
          <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
          <Text style={styles.statSubValue}>+${(todayEarnings * 0.1).toFixed(2)} from tips</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Truck size={24} color="#007AFF" />
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
          <Text style={styles.statSubValue}>This week: {stats.weeklyDeliveries}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Star size={24} color="#FFB800" />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statSubValue}>{stats.acceptanceRate}% acceptance rate</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <MapPin size={24} color="#FF6B35" />
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <Text style={styles.statValue}>23.4 km</Text>
          <Text style={styles.statSubValue}>This week: 156.8 km</Text>
        </View>
      </View>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/orders')}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>
          
          {activeOrders.slice(0, 2).map((order) => (
            <View key={order.id} style={styles.activeOrderCard}>
              <View style={styles.activeOrderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                </View>
                <View style={styles.orderStatus}>
                  <View style={[styles.statusDot, { backgroundColor: order.status === 'picking_up' ? '#FF9500' : '#007AFF' }]} />
                  <Text style={styles.statusText}>
                    {order.status === 'picking_up' ? 'Picking up' : 'Delivering'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <View style={styles.orderDetailItem}>
                  <MapPin size={14} color="#999" />
                  <Text style={styles.orderDetailText}>{order.deliveryAddress.address}</Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <DollarSign size={14} color="#999" />
                  <Text style={styles.orderDetailText}>${order.total.toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.activeOrderActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push(`/(driver)/orders?orderId=${order.id}`)}
                >
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => router.push(`/(driver)/map?orderId=${order.id}`)}
                >
                  <Navigation size={16} color="#fff" />
                  <Text style={styles.primaryActionButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(driver)/orders')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Truck size={24} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(driver)/map')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
              <MapPin size={24} color="#5CB338" />
            </View>
            <Text style={styles.quickActionText}>Map & Routes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4E6' }]}>
              <Clock size={24} color="#FFB800" />
            </View>
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
              <DollarSign size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickActionText}>Earnings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Performance</Text>
        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Completion Rate</Text>
            <Text style={styles.performanceValue}>100%</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Average Delivery Time</Text>
            <Text style={styles.performanceValue}>18 min</Text>
          </View>
          <View style={[styles.performanceRow, styles.performanceRowLast]}>
            <Text style={styles.performanceLabel}>Customer Rating</Text>
            <Text style={styles.performanceValue}>4.9 ⭐</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA'
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  driverName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2,
  },
  
  // Online Toggle
  onlineToggle: {
    alignItems: 'flex-end',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#E8F5E8',
  },
  toggleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#999',
  },
  toggleIndicatorActive: {
    backgroundColor: '#5CB338',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#5CB338',
  },
  
  // Active Order Banner
  activeOrderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5CB338',
  },
  viewOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewOrdersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5CB338',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  statCardPrimary: {
    width: '100%',
    backgroundColor: '#E8F5E8',
    borderColor: '#5CB338',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statSubValue: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  
  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Active Order Cards
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
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
    color: '#333',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  activeOrderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    flexDirection: 'row',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  
  // Performance Card
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceRowLast: {
    borderBottomWidth: 0,
  },
  performanceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  // Legacy styles for compatibility
  cardsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 12, 
    marginRight: 8, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  cardLabel: { 
    marginTop: 8, 
    color: '#6b7280' 
  },
  cardValue: { 
    marginTop: 6, 
    fontWeight: '700', 
    fontSize: 16 
  },
  row: { 
    padding: 12, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginBottom: 8 
  },
  rowText: { 
    fontWeight: '600' 
  },
  rowSub: { 
    color: '#6b7280', 
    marginTop: 4 
  }
})
