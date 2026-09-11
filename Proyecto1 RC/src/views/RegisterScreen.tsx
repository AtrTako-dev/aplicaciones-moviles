import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../components/ErrorMessage';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { registerController } from '../config/AppContainer';
import type { AuthStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleRegister = async () => {
    setFormError(null);
    const input = { name, email, password, confirmPassword };
    const errors = registerController.validate(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      const result = await registerController.register(input);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      Alert.alert(
        'Cuenta creada',
        'Tu cuenta se creó correctamente. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch {
      setFormError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>VOZ URBANA</Text>
            <Text style={styles.subtitle}>Crear cuenta</Text>
          </View>

          <InputField
            testID="register-name"
            label="Nombre"
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearFieldError('name');
            }}
            placeholder="Tu nombre"
            autoCapitalize="words"
            returnKeyType="next"
            error={fieldErrors.name || null}
          />

          <InputField
            testID="register-email"
            label="Correo electrónico"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearFieldError('email');
            }}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            error={fieldErrors.email || null}
          />

          <InputField
            testID="register-password"
            label="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearFieldError('password');
            }}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            returnKeyType="next"
            error={fieldErrors.password || null}
          />

          <InputField
            testID="register-confirm-password"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearFieldError('confirmPassword');
            }}
            placeholder="Repite tu contraseña"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={fieldErrors.confirmPassword || null}
          />

          <ErrorMessage message={formError} />

          <PrimaryButton
            testID="register-submit"
            title="Registrarse"
            onPress={handleRegister}
            loading={loading}
          />

          <PrimaryButton
            testID="register-back-login"
            title="Regresar al Login"
            onPress={handleBackToLogin}
            variant="ghost"
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