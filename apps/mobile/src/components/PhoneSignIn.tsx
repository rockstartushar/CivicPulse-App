import { Pressable, StyleSheet, Text, View } from 'react-native';

// Kept deliberately free of Firebase native modules so local demo builds work in Expo Go.
// Production OTP will be enabled in the Firebase/development-build release configuration.
export function PhoneSignIn({ onDemo }: { onDemo?: () => void }) {
  const demo = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  return <View style={styles.container}><Text style={styles.title}>CivicPulse</Text>{demo ? <><Text style={styles.copy}>Local demonstration mode does not use phone authentication.</Text><Pressable style={styles.button} onPress={onDemo}><Text style={styles.buttonText}>Enter local demo</Text></Pressable></> : <><Text style={styles.copy}>Phone sign-in is unavailable until Firebase is configured in a development build.</Text></>}</View>;
}
const styles=StyleSheet.create({container:{flex:1,padding:24,justifyContent:'center',gap:14},title:{fontSize:34,fontWeight:'700',color:'#073b4c'},copy:{fontSize:16,lineHeight:24,color:'#344'},button:{backgroundColor:'#0b6e69',padding:16,borderRadius:10,alignItems:'center'},buttonText:{color:'#fff',fontWeight:'700'}});
