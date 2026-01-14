import React, { useMemo } from 'react';
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

  const homeOptions = useMemo(
    () => ({
      tabBarLabel: strings?.home?.title || 'Home',
    }),
    [strings],
  );

  const createOptions = useMemo(
    () => ({
      tabBarLabel: strings?.create?.title || 'Create',
    }),
    [strings],
  );

  const profileOptions = useMemo(
    () => ({
      tabBarLabel: strings?.profile?.title || 'Profile',
    }),
    [strings],
  );

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={homeOptions} />
      <Tab.Screen name="Create" component={CreateScreen} options={createOptions} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={profileOptions} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
