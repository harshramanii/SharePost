import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import {
  Icon,
  EditProfileModal,
  LogoutModal,
  DeleteAccountModal,
  ContactSupportModal,
} from '../../components';
import { showSuccess, showError } from '../../helper/toast';
import { authService } from '../../services';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  clearProfile,
} from '../../store/slices/userSlice';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { theme, toggleTheme, colors } = useTheme();
  const { strings } = useLanguage();
  const { profile: reduxProfile, loading: profileLoading } = useSelector(
    state => state.user,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showContactSupportModal, setShowContactSupportModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    bio: '',
    facebook: '',
    instagram: '',
    twitter: '',
    avatar: '',
  });

  // Load profile from Redux when screen is focused
  useFocusEffect(
    useCallback(async () => {
      // Check if user is a guest (no session)
      const { data: sessionData } = await authService.getSession();
      if (!sessionData?.session) {
        setIsGuest(true);
        return;
      }

      setIsGuest(false);
      dispatch(fetchUserProfile());
      // Check if we need to open edit modal from navigation params
      if (route.params?.openEditModal) {
        setShowEditModal(true);
        // Clear the param to prevent reopening on subsequent focuses
        navigation.setParams({ openEditModal: undefined });
      }
    }, [dispatch, route.params, navigation]),
  );

  // Update local state when Redux profile changes
  useEffect(() => {
    if (reduxProfile) {
      setUserProfile({
        name: reduxProfile.full_name || '',
        username: reduxProfile.username || '',
        phone: reduxProfile.phone_number || '',
        bio: reduxProfile.bio || '',
        facebook: reduxProfile.facebook_url || '',
        instagram: reduxProfile.instagram_url || '',
        twitter: reduxProfile.twitter_url || '',
        avatar: reduxProfile.avatar_url || '',
        facebook_show_in_poster: reduxProfile.facebook_show_in_poster || false,
        instagram_show_in_poster:
          reduxProfile.instagram_show_in_poster || false,
        twitter_show_in_poster: reduxProfile.twitter_show_in_poster || false,
      });
    }
  }, [reduxProfile]);

  const handleEditProfile = useCallback(() => {
    if (isGuest) {
      // Navigate to SignUp for guest users
      navigation.navigate('SignUp');
    } else {
      setShowEditModal(true);
    }
  }, [isGuest, navigation]);

  const handleLanguage = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleFAQ = useCallback(() => {
    // Navigate to FAQ screen
    console.log('FAQ');
  }, []);

  const handleTerms = useCallback(() => {
    // Navigate to Terms screen
    console.log('Terms');
  }, []);

  const handlePrivacy = useCallback(() => {
    // Navigate to Privacy screen
    console.log('Privacy');
  }, []);

  const handleContactSupport = useCallback(() => {
    setShowContactSupportModal(true);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    if (isGuest) {
      // Navigate to SignUp for guest users
      navigation.navigate('SignUp');
    } else {
      setShowDeleteAccountModal(true);
    }
  }, [isGuest, navigation]);

  const handleConfirmDeleteAccount = useCallback(async () => {
    try {
      const { error } = await authService.deleteAccount();
      if (error) {
        showError(error || 'Failed to delete account');
        return;
      }

      // Clear Redux profile state
      dispatch(clearProfile());

      showSuccess('Account deleted successfully');
      setShowDeleteAccountModal(false);

      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      showError('Failed to delete account');
    }
  }, [navigation, dispatch]);

  const handleLogout = useCallback(() => {
    if (isGuest) {
      // Navigate to Login for guest users
      navigation.navigate('Login');
    } else {
      setShowLogoutModal(true);
    }
  }, [isGuest, navigation]);

  const handleConfirmLogout = useCallback(async () => {
    try {
      const { error } = await authService.signOut();
      if (error) {
        showError('Failed to logout');
        return;
      }
      // Clear Redux profile state
      dispatch(clearProfile());
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      showError('Failed to logout');
    }
  }, [navigation, dispatch]);

  const handleSaveProfile = useCallback(
    async updatedProfile => {
      try {
        const result = await dispatch(
          updateUserProfile({
            full_name: updatedProfile.name,
            username: updatedProfile.username,
            phone_number: updatedProfile.phone,
            bio: updatedProfile.bio,
            facebook_url: updatedProfile.facebook,
            instagram_url: updatedProfile.instagram,
            twitter_url: updatedProfile.twitter,
            avatar_url: updatedProfile.avatar,
            facebook_show_in_poster:
              updatedProfile.facebook_show_in_poster || false,
            instagram_show_in_poster:
              updatedProfile.instagram_show_in_poster || false,
            twitter_show_in_poster:
              updatedProfile.twitter_show_in_poster || false,
          }),
        ).unwrap();

        showSuccess('Profile saved successfully');
        setShowEditModal(false);
      } catch (error) {
        const errorMessage =
          error?.message || error?.error || error || 'Failed to update profile';
        showError(errorMessage);
        console.error('Exception in handleSaveProfile:', error);
      }
    },
    [dispatch],
  );

  const handleCloseModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const renderOptionItem = useCallback(
    (
      icon,
      title,
      onPress,
      showArrow = true,
      rightComponent = null,
      isDanger = false,
    ) => {
      return (
        <TouchableOpacity
          style={[
            styles.optionItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDanger && { borderColor: '#FF3B30' },
          ]}
          onPress={onPress}
          activeOpacity={0.7}
          disabled={!showArrow && !onPress}
          accessibilityLabel={title}
          accessibilityRole="button"
        >
          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Icon
                  name={icon}
                  size={wp(6)}
                  color={isDanger ? '#FF3B30' : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.optionTitle,
                  { color: isDanger ? '#FF3B30' : colors.text },
                ]}
              >
                {title}
              </Text>
            </View>
            {rightComponent ||
              (showArrow && (
                <Icon
                  name="arrowRight"
                  size={wp(6)}
                  color={isDanger ? '#FF3B30' : colors.textSecondary}
                />
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
      {profileLoading && !reduxProfile && !isGuest ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar && userProfile.avatar.trim() !== '' ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Icon name="profile" size={wp(12)} color={colors.primary} />
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.editIconContainer,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleEditProfile}
                activeOpacity={0.7}
                accessibilityLabel={strings.profile.editProfile}
                accessibilityRole="button"
              >
                <Icon name="pencil" size={wp(4)} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {isGuest ? 'Guest User' : userProfile.name || 'User'}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
              accessibilityLabel={
                isGuest ? strings.auth.signUp : strings.profile.editProfile
              }
              accessibilityRole="button"
            >
              <Icon name="pencil" size={wp(4)} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {isGuest ? strings.auth.signUp : strings.profile.editProfile}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {renderOptionItem(
              'language',
              strings.settings.language,
              handleLanguage,
            )}
            {renderOptionItem(
              theme === 'dark' ? 'sun' : 'moon',
              theme === 'dark'
                ? strings.settings.lightMode
                : strings.settings.darkMode,
              handleThemeToggle,
              false,
              <Switch
                value={theme === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                accessibilityLabel={
                  theme === 'dark'
                    ? strings.settings.lightMode
                    : strings.settings.darkMode
                }
              />,
            )}
            {renderOptionItem('faq', strings.profile.faq, handleFAQ)}
            {renderOptionItem('terms', strings.profile.terms, handleTerms)}
            {renderOptionItem(
              'privacy',
              strings.profile.privacy,
              handlePrivacy,
            )}
            {renderOptionItem('alert', 'Contact Support', handleContactSupport)}
            {!isGuest &&
              renderOptionItem(
                'delete',
                strings.profile.deleteAccount,
                handleDeleteAccount,
                true,
                null,
                true,
              )}
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
            activeOpacity={0.7}
            accessibilityLabel={
              isGuest ? strings.auth.login : strings.settings.logout
            }
            accessibilityRole="button"
          >
            <Text style={[styles.logoutText, { color: '#FF3B30' }]}>
              {isGuest ? strings.auth.login : strings.settings.logout}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!isGuest && (
        <>
          <EditProfileModal
            visible={showEditModal}
            onClose={handleCloseModal}
            profile={userProfile}
            onSave={handleSaveProfile}
          />

          <LogoutModal
            visible={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleConfirmLogout}
          />

          <DeleteAccountModal
            visible={showDeleteAccountModal}
            onClose={() => setShowDeleteAccountModal(false)}
            onConfirm={handleConfirmDeleteAccount}
          />
        </>
      )}

      <ContactSupportModal
        visible={showContactSupportModal}
        onClose={() => setShowContactSupportModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: hp(4),
    paddingHorizontal: wp(5),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
  },
  editButtonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  optionsContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  optionItem: {
    borderRadius: wp(3),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: wp(4),
  },
  optionTitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  logoutButton: {
    marginHorizontal: wp(5),
    marginTop: hp(3),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
