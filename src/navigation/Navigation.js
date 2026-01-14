import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { navigationRef } from './rootNavigation';
import { logScreenView } from '../services/firebaseServices';

//--- Common
import Loading from '../screens/Common/Loading';

//--- Intro
import IntroScreen from '../screens/Intro/IntroScreen';

//--- Language
import LanguageScreen from '../screens/Language/LanguageScreen';
import FaqScreen from '../screens/Static/FaqScreen';
import TermsScreen from '../screens/Static/TermsScreen';
import PrivacyPolicyScreen from '../screens/Static/PrivacyPolicyScreen';

//--- Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import PersonalDetailsScreen from '../screens/Auth/PersonalDetailsScreen';

//--- Tab Navigator
import TabNavigator from './TabNavigator';

//---- Main Stack
const Stack = createStackNavigator();

const MainStackNavigator = () => {
  const routeNameRef = useRef();

  const getActiveRouteName = state => {
    if (!state || !state.routes || state.index === undefined) {
      return null;
    }

    const route = state.routes[state.index];
    if (!route) {
      return null;
    }

    if (route.state) {
      // Dive into nested navigators (e.g., TabNavigator)
      const nestedRouteName = getActiveRouteName(route.state);
      // Combine parent and nested route names for better tracking
      if (nestedRouteName) {
        return `${route.name}_${nestedRouteName}`;
      }
    }

    return route.name;
  };

  const handleNavigationStateChange = async (prevState, currentState) => {
    if (!currentState) {
      return;
    }

    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(currentState);

    if (currentRouteName && previousRouteName !== currentRouteName) {
      // Log screen view to Firebase Analytics
      await logScreenView(currentRouteName);
    }

    // Save the current route name for next comparison
    routeNameRef.current = currentRouteName;
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        try {
          const rootState = navigationRef.current?.getRootState();
          if (rootState) {
            routeNameRef.current = getActiveRouteName(rootState);
          }
        } catch (error) {
          console.log('Error getting initial route name:', error);
        }
      }}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'Loading'} component={Loading} />
        <Stack.Screen name={'Intro'} component={IntroScreen} />
        <Stack.Screen name={'Language'} component={LanguageScreen} />
        <Stack.Screen name={'Login'} component={LoginScreen} />
        <Stack.Screen name={'SignUp'} component={SignUpScreen} />
        <Stack.Screen name={'ForgotPassword'} component={ForgotPasswordScreen} />
        <Stack.Screen
          name={'OTPVerification'}
          component={OTPVerificationScreen}
        />
        <Stack.Screen
          name={'PersonalDetails'}
          component={PersonalDetailsScreen}
        />
        <Stack.Screen name={'Faq'} component={FaqScreen} />
        <Stack.Screen name={'Terms'} component={TermsScreen} />
        <Stack.Screen name={'PrivacyPolicy'} component={PrivacyPolicyScreen} />
        <Stack.Screen name={'Main'} component={TabNavigator} />
        <Stack.Screen name={'HomeTabs'} component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default MainStackNavigator;
