import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../utils/theme';

interface ErrorMessageProps {
  message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.container} testID="errorMessage">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  text: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
