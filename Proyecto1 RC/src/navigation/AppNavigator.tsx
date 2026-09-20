import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { useAuth } from './AuthContext';
import LoginScreen from '../views/LoginScreen';
import HomeScreen from '../views/HomeScreen';
import ProductCatalogScreen from '../views/ProductCatalogScreen';
import ProductDetailScreen from '../views/ProductDetailScreen';
import ProductEditScreen from '../views/ProductEditScreen';
import LoadingIndicator from '../components/LoadingIndicator';
import { Colors } from '../utils/theme';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Catalogo: undefined;
  DetalleProducto: { productId: number };
  EditarProducto: { productId: number };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const { usuario, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <LoadingIndicator message="Verificando sesión..." />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {usuario ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
          <AppStack.Screen
            name="Catalogo"
            component={ProductCatalogScreen}
            options={{
              headerShown: true,
              headerTitle: 'Catálogo',
              headerBackTitle: 'Volver',
            }}
          />
          <AppStack.Screen
            name="DetalleProducto"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              headerTitle: 'Detalle del producto',
              headerBackTitle: 'Volver',
            }}
          />
          <AppStack.Screen
            name="EditarProducto"
            component={ProductEditScreen}
            options={{
              headerShown: true,
              headerTitle: 'Editar producto',
              headerBackTitle: 'Volver',
            }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
