import { db } from './firebase'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

// Returns the Firestore collection reference: users/{uid}/items
function itemsCol(uid) {
  return collection(db, 'users', uid, 'items')
}

// Creates a new item document (manual add)
export async function addItem(uid, data) {
  return addDoc(itemsCol(uid), {
    name: data.name ?? '',
    franchiseOrSeries: data.franchiseOrSeries ?? '',
    collectionNumber: data.collectionNumber ?? '',
    status: data.status, // 'owned' | 'wishlist'
    barcode: data.barcode ?? '',
    imageUrl: data.imageUrl ?? '',
    notes: data.notes ?? '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}
// Updates an existing item document and refreshes updatedAt
export async function updateItem(uid, itemId, data) {
  const ref = doc(db, 'users', uid, 'items', itemId)

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// Deletes an existing item document
export async function deleteItem(uid, itemId) {
  const ref = doc(db, 'users', uid, 'items', itemId)
  await deleteDoc(ref)
}

// Adds a discovered item directly to the user's wishlist
export async function addToWishlistFromDiscover(uid, item) {
  return addDoc(itemsCol(uid), {
    name: item.name ?? '',
    franchiseOrSeries: item.franchiseOrSeries ?? '',
    collectionNumber: item.collectionNumber ?? '',
    status: 'wishlist',
    barcode: item.barcode ?? '',
    imageUrl: item.imageUrl ?? '',
    notes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Real-time subscription to items filtered by status
export function subscribeItemsByStatus(uid, status, callback) {
  const q = query(
    itemsCol(uid),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(items)
  })
}
