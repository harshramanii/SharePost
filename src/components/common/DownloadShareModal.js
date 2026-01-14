import React, { useCallback, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Icon, Button } from '../../components';
import { adService, authService } from '../../services';
import { showSuccess, showError } from '../../helper/toast';

const DownloadShareModal = ({
  visible,
  onClose,
  actionType = 'download',
  onAdWatched,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [loadingAd, setLoadingAd] = useState(false);
  const [adReady, setAdReady] = useState(false);

  // Preload ad when modal becomes visible
  useEffect(() => {
    if (visible) {
      preloadAd();
    }
  }, [visible]);

  const preloadAd = useCallback(async () => {
    try {
      setAdReady(false);
      const result = await adService.preloadInterstitialAd();
      if (result.success && !result.skipped) {
        setAdReady(true);
      } else if (result.skipped) {
        // User has subscription, allow action directly
        setAdReady(true);
      }
    } catch (error) {
      console.error('Error preloading ad:', error);
      setAdReady(false);
    }
  }, []);

  const handleViewAds = useCallback(async () => {
    try {
      setLoadingAd(true);
      const result = await adService.showInterstitialAd();

      if (result.success) {
        if (result.skipped) {
          // User has subscription, allow action directly
          showSuccess('Action allowed!');
          onClose();
          if (onAdWatched) {
            onAdWatched();
          }
        } else {
          // Ad was shown and closed
          showSuccess('Ad watched successfully!');
          onClose();
          // Call the callback to allow the action after watching ad
          if (onAdWatched) {
            onAdWatched();
          }
        }
      } else {
        showError(result.error || 'Failed to show ad. Please try again.');
      }
    } catch (error) {
      console.error('Error showing ad:', error);
      showError('Failed to show ad. Please try again.');
    } finally {
      setLoadingAd(false);
      // Reload ad for next time
      preloadAd();
    }
  }, [onClose, onAdWatched, preloadAd]);

  const handlePurchaseSubscription = useCallback(async () => {
    onClose();
    // Check if user is logged in
    try {
      const { data: sessionData } = await authService.getSession();
      if (!sessionData?.session) {
        // User is not logged in, navigate to Login screen
        navigation.navigate('Login');
      } else {
        // User is logged in, navigate to Profile screen and open subscription modal
        navigation.navigate('Profile', { openSubscriptionModal: true });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // On error, navigate to Login screen
      navigation.navigate('Login');
    }
  }, [navigation, onClose]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const actionText =
    actionType === 'download'
      ? strings.downloadShare?.download || 'Download'
      : strings.downloadShare?.share || 'Share';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleOverlayPress}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          onPress={e => e.stopPropagation()}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {strings.downloadShare?.title || 'Unlock Premium Features'}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="close"
                    size={wp(6)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                >
                  {strings.downloadShare?.description ||
                    `To ${actionText.toLowerCase()} posts, please choose one of the following options:`}
                </Text>

                {/* View Ads Option - Whole card is clickable */}
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      opacity: loadingAd ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleViewAds}
                  activeOpacity={0.7}
                  disabled={loadingAd || !adReady}
                >
                  <View style={styles.optionContent} pointerEvents="none">
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: colors.primary + '20' },
                        ]}
                      >
                        {loadingAd ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Icon
                            name="video"
                            size={wp(6)}
                            color={colors.primary}
                          />
                        )}
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[styles.optionTitle, { color: colors.text }]}
                        >
                          {loadingAd
                            ? strings.downloadShare?.loadingAd ||
                              'Loading Ad...'
                            : strings.downloadShare?.viewAds || 'View Ads'}
                        </Text>
                        <Text
                          style={[
                            styles.optionSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {strings.downloadShare?.viewAdsDescription ||
                            'Watch a short ad to unlock this feature'}
                        </Text>
                      </View>
                    </View>
                    {!loadingAd && (
                      <Icon
                        name="arrowRight"
                        size={wp(5)}
                        color={colors.textSecondary}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Purchase Subscription Option */}
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handlePurchaseSubscription}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: colors.primary + '20' },
                        ]}
                      >
                        <Icon
                          name="settings"
                          size={wp(6)}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[styles.optionTitle, { color: colors.text }]}
                        >
                          {strings.downloadShare?.purchaseSubscription ||
                            'Purchase Subscription'}
                        </Text>
                        <Text
                          style={[
                            styles.optionSubtitle,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {strings.downloadShare?.purchaseDescription ||
                            'Get unlimited downloads and shares'}
                        </Text>
                      </View>
                    </View>
                    <Icon
                      name="arrowRight"
                      size={wp(5)}
                      color={colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    borderRadius: wp(4),
    maxHeight: hp(70),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    borderRadius: wp(4),
  },
  modalContent: {
    padding: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: fontFamily.bold,
    flex: 1,
  },
  closeButton: {
    padding: wp(1),
  },
  content: {
    gap: hp(2),
  },
  description: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginBottom: hp(2),
    lineHeight: fontSize(20),
  },
  optionCard: {
    borderRadius: wp(3),
    borderWidth: 1,
    padding: wp(4),
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
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    marginBottom: hp(0.5),
  },
  optionSubtitle: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
  },
});

export default DownloadShareModal;
