import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../components/ErrorMessage';
import PrimaryButton from '../components/PrimaryButton';
import { ROLES } from '../model/Rol';
import { useAuth } from '../navigation/AuthContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { usuario, signOut } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setFormError(null);
    setLoading(true);
    try {
      await signOut();
    } catch {
      setFormError('No se pudo cerrar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const seccionPorRol = () => {
    if (usuario?.rol === ROLES.ADMINISTRADOR) {
      return 'Acceso de administrador: gestión de catálogo y usuarios.';
    }
    if (usuario?.rol === ROLES.AUDITOR) {
      return 'Acceso de auditor: revisión de reportes y trazabilidad.';
    }
    return 'Acceso de cliente: exploración de productos.';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>APP1INICIO_CIERRE</Text>
          <Text style={styles.welcome} testID="home-welcome">
            Bienvenido, {usuario?.nombre ?? ''}
          </Text>
          <Text style={styles.email}>{usuario?.email ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText} testID="home-role">
              Rol: {usuario?.rol ?? ''}
            </Text>
          </View>
          <Text style={styles.roleSection}>{seccionPorRol()}</Text>

          <ErrorMessage message={formError} />

          <View style={styles.actions}>
            <PrimaryButton
              testID="home-catalog-button"
              title="Ver catálogo"
              onPress={() => navigation.navigate('Catalog')}
            />
            <PrimaryButton
              testID="catalog-button"
              title="Ver catálogo actualizado"
              onPress={() => navigation.navigate('Catalogo')}
            />
            <PrimaryButton
              testID="logout-button"
              title="Cerrar sesión"
              onPress={handleLogout}
              loading={loading}
              variant="ghost"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.md,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  roleSection: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
});
