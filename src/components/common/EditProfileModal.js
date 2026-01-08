import React, { useCallback, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActionSheetIOS,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, Icon } from '../../components';
import { showError } from '../../helper/toast';

const EditProfileModal = ({ visible, onClose, profile, onSave }) => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    bio: '',
    facebook: '',
    instagram: '',
    twitter: '',
    avatar: '',
    facebook_show_in_poster: false,
    instagram_show_in_poster: false,
    twitter_show_in_poster: false,
  });
  const [errors, setErrors] = useState({});
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Update form data when profile changes or modal opens
  useEffect(() => {
    if (visible && profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
        twitter: profile.twitter || '',
        avatar: profile.avatar || '',
        facebook_show_in_poster: profile.facebook_show_in_poster || false,
        instagram_show_in_poster: profile.instagram_show_in_poster || false,
        twitter_show_in_poster: profile.twitter_show_in_poster || false,
      });
      setSelectedImage(profile.avatar || null);
      setErrors({});
    }
  }, [visible, profile]);

  const showImagePickerOptions = useCallback(() => {
    if (Platform.OS === 'ios') {
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
        setSelectedImage(imageUri);
        setFormData(prev => ({ ...prev, avatar: imageUri }));
      }
    } catch (error) {
      showError('Failed to pick image');
      console.error('Image picker error:', error);
    }
  }, []);

  const validatePhone = useCallback(phone => {
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

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    // Call onSave and wait for it to complete
    // onSave should handle success/error alerts
    await onSave(formData);
  }, [formData, validateForm, onSave]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    setFormData(profile);
    setErrors({});
    onClose();
  }, [profile, onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={handleOverlayPress}>
        <View
          style={styles.modalContentWrapper}
          onStartShouldSetResponder={() => true}
        >
          <SafeAreaView
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings.profile.editProfile}
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
                activeOpacity={0.7}
                accessibilityLabel={strings.common.cancel}
                accessibilityRole="button"
              >
                <Icon name="close" size={wp(6)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formContainer}>
                {/* Profile Image Section */}
                <View style={styles.profileImageContainer}>
                  <TouchableOpacity
                    onPress={showImagePickerOptions}
                    style={styles.profileImageWrapper}
                    activeOpacity={0.7}
                  >
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.profileImagePlaceholder,
                          { backgroundColor: colors.primary + '20' },
                        ]}
                      >
                        <Icon
                          name="profile"
                          size={wp(15)}
                          color={colors.primary}
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.cameraIconContainer,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Icon name="camera" size={wp(5)} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.profileImageLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tap to change profile photo
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {strings.profile.fullName} *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.name ? '#FF3B30' : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.name}
                    onChangeText={value => handleChange('name', value)}
                    placeholder={strings.profile.fullName}
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel={strings.profile.fullName}
                    accessibilityHint="Enter your full name"
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Username *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.username
                          ? '#FF3B30'
                          : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.username}
                    onChangeText={value => handleChange('username', value)}
                    placeholder="username"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    accessibilityLabel="Username"
                    accessibilityHint="Enter your username"
                  />
                  {errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {strings.profile.phoneNumber}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.phone ? '#FF3B30' : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.phone}
                    onChangeText={value => handleChange('phone', value)}
                    placeholder="+1 234 567 8900"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    accessibilityLabel={strings.profile.phoneNumber}
                    accessibilityHint="Enter your phone number with country code"
                  />
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {strings.profile.bio}
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.bio}
                    onChangeText={value => handleChange('bio', value)}
                    placeholder={strings.profile.bio}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    accessibilityLabel={strings.profile.bio}
                    accessibilityHint="Enter your bio or description"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.socialHeaderContainer}>
                    <View style={styles.socialIconContainer}>
                      <Icon
                        name="facebook"
                        size={wp(5)}
                        color={colors.primary}
                      />
                      <Text style={[styles.label, { color: colors.text }]}>
                        {strings.profile.facebook}
                      </Text>
                    </View>
                    <View style={styles.switchContainer}>
                      <Text
                        style={[styles.switchLabel, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        Show in Poster
                      </Text>
                      <Switch
                        value={formData.facebook_show_in_poster}
                        onValueChange={value =>
                          handleChange('facebook_show_in_poster', value)
                        }
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={colors.white}
                        accessibilityLabel="Show Facebook in Poster"
                      />
                    </View>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.facebook
                          ? '#FF3B30'
                          : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.facebook}
                    onChangeText={value => handleChange('facebook', value)}
                    placeholder="https://facebook.com/username"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="url"
                    autoCapitalize="none"
                    accessibilityLabel={strings.profile.facebook}
                    accessibilityHint="Enter your Facebook profile URL"
                  />
                  {errors.facebook && (
                    <Text style={styles.errorText}>{errors.facebook}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.socialHeaderContainer}>
                    <View style={styles.socialIconContainer}>
                      <Icon
                        name="instagram"
                        size={wp(5)}
                        color={colors.primary}
                      />
                      <Text style={[styles.label, { color: colors.text }]}>
                        {strings.profile.instagram}
                      </Text>
                    </View>
                    <View style={styles.switchContainer}>
                      <Text
                        style={[styles.switchLabel, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        Show in Poster
                      </Text>
                      <Switch
                        value={formData.instagram_show_in_poster}
                        onValueChange={value =>
                          handleChange('instagram_show_in_poster', value)
                        }
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={colors.white}
                        accessibilityLabel="Show Instagram in Poster"
                      />
                    </View>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.instagram
                          ? '#FF3B30'
                          : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.instagram}
                    onChangeText={value => handleChange('instagram', value)}
                    placeholder="https://instagram.com/username"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="url"
                    autoCapitalize="none"
                    accessibilityLabel={strings.profile.instagram}
                    accessibilityHint="Enter your Instagram profile URL"
                  />
                  {errors.instagram && (
                    <Text style={styles.errorText}>{errors.instagram}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.socialHeaderContainer}>
                    <View style={styles.socialIconContainer}>
                      <Icon
                        name="twitter"
                        size={wp(5)}
                        color={colors.primary}
                      />
                      <Text style={[styles.label, { color: colors.text }]}>
                        {strings.profile.twitter}
                      </Text>
                    </View>
                    <View style={styles.switchContainer}>
                      <Text
                        style={[styles.switchLabel, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        Show in Poster
                      </Text>
                      <Switch
                        value={formData.twitter_show_in_poster}
                        onValueChange={value =>
                          handleChange('twitter_show_in_poster', value)
                        }
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={colors.white}
                        accessibilityLabel="Show Twitter in Poster"
                      />
                    </View>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.twitter ? '#FF3B30' : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.twitter}
                    onChangeText={value => handleChange('twitter', value)}
                    placeholder="https://twitter.com/username"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="url"
                    autoCapitalize="none"
                    accessibilityLabel={strings.profile.twitter}
                    accessibilityHint="Enter your Twitter profile URL"
                  />
                  {errors.twitter && (
                    <Text style={styles.errorText}>{errors.twitter}</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Button
                title={strings.common.cancel}
                onPress={handleCancel}
                style={[styles.footerButton, styles.cancelButton]}
                textStyle={{ color: colors.text }}
              />
              <Button
                title={strings.profile.save}
                onPress={handleSave}
                style={styles.footerButton}
              />
            </View>
          </SafeAreaView>
        </View>
      </Pressable>

      {/* Image Picker Options Modal for Android */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <Pressable
          style={styles.imagePickerOverlay}
          onPress={() => setShowImagePickerModal(false)}
        >
          <View
            style={[
              styles.imagePickerContainer,
              { backgroundColor: colors.surface },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.imagePickerTitle, { color: colors.text }]}>
              Select Photo
            </Text>
            <TouchableOpacity
              style={[
                styles.imagePickerOption,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => handleImagePicker('camera')}
            >
              <Icon name="camera" size={wp(6)} color={colors.primary} />
              <Text
                style={[styles.imagePickerOptionText, { color: colors.text }]}
              >
                Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => handleImagePicker('gallery')}
            >
              <Icon name="photo" size={wp(6)} color={colors.primary} />
              <Text
                style={[styles.imagePickerOptionText, { color: colors.text }]}
              >
                Photo Library
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.imagePickerCancel,
                { borderTopColor: colors.border },
              ]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text
                style={[styles.imagePickerCancelText, { color: colors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    height: hp(90),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: fontFamily.bold,
  },
  closeButton: {
    padding: wp(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  formContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
  input: {
    width: '100%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  textArea: {
    width: '100%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    minHeight: hp(10),
  },
  socialHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  socialIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  errorText: {
    color: '#FF3B30',
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    gap: wp(3),
  },
  footerButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: hp(1),
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cameraIconContainer: {
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
  profileImageLabel: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerContainer: {
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingBottom: hp(2),
  },
  imagePickerTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    gap: wp(3),
  },
  imagePickerOptionText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginLeft: wp(3),
  },
  imagePickerCancel: {
    paddingVertical: hp(2),
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: hp(1),
  },
  imagePickerCancelText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    color: '#FF3B30',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    flexShrink: 0,
  },
  switchLabel: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    flexShrink: 0,
  },
});

export default EditProfileModal;
