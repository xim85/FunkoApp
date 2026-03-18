import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { auth } from '../services/firebase'
import { subscribeItemsByStatus } from '../services/itemsService'

export default function OwnedScreen() {
  const uid = auth.currentUser?.uid
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeItemsByStatus(uid, 'owned', setItems)
    return unsub
  }, [uid])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owned</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No items yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || '(No name)'}</Text>
            <Text style={styles.meta}>
              {item.franchiseOrSeries || '-'}{' '}
              {item.collectionNumber ? `#${item.collectionNumber}` : ''}
            </Text>
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
  name: { fontWeight: '700' },
  meta: { marginTop: 4, opacity: 0.8 }
})
