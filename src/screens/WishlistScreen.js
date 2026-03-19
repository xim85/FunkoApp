import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  TextInput
} from 'react-native'
import { auth } from '../services/firebase'
import { subscribeItemsByStatus, updateItem } from '../services/itemsService'

export default function WishlistScreen() {
  const uid = auth.currentUser?.uid
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState('newest') // 'newest' | 'name'

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeItemsByStatus(uid, 'wishlist', setItems)
    return unsub
  }, [uid])

  const confirmMoveToOwned = (item) => {
    Alert.alert('Move item', 'Mark this item as owned?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, move',
        style: 'default',
        onPress: async () => {
          try {
            if (!uid) return
            await updateItem(uid, item.id, { status: 'owned' })
            // No manual state update needed: snapshot listener will refresh the list
          } catch (e) {
            Alert.alert('Error', String(e.message || e))
          }
        }
      }
    ])
  }

  const q = search.trim().toLowerCase()

  const filteredItems = items.filter((it) => {
    if (!q) return true
    const name = (it.name ?? '').toLowerCase()
    const series = (it.franchiseOrSeries ?? '').toLowerCase()
    return name.includes(q) || series.includes(q)
  })

  const displayItems = [...filteredItems].sort((a, b) => {
    if (sortMode === 'name') {
      const an = (a.name ?? '').toLowerCase()
      const bn = (b.name ?? '').toLowerCase()
      return an.localeCompare(bn)
    }
    return 0
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>

      <TextInput
        style={styles.search}
        placeholder='Search by name or series...'
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sortRow}>
        <Pressable
          style={[
            styles.sortBtn,
            sortMode === 'newest' && styles.sortBtnActive
          ]}
          onPress={() => setSortMode('newest')}
        >
          <Text style={styles.sortText}>Newest</Text>
        </Pressable>

        <Pressable
          style={[styles.sortBtn, sortMode === 'name' && styles.sortBtnActive]}
          onPress={() => setSortMode('name')}
        >
          <Text style={styles.sortText}>Name</Text>
        </Pressable>
      </View>

      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {items.length === 0 ? 'No items in wishlist.' : 'No results.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || '(No name)'}</Text>
            <Text style={styles.meta}>
              {item.franchiseOrSeries || '-'}{' '}
              {item.collectionNumber ? `#${item.collectionNumber}` : ''}
            </Text>

            <Pressable
              style={styles.smallButton}
              onPress={() => confirmMoveToOwned(item)}
            >
              <Text style={styles.smallButtonText}>Mark as owned</Text>
            </Pressable>
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
  meta: { marginTop: 4, opacity: 0.8 },

  smallButton: {
    marginTop: 10,
    backgroundColor: '#0f6d5a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  smallButtonText: { color: 'white', fontWeight: '700' },
  search: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  sortRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  sortBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center'
  },
  sortBtnActive: { backgroundColor: '#0f6d5a' },
  sortText: { fontWeight: '700', color: 'white' }
})
