import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import OwnedScreen from '../screens/OwnedScreen'
import WishlistScreen from '../screens/WishlistScreen'
import DuplicatesScreen from '../screens/DuplicatesScreen'
import ExploreScreen from '../screens/ExploreScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function RootNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Owned' component={OwnedScreen} />
      <Tab.Screen name='Wishlist' component={WishlistScreen} />
      <Tab.Screen name='Duplicates' component={DuplicatesScreen} />
      <Tab.Screen name='Explore' component={ExploreScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  )
}
