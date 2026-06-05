import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Motivation } from '../lib/types';

export default function MotivationCorner({
  item,
  onPress,
}: {
  item: Motivation | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      {item?.image_uri ? <Image source={{ uri: item.image_uri }} style={styles.img} /> : <View style={styles.img} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Motivation</Text>
        <Text numberOfLines={2} style={styles.quote}>
          {item?.quote ?? 'Tap to add a quote + photo'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
  },
  img: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f2f2f2' },
  title: { fontSize: 12, color: '#666', fontWeight: '700' },
  quote: { fontSize: 14, fontWeight: '600' },
});

