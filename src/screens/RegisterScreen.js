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
import { registerWithEmail } from '../services/authService'

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    try {
      await registerWithEmail(email, password)
    } catch (e) {
      Alert.alert('Registration error', String(e.message || e))
    }
  }

  return (
    <View style={styles.container}>
      <Header title='' subtitle='Create a new account' />

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

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to login</Text>
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
