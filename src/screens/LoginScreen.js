import React, { useState } from 'react'
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet
} from 'react-native'
import Header from '../../components/Header'
import { loginWithEmail, sendReset } from '../services/authService'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password)
    } catch (e) {
      Alert.alert('Sign-in error', String(e.message || e))
    }
  }

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      Alert.alert('Missing email', 'Please enter your email first.')
      return
    }

    try {
      await sendReset(trimmedEmail)
      Alert.alert('Email sent', 'Check your inbox to reset your password.')
    } catch (e) {
      Alert.alert('Reset error', String(e.message || e))
    }
  }

  return (
    <View style={styles.container}>
      <Header title='' subtitle='Sign in to your account' />

      <View style={styles.content}>
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

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>

        <Pressable onPress={handleForgotPassword}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#19bd9a' },
  content: { padding: 24, gap: 12 },
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
  buttonText: { color: 'white', fontWeight: '700' },
  link: { color: 'white', textDecorationLine: 'underline', marginTop: 6 }
})
