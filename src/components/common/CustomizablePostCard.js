import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
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
  TextInput,
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

const CustomizablePostCard = ({
  backgroundImage,
  backgroundText,
  backgroundColor,
  fontColor,
  fontSize: customFontSize,
  onDownload,
  onShare,
  showEdit = false,
}) => {
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

  useEffect(() => {
    if (showDownloadShareModal) {
      checkSubscriptionStatus();
    }
  }, [showDownloadShareModal, checkSubscriptionStatus]);

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
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
      onDownload?.();
    } catch (error) {
      console.error('Error downloading card:', error);
      showError('Failed to download image');
    }
  }, [onDownload, requestStoragePermission]);

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
      onShare?.();
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing card:', error);
        showError('Failed to share image');
      }
    }
  }, [onShare]);

  const handleModalClose = useCallback(() => {
    setShowDownloadShareModal(false);
    setPendingAction(null);
  }, []);

  const handleAfterViewAds = useCallback(() => {
    if (pendingAction === 'download') {
      captureAndDownload();
      return;
    }
    if (pendingAction === 'share') {
      captureAndShare();
    }
  }, [pendingAction, captureAndDownload, captureAndShare]);

  const handleDownload = useCallback(() => {
    if (checkingSubscription) return;
    if (hasActiveSubscription) {
      captureAndDownload();
      return;
    }
    setPendingAction('download');
    setShowDownloadShareModal(true);
  }, [checkingSubscription, hasActiveSubscription, captureAndDownload]);

  const handleShare = useCallback(() => {
    if (checkingSubscription) return;
    if (hasActiveSubscription) {
      captureAndShare();
      return;
    }
    setPendingAction('share');
    setShowDownloadShareModal(true);
  }, [checkingSubscription, hasActiveSubscription, captureAndShare]);

  const handleSocialLink = useCallback(async (url, type) => {
    if (!url || url.trim() === '') return;

    let finalUrl = url.trim();

    if (type === 'whatsapp') {
      const phoneNumber = finalUrl.replace(/[^0-9]/g, '');
      if (phoneNumber) {
        finalUrl = `https://wa.me/${phoneNumber}`;
      } else {
        return;
      }
    }

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

  const textFontSize = useMemo(() => {
    if (customFontSize === 'small') return fontSize(16);
    if (customFontSize === 'large') return fontSize(32);
    return fontSize(24); // medium
  }, [customFontSize]);

  const bgColor = backgroundColor || colors.surface;
  const textColor = fontColor || colors.text;

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
            {backgroundImage ? (
              <ImageBackground
                source={{ uri: backgroundImage }}
                style={styles.image}
                resizeMode="cover"
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
                            handleSocialLink(
                              userProfile.facebook_url,
                              'facebook',
                            )
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
            ) : (
              <View
                style={[
                  styles.textBackgroundContainer,
                  { backgroundColor: bgColor },
                ]}
              >
                {backgroundText && (
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        styles.backgroundText,
                        {
                          color: textColor,
                          fontSize: textFontSize,
                        },
                      ]}
                    >
                      {backgroundText}
                    </Text>
                  </View>
                )}
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
                            handleSocialLink(
                              userProfile.facebook_url,
                              'facebook',
                            )
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
              </View>
            )}
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
          <Icon name="download" size={wp(6)} color={colors.primary} />
          <Text
            style={[styles.actionLabel, { color: colors.text }]}
            numberOfLines={1}
          >
            {strings.home.download}
          </Text>
        </TouchableOpacity>

        {showEdit && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
            onPress={() =>
              navigation.navigate('Profile', { openEditModal: true })
            }
            activeOpacity={0.7}
            accessibilityLabel={strings.home.edit}
            accessibilityRole="button"
          >
            <Icon name="edit" size={wp(6)} color={colors.primary} />
            <Text
              style={[styles.actionLabel, { color: colors.text }]}
              numberOfLines={1}
            >
              {strings.home.edit}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityLabel={strings.common.share}
          accessibilityRole="button"
        >
          <Icon name="share" size={wp(6)} color={colors.primary} />
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
    height: hp(34),
    borderRadius: wp(4),
  },
  card: {
    width: '100%',
    height: hp(40),
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
    justifyContent: 'flex-end',
  },
  textBackgroundContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    position: 'relative',
    flexDirection: 'column',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(12),
  },
  backgroundText: {
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: hp(6),
    left: 0,
    right: 0,
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
  nameContainer: {
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
    fontSize: fontSize(14),
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
    marginTop: 'auto',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(0.5),
  },
  socialText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
  },
});

export default CustomizablePostCard;
