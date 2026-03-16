import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Firebase project configuration loaded from Expo public env vars
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
}

// Avoid re-initializing Firebase when hot reloading
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Initialize Auth with proper persistence on React Native (AsyncStorage).
// On Web, default Auth initialization is enough.
let auth
if (Platform.OS === 'web') {
  auth = getAuth(app)
} else {
  try {
    auth = initializeAuth(app, {
      // Persist session across app restarts on mobile
      persistence: getReactNativePersistence(AsyncStorage)
    })
  } catch (e) {
    // If Auth was already initialized (e.g., fast refresh), reuse the existing instance
    auth = getAuth(app)
  }
}

// Firestore database instance
export const db = getFirestore(app)

// Export app/auth for usage across the project
export { app, auth }
