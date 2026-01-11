/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background handler for Firebase Cloud Messaging
// This is registered lazily to ensure Firebase is initialized
AppRegistry.registerComponent(appName, () => {
  // Register background message handler after app is ready
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  } catch (error) {
    console.log('Firebase messaging not available yet:', error);
  }
  
  return App;
});
