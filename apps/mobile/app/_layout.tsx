import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  useEffect(() => {
    console.log('[civicpulse] root layout mounted');
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#073b4c' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#f5f7f8' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'CivicPulse' }} />
        <Stack.Screen name="explore/index" options={{ title: 'Jhotwara Civic Explorer' }} />
        <Stack.Screen name="explore/map" options={{ title: 'Jhotwara map' }} />
        <Stack.Screen name="ward/[id]" options={{ title: 'Ward information' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  console.error('[civicpulse] root error boundary', error);
  return (
    <View style={styles.error}>
      <Text style={styles.errorTitle}>CivicPulse startup error</Text>
      <Text selectable style={styles.errorText}>
        {error.message || String(error)}
      </Text>
      <Text style={styles.errorHint}>Take a screenshot of this message and share it here.</Text>
      <Pressable style={styles.retry} onPress={retry}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: '#fff5f5' },
  errorTitle: { fontSize: 24, fontWeight: '800', color: '#7f1d1d' },
  errorText: { fontFamily: 'monospace', color: '#450a0a', lineHeight: 20 },
  errorHint: { color: '#7f1d1d' },
  retry: { backgroundColor: '#7f1d1d', borderRadius: 10, padding: 14, alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: '800' },
});
