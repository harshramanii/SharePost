import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { introData } from '../../helper/dataConstants';
import { ONBOARDING_COMPLETED } from '../../helper/constData';
import { Button, Icon } from '../../components';

const IntroScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentData = useMemo(() => introData[currentIndex], [currentIndex]);

  const handleGetStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED, 'true');
      navigation.navigate('Language');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.navigate('Language');
    }
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < introData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  }, [currentIndex, handleGetStarted]);

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED, 'true');
      navigation.navigate('Language');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.navigate('Language');
    }
  }, [navigation]);

  const handleDotPress = useCallback(index => {
    setCurrentIndex(index);
  }, []);

  const renderFeatureCard = useCallback(
    (item, index) => {
      const isActive = index === currentIndex;
      return (
        <View
          key={item.id}
          style={[styles.featureCard, isActive && styles.activeFeatureCard]}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <Icon
              name={item.icon}
              size={wp(20)}
              color={isActive ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.featureTitle,
              { color: colors.primary },
              !isActive && styles.inactiveText,
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: colors.textSecondary },
              !isActive && styles.inactiveText,
            ]}
          >
            {item.description}
          </Text>
        </View>
      );
    },
    [currentIndex, colors],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {strings.intro.skip}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {renderFeatureCard(currentData, currentIndex)}
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {introData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                { backgroundColor: colors.textSecondary },
                index === currentIndex && [
                  styles.activeDot,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={
              currentIndex === introData.length - 1
                ? strings.intro.getStarted
                : strings.intro.next
            }
            onPress={handleNext}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
  },
  skipText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(3),
  },
  featureCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(5),
    width: '100%',
  },
  activeFeatureCard: {
    opacity: 1,
  },
  iconContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featureTitle: {
    fontSize: fontSize(26),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
  },
  featureDescription: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: fontSize(24),
    paddingHorizontal: wp(8),
  },
  inactiveText: {
    opacity: 0.3,
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  dot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginHorizontal: wp(1),
    opacity: 0.3,
  },
  activeDot: {
    width: wp(6),
    opacity: 1,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});

export default IntroScreen;
