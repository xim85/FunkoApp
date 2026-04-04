import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Image
} from 'react-native'
import { auth } from '../services/firebase'
import {
  subscribeItemsByStatus,
  updateItem,
  addToWishlistFromDiscover
} from '../services/itemsService'
import {
  subscribePublicUsers,
  subscribePublicItemsByUser
} from '../services/exploreService'

export default function WishlistScreen({ navigation }) {
  const uid = auth.currentUser?.uid
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState('newest')
  const [discoverItems, setDiscoverItems] = useState([])

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeItemsByStatus(uid, 'wishlist', setItems)
    return unsub
  }, [uid])

  useEffect(() => {
    if (!uid) return

    // Get all public users first
    const unsub = subscribePublicUsers((users) => {
      // Filter out the current user
      const others = users.filter((u) => u.uid !== uid)
      if (others.length === 0) {
        setDiscoverItems([])
        return
      }

      // Subscribe to each user's public items
      const allItems = {}
      const unsubs = others.map((u) =>
        subscribePublicItemsByUser(u.uid, (items) => {
          allItems[u.uid] = items
          // Merge all items into a flat list
          setDiscoverItems(Object.values(allItems).flat())
        })
      )

      return () => unsubs.forEach((u) => u())
    })

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

  const handleAddToWishlist = async (item) => {
    try {
      await addToWishlistFromDiscover(uid, item)
      Alert.alert('Added!', `${item.name} added to your wishlist.`)
    } catch (e) {
      Alert.alert('Error', String(e.message || e))
    }
  }

  const q = search.trim().toLowerCase()

  const filteredDiscoverItems = discoverItems.filter((it) => {
    if (!q) return true
    const name = (it.name ?? '').toLowerCase()
    const series = (it.franchiseOrSeries ?? '').toLowerCase()
    return name.includes(q) || series.includes(q)
  })

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

      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddItem', { initialStatus: 'wishlist' })
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
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('EditItem', { item })}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.thumbnail}
                resizeMode='contain'
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.thumbnailPlaceholderText}>?</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.name || '(No name)'}</Text>
              <Text style={styles.meta}>
                {item.franchiseOrSeries || '-'}{' '}
                {item.collectionNumber ? `#${item.collectionNumber}` : ''}
              </Text>
              <Pressable
                style={styles.smallButton}
                onPress={(e) => {
                  e.stopPropagation?.()
                  confirmMoveToOwned(item)
                }}
              >
                <Text style={styles.smallButtonText}>Mark as owned</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          filteredDiscoverItems.length > 0 ? (
            <View>
              <Text style={styles.discoverTitle}>Discover</Text>
              <Text style={styles.discoverSubtitle}>From other collectors</Text>
              {filteredDiscoverItems.map((item) => (
                <View
                  key={`${item.ownerUid}-${item.id}`}
                  style={styles.discoverCard}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.thumbnail}
                      resizeMode='contain'
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={styles.thumbnailPlaceholderText}>?</Text>
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{item.name || '(No name)'}</Text>
                    <Text style={styles.meta}>
                      {item.franchiseOrSeries || '-'}{' '}
                      {item.collectionNumber ? `#${item.collectionNumber}` : ''}
                    </Text>
                    <Pressable
                      style={styles.smallButton}
                      onPress={() => handleAddToWishlist(item)}
                    >
                      <Text style={styles.smallButtonText}>
                        + Add to wishlist
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  empty: { opacity: 0.7, marginTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
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
  addButton: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700'
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
  sortText: { fontWeight: '700', color: 'white' },
  discoverTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 4
  },
  discoverSubtitle: {
    opacity: 0.5,
    marginBottom: 12,
    fontSize: 12
  },
  discoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)'
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnailPlaceholderText: { fontSize: 24, opacity: 0.3 },
  cardInfo: { flex: 1 }
})
