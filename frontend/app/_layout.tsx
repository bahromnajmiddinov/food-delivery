import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext, CartContext, useAuth } from "@/contexts/AuthContext";
import { DriverContext } from '@/contexts/DriverContext';
import { ActivityIndicator, View, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading, user } = useAuth();

  console.log('🗺️ RootLayoutNav - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    console.log('⏳ RootLayoutNav: Showing loading screen');
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7ED321" />
      </View>
    );
  }

  console.log('✅ RootLayoutNav: Loading complete, rendering Stack');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="role-selector" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(restaurant)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    console.log('🚀 App started, hiding splash screen');
    SplashScreen.hideAsync();
  }, []);

  console.log('📱 RootLayout rendering');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <CartContext>
          <DriverContext>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </DriverContext>
        </CartContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
