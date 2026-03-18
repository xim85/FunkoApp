import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function AddItemScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add item</Text>
      <Text>Manual item creation form (TODO)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }
})
