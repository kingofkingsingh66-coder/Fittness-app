import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { Pedometer } from 'expo-sensors';

import { getStepsForDay, setStepsForDay } from '../lib/store';
import { formatDay, startOfDay } from '../lib/utils';

export default function StepsScreen() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [nonce, setNonce] = useState(0);

  const todayKey = formatDay(Date.now());
  const todaySteps = useMemo(() => getStepsForDay(todayKey), [nonce, todayKey]);

  useEffect(() => {
    (async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setAvailable(isAvailable);
      if (!isAvailable) return;
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      const start = new Date(startOfDay(Date.now()));
      const end = new Date();
      const result = await Pedometer.getStepCountAsync(start, end);
      setStepsForDay(todayKey, result.steps ?? 0);
      setNonce((x) => x + 1);
    } catch (e: any) {
      Alert.alert('Steps error', String(e?.message ?? e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Steps</Text>
      <Text style={styles.sub}>Today</Text>
      <Text style={styles.metric}>{todaySteps.toLocaleString()}</Text>
      <Text style={styles.sub}>steps</Text>

      <View style={{ marginTop: 18 }}>
        <Button title="Refresh from sensor" onPress={refresh} disabled={available === false} />
      </View>

      {available === false ? (
        <Text style={styles.hint}>Pedometer is not available on this device.</Text>
      ) : (
        <Text style={styles.hint}>Note: steps require motion/fitness permission on iOS.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa' },
  title: { fontSize: 28, fontWeight: '800' },
  metric: { fontSize: 52, fontWeight: '900', marginTop: 10 },
  sub: { marginTop: 6, color: '#444', fontWeight: '700' },
  hint: { marginTop: 14, color: '#666' },
});

