import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { addWorkoutSet, createWorkout, deleteWorkout, finishWorkout, listWorkoutSets, listWorkouts } from '../lib/store';

export default function WorkoutsScreen() {
  const [nonce, setNonce] = useState(0);
  const [newTitle, setNewTitle] = useState('');

  const workouts = useMemo(() => listWorkouts(), [nonce]);

  function addWorkout() {
    const t = newTitle.trim();
    if (!t) return;
    createWorkout(t);
    setNewTitle('');
    setNonce((x) => x + 1);
  }

  function removeWorkout(id: number) {
    Alert.alert('Delete workout?', 'This will delete all sets in it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteWorkout(id);
          setNonce((x) => x + 1);
        },
      },
    ]);
  }

  function addQuickSet(workoutId: number) {
    addWorkoutSet(workoutId, { exercise: 'Bench Press', reps: 10, weight: 40, seconds: null });
    setNonce((x) => x + 1);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="New workout title…"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <Button title="Add" onPress={addWorkout} />
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => {
          const sets = listWorkoutSets(item.id);
          return (
            <Pressable style={styles.card} onLongPress={() => removeWorkout(item.id)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.sub}>{sets.length} sets</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <Button title="Add sample set" onPress={() => addQuickSet(item.id)} />
                <Button title="Finish" onPress={() => (finishWorkout(item.id), setNonce((x) => x + 1))} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.hint}>Add your first workout.</Text>}
      />

      <Text style={styles.hint}>Tip: long-press a workout to delete.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa' },
  title: { fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 12, backgroundColor: '#fff' },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, backgroundColor: '#fff', padding: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  sub: { marginTop: 4, color: '#666' },
  hint: { marginTop: 10, color: '#666' },
});

