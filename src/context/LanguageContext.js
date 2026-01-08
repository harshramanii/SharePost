import React, {createContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {strings} from '../helper/strings';

const LANGUAGE_STORAGE_KEY = '@SharePost:language';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  strings: {},
});

export const LanguageProvider = ({children}) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  }, []);

  const setLanguage = useCallback(async (langCode) => {
    setLanguageState(langCode);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, []);

  const currentStrings = strings[language] || strings.en;

  return (
    <LanguageContext.Provider value={{language, setLanguage, strings: currentStrings}}>
      {children}
    </LanguageContext.Provider>
  );
};









