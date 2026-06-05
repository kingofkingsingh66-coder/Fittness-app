import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { addMotivation, deleteMotivation, listMotivations } from '../lib/store';

export default function MotivationScreen() {
  const [quote, setQuote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const items = useMemo(() => listMotivations(), [nonce]);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!res.canceled) setImageUri(res.assets[0]?.uri ?? null);
  }

  function save() {
    const q = quote.trim();
    if (!q) return;
    addMotivation(q, imageUri);
    setQuote('');
    setImageUri(null);
    setNonce((x) => x + 1);
  }

  function remove(id: number) {
    Alert.alert('Delete this?', 'Remove this motivation item.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMotivation(id);
          setNonce((x) => x + 1);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motivation</Text>

      <TextInput style={styles.input} placeholder="Write a quote…" value={quote} onChangeText={setQuote} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Pick photo" onPress={pickImage} />
        <Button title="Save" onPress={save} />
      </View>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

      <FlatList
        data={items}
        keyExtractor={(x) => String(x.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onLongPress={() => remove(item.id)}>
            {item.image_uri ? <Image source={{ uri: item.image_uri }} style={styles.thumb} /> : <View style={styles.thumb} />}
            <Text style={{ flex: 1, fontWeight: '600' }} numberOfLines={3}>
              {item.quote}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={{ color: '#666', marginTop: 14 }}>No items yet.</Text>}
      />

      <Text style={styles.hint}>Tip: long-press an item to delete.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 12, backgroundColor: '#fff', marginBottom: 10 },
  preview: { width: '100%', height: 180, borderRadius: 12, marginTop: 10, marginBottom: 10, backgroundColor: '#eee' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  thumb: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#eee' },
  hint: { marginTop: 10, color: '#777' },
});

