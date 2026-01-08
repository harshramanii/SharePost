import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { useTheme } from '../../hooks/useTheme';
import { ONBOARDING_COMPLETED } from '../../helper/constData';
import { authService } from '../../services';
import { fetchUserProfile } from '../../store/slices/userSlice';

const Loading = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    checkAuthAndOnboardingStatus();
  }, [navigation]);

  const checkAuthAndOnboardingStatus = useCallback(async () => {
    try {
      // First check if there's a stored session
      const { data: sessionData } = await authService.getSession();

      // If no session, check onboarding status and navigate accordingly
      if (!sessionData?.session) {
        const onboardingCompleted = await AsyncStorage.getItem(
          ONBOARDING_COMPLETED,
        );
        if (onboardingCompleted === 'true') {
          // User completed onboarding but not logged in - allow guest access to dashboard
          navigation.replace('Main');
        } else {
          navigation.replace('Intro');
        }
        return;
      }

      // Session exists, verify user
      const { data: user, error } = await authService.getCurrentUser();

      if (error || !user) {
        // Session exists but user verification failed
        // Clear invalid session
        await authService.removeToken();
        const onboardingCompleted = await AsyncStorage.getItem(
          ONBOARDING_COMPLETED,
        );
        if (onboardingCompleted === 'true') {
          // Allow guest access to dashboard if onboarding completed
          navigation.replace('Main');
        } else {
          navigation.replace('Intro');
        }
        return;
      }

      // User has valid session, fetch profile and check onboarding status
      dispatch(fetchUserProfile());
      const onboardingCompleted = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED,
      );
      if (onboardingCompleted === 'true') {
        navigation.replace('HomeTabs');
      } else {
        navigation.replace('Intro');
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
      // On error, check onboarding and navigate accordingly
      try {
        const onboardingCompleted = await AsyncStorage.getItem(
          ONBOARDING_COMPLETED,
        );
        if (onboardingCompleted === 'true') {
          // Allow guest access to dashboard if onboarding completed
          navigation.replace('Main');
        } else {
          navigation.replace('Intro');
        }
      } catch (err) {
        navigation.replace('Intro');
      }
    }
  }, [navigation, dispatch]);

  return (
    <View style={[style.mainContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size={'large'} color={colors.primary} />
    </View>
  );
};

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
