import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import {
  UtensilsCrossed,
  List,
  DollarSign,
  TrendingDown,
  Award,
  Target,
  CheckCircle,
  Calendar,
  Flame,
  Zap,
  Star,
  ArrowRight,
  Package
} from 'lucide-react-native'
import orders from '../../mocks/orders'

export default function RestaurantDashboard() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)

  const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing')

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const stats = {
    pendingOrders: pending.length,
    ordersToday: 34,
    todayIncome: 1200000,
    weeklyIncome: 8500000,
    avgPrepTime: 12,
    onTimeRate: 97,
    rating: 4.7
  }

  // Achievements system
  const achievements = [
    { id: 'streak', icon: Flame, label: '7 Day Streak', value: '7', color: '#FF6B35' },
    { id: 'rating', icon: Star, label: 'Top Rated', value: '4.7+', color: '#FFB800' },
    { id: 'speed', icon: Zap, label: 'Fast Prep', value: '12m', color: '#007AFF' },
    { id: 'quality', icon: Target, label: 'Quality', value: '97%', color: '#9C27B0' }
  ]

  // Weekly performance data
  const weeklyPerformance = [
    { day: 'Mon', orders: 45, income: 1650000 },
    { day: 'Tue', orders: 52, income: 1900000 },
    { day: 'Wed', orders: 38, income: 1380000 },
    { day: 'Thu', orders: 61, income: 2230000 },
    { day: 'Fri', orders: 72, income: 2630000 },
    { day: 'Sat', orders: 85, income: 3100000 },
    { day: 'Sun', orders: 68, income: 2480000 }
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.restaurantName}>Kitchen Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.achievementButton}
              onPress={() => router.push('/(kitchen)/achievements')}
            >
              <Award width={20} height={20} color="#9C27B0" />
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

        {isOnline && pending.length > 0 && (
          <View style={styles.activeOrderBanner}>
            <View style={styles.bannerLeft}>
              <Package size={20} color="#FF6B35" />
              <Text style={styles.bannerText}>
                {pending.length} Pending Order{pending.length > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewOrdersBtn}
              onPress={() => router.push('/(kitchen)/orders')}
            >
              <Text style={styles.viewOrdersText}>View</Text>
              <ArrowRight size={16} color="#FF6B35" />
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
              <Text style={styles.statLabel}>Today&apos;s Income</Text>
              <Text style={styles.statTrend}>
                <TrendingDown size={12} color="#5CB338" />
                <Text style={styles.trendText}>+8%</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>
            {(stats.todayIncome / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.statSubValue}>UZS</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <List size={24} color="#FF6B35" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statTrend}>
                <Target size={12} color="#5CB338" />
                <Text style={styles.trendText}>+5</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.ordersToday}</Text>
          <Text style={styles.statSubValue}>This week: {stats.ordersToday * 6}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <List size={24} color="#007AFF" />
            <View style={styles.statHeaderText}>
              <Text style={styles.statLabel}>Avg Prep Time</Text>
              <Text style={styles.statTrend}>
                <TrendingDown size={12} color="#007AFF" />
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.avgPrepTime}m</Text>
          <Text style={styles.statSubValue}>Target: 15m</Text>
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
          <Text style={styles.statSubValue}>{stats.onTimeRate}% on-time</Text>
        </View>
      </View>

      {/* Pending Orders */}
      {pending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(kitchen)/orders')}>
              <Text style={styles.sectionAction}>View all ({pending.length})</Text>
            </TouchableOpacity>
          </View>

          {pending.slice(0, 3).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                </View>
                <View style={styles.orderStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          order.status === 'pending' ? '#FF6B35' : '#007AFF'
                      }
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {order.status === 'pending' ? 'Pending' : 'Preparing'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.orderDetailItem}>
                  <List size={14} color="#999" />
                  <Text style={styles.orderDetailText}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <List size={14} color="#999" />
                  <Text style={styles.orderDetailText}>
                    Prep time: {order.preparationTime || 15} min
                  </Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <DollarSign size={14} color="#999" />
                  <Text style={styles.orderDetailText}>${order.total.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/(kitchen)/orders/${order.id}`)}
                >
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryActionButton]}
                  onPress={() => router.push(`/(kitchen)/kitchen?orderId=${order.id}`)}
                >
                  <Text style={styles.primaryActionButtonText}>Start Preparing</Text>
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
          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(kitchen)/kitchen')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
              <UtensilsCrossed size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickActionText}>Kitchen View</Text>
            <Text style={styles.quickActionSub}>{pending.length} pending</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(kitchen)/orders')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4E6' }]}>
              <List size={24} color="#FF6B35" />
            </View>
            <Text style={styles.quickActionText}>All Orders</Text>
            <Text style={styles.quickActionSub}>View history</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(kitchen)/menu')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
              <Package size={24} color="#5CB338" />
            </View>
            <Text style={styles.quickActionText}>Menu</Text>
            <Text style={styles.quickActionSub}>Manage items</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(kitchen)/reports')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Calendar size={24} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Reports</Text>
            <Text style={styles.quickActionSub}>View analytics</Text>
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
            <Text style={styles.performanceLabel}>Average Prep Time</Text>
            <Text style={styles.performanceValue}>{stats.avgPrepTime} min</Text>
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
              <CheckCircle size={16} color="#5CB338" />
            </View>
          </View>
          <View style={[styles.performanceRow, styles.performanceRowLast]}>
            <Text style={styles.performanceLabel}>Weekly Income</Text>
            <View style={styles.performanceValueWrapper}>
              <Text style={styles.performanceValue}>{(stats.weeklyIncome / 1000000).toFixed(1)}M</Text>
              <CheckCircle size={16} color="#5CB338" />
            </View>
          </View>
        </View>
      </View>

      {/* Orders Trend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Orders Trend</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>This Week</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trendCard}>
          {weeklyPerformance.map((day) => {
            const maxOrders = Math.max(...weeklyPerformance.map(d => d.orders))
            const heightPercentage = (day.orders / maxOrders) * 100
            return (
              <View key={day.day} style={styles.trendColumn}>
                <Text style={styles.trendValue}>{day.orders}</Text>
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

  // Header
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
  restaurantName: {
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
    backgroundColor: '#F3E5F5',
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
    backgroundColor: '#FFF4E6',
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
    color: '#FF6B35'
  },
  viewOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewOrdersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35'
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

  // Order Cards
  orderCard: {
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
  orderHeader: {
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
  customerName: {
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
  orderActions: {
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
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35'
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
    backgroundColor: '#FF6B35',
    borderRadius: 4
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666'
  }
})
