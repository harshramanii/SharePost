import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Icon } from '../../components';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, colors } = useTheme();
  const { strings } = useLanguage();

  const handleProfile = useCallback(() => {
    // Navigate to profile screen
    console.log('Profile');
  }, []);

  const handleLanguage = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleAbout = useCallback(() => {
    // Navigate to about screen
    console.log('About');
  }, []);

  const handleLogout = useCallback(() => {
    // Handle logout
    console.log('Logout');
  }, []);

  const renderSettingItem = useCallback(
    (icon, title, onPress, showArrow = true, rightComponent = null) => {
      return (
        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={onPress}
          activeOpacity={0.7}
          disabled={!showArrow && !onPress}
        >
          <View style={styles.settingContent}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Icon name={icon} size={wp(6)} color={colors.primary} />
              </View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {title}
              </Text>
            </View>
            {rightComponent ||
              (showArrow && (
                <Icon name="arrowRight" size={wp(6)} color={colors.grey} />
              ))}
          </View>
        </TouchableOpacity>
      );
    },
    [colors],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {strings.settings.title}
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.settingsContainer}>
            {renderSettingItem(
              'profile',
              strings.settings.profile,
              handleProfile,
            )}
            {renderSettingItem(
              'language',
              strings.settings.language,
              handleLanguage,
            )}
            {renderSettingItem(
              theme === 'dark' ? 'lightMode' : 'darkMode',
              theme === 'dark'
                ? strings.settings.lightMode
                : strings.settings.darkMode,
              handleThemeToggle,
              false,
              <Switch
                value={theme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.grey, true: colors.primary }}
                thumbColor={colors.white}
              />,
            )}
            {renderSettingItem('share', strings.settings.about, handleAbout)}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.logoutText, { color: colors.primary }]}>
              {strings.settings.logout}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {strings.settings.version} 1.0.0
          </Text>
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
    paddingBottom: hp(2),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: fontFamily.bold,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: hp(2),
    paddingBottom: hp(12),
  },
  settingsContainer: {
    paddingHorizontal: wp(5),
  },
  settingItem: {
    borderRadius: wp(3),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: wp(4),
  },
  settingTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.regular,
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(10),
    alignItems: 'center',
    borderTopWidth: 1,
  },
  logoutButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    marginBottom: hp(2),
  },
  logoutText: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
  },
  versionText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
});

export default SettingsScreen;
