import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

import { isPremiumUnlocked, setPremiumUnlocked } from '../lib/store';

export default function PremiumScreen({
  onStartPurchase,
  onRestorePurchase,
}: {
  onStartPurchase: () => Promise<void>;
  onRestorePurchase: () => Promise<void>;
}) {
  const [unlocked, setUnlocked] = useState(isPremiumUnlocked());

  useEffect(() => {
    setUnlocked(isPremiumUnlocked());
  }, []);

  async function buy() {
    try {
      await onStartPurchase();
      setUnlocked(isPremiumUnlocked());
    } catch (e: any) {
      Alert.alert('Purchase failed', String(e?.message ?? e));
    }
  }

  async function restore() {
    try {
      await onRestorePurchase();
      const nowUnlocked = isPremiumUnlocked();
      setUnlocked(nowUnlocked);
      Alert.alert('Restore complete', nowUnlocked ? 'Premium is active.' : 'No purchases found yet.');
    } catch (e: any) {
      Alert.alert('Restore failed', String(e?.message ?? e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium</Text>
      <Text style={styles.sub}>{unlocked ? 'Premium is unlocked.' : 'Unlock premium features.'}</Text>

      <View style={styles.card}>
        <Text style={styles.li}>• Advanced workout analytics</Text>
        <Text style={styles.li}>• Export data (CSV)</Text>
        <Text style={styles.li}>• More templates & insights</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Button title={unlocked ? 'Purchased' : 'Buy (one-time)'} onPress={buy} disabled={unlocked} />
        <Button title="Restore purchase" onPress={restore} />
        <Button title="(Dev) Toggle premium" onPress={() => (setPremiumUnlocked(!unlocked), setUnlocked(!unlocked))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa', gap: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { color: '#444', fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, backgroundColor: '#fff', padding: 14, gap: 6 },
  li: { fontWeight: '700' },
});
