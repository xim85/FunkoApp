import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { subscribeItemsByStatus } from '../services/itemsService'

export default function PublicProfileScreen({ route }) {
  const user = route?.params?.user // user picked from Explore list
  const profileUid = user?.uid

  const [ownedItems, setOwnedItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])

  const ownedPublic = !!user?.visibility?.owned
  const wishlistPublic = !!user?.visibility?.wishlist
  const duplicatesPublic = !!user?.visibility?.duplicates

  useEffect(() => {
    if (!profileUid) return
    if (!ownedPublic) return

    // Reads only "owned" items from the other user's items subcollection
    const unsub = subscribeItemsByStatus(profileUid, 'owned', setOwnedItems)
    return unsub
  }, [profileUid, ownedPublic])

  useEffect(() => {
    if (!profileUid) return
    if (!wishlistPublic) return

    const unsub = subscribeItemsByStatus(
      profileUid,
      'wishlist',
      setWishlistItems
    )
    return unsub
  }, [profileUid, wishlistPublic])

  const duplicateGroups = useMemo(() => {
    if (!duplicatesPublic) return []
    // Duplicates are derived from owned items, so we need owned data
    if (!ownedPublic) return []

    const map = new Map()

    for (const it of ownedItems) {
      const name = (it.name ?? '').trim().toLowerCase()
      const series = (it.franchiseOrSeries ?? '').trim().toLowerCase()
      const number = (it.collectionNumber ?? '').trim().toLowerCase()
      const key = `${name}__${series}__${number}`

      if (!map.has(key)) map.set(key, [])
      map.get(key).push(it)
    }

    return Array.from(map.entries())
      .filter(([, arr]) => arr.length > 1)
      .map(([key, arr]) => ({ key, items: arr }))
  }, [ownedItems, ownedPublic, duplicatesPublic])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.displayName || 'Public profile'}</Text>

      {ownedPublic ? (
        <>
          <Text style={styles.sectionTitle}>Owned</Text>
          <FlatList
            data={ownedItems}
            keyExtractor={(it) => it.id}
            ListEmptyComponent={
              <Text style={styles.empty}>No public owned items.</Text>
            }
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
        </>
      ) : (
        <Text style={styles.empty}>Owned section is private.</Text>
      )}

      {wishlistPublic ? (
        <>
          <Text style={styles.sectionTitle}>Wishlist</Text>
          <FlatList
            data={wishlistItems}
            keyExtractor={(it) => it.id}
            ListEmptyComponent={
              <Text style={styles.empty}>No public wishlist items.</Text>
            }
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
        </>
      ) : (
        <Text style={styles.empty}>Wishlist section is private.</Text>
      )}

      {duplicatesPublic ? (
        <>
          <Text style={styles.sectionTitle}>Duplicates</Text>
          <FlatList
            data={duplicateGroups}
            keyExtractor={(g) => g.key}
            ListEmptyComponent={
              <Text style={styles.empty}>No public duplicates.</Text>
            }
            renderItem={({ item: group }) => {
              const first = group.items[0]
              return (
                <View style={styles.card}>
                  <Text style={styles.name}>
                    {first?.name || '(No name)'}{' '}
                    {first?.collectionNumber
                      ? `#${first.collectionNumber}`
                      : ''}
                  </Text>
                  <Text style={styles.meta}>
                    {first?.franchiseOrSeries || '-'}
                  </Text>
                  <Text style={styles.meta}>Count: {group.items.length}</Text>
                </View>
              )
            }}
          />
        </>
      ) : (
        <Text style={styles.empty}>Duplicates section is private.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { marginTop: 8, fontWeight: '700', fontSize: 16 },
  empty: { opacity: 0.7, marginTop: 10 },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 10
  },
  name: { fontWeight: '700' },
  meta: { marginTop: 4, opacity: 0.8 }
})
