import { db } from './firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

// Computes whether the user has at least one public section enabled
export function computeHasPublicProfile(visibility) {
  return !!(visibility?.owned || visibility?.duplicates || visibility?.wishlist)
}

// Real-time subscription to the user profile document
export function subscribeToUserProfile(uid, callback) {
  const ref = doc(db, 'users', uid)

  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

// Updates user profile fields. If visibility is provided, also updates hasPublicProfile.
export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid)

  const patch = { ...data }
  if (data.visibility) {
    patch.hasPublicProfile = computeHasPublicProfile(data.visibility)
  }

  await updateDoc(ref, patch)
}
