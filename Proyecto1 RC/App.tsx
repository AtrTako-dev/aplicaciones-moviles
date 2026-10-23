import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/navigation/AuthContext';
import { CartProvider } from './src/navigation/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* US10: el carrito comparte estado entre catálogo, detalle y carrito. */}
        <CartProvider>
          <AppNavigator />
        </CartProvider>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
