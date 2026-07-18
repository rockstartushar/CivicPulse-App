import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
export function CameraCapture({ onCapture }: { onCapture: (uri: string) => void }) {
  const ref = useRef<CameraView>(null); const [open, setOpen] = useState(false); const [permission, requestPermission] = useCameraPermissions();
  const show = async () => { if (!permission?.granted) { const result = await requestPermission(); if (!result.granted) return; } setOpen(true); };
  return <><Pressable style={styles.button} onPress={show}><Text>Take issue photo</Text></Pressable><Modal visible={open} animationType="slide"><View style={styles.full}><CameraView ref={ref} style={styles.camera} facing="back" /><Pressable style={styles.capture} onPress={async () => { const photo = await ref.current?.takePictureAsync({ quality: 0.85, exif: false }); if (photo) { onCapture(photo.uri); setOpen(false); } }}><Text style={styles.captureText}>Capture</Text></Pressable><Pressable style={styles.cancel} onPress={() => setOpen(false)}><Text>Cancel</Text></Pressable></View></Modal></>;
}
const styles=StyleSheet.create({button:{alignSelf:'flex-start',padding:10},full:{flex:1,backgroundColor:'#000'},camera:{flex:1},capture:{margin:20,backgroundColor:'#fff',padding:18,borderRadius:30,alignItems:'center'},captureText:{fontWeight:'700'},cancel:{alignItems:'center',paddingBottom:30},});
