import { db } from './firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore'

// Gets owned public items from a specific user
export function subscribePublicItemsByUser(uid, callback) {
  const q = query(
    collection(db, 'users', uid, 'items'),
    where('status', '==', 'owned'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      id: d.id,
      ownerUid: uid,
      ...d.data()
    }))
    callback(items)
  })
}

// Subscribes to users with public profiles enabled
export function subscribePublicUsers(callback) {
  const q = query(
    collection(db, 'users'),
    where('hasPublicProfile', '==', true),
    orderBy('displayName', 'asc')
  )

  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
    callback(users)
  })
}
