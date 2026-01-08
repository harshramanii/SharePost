import React, {createContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@SharePost:theme';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  colors: {},
});

export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState('light');

  const lightColors = {
    white: '#fff',
    black: '#000',
    primary: '#0F1944',
    grey: '#8B8C88',
    darkGrey: '#5A5A5A',
    lightPrimary: '#1A2B5C',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8B8C88',
    border: '#E0E0E0',
  };

  const darkColors = {
    white: '#FFFFFF',
    black: '#000000',
    primary: '#4A90E2',
    grey: '#9E9E9E',
    darkGrey: '#757575',
    lightPrimary: '#6BA3E8',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9E9E9E',
    border: '#333333',
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{theme, toggleTheme, colors}}>
      {children}
    </ThemeContext.Provider>
  );
};









