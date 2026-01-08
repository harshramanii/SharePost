import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActionSheetIOS,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { hp, wp, isIos } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useDispatch } from 'react-redux';
import { Button, Input, Icon } from '../../components';
import { authService } from '../../services';
import { showSuccess, showError } from '../../helper/toast';
import { ONBOARDING_COMPLETED } from '../../helper/constData';
import { fetchUserProfile } from '../../store/slices/userSlice';

const PersonalDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const email = route.params?.email || '';
  const userIdFromParams = route.params?.userId || null;
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    bio: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const validatePhone = useCallback(phone => {
    if (!phone || phone.trim() === '') return true;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }, []);

  const validateURL = useCallback(url => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    },
    [errors],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = strings.profile.nameRequired;
    }

    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        'Username can only contain letters, numbers, and underscores';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = strings.profile.phoneInvalid;
    }

    if (formData.facebook && !validateURL(formData.facebook)) {
      newErrors.facebook = strings.profile.urlInvalid;
    }

    if (formData.instagram && !validateURL(formData.instagram)) {
      newErrors.instagram = strings.profile.urlInvalid;
    }

    if (formData.twitter && !validateURL(formData.twitter)) {
      newErrors.twitter = strings.profile.urlInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePhone, validateURL, strings]);

  const showImagePickerOptions = useCallback(() => {
    if (isIos) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Camera', 'Photo Library'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleImagePicker('camera');
          } else if (buttonIndex === 2) {
            handleImagePicker('gallery');
          }
        },
      );
    } else {
      setShowImagePickerModal(true);
    }
  }, []);

  const handleImagePicker = useCallback(async source => {
    setShowImagePickerModal(false);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: false,
    };

    try {
      let response;
      if (source === 'camera') {
        response = await launchCamera(options);
      } else {
        response = await launchImageLibrary(options);
      }

      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        showError(response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageUri = asset.uri;
        setProfileImage(imageUri);
      }
    } catch (error) {
      showError('Failed to pick image');
      console.error('Image picker error:', error);
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let userId = userIdFromParams;

      // Try to get current user, but don't fail if in signup flow
      if (!userId) {
        const { data: user, error: userError } =
          await authService.getCurrentUser();

        if (userError || !user?.id) {
          // Try to get user from session directly
          const { data: sessionData } = await authService.getSession();
          if (sessionData?.session?.user?.id) {
            userId = sessionData.session.user.id;
          } else {
            showError('User not found. Please try logging in again.');
            navigation.replace('Login');
            return;
          }
        } else {
          userId = user.id;
        }
      }

      // Upload profile photo if selected and is a local file
      let avatarUrl = profileImage;
      if (
        profileImage &&
        (profileImage.startsWith('file://') ||
          profileImage.startsWith('content://') ||
          profileImage.startsWith('ph://'))
      ) {
        const { data: uploadedUrl, error: uploadError } =
          await authService.uploadProfilePhoto(userId, profileImage);
        if (uploadError) {
          showError(uploadError.message || 'Failed to upload profile photo');
          setLoading(false);
          return;
        }
        avatarUrl = uploadedUrl;
      }

      // Update user profile
      const { error: updateError } = await authService.updateProfile(userId, {
        full_name: formData.name,
        username: formData.username,
        phone_number: formData.phone,
        bio: formData.bio,
        facebook_url: formData.facebook,
        instagram_url: formData.instagram,
        twitter_url: formData.twitter,
        avatar_url: avatarUrl,
      });

      if (updateError) {
        showError(updateError.message || 'Failed to save profile');
        return;
      }

      // Ensure session is saved before navigating
      let sessionSaved = false;
      const { data: sessionData } = await authService.getSession();
      if (sessionData?.session?.access_token) {
        await authService.saveToken(
          sessionData.session.access_token,
          sessionData.session.user,
        );
        sessionSaved = true;
      } else {
        // Try to get user directly and create session
        try {
          const { data: userData } = await authService.getCurrentUser();
          if (userData?.id) {
            // Get fresh session
            const { data: freshSession } = await authService.getSession();
            if (freshSession?.session?.access_token) {
              await authService.saveToken(
                freshSession.session.access_token,
                freshSession.session.user,
              );
              sessionSaved = true;
            }
          }
        } catch (sessionError) {
          console.warn('Could not refresh session:', sessionError);
        }
      }

      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED, 'true');

      // Verify session one more time before navigating
      if (!sessionSaved) {
        const { data: finalSession } = await authService.getSession();
        if (finalSession?.session?.access_token) {
          await authService.saveToken(
            finalSession.session.access_token,
            finalSession.session.user,
          );
        } else {
          // If still no session, try to get current user to trigger session refresh
          await authService.getCurrentUser();
        }
      }

      // Fetch updated user profile to update Redux state
      dispatch(fetchUserProfile());

      // Navigate to Dashboard (Home) - use replace to prevent going back
      // Loading screen will check session and navigate to HomeTabs if valid
      navigation.replace('Main');
      showSuccess('Profile setup completed');
    } catch (error) {
      showError(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    profileImage,
    validateForm,
    navigation,
    userIdFromParams,
    dispatch,
  ]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.auth.personalDetails}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Complete your profile to get started
          </Text>

          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View
                  style={[
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
                onPress={showImagePickerOptions}
                activeOpacity={0.7}
              >
                <Icon name="pencil" size={wp(4)} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={showImagePickerOptions}
              activeOpacity={0.7}
            >
              <Icon name="photo" size={wp(5)} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.text }]}>
                {strings.auth.uploadPhoto}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label={strings.profile.fullName}
              value={formData.name}
              onChangeText={value => handleChange('name', value)}
              placeholder={strings.profile.fullName}
              error={errors.name}
            />

            <Input
              label="Username"
              value={formData.username}
              onChangeText={value => handleChange('username', value)}
              placeholder="username"
              autoCapitalize="none"
              error={errors.username}
            />

            <Input
              label={strings.profile.phoneNumber}
              value={formData.phone}
              onChangeText={value => handleChange('phone', value)}
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label={strings.profile.bio}
              value={formData.bio}
              onChangeText={value => handleChange('bio', value)}
              placeholder={strings.profile.bio}
              multiline
              numberOfLines={4}
              error={errors.bio}
            />

            <View style={styles.socialSection}>
              <View style={styles.socialIconContainer}>
                <Icon name="facebook" size={wp(5)} color={colors.primary} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>
                  {strings.profile.facebook}
                </Text>
              </View>
              <Input
                value={formData.facebook}
                onChangeText={value => handleChange('facebook', value)}
                placeholder="https://facebook.com/username"
                keyboardType="url"
                autoCapitalize="none"
                error={errors.facebook}
              />
            </View>

            <View style={styles.socialSection}>
              <View style={styles.socialIconContainer}>
                <Icon name="instagram" size={wp(5)} color={colors.primary} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>
                  {strings.profile.instagram}
                </Text>
              </View>
              <Input
                value={formData.instagram}
                onChangeText={value => handleChange('instagram', value)}
                placeholder="https://instagram.com/username"
                keyboardType="url"
                autoCapitalize="none"
                error={errors.instagram}
              />
            </View>

            <View style={styles.socialSection}>
              <View style={styles.socialIconContainer}>
                <Icon name="twitter" size={wp(5)} color={colors.primary} />
                <Text style={[styles.socialLabel, { color: colors.text }]}>
                  {strings.profile.twitter}
                </Text>
              </View>
              <Input
                value={formData.twitter}
                onChangeText={value => handleChange('twitter', value)}
                placeholder="https://twitter.com/username"
                keyboardType="url"
                autoCapitalize="none"
                error={errors.twitter}
              />
            </View>

            <Button
              title={strings.auth.continue}
              onPress={handleContinue}
              loading={loading}
              style={styles.continueButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Image Picker Modal for Android */}
      {!isIos && (
        <Modal
          visible={showImagePickerModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImagePickerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Photo
              </Text>
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleImagePicker('camera')}
              >
                <Icon name="camera" size={wp(6)} color={colors.primary} />
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Camera
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImagePicker('gallery')}
              >
                <Icon name="photo" size={wp(6)} color={colors.primary} />
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Photo Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalCancelButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowImagePickerModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    paddingBottom: hp(12),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginBottom: hp(4),
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: hp(4),
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
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    borderWidth: 1,
    gap: wp(2),
  },
  uploadButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  form: {
    width: '100%',
  },
  socialSection: {
    marginBottom: hp(2),
  },
  socialIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(1),
  },
  socialLabel: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
  continueButton: {
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  modalTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    gap: wp(3),
  },
  modalOptionText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  modalCancelButton: {
    marginTop: hp(2),
    marginHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
  },
});

export default PersonalDetailsScreen;
