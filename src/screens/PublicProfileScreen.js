import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function PublicProfileScreen({ route }) {
  const user = route?.params?.user

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.displayName || 'Public profile'}</Text>
      <Text style={styles.meta}>UID: {user?.uid}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: '700' },
  meta: { opacity: 0.7 }
})
