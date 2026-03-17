import React from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { auth } from '../services/firebase'
import { logout } from '../services/authService'

export default function ProfileScreen() {
  const user = auth.currentUser

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      Alert.alert('Error', String(e.message || e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Signed in as:</Text>
      <Text style={styles.value}>{user?.email ?? '-'}</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  label: { opacity: 0.7 },
  value: { fontWeight: '700' },
  button: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: { color: 'white', fontWeight: '700' }
})
