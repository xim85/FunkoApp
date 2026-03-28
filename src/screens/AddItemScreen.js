import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert
} from 'react-native'
import { auth } from '../services/firebase'
import { addItem } from '../services/itemsService'
import { lookupBarcode } from '../services/upcProxyService'

const parseFunkoTitle = (title) => {
  if (!title) return { name: null, franchise: null, number: null }

  // Extract number: works with "#166" or bare "375" at the end
  const numberWithHash = title.match(/#(\d+)/)
  const numberAtEnd = title.match(/\s(\d+)\s*$/)
  const number = numberWithHash
    ? numberWithHash[1]
    : numberAtEnd
      ? numberAtEnd[1]
      : null

  // Remove all known Funko prefixes
  const cleaned = title
    .replace(/^Funko\s+(Pop!?|Collectible\s+Vinyl\s+Figures?|POP!?)\s*/i, '')
    .replace(/#\d+/, '')
    .replace(/\s\d+\s*$/, '')
    .trim()

  // Format 1: "TV: Wednesday - Wednesday Vinyl Figure"
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':')
    const franchise = parts[0].trim()
    const rawName = parts.slice(1).join(':').trim()

    // Clean "Wednesday - Wednesday Vinyl Figure" → "Wednesday"
    const nameMatch = rawName.match(/^([^-]+?)\s*-\s*.+$/)
    const name = nameMatch ? nameMatch[1].trim() : rawName

    return { franchise, name, number }
  }

  // Format 2: "Disney Mulan" (no colon, known Disney/Marvel/etc prefix)
  const knownFranchises = [
    'Disney',
    'Marvel',
    'DC',
    'Star Wars',
    'Harry Potter',
    'Nintendo',
    'Royals',
    'TV',
    'Movies',
    'Animation',
    'Games',
    'Sports',
    'Music',
    'Ad Icons'
  ]

  for (const franchise of knownFranchises) {
    if (cleaned.toLowerCase().startsWith(franchise.toLowerCase())) {
      const name = cleaned.slice(franchise.length).trim()
      return { franchise, name: name || null, number }
    }
  }

  // Fallback: return everything as name
  return { franchise: null, name: cleaned, number }
}

export default function AddItemScreen({ navigation, route }) {
  // Get the current user's ID from Firebase Auth
  const uid = auth.currentUser?.uid

  // Allow other screens to pre-select a status when navigating here
  const initialStatus = route?.params?.initialStatus ?? 'owned'
  // Lookup state: tracks loading and feedback message
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupMsg, setLookupMsg] = useState('')
  // Form fields
  const [name, setName] = useState('')
  const [franchiseOrSeries, setFranchiseOrSeries] = useState('')
  const [collectionNumber, setCollectionNumber] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [barcode, setBarcode] = useState('')
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // If the barcode scanner screen passed a barcode back, fill it in
  useEffect(() => {
    const incoming = route?.params?.barcode
    if (incoming) setBarcode(String(incoming))
  }, [route?.params?.barcode])

  // Whenever the barcode changes, try to autofill the form via the proxy API
  useEffect(() => {
    const b = barcode.trim()
    // Skip lookup for short barcodes
    if (b.length < 8) {
      setLookupMsg('')
      return
    }

    let cancelled = false
    // Debounce: wait 400ms before firing to avoid spamming the API
    const t = setTimeout(async () => {
      try {
        setLookupLoading(true)
        setLookupMsg('Looking up...')

        const data = await lookupBarcode(b)
        console.log('API response:', JSON.stringify(data, null, 2))
        if (cancelled) return

        if (!data?.found) {
          setLookupMsg('Not found. Fill manually.')
          return
        }

        // Use the first image returned, only if the field is still empty
        const firstImg = data?.images?.[0]
        if (firstImg && !imageUrl.trim()) setImageUrl(firstImg)

        // Parse the Funko title to extract name, franchise and number
        const parsed = parseFunkoTitle(data.title)

        // Only autofill fields the user hasn't already typed in
        if (parsed.name && !name.trim()) {
          setName(parsed.name)
        }

        if (!franchiseOrSeries.trim()) {
          if (parsed.franchise) {
            setFranchiseOrSeries(parsed.franchise)
          } else if (data.brand) {
            setFranchiseOrSeries(data.brand)
          }
        }

        if (parsed.number && !collectionNumber.trim()) {
          setCollectionNumber(parsed.number)
        }

        setLookupMsg('Autofilled from barcode.')
      } catch (e) {
        if (cancelled) return
        setLookupMsg(`Lookup error: ${String(e.message || e)}`)
      } finally {
        if (!cancelled) setLookupLoading(false)
      }
    }, 400)
    // Cleanup: cancel the timeout and ignore stale responses
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [barcode])

  // Validate the form and save the item to Firestore
  const handleSave = async () => {
    if (!uid) {
      Alert.alert('Error', 'You must be signed in.')
      return
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      Alert.alert('Validation', 'Name is required.')
      return
    }

    if (status !== 'owned' && status !== 'wishlist') {
      Alert.alert('Validation', 'Status is required.')
      return
    }

    try {
      await addItem(uid, {
        name: trimmedName,
        franchiseOrSeries: franchiseOrSeries.trim(),
        collectionNumber: collectionNumber.trim(),
        status,
        barcode: barcode.trim(),
        imageUrl: imageUrl.trim(),
        notes: notes.trim()
      })

      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', String(e.message || e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add item</Text>

      <TextInput
        style={styles.input}
        placeholder='Name *'
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder='Franchise / Series'
        value={franchiseOrSeries}
        onChangeText={setFranchiseOrSeries}
      />

      <TextInput
        style={styles.input}
        placeholder='Collection number'
        value={collectionNumber}
        onChangeText={setCollectionNumber}
      />

      <Text style={styles.sectionTitle}>Status *</Text>
      <View style={styles.statusRow}>
        <Pressable
          style={[
            styles.statusBtn,
            status === 'owned' && styles.statusBtnActive
          ]}
          onPress={() => setStatus('owned')}
        >
          <Text style={styles.statusText}>Owned</Text>
        </Pressable>

        <Pressable
          style={[
            styles.statusBtn,
            status === 'wishlist' && styles.statusBtnActive
          ]}
          onPress={() => setStatus('wishlist')}
        >
          <Text style={styles.statusText}>Wishlist</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScanBarcode')}
      >
        <Text style={styles.scanButtonText}>Scan barcode</Text>
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder='Barcode (optional)'
        value={barcode}
        onChangeText={setBarcode}
      />

      {lookupLoading ? <Text style={styles.lookupMsg}>Loading...</Text> : null}
      {lookupMsg ? <Text style={styles.lookupMsg}>{lookupMsg}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder='Image URL (optional)'
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      <TextInput
        style={[styles.input, styles.notes]}
        placeholder='Notes (optional)'
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },

  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  notes: { minHeight: 90, textAlignVertical: 'top' },

  sectionTitle: { fontWeight: '700', marginTop: 6 },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center'
  },
  statusBtnActive: { backgroundColor: '#0f6d5a' },
  statusText: { fontWeight: '700', color: 'white' },

  scanButton: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  scanButtonText: { fontWeight: '700' },

  saveButton: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  saveButtonText: { color: 'white', fontWeight: '700' },
  lookupMsg: { color: '#444' }
})
