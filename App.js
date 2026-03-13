import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert
} from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { auth, db } from './src/services/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const user = auth.currentUser

  const handleRegister = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )
      const uid = cred.user.uid

      // Crea el perfil mínimo en Firestore
      await setDoc(doc(db, 'users', uid), {
        displayName: email.trim(),
        visibility: { owned: true, duplicates: false, wishlist: false },
        hasPublicProfile: true, // owned=true => al menos una sección pública
        createdAt: serverTimestamp()
      })

      Alert.alert('OK', 'Usuario registrado correctamente')
    } catch (e) {
      Alert.alert('Error al registrar', String(e.message || e))
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      Alert.alert('OK', 'Sesión iniciada')
    } catch (e) {
      Alert.alert('Error al iniciar sesión', String(e.message || e))
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    Alert.alert('OK', 'Sesión cerrada')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Funko App</Text>

      {user ? (
        <>
          <Text style={styles.text}>Sesión iniciada como:</Text>
          <Text style={styles.bold}>{user.email}</Text>

          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </Pressable>
        </>
      ) : (
        <>
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
            placeholder='Contraseña'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </Pressable>
        </>
      )}

      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19bd9a',
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonText: { color: 'white', fontWeight: '700' }
})
