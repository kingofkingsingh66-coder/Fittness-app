import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { addFoodEntry, deleteFoodEntry, listFoodEntriesForDay } from '../lib/store';
import { searchCached, searchOpenFoodFacts } from '../lib/foodApi';
import type { FoodSearchItem } from '../lib/types';

export default function NutritionScreen() {
  const today = Date.now();
  const [nonce, setNonce] = useState(0);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<FoodSearchItem[]>([]);
  const [busy, setBusy] = useState(false);

  const entries = useMemo(() => listFoodEntriesForDay(today), [nonce]);
  const total = entries.reduce((s, e) => s + (e.calories ?? 0), 0);

  async function search() {
    const query = q.trim();
    if (!query) return;
    setBusy(true);
    try {
      const cached = searchCached(query);
      setResults(cached);
      const online = await searchOpenFoodFacts(query);
      setResults(online);
    } catch (e: any) {
      Alert.alert('Search failed', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  function add(item: FoodSearchItem) {
    // Simple: add 100g serving
    const cals = item.calories_100g ?? 0;
    addFoodEntry({
      eaten_at: Date.now(),
      meal: null,
      food_name: item.name,
      calories: cals,
      protein_g: item.protein_100g,
      carbs_g: item.carbs_100g,
      fat_g: item.fat_100g,
      serving_text: '100g',
    });
    setNonce((x) => x + 1);
  }

  function removeEntry(id: number) {
    deleteFoodEntry(id);
    setNonce((x) => x + 1);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.sub}>Today: {Math.round(total)} kcal</Text>

      <View style={styles.searchRow}>
        <TextInput style={styles.input} placeholder="Search foods…" value={q} onChangeText={setQ} />
        <Button title={busy ? '…' : 'Search'} onPress={search} disabled={busy} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <Pressable style={styles.resultRow} onPress={() => add(item)}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.kcal}>{Math.round(item.calories_100g ?? 0)} kcal / 100g</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.hint}>Search to add foods (data comes from Open Food Facts).</Text>}
      />

      <Text style={styles.section}>Today’s log</Text>
      <FlatList
        data={entries}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.entryRow} onLongPress={() => removeEntry(item.id)}>
            <Text style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>
              {item.food_name}
            </Text>
            <Text style={{ fontWeight: '700' }}>{Math.round(item.calories)} kcal</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.hint}>No food entries yet.</Text>}
      />
      <Text style={styles.hint}>Tip: long-press an entry to delete.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa' },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 6, color: '#444', fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 12, backgroundColor: '#fff' },
  resultRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontWeight: '700' },
  kcal: { color: '#666', marginTop: 2 },
  section: { marginTop: 12, fontWeight: '800' },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  hint: { marginTop: 10, color: '#666' },
});

