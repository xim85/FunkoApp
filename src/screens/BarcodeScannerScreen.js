import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

export default function BarcodeScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  if (!permission) return null

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera permission needed</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
      </View>
    )
  }

  const onBarcodeScanned = ({ data }) => {
    if (scanned) return
    setScanned(true)

    // Volver a AddItem con el barcode rellenado (merge evita perder lo escrito)
    navigation.navigate({
      name: 'AddItem',
      params: { barcode: String(data || '') },
      merge: true
    })
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
          // Puedes dejarlo vacío para "todos", pero así suele ir bien:
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code128',
            'code39',
            'qr'
          ]
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Point the camera at the barcode</Text>

        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>

          {scanned && (
            <Pressable style={styles.button} onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Scan again</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  overlayText: { color: 'white', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 10
  },
  title: { fontSize: 16, fontWeight: '700' },

  button: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  secondary: { backgroundColor: 'rgba(255,255,255,0.2)' },
  buttonText: { color: 'white', fontWeight: '700' }
})
