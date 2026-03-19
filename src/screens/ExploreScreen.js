import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { subscribePublicUsers } from '../services/exploreService'
import { auth } from '../services/firebase'

export default function ExploreScreen() {
  const currentUid = auth.currentUser?.uid
  const [users, setUsers] = useState([])

  useEffect(() => {
    const unsub = subscribePublicUsers(setUsers)
    return unsub
  }, [])

  // Optional: hide yourself from the explore list
  const visibleUsers = users.filter((u) => u.uid !== currentUid)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <FlatList
        data={visibleUsers}
        keyExtractor={(u) => u.uid}
        ListEmptyComponent={
          <Text style={styles.empty}>No public users found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.displayName || 'User'}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  empty: { opacity: 0.7, marginTop: 12 },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 10
  },
  name: { fontWeight: '700' }
})
