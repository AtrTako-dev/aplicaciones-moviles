import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../components/ErrorMessage';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { authController } from '../config/AppContainer';
import { useAuth } from '../navigation/AuthContext';
import { ErrorAmigable } from '../services/ErrorAmigable';
import { Colors, Spacing } from '../utils/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const clearFieldError = (field: 'username' | 'password') => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleLogin = async () => {
    setFormError(null);
    const errors = authController.validate({ username, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      const usuario = await authController.login(username, password);
      signIn(usuario);
    } catch (error) {
      setFormError(
        error instanceof ErrorAmigable
          ? error.message
          : 'Ocurrió un error inesperado. Intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>APP1INICIO_CIERRE</Text>
            <Text style={styles.subtitle}>Iniciar sesión</Text>
          </View>

          <InputField
            testID="login-username"
            label="Usuario"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              clearFieldError('username');
            }}
            placeholder="Ingresa tu usuario"
            autoCapitalize="none"
            returnKeyType="next"
            error={fieldErrors.username || null}
          />

          <InputField
            testID="login-password"
            label="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearFieldError('password');
            }}
            placeholder="Tu contraseña"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={fieldErrors.password || null}
          />

          <ErrorMessage message={formError} />

          <PrimaryButton
            testID="login-submit"
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
