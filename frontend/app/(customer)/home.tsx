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
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, Star, Clock, Bell, Settings, MapPin, Plus, Navigation } from 'lucide-react-native';
import { useAuth, useCart } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { DeliveryAddress, Restaurant } from '@/types';
import { useRestaurants, usePopularRestaurants } from '@/hooks/useApi';

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const { deliveryAddress, setDeliveryAddress, savedAddresses, recentAddresses, addRecentAddress } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // API Data
  const { data: restaurantsData, isLoading: isLoadingRestaurants, error: restaurantsError } = useRestaurants();
  const { data: popularRestaurantsData, isLoading: isLoadingPopular, error: popularError } = usePopularRestaurants();
  
  // Extract restaurants from API response
  const restaurants = restaurantsData?.results || [];
  const popularRestaurants = popularRestaurantsData?.results || [];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address: DeliveryAddress = {
        id: 'current-' + Date.now(),
        label: 'Current Location',
        address: 'Using current location',
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      setDeliveryAddress(address);
      await addRecentAddress(address);
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
    addRecentAddress(address);
    setShowAddressModal(false);
  };

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
               <TouchableOpacity style={styles.addressButton} onPress={() => setShowAddressModal(true)}>
                 <Text style={styles.addressLabel}>My address</Text>
                 <View style={styles.addressRow}>
                   <Text style={styles.addressText} numberOfLines={1}>
                     {deliveryAddress?.address || 'Current location'}
                   </Text>
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
        {promoCards.map((promo) => {
          const restaurant = mockRestaurants.find(r => r.name === promo.restaurant);
          return (
            <TouchableOpacity 
              key={promo.id} 
              style={styles.promoCard}
              onPress={() => restaurant && router.push(`/restaurant-detail?id=${restaurant.id}` as any)}
            >
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
          );
        })}

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => {
                // Navigate to search with category filter
                if (category.name === 'Restaurants') {
                  router.push('/(customer)/restaurant-detail?id=' + mockRestaurants[0].id as any);
                } else if (category.name === 'Shops') {
                  // For shops, show a message or navigate to a shops page
                  console.log('Shops category selected');
                } else if (category.name === 'Offers') {
                  // For offers, could navigate to offers page
                  console.log('Offers category selected');
                }
              }}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular restaurants</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/restaurant-list' as any)}>
              <Text style={styles.seeAll}>All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
           horizontal
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={styles.restaurantList}
          >
           {restaurants.map((restaurant: Restaurant) => (
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
                      {restaurant.delivery_time}
                    </Text>
                  </View>
                  {restaurant.tags && restaurant.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      <Text style={styles.tag} numberOfLines={1}>
                        {restaurant.tags[0].name}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worth Trying</Text>

          {popularRestaurants.slice(0, 2).map((restaurant: Restaurant) => (
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
                  <Text style={styles.featuredMetaText}>{restaurant.delivery_time}</Text>
                </View>
                {restaurant.tags && restaurant.tags.length > 0 && (
                  <View style={styles.featuredTagContainer}>
                    <Text style={styles.featuredTag}>{restaurant.tags[0].name}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          </View>

          {/* Loading indicator */}
          {(isLoadingRestaurants || isLoadingPopular) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7ED321" />
              <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
          )}

          {/* Error handling */}
          {(restaurantsError || popularError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load restaurants</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  // Retry logic would go here
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          </Animated.ScrollView>

          {/* Address Selection Modal */}
          <Modal
          visible={showAddressModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddressModal(false)}
          >
          <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddressModal(false)}
          >
          <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
           <TouchableOpacity activeOpacity={1}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Select Delivery Address</Text>
               <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                 <Text style={styles.modalClose}>✕</Text>
               </TouchableOpacity>
             </View>

             <ScrollView style={styles.modalContent}>
               {/* Current Location Option */}
               <TouchableOpacity
                 style={[
                   styles.addressOption,
                   deliveryAddress?.label === 'Current Location' && styles.addressOptionActive,
                 ]}
                 onPress={getCurrentLocation}
                 disabled={loadingLocation}
               >
                 <View style={styles.addressOptionLeft}>
                   <View style={styles.addressIcon}>
                     <Navigation size={20} color={loadingLocation ? '#999' : '#7ED321'} />
                   </View>
                   <View style={styles.addressOptionText}>
                     <Text style={styles.addressOptionLabel}>Use Current Location</Text>
                     <Text style={styles.addressOptionSubtext}>
                       {loadingLocation ? 'Getting location...' : 'Enable location access'}
                     </Text>
                   </View>
                 </View>
                 {deliveryAddress?.label === 'Current Location' && (
                   <View style={styles.selectedIndicator}>
                     <View style={styles.selectedDot} />
                   </View>
                 )}
               </TouchableOpacity>

               {/* Saved Addresses */}
               {savedAddresses.length > 0 && (
                 <View style={styles.addressSection}>
                   <Text style={styles.addressSectionTitle}>Saved Addresses</Text>
                   {savedAddresses.map((address) => (
                     <TouchableOpacity
                       key={address.id}
                       style={[
                         styles.addressOption,
                         deliveryAddress?.id === address.id && styles.addressOptionActive,
                       ]}
                       onPress={() => handleAddressSelect(address)}
                     >
                       <View style={styles.addressOptionLeft}>
                         <View style={styles.addressIcon}>
                           <MapPin size={20} color={deliveryAddress?.id === address.id ? '#7ED321' : '#666'} />
                         </View>
                         <View style={styles.addressOptionText}>
                           <Text style={styles.addressOptionLabel}>{address.label}</Text>
                           <Text style={styles.addressOptionSubtext} numberOfLines={1}>
                             {address.address}
                           </Text>
                         </View>
                       </View>
                       {deliveryAddress?.id === address.id && (
                         <View style={styles.selectedIndicator}>
                           <View style={styles.selectedDot} />
                         </View>
                       )}
                     </TouchableOpacity>
                   ))}
                 </View>
               )}

               {/* Recent Addresses */}
               {recentAddresses.length > 0 && (
                 <View style={styles.addressSection}>
                   <Text style={styles.addressSectionTitle}>Recent Addresses</Text>
                   {recentAddresses.map((address) => (
                     <TouchableOpacity
                       key={address.id}
                       style={[
                         styles.addressOption,
                         deliveryAddress?.id === address.id && styles.addressOptionActive,
                       ]}
                       onPress={() => handleAddressSelect(address)}
                     >
                       <View style={styles.addressOptionLeft}>
                         <View style={styles.addressIcon}>
                           <MapPin size={20} color={deliveryAddress?.id === address.id ? '#7ED321' : '#666'} />
                         </View>
                         <View style={styles.addressOptionText}>
                           <Text style={styles.addressOptionLabel}>{address.label}</Text>
                           <Text style={styles.addressOptionSubtext} numberOfLines={1}>
                             {address.address}
                           </Text>
                         </View>
                       </View>
                       {deliveryAddress?.id === address.id && (
                         <View style={styles.selectedIndicator}>
                           <View style={styles.selectedDot} />
                         </View>
                       )}
                     </TouchableOpacity>
                   ))}
                 </View>
               )}

               {/* Add New Address */}
               <TouchableOpacity
                 style={styles.addNewAddressButton}
                 onPress={() => {
                   setShowAddressModal(false);
                   router.push('/(customer)/map-select');
                 }}
               >
                 <Plus size={20} color="#7ED321" />
                 <Text style={styles.addNewAddressText}>Add New Address on Map</Text>
               </TouchableOpacity>
             </ScrollView>
           </TouchableOpacity>
          </SafeAreaView>
          </TouchableOpacity>
          </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalContent: {
    padding: 20,
  },
  addressSection: {
    marginBottom: 24,
  },
  addressSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginBottom: 12,
  },
  addressOptionActive: {
    backgroundColor: '#F0FBE3',
    borderWidth: 2,
    borderColor: '#7ED321',
  },
  addressOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressOptionText: {
    flex: 1,
  },
  addressOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  addressOptionSubtext: {
    fontSize: 13,
    color: '#666',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F0FBE3',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7ED321',
    borderStyle: 'dashed',
  },
  addNewAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#7ED321',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  });
