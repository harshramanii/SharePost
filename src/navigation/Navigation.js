import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { navigationRef } from './rootNavigation';

//--- Common
import Loading from '../screens/Common/Loading';

//--- Intro
import IntroScreen from '../screens/Intro/IntroScreen';

//--- Language
import LanguageScreen from '../screens/Language/LanguageScreen';

//--- Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import PersonalDetailsScreen from '../screens/Auth/PersonalDetailsScreen';

//--- Tab Navigator
import TabNavigator from './TabNavigator';

//---- Main Stack
const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'Loading'} component={Loading} />
        <Stack.Screen name={'Intro'} component={IntroScreen} />
        <Stack.Screen name={'Language'} component={LanguageScreen} />
        <Stack.Screen name={'Login'} component={LoginScreen} />
        <Stack.Screen name={'SignUp'} component={SignUpScreen} />
        <Stack.Screen
          name={'OTPVerification'}
          component={OTPVerificationScreen}
        />
        <Stack.Screen
          name={'PersonalDetails'}
          component={PersonalDetailsScreen}
        />
        <Stack.Screen name={'Main'} component={TabNavigator} />
        <Stack.Screen name={'HomeTabs'} component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default MainStackNavigator;
