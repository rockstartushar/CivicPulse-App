import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { jhotwara, wards } from '@/src/data/jhotwara';

export default function JhotwaraMap() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.mapPreview}>
        <Text style={styles.mapTitle}>Jhotwara civic map</Text>
        <Text style={styles.mapCopy}>
          Ward boundaries will appear here after the official GIS boundary file is verified and imported.
        </Text>
        <Text style={styles.mapStatus}>OFFLINE EXPLORER · NO LOGIN REQUIRED</Text>
      </View>
      <Text style={styles.title}>Jhotwara ward directory</Text>
      <Text style={styles.note}>Select a ward to view source-backed public information.</Text>
      <View style={styles.grid}>
        {wards.map((ward) => (
          <Link key={ward.id} href={{ pathname: '/ward/[id]', params: { id: ward.id } }} asChild>
            <View style={styles.ward}>
              <Text style={styles.wardLabel}>WARD</Text>
              <Text style={styles.wardNumber}>{ward.number}</Text>
            </View>
          </Link>
        ))}
      </View>
      <Text style={styles.source}>Constituency source: {jhotwara.sourceLabel}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 10 },
  mapPreview: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: '#dceeed',
    padding: 22,
    justifyContent: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderColor: '#acd0cc',
  },
  mapTitle: { fontSize: 26, fontWeight: '800', color: '#073b4c' },
  mapCopy: { color: '#405258', lineHeight: 20 },
  mapStatus: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#0b6e69' },
  title: { fontSize: 21, fontWeight: '800', color: '#073b4c', marginTop: 4 },
  note: { fontSize: 13, lineHeight: 19, color: '#52616b' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ward: { width: 92, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c8d4d6', borderRadius: 12, padding: 13 },
  wardLabel: { fontSize: 10, color: '#52616b', fontWeight: '700' },
  wardNumber: { fontSize: 26, fontWeight: '800', color: '#0b6e69' },
  source: { fontSize: 12, color: '#52616b', marginTop: 4 },
});
