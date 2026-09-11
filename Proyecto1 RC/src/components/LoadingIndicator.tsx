import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../utils/theme';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Cargando...' }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  text: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
