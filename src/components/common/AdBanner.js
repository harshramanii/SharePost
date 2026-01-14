import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { hp, wp } from '../../helper/constants';
import { subscriptionService } from '../../services';
import { useTheme } from '../../hooks/useTheme';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3940256099942544/6300978111'; // Replace with your production Banner Ad Unit ID

const AdBanner = ({ style }) => {
  const { colors } = useTheme();
  const [shouldShow, setShouldShow] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const hasSubscription = await subscriptionService.hasActiveSubscription();
      setShouldShow(!hasSubscription);
    } catch (e) {
      setShouldShow(true);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  if (!shouldShow) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.border },
        style,
      ]}
    >
      <BannerAd unitId={BANNER_AD_UNIT_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderTopWidth: 1,
    minHeight: hp(30), // Ensure 30% of screen height
  },
});

export default AdBanner;

