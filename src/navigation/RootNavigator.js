import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'

import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'

import OwnedScreen from '../screens/OwnedScreen'
import WishlistScreen from '../screens/WishlistScreen'
import DuplicatesScreen from '../screens/DuplicatesScreen'
import ExploreScreen from '../screens/ExploreScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AddItemScreen from '../screens/AddItemScreen'
import EditItemScreen from '../screens/EditItemScreen'
import PublicProfileScreen from '../screens/PublicProfileScreen'
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const OwnedStack = createNativeStackNavigator()
const WishlistStack = createNativeStackNavigator()
const ExploreStack = createNativeStackNavigator()

export default function RootNavigator() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) return null

  return user ? <AppTabs /> : <AuthStack />
}

function WishlistStackNavigator() {
  return (
    <WishlistStack.Navigator>
      <WishlistStack.Screen
        name='WishlistList'
        component={WishlistScreen}
        options={{ title: 'Wishlist' }}
      />
      <WishlistStack.Screen
        name='AddItem'
        component={AddItemScreen}
        options={{ title: 'Add item' }}
      />
      <WishlistStack.Screen
        name='EditItem'
        component={EditItemScreen}
        options={{ title: 'Edit item' }}
      />
      <WishlistStack.Screen
        name='ScanBarcode'
        component={BarcodeScannerScreen}
        options={{ title: 'Scan barcode' }}
      />
    </WishlistStack.Navigator>
  )
}

function OwnedStackNavigator() {
  return (
    <OwnedStack.Navigator>
      <OwnedStack.Screen
        name='OwnedList'
        component={OwnedScreen}
        options={{ title: 'Owned' }}
      />
      <OwnedStack.Screen
        name='AddItem'
        component={AddItemScreen}
        options={{ title: 'Add item' }}
      />
      <OwnedStack.Screen
        name='EditItem'
        component={EditItemScreen}
        options={{ title: 'Edit item' }}
      />
      <OwnedStack.Screen
        name='ScanBarcode'
        component={BarcodeScannerScreen}
        options={{ title: 'Scan barcode' }}
      />
    </OwnedStack.Navigator>
  )
}
function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen
        name='ExploreList'
        component={ExploreScreen}
        options={{ title: 'Explore' }}
      />
      <ExploreStack.Screen
        name='PublicProfile'
        component={PublicProfileScreen}
        options={{ title: 'Public profile' }}
      />
    </ExploreStack.Navigator>
  )
}
function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name='Owned'
        component={OwnedStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name='Wishlist'
        component={WishlistStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name='Duplicates' component={DuplicatesScreen} />
      <Tab.Screen
        name='Explore'
        component={ExploreStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  )
}
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Register' component={RegisterScreen} />
    </Stack.Navigator>
  )
}
