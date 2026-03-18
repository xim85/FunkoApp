import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert
} from 'react-native'
import { auth } from '../services/firebase'
import { subscribeItemsByStatus, updateItem } from '../services/itemsService'

export default function WishlistScreen() {
  const uid = auth.currentUser?.uid
  const [items, setItems] = useState([])

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No items in wishlist.</Text>
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
  smallButtonText: { color: 'white', fontWeight: '700' }
})
