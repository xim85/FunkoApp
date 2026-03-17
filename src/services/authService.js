import { auth, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'

// Ensures a Firestore user profile exists for the given uid
export async function ensureUserProfile(uid, fallbackEmail) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) return

  const visibility = { owned: true, duplicates: false, wishlist: false }
  const hasPublicProfile =
    visibility.owned || visibility.duplicates || visibility.wishlist

  await setDoc(ref, {
    displayName: fallbackEmail ?? 'User',
    visibility,
    hasPublicProfile,
    createdAt: serverTimestamp()
  })
}

export async function registerWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  )
  await ensureUserProfile(cred.user.uid, email.trim())
  return cred.user
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
  await ensureUserProfile(cred.user.uid, cred.user.email)
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

export async function sendReset(email) {
  await sendPasswordResetEmail(auth, email.trim())
}
