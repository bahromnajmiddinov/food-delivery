import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, Star, Clock, Bell, Settings } from 'lucide-react-native';
import { mockRestaurants } from '@/mocks/restaurants';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const categories = [
    { id: '1', name: 'Restaurants', emoji: '🍔' },
    { id: '2', name: 'Shops', emoji: '🛒' },
    { id: '3', name: 'Offers', emoji: '🎉' },
  ];

  const promoCards = [
    {
      id: '1',
      title: 'For all your friends',
      subtitle: 'up to -40%',
      restaurant: 'Embassy',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      color: '#FFE5B4',
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity }]} />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.addressContainer}>
              <TouchableOpacity style={styles.addressButton}>
                <Text style={styles.addressLabel}>My address</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressText}>Current location</Text>
                  <ChevronDown size={16} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/(customer)/notifications')}
            >
              <Bell size={24} color="#1A1A1A" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/(customer)/settings')}
            >
              <Settings size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {promoCards.map((promo) => (
          <TouchableOpacity key={promo.id} style={styles.promoCard}>
            <View style={[styles.promoContent, { backgroundColor: promo.color }]}>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <View style={styles.promoSubtitleRow}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{promo.restaurant}</Text>
                  </View>
                  <Text style={styles.promoDiscount}>{promo.subtitle}</Text>
                </View>
              </View>
              <Image source={{ uri: promo.image }} style={styles.promoImage} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantList}
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
                        {restaurant.tags[0]}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Worth Trying</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>All</Text>
            </TouchableOpacity>
          </View>

          {mockRestaurants.slice(0, 2).map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.featuredCard}
              onPress={() => router.push(`/restaurant-detail?id=${restaurant.id}` as any)}
            >
              <Image
                source={{ uri: restaurant.image }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredBadge}>
                  <Star size={14} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.featuredRating}>{restaurant.rating}</Text>
                </View>
              </View>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName}>{restaurant.name}</Text>
                <View style={styles.featuredMeta}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.featuredMetaText}>{restaurant.deliveryTime}</Text>
                </View>
                {restaurant.tags.length > 0 && (
                  <View style={styles.featuredTagContainer}>
                    <Text style={styles.featuredTag}>{restaurant.tags[0]}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#FFFFFF',
    zIndex: 0,
  },
  safeArea: {
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addressContainer: {
    flex: 1,
  },
  addressButton: {
    gap: 2,
  },
  addressLabel: {
    fontSize: 12,
    color: '#999',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7ED321',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  promoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  promoContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
    gap: 12,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  promoSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoDiscount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  promoImage: {
    width: 120,
    height: 100,
    borderRadius: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED321',
  },
  restaurantList: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 16,
  },
  restaurantCard: {
    width: 200,
    marginRight: 12,
  },
  restaurantImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 200,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  restaurantBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
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
    gap: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantMetaText: {
    fontSize: 13,
    color: '#999',
  },
  tagContainer: {
    marginTop: 4,
  },
  tag: {
    fontSize: 12,
    color: '#7ED321',
    fontWeight: '600',
  },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  featuredOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  featuredInfo: {
    padding: 16,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  featuredMetaText: {
    fontSize: 14,
    color: '#666',
  },
  featuredTagContainer: {
    backgroundColor: '#F0FBE3',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7ED321',
  },
});
