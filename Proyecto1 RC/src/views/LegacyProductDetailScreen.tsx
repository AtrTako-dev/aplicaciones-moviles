import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'ProductDetail'>;

export default function LegacyProductDetailScreen({ route }: Props) {
  const { producto } = route.params;

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: producto.image }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.category} testID="detail-category">
        {producto.category}
      </Text>
      <Text style={styles.title} testID="detail-title">
        {producto.title}
      </Text>
      <Text style={styles.price} testID="detail-price">
        ${producto.price.toFixed(2)}
      </Text>
      <Text style={styles.description} testID="detail-description">
        {producto.description}
      </Text>
      {producto.rating ? (
        <Text style={styles.rating} testID="detail-rating">
          Calificación: {producto.rating.rate} ({producto.rating.count} reseñas)
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
  },
  imageContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  image: {
    width: 240,
    height: 240,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
