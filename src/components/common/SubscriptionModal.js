import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, Icon } from '../../components';
import { logEvent } from '../../services/firebaseServices';
import {
  subscriptionService,
  PRODUCT_IDS,
} from '../../services/subscriptionService';
import { showSuccess, showError } from '../../helper/toast';

const SubscriptionModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [products, setProducts] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  // Initialize subscription service and load products when modal opens
  useEffect(() => {
    if (visible) {
      initializeSubscription();
      checkSubscriptionStatus();
    }
  }, [visible]);

  // Refresh subscription status when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Refresh status when modal opens
      checkSubscriptionStatus();
    }
  }, [visible, checkSubscriptionStatus]);

  const initializeSubscription = useCallback(async () => {
    setLoading(true);
    try {
      // Debug IAP status first
      const debugResult = await subscriptionService.debugIAPStatus();
      console.log('[SubscriptionModal] IAP Debug Status:', debugResult);

      const result = await subscriptionService.initialize();
      if (result.success) {
        const loadedProducts = subscriptionService.getProducts();
        console.log(
          '[SubscriptionModal] Loaded subscription products:',
          loadedProducts,
        );
        setProducts(loadedProducts);

        // If no products loaded, try to reload with delay
        if (!loadedProducts || loadedProducts.length === 0) {
          console.warn(
            '[SubscriptionModal] No products loaded, attempting to reload...',
          );
          // Wait a bit for connection to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));
          const reloadResult = await subscriptionService.loadProducts();
          if (reloadResult.success && reloadResult.products) {
            console.log(
              '[SubscriptionModal] Products reloaded:',
              reloadResult.products,
            );
            setProducts(reloadResult.products);
          } else {
            console.error(
              '[SubscriptionModal] Failed to reload products:',
              reloadResult.error,
            );
            showError(
              'Products not available. Please check:\n' +
                '1. Products are activated in Play Console\n' +
                '2. App is signed with release keystore\n' +
                '3. Your account is added as license tester',
            );
          }
        }
      } else {
        console.error(
          '[SubscriptionModal] Failed to initialize subscription service:',
          result.error,
        );
        showError(
          'Failed to load subscription plans: ' +
            (result.error || 'Unknown error'),
        );
      }
    } catch (error) {
      console.error(
        '[SubscriptionModal] Error initializing subscription:',
        error,
      );
      showError('Failed to initialize subscriptions: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, []);

  // Extract plan data from product
  const extractPlanFromProduct = useCallback(
    product => {
      if (!product) return null;

      // Extract pricing from subscription offers
      let price =
        product.displayPrice || product.localizedPrice || product.price;
      let currency = product.currencyCode || product.currency || 'INR';
      let trialInfo = null;
      let billingPeriod = null;

      // Handle Android subscription offers
      const offerDetails =
        product.subscriptionOfferDetailsAndroid ||
        product.subscriptionOfferDetails ||
        [];

      if (offerDetails.length > 0) {
        // Find offer with trial period first, otherwise use first offer
        const offer =
          offerDetails.find(
            o =>
              o.pricingPhases?.pricingPhaseList?.[0]?.priceAmountMicros ===
                '0' ||
              o.pricingPhases?.pricingPhaseList?.[0]?.priceAmountMicros === 0,
          ) || offerDetails[0];

        if (offer?.pricingPhases?.pricingPhaseList) {
          const pricingPhaseList = offer.pricingPhases.pricingPhaseList;

          // Find trial phase
          const trialPhase = pricingPhaseList.find(
            phase =>
              phase.priceAmountMicros === '0' || phase.priceAmountMicros === 0,
          );

          if (trialPhase) {
            trialInfo = {
              offerId: offer.offerId,
              period: trialPhase.billingPeriod,
              formattedPrice: trialPhase.formattedPrice,
            };
          }

          // Find the recurring phase (recurrenceMode === 1 means recurring)
          const recurringPhase =
            pricingPhaseList.find(phase => phase.recurrenceMode === 1) ||
            pricingPhaseList[pricingPhaseList.length - 1];

          if (recurringPhase) {
            price = recurringPhase.formattedPrice || price;
            currency = recurringPhase.priceCurrencyCode || currency;
            billingPeriod = recurringPhase.billingPeriod;
          }
        }
      }

      // Determine plan type and name
      const productId = product.id || product.productId || product.sku || '';
      const isMonthly = productId.includes('monthly');
      const isYearly = productId.includes('yearly');

      // Get display name
      const displayName =
        product.displayName ||
        product.nameAndroid ||
        (isMonthly
          ? strings?.subscription?.monthly || 'Monthly'
          : strings?.subscription?.yearly || 'Yearly');

      // Calculate price per month for yearly plans
      const numericPrice = parseFloat(price?.replace(/[^0-9.]/g, '') || '0');
      const pricePerMonth = isYearly
        ? Math.round(numericPrice / 12)
        : numericPrice;

      return {
        id: productId,
        name: displayName,
        price: numericPrice,
        currency: currency,
        formattedPrice: price || `${numericPrice} ${currency}`,
        pricePerMonth: pricePerMonth,
        duration: isMonthly
          ? strings?.subscription?.month || 'Month'
          : strings?.subscription?.year || 'Year',
        description: isMonthly
          ? strings?.subscription?.monthlyDescription ||
            'Access to premium features for one month'
          : strings?.subscription?.yearlyDescription ||
            'Access to premium features for one year at a discounted rate',
        savings: isYearly ? 'Save 50%' : null,
        product: product,
        trialInfo: trialInfo,
        billingPeriod: billingPeriod,
      };
    },
    [strings],
  );

  // Create dynamic plans array from products
  const plans = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products
      .map(product => extractPlanFromProduct(product))
      .filter(plan => plan !== null)
      .sort((a, b) => {
        // Sort monthly first, then yearly
        const aIsMonthly = a.id.includes('monthly');
        const bIsMonthly = b.id.includes('monthly');
        if (aIsMonthly && !bIsMonthly) return -1;
        if (!aIsMonthly && bIsMonthly) return 1;
        return 0;
      });
  }, [products, extractPlanFromProduct]);

  // Set initial selected plan when products load
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  // Get current selected plan
  const currentPlan = useMemo(() => {
    return plans.find(plan => plan.id === selectedPlanId) || plans[0] || null;
  }, [plans, selectedPlanId]);

  const benefits = useMemo(
    () => [
      strings?.subscription?.benefit1 || 'Unlimited post creation',
      strings?.subscription?.benefit2 ||
        'Access to all premium themes and backgrounds',
      strings?.subscription?.benefit3 || 'High-quality image downloads',
      strings?.subscription?.benefit4 || 'Priority customer support',
      strings?.subscription?.benefit5 || 'Ad-free experience',
    ],
    [strings],
  );

  const handlePlanSelect = useCallback(
    planId => {
      setSelectedPlanId(planId);
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        logEvent('subscription_plan_selected', {
          plan_id: plan.id,
          plan_name: plan.name,
        });
      }
    },
    [plans],
  );

  const handleSubscribe = useCallback(async () => {
    if (purchasing || !currentPlan) return;

    setPurchasing(true);
    try {
      logEvent('subscription_subscribe_clicked', {
        plan_id: currentPlan.id,
        plan_name: currentPlan.name,
        price: currentPlan.price,
      });

      const result = await subscriptionService.purchaseSubscription(
        currentPlan.id,
      );

      if (result.success) {
        // Purchase flow initiated - the purchase listener will handle the rest
        showSuccess('Processing your subscription...');

        // Poll for subscription status update (purchase listener will save it)
        const checkPurchaseStatus = async () => {
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const status = await subscriptionService.getSubscriptionStatus();
            if (status?.status === 'active' && status?.subscription) {
              setSubscriptionStatus(status);
              showSuccess('Subscription activated successfully!');
              setTimeout(() => {
                onClose();
              }, 1500);
              return;
            }
          }
        };
        checkPurchaseStatus();
      } else {
        showError(result.error || 'Failed to start purchase');
        setPurchasing(false);
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      showError('Failed to purchase subscription');
      setPurchasing(false);
    }
  }, [currentPlan, purchasing, onClose]);

  const handleRestorePurchases = useCallback(async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.restorePurchases();
      if (result.success && result.restored) {
        showSuccess(
          result.message || `Restored ${result.restoredCount} purchase(s)`,
        );
        await checkSubscriptionStatus();
      } else {
        showError(result.message || 'No purchases found to restore');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      showError('Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
            edges={['bottom']}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings?.subscription?.title || 'Choose Your Plan'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
                accessibilityLabel={strings.common.cancel}
                accessibilityRole="button"
              >
                <Icon name="close" size={wp(6)} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loading && !products.length ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Loading subscription plans...
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Subscription plans not available. Please try again later.
                </Text>
              </View>
            ) : subscriptionStatus?.status === 'active' &&
              subscriptionStatus?.subscription ? (
              // Show active subscription info
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.contentContainer}>
                  <View
                    style={[
                      styles.subscriptionStatusCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Icon
                      name="check-circle"
                      size={wp(12)}
                      color={colors.primary}
                      style={styles.statusIcon}
                    />
                    <Text style={[styles.statusTitle, { color: colors.text }]}>
                      {strings?.subscription?.activeSubscription ||
                        'Active Subscription'}
                    </Text>
                    <Text
                      style={[
                        styles.statusPlanName,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {subscriptionStatus.subscription.subscription_type ===
                      'monthly'
                        ? strings?.subscription?.monthly || 'Monthly'
                        : strings?.subscription?.yearly || 'Yearly'}{' '}
                      Plan
                    </Text>
                    {subscriptionStatus.subscription.expiry_date && (
                      <View style={styles.statusDetails}>
                        <Text
                          style={[
                            styles.statusLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {strings?.subscription?.expiresOn || 'Expires on'}:
                        </Text>
                        <Text
                          style={[styles.statusValue, { color: colors.text }]}
                        >
                          {new Date(
                            subscriptionStatus.subscription.expiry_date,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    )}
                    {subscriptionStatus.subscription.auto_renew_enabled && (
                      <View
                        style={[
                          styles.autoRenewBadge,
                          { backgroundColor: colors.primary + '15' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.autoRenewBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          {strings?.subscription?.autoRenew ||
                            'Auto-renew enabled'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Benefits Section - still show benefits */}
                  <View style={styles.benefitsContainer}>
                    <Text
                      style={[styles.benefitsTitle, { color: colors.text }]}
                    >
                      {strings?.subscription?.benefitsTitle ||
                        'Premium Features'}
                    </Text>
                    {benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Icon
                          name="check"
                          size={wp(5)}
                          color={colors.primary}
                          style={styles.benefitIcon}
                        />
                        <Text
                          style={[styles.benefitText, { color: colors.text }]}
                        >
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.contentContainer}>
                  {/* Plan Toggle - Dynamic */}
                  {plans.length > 1 && (
                    <View
                      style={[
                        styles.toggleContainer,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {plans.map(plan => (
                        <TouchableOpacity
                          key={plan.id}
                          style={[
                            styles.toggleOption,
                            selectedPlanId === plan.id && [
                              styles.toggleOptionActive,
                              { backgroundColor: colors.primary },
                            ],
                          ]}
                          onPress={() => handlePlanSelect(plan.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.toggleText,
                              {
                                color:
                                  selectedPlanId === plan.id
                                    ? colors.white
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {plan.name}
                          </Text>
                          {selectedPlanId === plan.id && plan.savings && (
                            <View
                              style={[
                                styles.savingsBadge,
                                { backgroundColor: colors.white + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.savingsText,
                                  { color: colors.white },
                                ]}
                              >
                                {plan.savings}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Plan Card - Dynamic */}
                  {currentPlan && (
                    <View
                      style={[
                        styles.planCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <View style={styles.planHeader}>
                        <Text style={[styles.planName, { color: colors.text }]}>
                          {currentPlan.name}
                        </Text>
                        {currentPlan.savings && (
                          <View
                            style={[
                              styles.savingsTag,
                              { backgroundColor: colors.primary + '15' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.savingsTagText,
                                { color: colors.primary },
                              ]}
                            >
                              {currentPlan.savings}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: colors.text }]}>
                          {currentPlan.formattedPrice ||
                            `${currentPlan.price} ${currentPlan.currency}`}
                        </Text>
                        <Text
                          style={[
                            styles.duration,
                            { color: colors.textSecondary },
                          ]}
                        >
                          / {currentPlan.duration}
                        </Text>
                      </View>

                      {/* Show trial info */}
                      {currentPlan.trialInfo && (
                        <View style={styles.offerInfoContainer}>
                          <Text
                            style={[
                              styles.offerText,
                              { color: colors.primary },
                            ]}
                          >
                            {currentPlan.trialInfo.offerId === '3days'
                              ? '3 days free trial'
                              : currentPlan.trialInfo.offerId === '7days'
                              ? '7 days free trial'
                              : 'Free trial available'}
                          </Text>
                        </View>
                      )}

                      {/* Show price per month for yearly plans */}
                      {currentPlan.id.includes('yearly') &&
                        currentPlan.pricePerMonth && (
                          <Text
                            style={[
                              styles.pricePerMonth,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {currentPlan.pricePerMonth} {currentPlan.currency} /{' '}
                            {(
                              strings?.subscription?.month || 'Month'
                            ).toLowerCase()}
                          </Text>
                        )}

                      <Text
                        style={[
                          styles.planDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {currentPlan.description}
                      </Text>

                      {/* Show if product is loaded from store */}
                      {currentPlan.product && (
                        <Text
                          style={[
                            styles.productLoadedIndicator,
                            { color: colors.primary },
                          ]}
                        >
                          ✓ Store price loaded
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Benefits Section */}
                  <View style={styles.benefitsContainer}>
                    <Text
                      style={[styles.benefitsTitle, { color: colors.text }]}
                    >
                      {strings?.subscription?.benefitsTitle ||
                        'Premium Features'}
                    </Text>
                    {benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Icon
                          name="check"
                          size={wp(5)}
                          color={colors.primary}
                          style={styles.benefitIcon}
                        />
                        <Text
                          style={[styles.benefitText, { color: colors.text }]}
                        >
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Footer */}
            <View
              style={[styles.modalFooter, { borderTopColor: colors.border }]}
            >
              {subscriptionStatus?.status === 'active' &&
              subscriptionStatus?.subscription ? (
                <View style={styles.activeSubscriptionContainer}>
                  <View style={styles.subscriptionInfoCard}>
                    <Icon
                      name="check-circle"
                      size={wp(8)}
                      color={colors.primary}
                      style={styles.subscriptionIcon}
                    />
                    <Text
                      style={[
                        styles.activeSubscriptionTitle,
                        { color: colors.text },
                      ]}
                    >
                      {strings?.subscription?.activeSubscription ||
                        'Active Subscription'}
                    </Text>
                    <Text
                      style={[
                        styles.subscriptionPlanName,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {subscriptionStatus.subscription.subscription_type ===
                      'monthly'
                        ? strings?.subscription?.monthly || 'Monthly'
                        : strings?.subscription?.yearly || 'Yearly'}
                    </Text>
                    {subscriptionStatus.subscription.expiry_date && (
                      <Text
                        style={[
                          styles.subscriptionExpiry,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {strings?.subscription?.expiresOn || 'Expires on'}:{' '}
                        {new Date(
                          subscriptionStatus.subscription.expiry_date,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                    {subscriptionStatus.subscription.auto_renew_enabled && (
                      <Text
                        style={[
                          styles.autoRenewText,
                          { color: colors.primary },
                        ]}
                      >
                        {strings?.subscription?.autoRenew ||
                          'Auto-renew enabled'}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <>
                  {currentPlan && (
                    <Button
                      title={
                        purchasing
                          ? 'Processing...'
                          : strings?.subscription?.subscribeNow ||
                            'Subscribe Now'
                      }
                      onPress={handleSubscribe}
                      style={styles.subscribeButton}
                      textStyle={styles.subscribeButtonText}
                      disabled={purchasing || loading || !currentPlan}
                    />
                  )}
                  <TouchableOpacity
                    onPress={handleRestorePurchases}
                    style={styles.restoreButton}
                    disabled={loading || purchasing}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text
                        style={[
                          styles.restoreButtonText,
                          { color: colors.primary },
                        ]}
                      >
                        Restore Purchases
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Pressable>
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
    height: hp(95),
  },
  modalContainer: {
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    height: hp(95),
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
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: wp(3),
    borderWidth: 1,
    padding: wp(1),
    marginBottom: hp(3),
  },
  toggleOption: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toggleOptionActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
  savingsBadge: {
    position: 'absolute',
    top: -wp(2),
    right: wp(2),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
  },
  savingsText: {
    fontSize: fontSize(10),
    fontFamily: fontFamily.bold,
  },
  planCard: {
    borderRadius: wp(4),
    borderWidth: 2,
    padding: wp(5),
    marginBottom: hp(3),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  planName: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
  },
  savingsTag: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  savingsTagText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.bold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: fontSize(32),
    fontFamily: fontFamily.bold,
  },
  duration: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginLeft: wp(1),
  },
  pricePerMonth: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginBottom: hp(1),
  },
  planDescription: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    lineHeight: fontSize(20),
  },
  offerInfoContainer: {
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  offerText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.bold,
  },
  productLoadedIndicator: {
    fontSize: fontSize(11),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
    fontStyle: 'italic',
  },
  benefitsContainer: {
    marginTop: hp(1),
  },
  benefitsTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    marginBottom: hp(2),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  benefitIcon: {
    marginRight: wp(3),
    marginTop: hp(0.3),
  },
  benefitText: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    lineHeight: fontSize(20),
  },
  modalFooter: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
  },
  subscribeButton: {
    height: hp(6.5),
  },
  subscribeButtonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  restoreButton: {
    marginTop: hp(1.5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  activeSubscriptionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  subscriptionInfoCard: {
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    width: '100%',
  },
  subscriptionIcon: {
    marginBottom: hp(1.5),
  },
  activeSubscriptionTitle: {
    fontSize: fontSize(20),
    fontFamily: fontFamily.bold,
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  subscriptionPlanName: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginBottom: hp(0.5),
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subscriptionExpiry: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginTop: hp(1),
    textAlign: 'center',
  },
  autoRenewText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  activeSubscriptionText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  subscriptionStatusCard: {
    borderRadius: wp(4),
    borderWidth: 2,
    padding: wp(6),
    marginBottom: hp(3),
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: hp(2),
  },
  statusTitle: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  statusPlanName: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.regular,
    marginBottom: hp(2),
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  statusDetails: {
    alignItems: 'center',
    marginTop: hp(1),
  },
  statusLabel: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginBottom: hp(0.5),
  },
  statusValue: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
  },
  autoRenewBadge: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    marginTop: hp(2),
  },
  autoRenewBadgeText: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.bold,
  },
});

export default SubscriptionModal;
