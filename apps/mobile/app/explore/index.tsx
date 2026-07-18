import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { jhotwara } from '@/src/data/jhotwara';

export default function ExploreJhotwara() {
  return <View style={styles.container}>
    <Text style={styles.eyebrow}>CIVIC EXPLORER</Text>
    <Text style={styles.title}>Explore your constituency</Text>
    <Text style={styles.copy}>View verified public information about wards, civic tenders and construction work. No account is needed.</Text>
    <View style={styles.selection}><Selector label="State" value={jhotwara.state} /><Selector label="City" value={jhotwara.city} /><Selector label="Constituency" value={`${jhotwara.constituency} (AC-${jhotwara.assemblyNumber})`} /></View>
    <Link href="./map" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Explore Jhotwara</Text></Pressable></Link>
    <Text style={styles.note}>For this first release, Rajasthan, Jaipur and Jhotwara are fixed. More locations will be added only with reviewed public data.</Text>
  </View>;
}
function Selector({ label, value }: { label: string; value: string }) { return <View style={styles.selector}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ container:{flex:1,padding:24,justifyContent:'center',gap:16},eyebrow:{color:'#0b6e69',fontWeight:'800',letterSpacing:1},title:{fontSize:31,fontWeight:'800',color:'#073b4c'},copy:{fontSize:16,lineHeight:23,color:'#405258'},selection:{gap:10,marginVertical:8},selector:{borderWidth:1,borderColor:'#c8d4d6',backgroundColor:'#fff',borderRadius:12,padding:14},label:{fontSize:12,fontWeight:'700',color:'#52616b'},value:{fontSize:17,fontWeight:'700',color:'#073b4c',marginTop:3},primary:{backgroundColor:'#0b6e69',borderRadius:12,padding:17,alignItems:'center'},primaryText:{color:'#fff',fontSize:16,fontWeight:'800'},note:{color:'#52616b',fontSize:13,lineHeight:19} });
