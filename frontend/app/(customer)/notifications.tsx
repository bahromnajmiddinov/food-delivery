import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Bell, Package, Tag, AlertCircle } from 'lucide-react-native';
import { mockNotifications } from '@/mocks/notifications';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package size={20} color="#7ED321" />;
      case 'delivery':
        return <Bell size={20} color="#FF9500" />;
      case 'promotion':
        return <Tag size={20} color="#FF3B30" />;
      case 'system':
        return <AlertCircle size={20} color="#007AFF" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>Mark all</Text>
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={{ width: 24 }} />}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {unreadCount > 0 && (
          <View style={styles.unreadSection}>
            <Text style={styles.sectionTitle}>New ({unreadCount})</Text>
            {notifications
              .filter(notif => !notif.read)
              .map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={styles.notificationCard}
                  onPress={() => {
                    handleMarkAsRead(notif.id);
                    if (notif.orderId) {
                      router.push('/(customer)/orders');
                    }
                  }}
                >
                  <View style={[styles.iconContainer, !notif.read && styles.iconContainerUnread]}>
                    {getIcon(notif.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                    <Text style={styles.notificationTime}>{getTimeAgo(notif.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {notifications.some(n => n.read) && (
          <View style={styles.readSection}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {notifications
              .filter(notif => notif.read)
              .map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notificationCard, styles.notificationCardRead]}
                  onPress={() => {
                    if (notif.orderId) {
                      router.push('/(customer)/orders');
                    }
                  }}
                >
                  <View style={styles.iconContainer}>
                    {getIcon(notif.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, styles.notificationTitleRead]}>
                      {notif.title}
                    </Text>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                    <Text style={styles.notificationTime}>{getTimeAgo(notif.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You&apos;re all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED321',
  },
  scrollView: {
    flex: 1,
  },
  unreadSection: {
    paddingTop: 20,
  },
  readSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 16,
  },
  notificationCardRead: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerUnread: {
    backgroundColor: '#F0FBE3',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  notificationTitleRead: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7ED321',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});
