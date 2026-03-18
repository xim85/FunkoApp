import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { auth } from '../services/firebase'
import { subscribeItemsByStatus } from '../services/itemsService'

export default function DuplicatesScreen() {
  const uid = auth.currentUser?.uid
  const [ownedItems, setOwnedItems] = useState([])

  // Load owned items in real time
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeItemsByStatus(uid, 'owned', setOwnedItems)
    return unsub
  }, [uid])

  // Build duplicate groups derived from owned items
  const duplicateGroups = useMemo(() => {
    const map = new Map()

    for (const item of ownedItems) {
      const name = (item.name ?? '').trim().toLowerCase()
      const series = (item.franchiseOrSeries ?? '').trim().toLowerCase()
      const number = (item.collectionNumber ?? '').trim().toLowerCase()

      // Composite key: name + series + collectionNumber
      const key = `${name}__${series}__${number}`

      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }

    // Keep only groups with 2+ items
    return Array.from(map.entries())
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({ key, items }))
  }, [ownedItems])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duplicates</Text>

      <FlatList
        data={duplicateGroups}
        keyExtractor={(g) => g.key}
        ListEmptyComponent={
          <Text style={styles.empty}>No duplicates found.</Text>
        }
        renderItem={({ item: group }) => {
          const first = group.items[0]
          return (
            <View style={styles.card}>
              <Text style={styles.name}>
                {first?.name || '(No name)'}{' '}
                {first?.collectionNumber ? `#${first.collectionNumber}` : ''}
              </Text>
              <Text style={styles.meta}>{first?.franchiseOrSeries || '-'}</Text>
              <Text style={styles.count}>Count: {group.items.length}</Text>
            </View>
          )
        }}
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
  meta: { marginTop: 4, opacity: 0.8 },
  count: { marginTop: 8, fontWeight: '700' }
})
