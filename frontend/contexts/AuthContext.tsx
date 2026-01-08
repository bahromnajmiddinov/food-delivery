import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { User, UserRole, CartItem, DeliveryAddress } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    console.log('🔄 Loading user from storage...');
    try {
      const stored = await AsyncStorage.getItem('user');
      console.log('📦 Stored user data:', stored);
      if (stored) {
        const parsedUser = JSON.parse(stored);
        console.log('✅ User loaded:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('ℹ️ No user found in storage');
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error);
    } finally {
      console.log('✅ Loading complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    console.log('Sending OTP to:', phone);
    setPhoneNumber(phone);
    setOtpSent(true);
    return true;
  };

  const verifyOTP = async (otp: string, role: UserRole, name: string) => {
    console.log('Verifying OTP:', otp);
    
    const newUser: User = {
      id: Math.random().toString(),
      phone: phoneNumber,
      name,
      role,
      rating: 4.5,
    };

    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setOtpSent(false);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setPhoneNumber('');
    setOtpSent(false);
  };

  const updateRole = async (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    }
  };

  return {
    user,
    isLoading,
    phoneNumber,
    otpSent,
    sendOTP,
    verifyOTP,
    logout,
    updateRole,
  };
});

export const [CartContext, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [recentAddresses, setRecentAddresses] = useState<DeliveryAddress[]>([]);

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedAddresses');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
      const recent = await AsyncStorage.getItem('recentAddresses');
      if (recent) {
        setRecentAddresses(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const addItem = (item: CartItem) => {
    const existing = items.find(i => i.id === item.id);
    let newItems: CartItem[];
    
    if (existing) {
      newItems = items.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newItems = [...items, item];
    }
    
    setItems(newItems);
    saveCart(newItems);
  };

  const removeItem = (itemId: string) => {
    const newItems = items.filter(i => i.id !== itemId);
    setItems(newItems);
    saveCart(newItems);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const newItems = items.map(i => 
      i.id === itemId ? { ...i, quantity } : i
    );
    setItems(newItems);
    saveCart(newItems);
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
  };

  const addSavedAddress = async (address: DeliveryAddress) => {
    const exists = savedAddresses.find(a => a.id === address.id);
    if (exists) return;
    const newSaved = [...savedAddresses, address];
    setSavedAddresses(newSaved);
    try {
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(newSaved));
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const removeSavedAddress = async (addressId: string) => {
    const newSaved = savedAddresses.filter(a => a.id !== addressId);
    setSavedAddresses(newSaved);
    try {
      await AsyncStorage.setItem('savedAddresses', JSON.stringify(newSaved));
    } catch (error) {
      console.error('Failed to remove address:', error);
    }
  };

  const addRecentAddress = async (address: DeliveryAddress) => {
    const newRecent = [address, ...recentAddresses.filter(a => a.id !== address.id)].slice(0, 5);
    setRecentAddresses(newRecent);
    try {
      await AsyncStorage.setItem('recentAddresses', JSON.stringify(newRecent));
    } catch (error) {
      console.error('Failed to save recent address:', error);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    deliveryAddress,
    setDeliveryAddress,
    savedAddresses,
    recentAddresses,
    addSavedAddress,
    removeSavedAddress,
    addRecentAddress,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
  };
});
