import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Clock, Star, ChevronLeft } from 'lucide-react-native';
import { mockRestaurants } from '@/mocks/restaurants';
import { router } from 'expo-router';

export default function RestaurantListScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurants</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.restaurantCard}
            onPress={() => router.push(`/restaurant-detail?id=${restaurant.id}` as any)}
          >
            <View style={styles.restaurantImageContainer}>
              <Image
                source={{ uri: restaurant.image }}
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantBadge}>
                <Star size={12} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
            </View>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.restaurantMeta}>
                <Clock size={14} color="#999" />
                <Text style={styles.restaurantMetaText}>
                  {restaurant.deliveryTime}
                </Text>
              </View>
              {restaurant.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  <Text style={styles.tag} numberOfLines={1}>
                    {restaurant.tags.join(' • ')}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImageContainer: {
    position: 'relative',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  restaurantMetaText: {
    fontSize: 14,
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
});