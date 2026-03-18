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

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const OwnedStack = createNativeStackNavigator()

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
    </OwnedStack.Navigator>
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
      <Tab.Screen name='Wishlist' component={WishlistScreen} />
      <Tab.Screen name='Duplicates' component={DuplicatesScreen} />
      <Tab.Screen name='Explore' component={ExploreScreen} />
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
