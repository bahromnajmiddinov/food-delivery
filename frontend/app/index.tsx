import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  console.log('🏠 Index page - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('⏳ Still loading user data...');
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7ED321" />
      </View>
    );
  }

  if (!user) {
    console.log('🚪 No user, redirecting to /login');
    return <Redirect href="/login" />;
  }

  if (user.role === 'customer') {
    console.log('🛒 Customer detected, redirecting to /(customer)/home');
    return <Redirect href="/(customer)/home" />;
  }

  if (user.role === 'driver') {
    console.log('🚗 Driver detected, redirecting to /(driver)/map');
    return <Redirect href="/(driver)/map" />;
  }

  if (user.role === 'kitchen_staff') {
    console.log('🍳 Kitchen staff detected, redirecting to /(kitchen)/kitchen');
    return <Redirect href="/(kitchen)/kitchen" />;
  }

  console.log('⚠️ Unknown state, redirecting to /login');
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
