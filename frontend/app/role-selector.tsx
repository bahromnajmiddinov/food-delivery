import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { UserRole } from '@/types';
import { ShoppingBag, Bike, UtensilsCrossed } from 'lucide-react-native';

export default function RoleSelectorScreen() {
  const { verifyOTP } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [scaleAnims] = useState({
    customer: new Animated.Value(1),
    driver: new Animated.Value(1),
    restaurant: new Animated.Value(1),
  });

  const roles: { type: UserRole; icon: any; title: string; description: string }[] = [
    {
      type: 'customer',
      icon: ShoppingBag,
      title: 'Customer',
      description: 'Order food from restaurants',
    },
    {
      type: 'driver',
      icon: Bike,
      title: 'Delivery Driver',
      description: 'Deliver orders to customers',
    },
    {
      type: 'restaurant',
      icon: UtensilsCrossed,
      title: 'Restaurant',
      description: 'Manage kitchen and orders',
    },
  ];

  const handleRolePress = (role: UserRole) => {
    setSelectedRole(role);
    
    Animated.sequence([
      Animated.timing(scaleAnims[role], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[role], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (name.trim()) {
      await verifyOTP('123456', selectedRole, name);
      
      if (selectedRole === 'customer') {
        router.replace('/(customer)/home');
      } else if (selectedRole === 'driver') {
        router.replace('/(driver)/map');
      } else if (selectedRole === 'restaurant') {
        router.replace('/(restaurant)/kitchen');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>Select how you want to use the app</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.type;
            
            return (
              <Animated.View
                key={role.type}
                style={{ transform: [{ scale: scaleAnims[role.type] }] }}
              >
                <TouchableOpacity
                  style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                  onPress={() => handleRolePress(role.type)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && styles.iconContainerSelected,
                    ]}
                  >
                    <Icon
                      size={32}
                      color={isSelected ? '#7ED321' : '#666'}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
                    {role.title}
                  </Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  rolesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    backgroundColor: '#F0FBE3',
    borderColor: '#7ED321',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#FFFFFF',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: '#7ED321',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7ED321',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7ED321',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
