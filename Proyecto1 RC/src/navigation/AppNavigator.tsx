import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { useAuth } from './AuthContext';
import LoginScreen from '../views/LoginScreen';
import HomeScreen from '../views/HomeScreen';
import LoadingIndicator from '../components/LoadingIndicator';
import { Colors } from '../utils/theme';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
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
