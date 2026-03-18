import React, { useState } from 'react'
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

export default function AddItemScreen({ navigation, route }) {
  const uid = auth.currentUser?.uid

  // Optional: allow parent screen to prefill a default status
  const initialStatus = route?.params?.initialStatus ?? 'owned'

  const [name, setName] = useState('')
  const [franchiseOrSeries, setFranchiseOrSeries] = useState('')
  const [collectionNumber, setCollectionNumber] = useState('')
  const [status, setStatus] = useState(initialStatus)
  const [barcode, setBarcode] = useState('')
  const [notes, setNotes] = useState('')

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

      <TextInput
        style={styles.input}
        placeholder='Barcode (optional)'
        value={barcode}
        onChangeText={setBarcode}
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

  saveButton: {
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8
  },
  saveButtonText: { color: 'white', fontWeight: '700' }
})
