import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_STORAGE_KEY = '@SharePost:fcm_token';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFCMToken();

      console.log('Authorization status:', authStatus);
    }
  } else {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'App needs permission to send notifications',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getFCMToken();
    }
  }
};

export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Store token in AsyncStorage
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      console.log('FCM token stored in AsyncStorage');
    }

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Get stored FCM token from AsyncStorage
export const getStoredFCMToken = async () => {
  try {
    const token = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    return token;
  } catch (error) {
    console.error('Error getting stored FCM token:', error);
    return null;
  }
};

// Remove FCM token from AsyncStorage (e.g., on logout)
export const removeFCMToken = async () => {
  try {
    await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    console.log('FCM token removed from AsyncStorage');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

// Log screen view event to Firebase Analytics
export const logScreenView = async (screenName, screenClass = null) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log('Screen view logged:', screenName);
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

// Log custom event to Firebase Analytics
export const logEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
    console.log('Event logged:', eventName, params);
  } catch (error) {
    console.error('Error logging event:', error);
  }
};
