import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert, Switch } from 'react-native'
import { auth } from '../services/firebase'
import { logout } from '../services/authService'
import {
  subscribeToUserProfile,
  updateUserProfile
} from '../services/usersService'

export default function ProfileScreen() {
  // Current authenticated user (Firebase Auth)
  const user = auth.currentUser

  // Safe access to the uid (avoids crashes if user is temporarily null/undefined)
  const uid = user?.uid

  // Local state that mirrors the Firestore profile document (users/{uid})
  const [profile, setProfile] = useState(null)

  // Subscribe to the Firestore user profile in real time
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToUserProfile(uid, setProfile)
    return unsub
  }, [uid])

  // Sign out the current user
  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      Alert.alert('Error', String(e.message || e))
    }
  }

  // Update one visibility flag and persist it immediately to Firestore
  const setVisibility = async (key, value) => {
    if (!uid) return

    // Use current visibility values or a safe default object
    const current = profile?.visibility ?? {
      owned: false,
      duplicates: false,
      wishlist: false
    }

    // Build the next visibility object (immutable update)
    const nextVisibility = { ...current, [key]: value }

    try {
      // updateUserProfile also recalculates hasPublicProfile when visibility is provided
      await updateUserProfile(uid, { visibility: nextVisibility })
    } catch (e) {
      Alert.alert('Error', String(e.message || e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Signed in as:</Text>
      <Text style={styles.value}>{user?.email ?? '-'}</Text>

      <Text style={styles.sectionTitle}>Public visibility</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Owned</Text>
        <Switch
          // Force boolean to avoid undefined warnings
          value={!!profile?.visibility?.owned}
          onValueChange={(v) => setVisibility('owned', v)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Duplicates</Text>
        <Switch
          value={!!profile?.visibility?.duplicates}
          onValueChange={(v) => setVisibility('duplicates', v)}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Wishlist</Text>
        <Switch
          value={!!profile?.visibility?.wishlist}
          onValueChange={(v) => setVisibility('wishlist', v)}
        />
      </View>

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

  sectionTitle: { marginTop: 12, fontWeight: '700', fontSize: 16 },
  row: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowLabel: { fontWeight: '600' },

  button: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: { color: 'white', fontWeight: '700' }
})
