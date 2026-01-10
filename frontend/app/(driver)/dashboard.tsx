import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import {
  MapPin,
  Truck,
  Clock,
  Star,
  DollarSign,
  Navigation,
  ArrowRight,
  Award,
  Target,
  Flame,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react-native'
import { mockOrders } from '@/mocks/orders'

export default function DriverDashboard() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const activeOrders = mockOrders.filter(o =>
    ['picking_up', 'delivering'].includes(o.status)
  )
  const completedOrders = mockOrders.filter(o => o.status === 'delivered')
  const todayEarnings = completedOrders.reduce(
    (total, order) => total + order.deliveryFee,
    0
  )

  // Calculate weekly earnings (more realistic mock)
  const weeklyEarnings = todayEarnings * 6.5 + 85000

  const stats = {
    todayDeliveries: completedOrders.length,
    weeklyDeliveries: 47,
    todayEarnings,
    weeklyEarnings,
    rating: 4.8,
    acceptanceRate: 98,
    onTimeRate: 99,
    avgDeliveryTime: 18,
    totalDistance: 23.4
  }

  // Achievements system
  const achievements = [
    { id: 'streak', icon: Flame, label: '7 Day Streak', value: '7', color: '#FF6B35' },
    { id: 'rating', icon: Star, label: 'Top Rated', value: '4.8+', color: '#FFB800' },
    { id: 'speed', icon: Zap, label: 'Speed Demon', value: 'Fast', color: '#007AFF' },
    { id: 'reliability', icon: Target, label: 'Reliable', value: '99%', color: '#5CB338' }
  ]

  // Weekly performance data
  const weeklyPerformance = [
    { day: 'Mon', earnings: 125000, deliveries: 8 },
    { day: 'Tue', earnings: 145000, deliveries: 9 },
    { day: 'Wed', earnings: 98000, deliveries: 6 },
    { day: 'Thu', earnings: 167000, deliveries: 11 },
    { day: 'Fri', earnings: 189000, deliveries: 13 },
    { day: 'Sat', earnings: 223000, deliveries: 15 },
    { day: 'Sun', earnings: 156000, deliveries: 10 }
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.driverName}>Alex Driver</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.achievementButton}
              onPress={() => router.push('/(driver)/achievements')}
            >
              <Award width={20} height={20} color="#FFB800" />
            </TouchableOpacity>
            <View style={styles.onlineToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, isOnline && styles.toggleButtonActive]}
                onPress={() => setIsOnline(!isOnline)}
              >
                <View
                  style={[styles.toggleIndicator, isOnline && styles.toggleIndicatorActive]}
                />
              </TouchableOpacity>
              <Text style={[styles.toggleText, isOnline && styles.toggleTextActive]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
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

      {/* Achievements Bar */}
      <View style={styles.achievementsSection}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}15` }]}>
              <achievement.icon size={16} color={achievement.color} />
            </View>
            <Text style={styles.achievementLabel}>{achievement.value}</Text>
          </View>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statHeader}>
            <DollarSign size={24} color="#5CB338" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Today&apos;s Earnings</Text>
              <Text style={styles.statTrend}>
                <TrendingUp size={12} color="#5CB338" />
                <Text style={styles.trendText}>+12%</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>${todayEarnings.toFixed(2)}</Text>
          <Text style={styles.statSubValue}>+${(todayEarnings * 0.12).toFixed(2)} from tips</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Truck size={24} color="#007AFF" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Deliveries</Text>
              <Text style={styles.statTrend}>
                <TrendingUp size={12} color="#5CB338" />
                <Text style={styles.trendText}>+5</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
          <Text style={styles.statSubValue}>This week: {stats.weeklyDeliveries}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Star size={24} color="#FFB800" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statTrend}>
                <CheckCircle size={12} color="#5CB338" />
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.rating}</Text>
          <Text style={styles.statSubValue}>{stats.acceptanceRate}% acceptance</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <MapPin size={24} color="#FF6B35" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statTrend}>
                <TrendingDown size={12} color="#007AFF" />
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.totalDistance} km</Text>
          <Text style={styles.statSubValue}>This week: 156.8 km</Text>
        </View>
      </View>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/orders')}>
              <Text style={styles.sectionAction}>View all ({activeOrders.length})</Text>
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
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: order.status === 'picking_up' ? '#FF9500' : '#007AFF'
                      }
                    ]}
                  />
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
                  <Clock size={14} color="#999" />
                  <Text style={styles.orderDetailText}>ETA: {order.estimatedDeliveryTime}</Text>
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
            <Text style={styles.quickActionSub}>{activeOrders.length} active</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(driver)/map')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
              <MapPin size={24} color="#5CB338" />
            </View>
            <Text style={styles.quickActionText}>Map & Routes</Text>
            <Text style={styles.quickActionSub}>Open navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(driver)/schedule')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4E6' }]}>
              <Calendar size={24} color="#FF9500" />
            </View>
            <Text style={styles.quickActionText}>Schedule</Text>
            <Text style={styles.quickActionSub}>Manage shifts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(driver)/earnings')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
              <DollarSign size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickActionText}>Earnings</Text>
            <Text style={styles.quickActionSub}>View reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Performance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week&apos;s Performance</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Completion Rate</Text>
            <View style={styles.performanceValueWrapper}>
              <Text style={styles.performanceValue}>100%</Text>
              <CheckCircle size={16} color="#5CB338" />
            </View>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Average Delivery Time</Text>
            <Text style={styles.performanceValue}>{stats.avgDeliveryTime} min</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>On-Time Rate</Text>
            <View style={styles.performanceValueWrapper}>
              <Text style={styles.performanceValue}>{stats.onTimeRate}%</Text>
              <CheckCircle size={16} color="#5CB338" />
            </View>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Customer Rating</Text>
            <View style={styles.performanceValueWrapper}>
              <Text style={styles.performanceValue}>{stats.rating} ⭐</Text>
              <TrendingUp size={16} color="#5CB338" />
            </View>
          </View>
          <View style={[styles.performanceRow, styles.performanceRowLast]}>
            <Text style={styles.performanceLabel}>Weekly Earnings</Text>
            <View style={styles.performanceValueWrapper}>
              <Text style={styles.performanceValue}>${weeklyEarnings.toFixed(2)}</Text>
              <TrendingUp size={16} color="#5CB338" />
            </View>
          </View>
        </View>
      </View>

      {/* Earnings Trend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings Trend</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>This Week</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trendCard}>
          {weeklyPerformance.map((day, index) => {
            const maxEarnings = Math.max(...weeklyPerformance.map(d => d.earnings))
            const heightPercentage = (day.earnings / maxEarnings) * 100
            return (
              <View key={day.day} style={styles.trendColumn}>
                <Text style={styles.trendValue}>${(day.earnings / 1000).toFixed(0)}k</Text>
                <View style={styles.trendBarWrapper}>
                  <View style={[styles.trendBar, { height: `${heightPercentage}%` }]} />
                </View>
                <Text style={styles.trendLabel}>{day.day}</Text>
              </View>
            )
          })}
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
    borderBottomColor: '#F0F0F0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  greeting: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500'
  },
  driverName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  achievementButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineToggle: {
    alignItems: 'flex-end'
  },
  toggleButton: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    padding: 3,
    justifyContent: 'center'
  },
  toggleButtonActive: {
    backgroundColor: '#E8F5E8'
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#999'
  },
  toggleIndicatorActive: {
    backgroundColor: '#5CB338',
    marginLeft: 'auto'
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 4
  },
  toggleTextActive: {
    color: '#5CB338'
  },

  // Active Order Banner
  activeOrderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5CB338'
  },
  viewOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewOrdersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5CB338'
  },

  // Achievements Section
  achievementsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  achievementItem: {
    alignItems: 'center'
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  achievementLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666'
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20
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
    borderColor: '#F5F5F5'
  },
  statCardPrimary: {
    width: '100%',
    backgroundColor: '#E8F5E8',
    borderColor: '#5CB338'
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  statHeaderText: {
    flex: 1
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600'
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5CB338'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4
  },
  statSubValue: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500'
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
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
    borderColor: '#F5F5F5'
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  orderInfo: {
    flex: 1
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  orderDetails: {
    marginBottom: 16
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  activeOrderActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center'
  },
  primaryActionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    flexDirection: 'row',
    gap: 6
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
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
    elevation: 2
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2
  },
  quickActionSub: {
    fontSize: 11,
    color: '#999'
  },

  // Performance Card
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  performanceRowLast: {
    borderBottomWidth: 0
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  performanceValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  performanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A'
  },

  // Trend Card
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center'
  },
  trendValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6
  },
  trendBarWrapper: {
    width: 24,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  trendBar: {
    width: '100%',
    backgroundColor: '#5CB338',
    borderRadius: 4
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666'
  }
})
