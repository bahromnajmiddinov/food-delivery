import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, MapPin, Wallet, CreditCard, StickyNote } from 'lucide-react-native';
import { useCart } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/types';

export default function CheckoutScreen() {
  const { items, total, deliveryAddress, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = 5.00;
  const finalTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      Alert.alert(
        'Order Placed!',
        `Your order has been placed successfully. Order total: $${finalTotal.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.replace('/(customer)/orders');
            },
          },
        ]
      );
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            {deliveryAddress ? (
              <TouchableOpacity 
                style={styles.addressCard}
                onPress={() => router.push('/(customer)/map-select')}
              >
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{deliveryAddress.label}</Text>
                  <Text style={styles.addressText}>{deliveryAddress.address}</Text>
                </View>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/(customer)/map-select')}
              >
                <Text style={styles.addButtonText}>+ Add Delivery Address</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet size={20} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <View style={styles.paymentIconContainer}>
                <Wallet size={24} color={paymentMethod === 'cash' ? '#7ED321' : '#666'} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[
                  styles.paymentTitle,
                  paymentMethod === 'cash' && styles.paymentTitleActive
                ]}>
                  Cash on Delivery
                </Text>
                <Text style={styles.paymentDescription}>Pay when you receive</Text>
              </View>
              <View style={[
                styles.radioButton,
                paymentMethod === 'cash' && styles.radioButtonActive
              ]}>
                {paymentMethod === 'cash' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <View style={styles.paymentIconContainer}>
                <CreditCard size={24} color={paymentMethod === 'card' ? '#7ED321' : '#666'} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[
                  styles.paymentTitle,
                  paymentMethod === 'card' && styles.paymentTitleActive
                ]}>
                  Online Payment
                </Text>
                <Text style={styles.paymentDescription}>Pay now with card</Text>
              </View>
              <View style={[
                styles.radioButton,
                paymentMethod === 'card' && styles.radioButtonActive
              ]}>
                {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StickyNote size={20} color="#1A1A1A" />
              <Text style={styles.sectionTitle}>Order Notes</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Add special instructions (e.g., ring doorbell, contactless delivery)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>${finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : `Place Order • $${finalTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addressCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED321',
  },
  addButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7ED321',
  },
  paymentOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    borderColor: '#7ED321',
    backgroundColor: '#F0FBE3',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  paymentTitleActive: {
    color: '#1A1A1A',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: '#7ED321',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7ED321',
  },
  notesInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 100,
  },
  summarySection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7ED321',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  placeOrderButton: {
    backgroundColor: '#7ED321',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
