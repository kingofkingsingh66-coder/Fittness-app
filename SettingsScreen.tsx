import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { isPremiumUnlocked } from '../lib/store';

export default function SettingsScreen() {
  const [premium] = useState(isPremiumUnlocked());
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sub}>Premium: {premium ? 'Yes' : 'No'}</Text>
      <View style={{ marginTop: 14 }}>
        <Button title="(Coming soon) Export data" onPress={() => {}} disabled={!premium} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#fafafa' },
  title: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 10, color: '#444', fontWeight: '700' },
});

