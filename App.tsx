/**
 * Water & Dust Eject App
 * @format
 */

import React from 'react';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { store } from './src/store';
import MainStackNavigator from './src/navigation/Navigation';

const AppContent = () => {
  const { theme, colors } = React.useContext(ThemeContext);

  // Custom toast configuration
  const toastConfig = {
    success: ({ text1, text2 }) => (
      <View
        style={{
          height: 60,
          width: '90%',
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 10,
          borderLeftWidth: 4,
          borderLeftColor: '#4CAF50',
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View style={{ flex: 1 }}>
          {text1 && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 2,
              }}>
              {text1}
            </Text>
          )}
          {text2 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    ),
    error: ({ text1, text2 }) => (
      <View
        style={{
          height: 60,
          width: '90%',
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 10,
          borderLeftWidth: 4,
          borderLeftColor: '#F44336',
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View style={{ flex: 1 }}>
          {text1 && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 2,
              }}>
              {text1}
            </Text>
          )}
          {text2 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    ),
    info: ({ text1, text2 }) => (
      <View
        style={{
          height: 60,
          width: '90%',
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderRadius: 10,
          borderLeftWidth: 4,
          borderLeftColor: '#2196F3',
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View style={{ flex: 1 }}>
          {text1 && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 2,
              }}>
              {text1}
            </Text>
          )}
          {text2 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    ),
  };

  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <MainStackNavigator />
      <Toast config={toastConfig} />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

export default App;
