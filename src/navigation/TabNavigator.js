import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomTabBar from '../components/common/CustomTabBar';
import { useLanguage } from '../hooks/useLanguage';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import CreateScreen from '../screens/Create/CreateScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { strings } = useLanguage();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: strings.home.title,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: strings.create.title,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: strings.profile.title,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
