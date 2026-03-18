import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function EditItemScreen({ route }) {
  const item = route?.params?.item

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit item</Text>
      <Text>{item?.name ?? 'No item received'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }
})
