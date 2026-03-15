import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'

export default function Header() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Funko-Logo.png')}
        style={styles.logo}
        resizeMode='contain'
      />
      <Text style={styles.title}>Funko App</Text>
      <Text style={styles.subtitle}>Funko App</Text>
    </View>
  )
}
const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 14,
    color: '#555'
  }
})
