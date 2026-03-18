import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput
} from 'react-native'
import { auth } from '../services/firebase'
import { subscribeItemsByStatus } from '../services/itemsService'

export default function OwnedScreen({ navigation }) {
  const uid = auth.currentUser?.uid
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeItemsByStatus(uid, 'owned', setItems)
    return unsub
  }, [uid])

  const q = search.trim().toLowerCase()

  const filteredItems = items.filter((it) => {
    if (!q) return true

    const name = (it.name ?? '').toLowerCase()
    const series = (it.franchiseOrSeries ?? '').toLowerCase()

    return name.includes(q) || series.includes(q)
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owned</Text>
      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddItem', { initialStatus: 'owned' })
        }
      >
        <Text style={styles.addButtonText}>Add item</Text>
      </Pressable>

      <TextInput
        style={styles.search}
        placeholder='Search by name or series...'
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {items.length === 0 ? 'No items yet.' : 'No results.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('EditItem', { item })}
          >
            <Text style={styles.name}>{item.name || '(No name)'}</Text>
            <Text style={styles.meta}>
              {item.franchiseOrSeries || '-'}{' '}
              {item.collectionNumber ? `#${item.collectionNumber}` : ''}
            </Text>
          </Pressable>
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
  addButton: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  addButtonText: { color: 'white', fontWeight: '700' },
  search: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  }
})
