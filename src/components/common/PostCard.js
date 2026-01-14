import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  Linking,
  ImageBackground,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { showSuccess, showError } from '../../helper/toast';
import { subscriptionService } from '../../services';
import Icon from './Icon';
import DownloadShareModal from './DownloadShareModal';

const PostCard = ({ post, onDownload, onEdit, onShare }) => {
  const navigation = useNavigation();
  const viewShotRef = useRef(null);
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const { profile: userProfile } = useSelector(state => state.user);
  const [showDownloadShareModal, setShowDownloadShareModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'download' or 'share'
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setCheckingSubscription(true);
      const hasSubscription = await subscriptionService.hasActiveSubscription();
      setHasActiveSubscription(hasSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  }, []);

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        // For older versions, use WRITE_EXTERNAL_STORAGE
        const androidVersion = Platform.Version;
        let permission;

        if (androidVersion >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        }

        const granted = await PermissionsAndroid.request(permission, {
          title: 'Storage Permission',
          message: 'App needs access to storage to save images',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }, []);

  const captureAndDownload = useCallback(async () => {
    try {
      if (!viewShotRef.current) {
        showError('Unable to capture card');
        return;
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        showError('Storage permission is required to download');
        return;
      }

      const uri = await viewShotRef.current.capture();

      if (Platform.OS === 'ios') {
        await CameraRoll.save(uri, { type: 'photo' });
      } else {
        await CameraRoll.save(uri, { type: 'photo' });
      }

      showSuccess('Image saved to gallery');
      onDownload?.(post);
    } catch (error) {
      console.error('Error downloading card:', error);
      showError('Failed to download image');
    }
  }, [post, onDownload, requestStoragePermission]);

  const captureAndShare = useCallback(async () => {
    try {
      if (!viewShotRef.current) {
        showError('Unable to capture card');
        return;
      }

      const uri = await viewShotRef.current.capture();

      const shareOptions = {
        title: 'Share Post',
        message: 'Check out this post!',
        url: uri,
        type: 'image/jpeg',
      };

      await Share.open(shareOptions);
      onShare?.(post);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing card:', error);
        showError('Failed to share image');
      }
    }
  }, [post, onShare]);

  const handleDownload = useCallback(() => {
    if (hasActiveSubscription) {
      captureAndDownload();
    } else {
      setPendingAction('download');
      setShowDownloadShareModal(true);
    }
  }, [hasActiveSubscription, captureAndDownload]);

  const handleEdit = useCallback(() => {
    navigation.navigate('Profile', { openEditModal: true });
    onEdit?.(post);
  }, [post, onEdit, navigation]);

  const handleShare = useCallback(() => {
    if (hasActiveSubscription) {
      captureAndShare();
    } else {
      setPendingAction('share');
      setShowDownloadShareModal(true);
    }
  }, [hasActiveSubscription, captureAndShare]);

  const handleModalClose = useCallback(() => {
    setShowDownloadShareModal(false);
    setPendingAction(null);
  }, []);

  const handleAfterViewAds = useCallback(() => {
    // After viewing ads, allow the action
    if (pendingAction === 'download') {
      captureAndDownload();
    } else if (pendingAction === 'share') {
      captureAndShare();
    }
    handleModalClose();
  }, [pendingAction, captureAndDownload, captureAndShare, handleModalClose]);

  const handleSocialLink = useCallback(async (url, type) => {
    if (!url || url.trim() === '') return;

    let finalUrl = url.trim();

    // For WhatsApp, format the phone number
    if (type === 'whatsapp') {
      const phoneNumber = finalUrl.replace(/[^0-9]/g, '');
      if (phoneNumber) {
        finalUrl = `https://wa.me/${phoneNumber}`;
      } else {
        return;
      }
    }

    // Ensure URL has protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (canOpen) {
        await Linking.openURL(finalUrl);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'jpg', quality: 0.9 }}
        style={styles.viewShot}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ uri: post.image ?? '' }}
              style={styles.image}
              resizeMode="stretch"
            >
              <View style={styles.bottomOverlay}>
                <View style={styles.profileSection}>
                  {userProfile &&
                  userProfile.avatar_url &&
                  userProfile.avatar_url.trim() !== '' ? (
                    <Image
                      source={{ uri: userProfile.avatar_url ?? '' }}
                      style={[
                        styles.profilePhoto,
                        { borderColor: colors.primary },
                      ]}
                    />
                  ) : (
                    <View />
                  )}
                  <View
                    style={[
                      styles.nameContainer,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[styles.fullName, { color: colors.white }]}
                      numberOfLines={1}
                    >
                      {userProfile && userProfile.full_name
                        ? userProfile.full_name
                        : strings.home.welcomeUser}
                    </Text>
                  </View>
                </View>
              </View>
              {((userProfile?.facebook_url &&
                userProfile?.facebook_show_in_poster) ||
                (userProfile?.instagram_url &&
                  userProfile?.instagram_show_in_poster) ||
                (userProfile?.twitter_url &&
                  userProfile?.twitter_show_in_poster)) && (
                <View
                  style={[
                    styles.footer,
                    {
                      backgroundColor: colors.background,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  {userProfile?.facebook_url &&
                    userProfile?.facebook_show_in_poster && (
                      <TouchableOpacity
                        style={styles.socialLink}
                        onPress={() =>
                          handleSocialLink(userProfile.facebook_url, 'facebook')
                        }
                      >
                        <Icon name="facebook" size={wp(4)} color="#1877F2" />
                        <Text
                          style={[
                            styles.socialText,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {userProfile?.facebook_url ?? ''}
                        </Text>
                      </TouchableOpacity>
                    )}

                  {userProfile?.instagram_url &&
                    userProfile?.instagram_show_in_poster && (
                      <TouchableOpacity
                        style={styles.socialLink}
                        onPress={() =>
                          handleSocialLink(
                            userProfile.instagram_url,
                            'instagram',
                          )
                        }
                      >
                        <Icon name="instagram" size={wp(4)} color="#E4405F" />
                        <Text
                          style={[
                            styles.socialText,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {userProfile?.instagram_url ?? ''}
                        </Text>
                      </TouchableOpacity>
                    )}

                  {userProfile?.twitter_url &&
                    userProfile?.twitter_show_in_poster && (
                      <TouchableOpacity
                        style={styles.socialLink}
                        onPress={() =>
                          handleSocialLink(userProfile.twitter_url, 'twitter')
                        }
                      >
                        <Icon name="twitter" size={wp(4)} color="#000000" />
                        <Text
                          style={[
                            styles.socialText,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {userProfile?.twitter_url ?? ''}
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              )}
            </ImageBackground>
          </View>
        </View>
      </ViewShot>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={handleDownload}
          activeOpacity={0.7}
          accessibilityLabel={strings.home.download}
          accessibilityRole="button"
        >
          <Icon name="download" size={wp(5)} color={colors.primary} />
          <Text
            style={[styles.actionLabel, { color: colors.text }]}
            numberOfLines={1}
          >
            {strings.home.download}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={handleEdit}
          activeOpacity={0.7}
          accessibilityLabel={strings.home.edit}
          accessibilityRole="button"
        >
          <Icon name="edit" size={wp(5)} color={colors.primary} />
          <Text
            style={[styles.actionLabel, { color: colors.text }]}
            numberOfLines={1}
          >
            {strings.home.edit}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityLabel={strings.common.share}
          accessibilityRole="button"
        >
          <Icon name="share" size={wp(5)} color={colors.primary} />
          <Text
            style={[styles.actionLabel, { color: colors.text }]}
            numberOfLines={1}
          >
            {strings.common.share}
          </Text>
        </TouchableOpacity>
      </View>

      <DownloadShareModal
        visible={showDownloadShareModal}
        onClose={handleModalClose}
        actionType={pendingAction || 'download'}
        onAdWatched={handleAfterViewAds}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  viewShot: {
    width: '100%',
    height: hp(40),
    borderRadius: wp(4),
  },
  card: {
    width: '100%',
    height: hp(46),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: '85%',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: wp(3),
    // paddingBottom: hp(1),
    paddingTop: hp(1),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(2.5),
  },
  profilePhoto: {
    width: wp(16),
    height: wp(16),
    borderWidth: 2,
    borderTopRightRadius: wp(2),
  },
  profilePhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  nameContainer: {
    // flex: 1,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopLeftRadius: wp(2),
  },
  fullName: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    gap: wp(2),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  actionLabel: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.bold,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopWidth: 1,
    // gap: wp(4),
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.5),
    // flex: 1,
  },
  socialText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
  },
});

export default PostCard;
