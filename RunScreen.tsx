import React, { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { addRunPoint, createRun, finishRun, listRuns, updateRunSummary } from '../lib/store';
import { haversineKm } from '../lib/utils';

export default function RunScreen() {
  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [startTs, setStartTs] = useState<number | null>(null);
  const lastPoint = useRef<{ lat: number; lon: number } | null>(null);

  async function start() {
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (!fg.granted) {
        Alert.alert('Permission needed', 'Location permission is required to track runs.');
        return;
      }

      const run = createRun();
      setRunId(run.id);
      setStartTs(run.started_at);
      setDistanceKm(0);
      lastPoint.current = null;
      setRunning(true);

      watchSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
        (pos) => {
          const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          const ts = Date.now();
          addRunPoint(run.id, { ts, lat: p.lat, lon: p.lon, accuracy: pos.coords.accuracy ?? null });
          if (lastPoint.current) {
            const d = haversineKm(lastPoint.current, p);
            if (d < 0.2) setDistanceKm((x) => x + d); // ignore obvious GPS jumps
          }
          lastPoint.current = p;
        }
      );
    } catch (e: any) {
      Alert.alert('Run error', String(e?.message ?? e));
      setRunning(false);
    }
  }

  async function stop() {
    try {
      watchSub.current?.remove();
      watchSub.current = null;
      setRunning(false);

      if (runId && startTs) {
        const durationS = Math.max(0, Math.round((Date.now() - startTs) / 1000));
        updateRunSummary(runId, distanceKm, durationS);
        finishRun(runId);
      }
      setRunId(null);
      setStartTs(null);
      lastPoint.current = null;
    } catch (e: any) {
      Alert.alert('Stop error', String(e?.message ?? e));
    }
  }

  const durationS = startTs ? Math.round((Date.now() - startTs) / 1000) : 0;
  const pace = distanceKm > 0 ? durationS / 60 / distanceKm : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run</Text>

      <View style={styles.card}>
        <Text style={styles.metric}>{distanceKm.toFixed(2)} km</Text>
        <Text style={styles.sub}>Duration: {Math.floor(durationS / 60)}m {durationS % 60}s</Text>
        <Text style={styles.sub}>Pace: {pace ? pace.toFixed(1) : '—'} min/km</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Start" onPress={start} disabled={running} />
        <Button title="Stop" onPress={stop} disabled={!running} />
      </View>

      <Text style={styles.hint}>Past runs: {listRuns().length}</Text>
      <Text style={styles.hint}>Tip: For best accuracy, keep GPS on and avoid indoor tracking.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa', gap: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, backgroundColor: '#fff', padding: 14 },
  metric: { fontSize: 44, fontWeight: '900' },
  sub: { marginTop: 6, color: '#444', fontWeight: '700' },
  hint: { color: '#666', marginTop: 10 },
});

