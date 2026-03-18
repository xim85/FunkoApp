import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert
} from 'react-native'
import { auth } from '../services/firebase'
import { updateItem, deleteItem } from '../services/itemsService'

export default function EditItemScreen({ navigation, route }) {
  const uid = auth.currentUser?.uid

  // Item passed from the list screen
  const item = route?.params?.item

  // Prevent crashes if navigation params are missing
  const initial = useMemo(() => {
    return {
      id: item?.id,
      name: item?.name ?? '',
      franchiseOrSeries: item?.franchiseOrSeries ?? '',
      collectionNumber: item?.collectionNumber ?? '',
      status: item?.status ?? 'owned',
      barcode: item?.barcode ?? '',
      notes: item?.notes ?? ''
    }
  }, [item])

  const [name, setName] = useState(initial.name)
  const [franchiseOrSeries, setFranchiseOrSeries] = useState(
    initial.franchiseOrSeries
  )
  const [collectionNumber, setCollectionNumber] = useState(
    initial.collectionNumber
  )
  const [status, setStatus] = useState(initial.status)
  const [barcode, setBarcode] = useState(initial.barcode)
  const [notes, setNotes] = useState(initial.notes)

  const handleSave = async () => {
    if (!uid) {
      Alert.alert('Error', 'You must be signed in.')
      return
    }

    if (!initial.id) {
      Alert.alert('Error', 'Missing item id.')
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
      await updateItem(uid, initial.id, {
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

  const handleDelete = () => {
    if (!uid || !initial.id) return

    Alert.alert(
      'Delete item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(uid, initial.id)
              navigation.goBack()
            } catch (e) {
              Alert.alert('Error', String(e.message || e))
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit item</Text>

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
        <Text style={styles.saveButtonText}>Save changes</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete item</Text>
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
  saveButtonText: { color: 'white', fontWeight: '700' },
  deleteButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  deleteButtonText: { color: 'white', fontWeight: '700' }
})
