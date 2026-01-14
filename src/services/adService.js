import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { subscriptionService } from './subscriptionService';

// Ad Unit IDs - Replace with your actual Ad Unit IDs from AdMob
// Test IDs are used automatically in development mode via TestIds
// Get your production Ad Unit IDs from: https://admob.google.com
const AD_UNIT_IDS = {
  rewarded:
    Platform.OS === 'android'
      ? 'ca-app-pub-3940256099942544/5224354917' // Replace with your Android Rewarded Ad Unit ID
      : 'ca-app-pub-3940256099942544/1712485313', // Replace with your iOS Rewarded Ad Unit ID
  interstitial:
    Platform.OS === 'android'
      ? 'ca-app-pub-3940256099942544/1033173712' // Replace with your Android Interstitial Ad Unit ID
      : 'ca-app-pub-3940256099942544/4411468910', // Replace with your iOS Interstitial Ad Unit ID
};

class AdService {
  constructor() {
    this.isInitialized = false;
    this.rewardedAd = null;
    this.interstitialAd = null;
  }

  waitForAdLoaded = (ad, timeoutMs = 10000) => {
    return new Promise((resolve, reject) => {
      if (!ad) {
        reject(new Error('Ad instance missing'));
        return;
      }

      // Some platforms may already report loaded
      if (ad.loaded) {
        resolve(true);
        return;
      }

      let didFinish = false;
      let unsubscribeLoaded = null;
      let unsubscribeError = null;

      const finish = (err, value) => {
        if (didFinish) return;
        didFinish = true;
        if (unsubscribeLoaded) unsubscribeLoaded();
        if (unsubscribeError) unsubscribeError();
        if (err) reject(err);
        else resolve(value);
      };

      const timer = setTimeout(() => {
        finish(new Error('Ad load timeout'));
      }, timeoutMs);

      unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        clearTimeout(timer);
        finish(null, true);
      });

      unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, error => {
        clearTimeout(timer);
        finish(new Error(error?.message || 'Ad failed to load'));
      });
    });
  };

  // Initialize Google Mobile Ads
  initialize = async () => {
    try {
      if (this.isInitialized) {
        return { success: true };
      }

      // Configure request settings before initializing
      // This is optional but recommended for better ad targeting
      await mobileAds().setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,
        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        // Set to false if your app is not child-directed
        tagForChildDirectedTreatment: false,
        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: false,
        // An array of test device IDs to allow (emulator is included by default in dev mode)
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });

      // Initialize the SDK
      await mobileAds().initialize();
      this.isInitialized = true;
      console.log('[AdService] Google Mobile Ads initialized');
      return { success: true };
    } catch (error) {
      console.error('[AdService] Error initializing ads:', error);
      return { success: false, error: error.message };
    }
  };

  // Load a rewarded ad
  loadRewardedAd = async () => {
    try {
      // Check subscription first
      const hasSubscription = await this.checkSubscription();
      if (hasSubscription) {
        console.log(
          '[AdService] User has active subscription, skipping rewarded ad load',
        );
        return { success: true, skipped: true };
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      // Create and load rewarded ad
      // Using test IDs in development, production IDs in release
      const adUnitId = __DEV__ ? TestIds.REWARDED : AD_UNIT_IDS.rewarded;
      this.rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false, // Set to true if you want non-personalized ads only
      });

      await this.rewardedAd.load();
      console.log('[AdService] Rewarded ad loaded');
      return { success: true };
    } catch (error) {
      console.error('[AdService] Error loading rewarded ad:', error);
      return { success: false, error: error.message };
    }
  };

  // Show rewarded ad
  showRewardedAd = async () => {
    try {
      // Check subscription first
      const hasSubscription = await this.checkSubscription();
      if (hasSubscription) {
        console.log(
          '[AdService] User has active subscription, skipping rewarded ad',
        );
        return { success: true, skipped: true };
      }

      if (!this.rewardedAd) {
        const loadResult = await this.loadRewardedAd();
        if (!loadResult.success) {
          return {
            success: false,
            error: 'Failed to load ad. Please try again.',
          };
        }
      }

      // Check if ad is loaded
      if (!this.rewardedAd.loaded) {
        const loadResult = await this.loadRewardedAd();
        if (!loadResult.success) {
          return {
            success: false,
            error: 'Ad not ready. Please try again.',
          };
        }
      }

      // Show the ad
      return new Promise((resolve, reject) => {
        const unsubscribeLoaded = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            console.log('[AdService] Rewarded ad loaded');
          },
        );

        const unsubscribeEarned = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          reward => {
            console.log('[AdService] User earned reward:', reward);
            unsubscribeLoaded();
            unsubscribeEarned();
            resolve({ success: true, reward });
          },
        );

        const unsubscribeError = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.ERROR,
          error => {
            console.error('[AdService] Rewarded ad error:', error);
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeError();
            reject({ success: false, error: error.message });
          },
        );

        const unsubscribeClosed = this.rewardedAd.addAdEventListener(
          RewardedAdEventType.CLOSED,
          () => {
            console.log('[AdService] Rewarded ad closed');
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeError();
            unsubscribeClosed();
            // If ad was closed without earning reward
            if (!this.rewardedAd.loaded) {
              resolve({ success: false, error: 'Ad was closed' });
            }
          },
        );

        // Show the ad
        this.rewardedAd.show().catch(error => {
          console.error('[AdService] Error showing rewarded ad:', error);
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeError();
          unsubscribeClosed();
          reject({ success: false, error: error.message });
        });
      });
    } catch (error) {
      console.error('[AdService] Error showing rewarded ad:', error);
      return { success: false, error: error.message };
    }
  };

  // Preload rewarded ad (call this when app starts or when modal opens)
  preloadRewardedAd = async () => {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return await this.loadRewardedAd();
    } catch (error) {
      console.error('[AdService] Error preloading rewarded ad:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has active subscription
  checkSubscription = async () => {
    try {
      return await subscriptionService.hasActiveSubscription();
    } catch (error) {
      console.error('[AdService] Error checking subscription:', error);
      return false;
    }
  };

  // Load an interstitial ad
  loadInterstitialAd = async () => {
    try {
      // Check subscription first
      const hasSubscription = await this.checkSubscription();
      if (hasSubscription) {
        console.log(
          '[AdService] User has active subscription, skipping ad load',
        );
        return { success: true, skipped: true };
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      // If ad already exists and is loaded, don't recreate it
      if (this.interstitialAd && this.interstitialAd.loaded) {
        console.log('[AdService] Interstitial ad already loaded');
        return { success: true };
      }

      // Create and load interstitial ad
      const adUnitId = __DEV__
        ? TestIds.INTERSTITIAL
        : AD_UNIT_IDS.interstitial;
      this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Start load, then wait for LOADED event
      this.interstitialAd.load();
      await this.waitForAdLoaded(this.interstitialAd, 12000);

      console.log('[AdService] Interstitial ad loaded and ready');
      return { success: true };
    } catch (error) {
      console.error('[AdService] Error loading interstitial ad:', error);
      this.interstitialAd = null;
      return { success: false, error: error.message };
    }
  };

  // Show interstitial ad
  showInterstitialAd = async () => {
    try {
      // Check subscription first
      const hasSubscription = await this.checkSubscription();
      if (hasSubscription) {
        console.log('[AdService] User has active subscription, skipping ad');
        return { success: true, skipped: true };
      }

      // Ensure ad is loaded
      if (!this.interstitialAd || !this.interstitialAd.loaded) {
        const loadResult = await this.loadInterstitialAd();
        if (!loadResult.success) {
          return {
            success: false,
            error: 'Failed to load ad. Please try again.',
          };
        }
        if (loadResult.skipped) {
          return { success: true, skipped: true };
        }
      }

      // Double check ad is actually loaded before showing
      if (!this.interstitialAd.loaded) {
        return {
          success: false,
          error: 'Ad not ready. Please try again.',
        };
      }

      // Show the ad
      return new Promise((resolve, reject) => {
        const unsubscribeClosed = this.interstitialAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            console.log('[AdService] Interstitial ad closed');
            unsubscribeClosed();
            // Clear the ad reference so it can be reloaded
            this.interstitialAd = null;
            // Reload ad for next time
            this.loadInterstitialAd();
            resolve({ success: true });
          },
        );

        const unsubscribeError = this.interstitialAd.addAdEventListener(
          AdEventType.ERROR,
          error => {
            console.error('[AdService] Interstitial ad error:', error);
            unsubscribeClosed();
            unsubscribeError();
            // Clear the ad reference on error
            this.interstitialAd = null;
            reject({ success: false, error: error.message });
          },
        );

        // Show the ad
        this.interstitialAd.show().catch(error => {
          console.error('[AdService] Error showing interstitial ad:', error);
          unsubscribeClosed();
          unsubscribeError();
          // Clear the ad reference on show error
          this.interstitialAd = null;
          reject({ success: false, error: error.message });
        });
      });
    } catch (error) {
      console.error('[AdService] Error showing interstitial ad:', error);
      // Clear ad reference on exception
      this.interstitialAd = null;
      return { success: false, error: error.message };
    }
  };

  // Preload interstitial ad
  preloadInterstitialAd = async () => {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return await this.loadInterstitialAd();
    } catch (error) {
      console.error('[AdService] Error preloading interstitial ad:', error);
      return { success: false, error: error.message };
    }
  };
}

// Export singleton instance
export const adService = new AdService();

// Export BannerAd component for use in other components
export { BannerAd, BannerAdSize, TestIds };
