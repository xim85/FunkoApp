import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Header from './components/Header'

import { auth, db } from './src/services/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'

export default function App() {
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Reactive Firebase user (updates on login/logout)
  const [user, setUser] = useState(null)

  // Subscribe to auth state changes (keeps UI in sync with Firebase Auth session)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  // Ensures the Firestore profile document exists for the authenticated user.
  // This covers cases where the Auth user exists but the Firestore doc is missing.
  const ensureProfile = async (uid, fallbackEmail) => {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
      // Default public visibility settings for the MVP
      const visibility = { owned: true, duplicates: false, wishlist: false }

      // Derived flag used for "Explore" queries (at least one section is public)
      const hasPublicProfile =
        visibility.owned || visibility.duplicates || visibility.wishlist

      // Create the minimal profile document
      await setDoc(ref, {
        displayName: fallbackEmail ?? 'User',
        visibility,
        hasPublicProfile,
        createdAt: serverTimestamp()
      })
    }
  }

  // Registers a new user in Firebase Auth and creates the corresponding profile in Firestore
  const handleRegister = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      await ensureProfile(cred.user.uid, email.trim())
      Alert.alert('OK', 'User registered successfully')
    } catch (e) {
      Alert.alert('Registration error', String(e.message || e))
    }
  }

  // Signs in an existing user and ensures the profile doc exists
  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      await ensureProfile(cred.user.uid, cred.user.email)
      Alert.alert('OK', 'Signed in')
    } catch (e) {
      Alert.alert('Sign-in error', String(e.message || e))
    }
  }
  // Sends a password reset email to the provided address
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      Alert.alert('Missing email', 'Please enter your email first.')
      return
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail)
      Alert.alert('Email sent', 'Check your inbox to reset your password.')
    } catch (e) {
      Alert.alert('Reset error', String(e.message || e))
    }
  }
  // Ends the current session
  const handleLogout = async () => {
    await signOut(auth)
    Alert.alert('OK', 'Signed out')
  }

  return (
    <View style={styles.container}>
      <Header
        title=''
        subtitle={
          user ? `Signed in as ${user.email}` : 'Sign in or create an account'
        }
      />

      {/* Authenticated state */}
      {user ? (
        <>
          <Text style={styles.text}>Signed in as:</Text>
          <Text style={styles.bold}>{user.email}</Text>

          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Unauthenticated state */}
          <TextInput
            style={styles.input}
            placeholder='Email'
            autoCapitalize='none'
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder='Password'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>
          <Pressable onPress={handleForgotPassword}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </>
      )}

      <StatusBar style='auto' />
    </View>
  )
}

// Basic UI styles for the MVP screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19bd9a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 24,
    gap: 12
  },
  title: { fontSize: 26, fontWeight: '700', color: 'white', marginBottom: 12 },
  text: { color: 'white' },
  bold: { color: 'white', fontWeight: '700' },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    width: '100%',
    backgroundColor: '#0f6d5a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonSecondary: { backgroundColor: '#0a4a3d' },
  buttonText: { color: 'white', fontWeight: '700' },
  link: {
    color: 'white',
    textDecorationLine: 'underline',
    marginTop: 6
  }
})
