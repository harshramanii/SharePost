import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { languages } from '../../helper/dataConstants';
import { ONBOARDING_COMPLETED } from '../../helper/constData';
import { Button, Icon, AdBanner } from '../../components';
import { subscriptionService } from '../../services';

const LanguageScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { language, setLanguage, strings } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const hasSubscription = await subscriptionService.hasActiveSubscription();
        setHasActiveSubscription(hasSubscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      }
    };
    checkSubscription();
  }, []);

  const selectedLanguageData = useMemo(
    () => languages.find(lang => lang.code === selectedLanguage),
    [selectedLanguage],
  );

  const handleLanguageSelect = useCallback(
    languageCode => {
      setSelectedLanguage(languageCode);
      setLanguage(languageCode);
    },
    [setLanguage],
  );

  const handleContinue = useCallback(async () => {
    try {
      // Language is already saved by setLanguage
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED, 'true');
      // Navigate to Main (which contains TabNavigator) instead of HomeTabs
      // This ensures proper navigation flow
      navigation.replace('Main');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.replace('Main');
    }
  }, [navigation]);

  const renderLanguageItem = useCallback(
    language => {
      const isSelected = language.code === selectedLanguage;
      return (
        <TouchableOpacity
          key={language.id}
          style={[
            styles.languageItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isSelected && [
              styles.selectedLanguageItem,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ],
          ]}
          onPress={() => handleLanguageSelect(language.code)}
          activeOpacity={0.7}
        >
          <View style={styles.languageContent}>
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  { color: colors.text },
                  isSelected && { color: colors.primary },
                ]}
              >
                {language.name}
              </Text>
              <Text
                style={[
                  styles.languageNativeName,
                  { color: colors.text },
                  isSelected && { color: colors.primary },
                ]}
              >
                {language.nativeName}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkContainer}>
                <Icon name="check" size={wp(6)} color={colors.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedLanguage, handleLanguageSelect, colors],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={hasActiveSubscription ? styles.contentAreaFull : styles.contentArea}>
        <View style={styles.header}>
          <View style={styles.iconHeaderContainer}>
            <View
              style={[styles.iconContainer, { backgroundColor: colors.surface }]}
            >
              <Icon name="language" size={wp(12)} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>
            {strings.language.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {strings.language.subtitle}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {languages.map(language => renderLanguageItem(language))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={strings.language.continue}
            onPress={handleContinue}
            style={styles.button}
          />
        </View>
      </View>

      {!hasActiveSubscription && (
        <View style={styles.adArea}>
          <AdBanner style={styles.adBanner} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 7,
  },
  contentAreaFull: {
    flex: 1,
  },
  adArea: {
    flex: 3,
    justifyContent: 'center',
  },
  adBanner: {
    borderTopWidth: 0,
  },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(2),
    alignItems: 'center',
  },
  iconHeaderContainer: {
    marginBottom: hp(2),
  },
  iconContainer: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  languageItem: {
    borderRadius: wp(3),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
  },
  selectedLanguageItem: {
    borderWidth: 2,
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    marginBottom: hp(0.5),
  },
  selectedLanguageName: {},
  languageNativeName: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  selectedLanguageNativeName: {},
  checkContainer: {
    marginLeft: wp(3),
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    paddingTop: hp(2),
  },
  button: {
    width: '100%',
  },
});

export default LanguageScreen;
