import { db } from './firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore'

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
