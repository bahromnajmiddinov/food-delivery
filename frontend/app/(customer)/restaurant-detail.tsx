import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, X, ShoppingCart } from 'lucide-react-native';
import { mockRestaurants, mockMenuItems } from '@/mocks/restaurants';
import { mockReviews } from '@/mocks/reviews';
import { mockOrders } from '@/mocks/orders';
import { useDriver } from '@/contexts/DriverContext';
import { useCart } from '@/contexts/AuthContext';
import { MenuItem } from '@/types';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addItem, itemCount } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const restaurant = mockRestaurants.find(r => r.id === id);
  const menuItems = mockMenuItems.filter(item => item.restaurantId === id);
  
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (selectedItem) {
      addItem({ ...selectedItem, quantity });
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  // Try to find an active order for this restaurant to show ETA
  const activeOrder = mockOrders.find(o => o.restaurantId === id && ['preparing', 'picking_up', 'delivering'].includes(o.status));
  const driverCtx = useDriver();
  const estimateETA = driverCtx?.estimateETA;
  const eta = activeOrder && estimateETA ? estimateETA(activeOrder.deliveryAddress.coordinates, activeOrder.preparationTime || 0) : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
          <SafeAreaView edges={['top']} style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.restaurantHeader}>
            <View style={styles.restaurantTitleRow}>
              <Image source={{ uri: restaurant.logo }} style={styles.logo} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.metaRow}>
                  <Star size={16} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.rating}>{restaurant.rating}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Clock size={16} color="#999" />
                  <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <MapPin size={16} color="#999" />
                  <Text style={styles.metaText}>{restaurant.distance}</Text>
                </View>
              </View>
            </View>

            {restaurant.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {restaurant.tags.map((tag, index) => (
                  <View key={index} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuSection}>
            {eta && eta.minutes !== null && (
              <View style={styles.etaContainer}>
                <Text style={styles.etaText}>Driver ETA: {eta.minutes} min</Text>
                <Text style={styles.etaSubText}>{eta.distanceKm} km away</Text>
              </View>
            )}
            <Text style={styles.sectionTitle}>Menu</Text>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => setSelectedItem(item)}
              >
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setSelectedItem(item)}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews ({mockReviews.length})</Text>
            {mockReviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.userName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.userName}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color={i < review.rating ? '#FFB800' : '#E0E0E0'}
                          fill={i < review.rating ? '#FFB800' : '#E0E0E0'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {itemCount > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <ShoppingCart size={24} color="#FFFFFF" />
          <Text style={styles.cartButtonText}>View Cart</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <X size={24} color="#1A1A1A" />
            </TouchableOpacity>

            {selectedItem && (
              <>
                <Image 
                  source={{ uri: selectedItem.image }} 
                  style={styles.modalImage} 
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedItem.description}
                  </Text>
                  <Text style={styles.modalPrice}>
                    ${selectedItem.price.toFixed(2)}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Quantity</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus size={20} color="#1A1A1A" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                      >
                        <Plus size={20} color="#1A1A1A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.addToCartButton}
                    onPress={handleAddToCart}
                  >
                    <Text style={styles.addToCartButtonText}>
                      Add to Cart - ${(selectedItem.price * quantity).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F0F0F0',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  restaurantHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  metaSeparator: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  metaText: {
    fontSize: 14,
    color: '#999',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#F0FBE3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7ED321',
  },
  categoriesScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  categoryChipActive: {
    backgroundColor: '#7ED321',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 12,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7ED321',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  reviewsSection: {
    padding: 20,
    paddingTop: 0,
  },
  reviewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#7ED321',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  cartBadge: {
    position: 'absolute',
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  etaContainer: {
    padding: 12,
    backgroundColor: '#F0F8F3',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  etaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  etaSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F0F0F0',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7ED321',
    marginBottom: 24,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#7ED321',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
