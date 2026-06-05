import React, { useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import MotivationCorner from '../components/MotivationCorner';
import { getTodaySteps, listFoodEntriesForDay, listMotivations, listWorkouts } from '../lib/store';

export default function HomeScreen({
  onOpenMotivation,
  onOpenPremium,
  onOpenWorkouts,
  onOpenNutrition,
  onOpenSteps,
  onOpenRun,
  onOpenSettings,
}: {
  onOpenMotivation: () => void;
  onOpenPremium: () => void;
  onOpenWorkouts: () => void;
  onOpenNutrition: () => void;
  onOpenSteps: () => void;
  onOpenRun: () => void;
  onOpenSettings: () => void;
}) {
  // Simple "refresh" mechanism without global state mgmt
  const [nonce, setNonce] = useState(0);

  const today = Date.now();
  const steps = useMemo(() => getTodaySteps(), [nonce]);
  const foods = useMemo(() => listFoodEntriesForDay(today), [nonce]);
  const workouts = useMemo(() => listWorkouts().slice(0, 1), [nonce]);
  const motivations = useMemo(() => listMotivations(), [nonce]);
  const pickedMotivation = motivations.length ? motivations[nonce % motivations.length] : null;

  const caloriesToday = foods.reduce((sum, f) => sum + (f.calories ?? 0), 0);

  return (
    <View style={styles.container}>
      <MotivationCorner item={pickedMotivation} onPress={onOpenMotivation} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.metric}>{steps.toLocaleString()} steps</Text>
        <Text style={styles.sub}>{Math.round(caloriesToday)} calories eaten</Text>
        <Text style={styles.sub}>
          Last workout: {workouts[0] ? workouts[0].title : 'None yet'}
        </Text>
      </View>

      <View style={styles.row}>
        <Button title="Refresh" onPress={() => setNonce((x) => x + 1)} />
        <Button title="Premium" onPress={onOpenPremium} />
      </View>

      <View style={styles.grid}>
        <Button title="Workouts" onPress={onOpenWorkouts} />
        <Button title="Nutrition" onPress={onOpenNutrition} />
        <Button title="Steps" onPress={onOpenSteps} />
        <Button title="Run" onPress={onOpenRun} />
        <Button title="Settings" onPress={onOpenSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, gap: 14, backgroundColor: '#fafafa' },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  metric: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 6, color: '#444', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { gap: 10, marginTop: 8 },
});
