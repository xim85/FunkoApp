import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'

// Reusable header with optional title/subtitle
export default function Header({ title = 'Funko App', subtitle }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Funko-Logo.png')}
        style={styles.logo}
        resizeMode='contain'
      />

      <Text style={styles.title}>{title}</Text>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 0,
    gap: 6
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 80
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white'
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    width: '100%',
    opacity: 0.8
  }
})
