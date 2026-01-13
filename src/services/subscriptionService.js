import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { logEvent } from './firebaseServices';

// Lazy load react-native-iap to avoid issues if native module isn't ready
let RNIap = null;
let isRNIapLoaded = false;

// Import named exports for v14 API
let requestPurchase = null;

const loadRNIap = async () => {
  if (isRNIapLoaded) {
    return RNIap;
  }
  try {
    const iapModule = require('react-native-iap');
    // Get default export
    RNIap = iapModule.default || iapModule;
    
    // Get named export for requestPurchase (v14 uses this for both purchases and subscriptions)
    requestPurchase = iapModule.requestPurchase || RNIap.requestPurchase;
    
    console.log('[SubscriptionService] Loaded IAP module:', {
      hasDefault: !!iapModule.default,
      hasRequestPurchase: typeof requestPurchase === 'function',
      namedExports: Object.keys(iapModule).filter(key => 
        typeof iapModule[key] === 'function' && 
        (key.includes('request') || key.includes('purchase') || key.includes('subscription'))
      ),
    });
    
    isRNIapLoaded = true;
    return RNIap;
  } catch (error) {
    console.error('Error loading react-native-iap:', error);
    return null;
  }
};

// Product IDs
const PRODUCT_IDS = {
  monthly:
    Platform.OS === 'ios'
      ? 'monthly_subscription'
      : 'monthly_subscription_android',
  yearly:
    Platform.OS === 'ios'
      ? 'yearly_subscription'
      : 'yearly_subscription_android',
};

// Android Base Plan IDs and Offer IDs
const ANDROID_SUBSCRIPTION_CONFIG = {
  monthly: {
    basePlanId: 'monthly',
    offerId: '3days',
  },
  yearly: {
    basePlanId: 'yearly',
    offerId: '7days',
  },
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  NONE: 'none',
};

class SubscriptionService {
  constructor() {
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
    this.products = [];
    this.isInitialized = false;
  }

  // Initialize the subscription service
  initialize = async () => {
    try {
      if (this.isInitialized) {
        console.log('Subscription service already initialized');
        return { success: true };
      }

      // Load RNIap module
      const iapModule = await loadRNIap();
      if (!iapModule) {
        console.warn('react-native-iap module not available');
        return { success: false, error: 'IAP module not available' };
      }

      // Initialize connection to store with retry logic
      let connectionInitialized = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await iapModule.initConnection();
          console.log(
            `IAP connection initialized (attempt ${attempt}):`,
            result,
          );
          connectionInitialized = true;
          break;
        } catch (connectionError) {
          console.error(
            `Error initializing IAP connection (attempt ${attempt}):`,
            connectionError,
          );
          if (attempt === 3) {
            console.warn(
              'IAP connection failed after 3 attempts, continuing anyway...',
            );
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!connectionInitialized) {
        console.warn(
          'IAP connection not initialized, but continuing to load products...',
        );
      }

      // Get available products with retry
      const productsResult = await this.loadProducts();
      if (!productsResult.success) {
        console.warn('Failed to load products on first attempt, retrying...');
        // Retry after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.loadProducts();
      }

      // Set up purchase listeners
      await this.setupPurchaseListeners();

      this.isInitialized = true;
      console.log('Subscription service initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initializing subscription service:', error);
      return { success: false, error: error.message };
    }
  };

  // Load available products from store
  loadProducts = async () => {
    try {
      const iapModule = await loadRNIap();
      if (!iapModule) {
        console.warn('IAP module not available for loading products');
        return { success: false, error: 'IAP module not available' };
      }

      const productIds = Object.values(PRODUCT_IDS);
      console.log(
        `[SubscriptionService] Loading products for ${Platform.OS}:`,
        productIds,
      );

      let products = [];
      let error = null;

      // For Android, use fetchProducts with type: 'subs' for subscriptions
      if (Platform.OS === 'android') {
        // Method 1: Try fetchProducts with type: 'subs' (for subscriptions with offers)
        if (iapModule.fetchProducts) {
          try {
            console.log(
              '[SubscriptionService] Trying fetchProducts with type: subs...',
            );
            const result = await iapModule.fetchProducts({
              skus: productIds,
              type: 'subs',
            });
            // fetchProducts returns { products: [...] }
            products = result?.products || result || [];
            console.log(
              '[SubscriptionService] Android subscriptions loaded with fetchProducts:',
              products?.length || 0,
              'products',
            );
            if (products && products.length > 0) {
              console.log('[SubscriptionService] Products:', products);
              this.products = products;
              return { success: true, products };
            }
          } catch (subError) {
            console.warn(
              '[SubscriptionService] fetchProducts (subs) failed:',
              subError.message || subError,
            );
            error = subError;
          }
        }

        // Method 2: Try fetchProducts without type (fallback)
        if (iapModule.fetchProducts) {
          try {
            console.log(
              '[SubscriptionService] Trying fetchProducts without type...',
            );
            const result = await iapModule.fetchProducts({ skus: productIds });
            products = result?.products || result || [];
            console.log(
              '[SubscriptionService] Android products loaded with fetchProducts:',
              products?.length || 0,
              'products',
            );
            if (products && products.length > 0) {
              console.log('[SubscriptionService] Products:', products);
              this.products = products;
              return { success: true, products };
            }
          } catch (prodError) {
            console.warn(
              '[SubscriptionService] fetchProducts failed:',
              prodError.message || prodError,
            );
            if (!error) error = prodError;
          }
        }
      } else if (iapModule.fetchProducts) {
        // For iOS, use fetchProducts with type: 'subs'
        try {
          const result = await iapModule.fetchProducts({
            skus: productIds,
            type: 'subs',
          });
          products = result?.products || result || [];
          console.log(
            '[SubscriptionService] iOS products loaded:',
            products?.length || 0,
            'products',
          );
        } catch (iosError) {
          console.error(
            '[SubscriptionService] iOS fetchProducts failed:',
            iosError,
          );
          error = iosError;
        }
      }

      this.products = products || [];
      if (products && products.length > 0) {
        console.log('[SubscriptionService] Final products:', products);
        return { success: true, products };
      } else {
        return {
          success: false,
          error:
            error?.message ||
            'No products found. Check Play Console configuration.',
          products: [],
        };
      }
    } catch (error) {
      console.error('[SubscriptionService] Error loading products:', error);
      return { success: false, error: error.message, products: [] };
    }
  };

  // Get products list
  getProducts = () => {
    return this.products;
  };

  // Debug method to check IAP status
  debugIAPStatus = async () => {
    try {
      const iapModule = await loadRNIap();
      if (!iapModule) {
        return {
          success: false,
          error: 'IAP module not loaded',
          details: {},
        };
      }

      const productIds = Object.values(PRODUCT_IDS);
      const debugInfo = {
        platform: Platform.OS,
        productIds: productIds,
        isInitialized: this.isInitialized,
        productsCount: this.products.length,
        hasInitConnection: typeof iapModule.initConnection === 'function',
        hasFetchProducts: typeof iapModule.fetchProducts === 'function',
        hasGetAvailablePurchases:
          typeof iapModule.getAvailablePurchases === 'function',
      };

      // Try to get connection status
      try {
        if (iapModule.getConnectionState) {
          debugInfo.connectionState = await iapModule.getConnectionState();
        }
      } catch (e) {
        debugInfo.connectionStateError = e.message;
      }

      console.log('[SubscriptionService] Debug Info:', debugInfo);
      return { success: true, details: debugInfo };
    } catch (error) {
      console.error('[SubscriptionService] Debug error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get product by ID
  getProduct = productId => {
    return this.products.find(
      p =>
        p.id === productId ||
        p.productId === productId ||
        p.sku === productId,
    );
  };

  // Setup purchase update and error listeners
  setupPurchaseListeners = async () => {
    try {
      const iapModule = await loadRNIap();
      if (!iapModule) {
        console.warn('IAP module not available for setting up listeners');
        return;
      }

      // Purchase update listener
      if (iapModule.purchaseUpdatedListener) {
        this.purchaseUpdateSubscription = iapModule.purchaseUpdatedListener(
          async purchase => {
            console.log('Purchase updated:', purchase);
            try {
              // Finish the transaction
              if (iapModule.finishTransaction) {
                await iapModule.finishTransaction({ purchase });
              }

              // Verify and save purchase to database
              await this.handlePurchaseSuccess(purchase);

              // Log analytics event
              await logEvent('subscription_purchased', {
                product_id: purchase.productId,
                transaction_id: purchase.transactionId,
                platform: Platform.OS,
              });
            } catch (error) {
              console.error('Error handling purchase update:', error);
            }
          },
        );
      }

      // Purchase error listener
      if (iapModule.purchaseErrorListener) {
        this.purchaseErrorSubscription = iapModule.purchaseErrorListener(
          error => {
            console.error('Purchase error:', error);
            logEvent('subscription_purchase_error', {
              error_code: error.code,
              error_message: error.message,
              platform: Platform.OS,
            });
          },
        );
      }
    } catch (error) {
      console.error('Error setting up purchase listeners:', error);
    }
  };

  // Handle successful purchase
  handlePurchaseSuccess = async purchase => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated');
        return { success: false, error: 'User not authenticated' };
      }

      // Determine subscription type and expiry
      const subscriptionType = this.getSubscriptionType(purchase.productId);
      
      // Fix date handling - use transactionDate or purchaseDate safely
      const purchaseDateValue = purchase.transactionDate || purchase.purchaseDate || Date.now();
      
      // Convert to Date object safely
      let purchaseDateObj;
      if (typeof purchaseDateValue === 'number') {
        // If it's a timestamp, convert it
        purchaseDateObj = new Date(purchaseDateValue);
      } else if (typeof purchaseDateValue === 'string') {
        // If it's a string, parse it
        purchaseDateObj = new Date(purchaseDateValue);
      } else {
        // Fallback to current date
        purchaseDateObj = new Date();
      }

      // Validate the date before using toISOString()
      if (isNaN(purchaseDateObj.getTime())) {
        console.warn('Invalid purchase date, using current date');
        purchaseDateObj = new Date();
      }

      const expiryDate = this.calculateExpiryDate(
        subscriptionType,
        purchaseDateObj,
      );

      // Save subscription to database
      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            product_id: purchase.productId,
            transaction_id: purchase.transactionId,
            platform: Platform.OS,
            subscription_type: subscriptionType,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            purchase_date: purchaseDateObj.toISOString(),
            expiry_date: expiryDate.toISOString(),
            original_transaction_id:
              purchase.originalTransactionIdentifierIOS ||
              purchase.transactionId,
            receipt_data: purchase.purchaseToken || purchase.transactionReceipt,
            auto_renew_enabled: purchase.isAutoRenewing !== false,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,product_id',
          },
        );

      if (dbError) {
        console.error('Error saving subscription to database:', dbError);
        return { success: false, error: dbError.message };
      }

      console.log('Subscription saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error handling purchase success:', error);
      return { success: false, error: error.message };
    }
  };

  // Get subscription type from product ID
  getSubscriptionType = productId => {
    // Handle both iOS and Android product IDs
    if (
      productId === PRODUCT_IDS.monthly ||
      productId === 'monthly_subscription' ||
      productId === 'monthly_subscription_android'
    ) {
      return 'monthly';
    } else if (
      productId === PRODUCT_IDS.yearly ||
      productId === 'yearly_subscription' ||
      productId === 'yearly_subscription_android'
    ) {
      return 'yearly';
    }
    return 'unknown';
  };

  // Calculate expiry date based on subscription type
  calculateExpiryDate = (subscriptionType, purchaseDate) => {
    const date = new Date(purchaseDate);
    if (subscriptionType === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (subscriptionType === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  };

  // Purchase a subscription
  purchaseSubscription = async productId => {
    try {
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return {
            success: false,
            error: 'Failed to initialize subscription service',
          };
        }
      }

      const iapModule = await loadRNIap();
      if (!iapModule) {
        return {
          success: false,
          error: 'IAP module not available',
        };
      }

      // Ensure requestPurchase is loaded (it's a named export in v14)
      if (!requestPurchase) {
        const iapModuleCheck = require('react-native-iap');
        requestPurchase = iapModuleCheck.requestPurchase;
        console.log('[SubscriptionService] Reloaded named export:', {
          hasRequestPurchase: typeof requestPurchase === 'function',
        });
      }

      // Debug: Check available methods
      const requestMethods = Object.keys(iapModule).filter(key => 
        typeof iapModule[key] === 'function' && (
          key.toLowerCase().includes('request') || 
          key.toLowerCase().includes('purchase') ||
          key.toLowerCase().includes('subscription')
        )
      );
      
      console.log('[SubscriptionService] Available IAP methods:', {
        hasRequestPurchase: typeof requestPurchase === 'function',
        requestPurchaseType: typeof requestPurchase,
        allRequestMethods: requestMethods,
        allMethods: Object.keys(iapModule).slice(0, 20), // First 20 methods
        iapModuleType: typeof iapModule,
        iapModuleConstructor: iapModule.constructor?.name,
      });

      // Ensure connection is ready - reinitialize if needed
      try {
        if (iapModule.getConnectionState) {
          const connectionState = await iapModule.getConnectionState();
          console.log(
            '[SubscriptionService] IAP Connection State:',
            connectionState,
          );
          if (connectionState !== 'connected') {
            console.warn(
              '[SubscriptionService] IAP not connected, reinitializing...',
            );
            await iapModule.initConnection();
          }
        } else {
          // If getConnectionState doesn't exist, try to initialize anyway
          console.log('[SubscriptionService] Reinitializing IAP connection...');
          await iapModule.initConnection();
        }
      } catch (connError) {
        console.warn('[SubscriptionService] Connection check failed:', connError);
        // Try to initialize anyway
        try {
          await iapModule.initConnection();
        } catch (initError) {
          console.error('[SubscriptionService] Failed to initialize connection:', initError);
        }
      }

      // Ensure purchase listeners are set up
      if (!this.purchaseUpdateSubscription || !this.purchaseErrorSubscription) {
        console.log('[SubscriptionService] Setting up purchase listeners...');
        await this.setupPurchaseListeners();
      }

      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const product = this.getProduct(productId);
      if (!product) {
        console.error(
          '[SubscriptionService] Product not found:',
          productId,
          'Available products:',
          this.products.map(p => ({
            id: p.id,
            productId: p.productId,
            sku: p.sku,
          })),
        );
        return {
          success: false,
          error: 'Product not found. Please try again.',
        };
      }

      console.log('[SubscriptionService] Purchasing product:', {
        productId: productId,
        product: {
          id: product.id,
          productId: product.productId,
          sku: product.sku,
          hasOffers: !!(
            product.subscriptionOfferDetailsAndroid ||
            product.subscriptionOfferDetails
          ),
        },
      });

      // For Android subscriptions with offers
      const offerDetails =
        product.subscriptionOfferDetailsAndroid ||
        product.subscriptionOfferDetails;
      if (
        Platform.OS === 'android' &&
        offerDetails &&
        offerDetails.length > 0
      ) {
        // Find the offer with matching offerId (prefer trial offers)
        const subscriptionType = this.getSubscriptionType(productId);
        const config = ANDROID_SUBSCRIPTION_CONFIG[subscriptionType];

        let selectedOffer = null;

        if (config) {
          // First, try to find offer with matching offerId (trial offer)
          selectedOffer = offerDetails.find(offerDetail => {
            return offerDetail.offerId === config.offerId;
          });
        }

        // If no matching offerId found, try to find by basePlanId
        if (!selectedOffer && config) {
          selectedOffer = offerDetails.find(offerDetail => {
            return offerDetail.basePlanId === config.basePlanId;
          });
        }

        // If still no offer found, use the first available offer
        if (!selectedOffer) {
          selectedOffer = offerDetails[0];
        }

        if (selectedOffer && selectedOffer.offerToken) {
          // Use the product id field (could be id, productId, or sku)
          const productSku =
            product.id || product.productId || product.sku || productId;

          console.log('[SubscriptionService] Product SKU details:', {
            productId: productId,
            productIdField: product.id,
            finalSku: productSku,
          });

          if (!productSku) {
            return {
              success: false,
              error: 'Product SKU is missing. Cannot proceed with purchase.',
            };
          }

          if (!selectedOffer.offerToken) {
            return {
              success: false,
              error: 'Offer token is missing. Cannot proceed with purchase.',
            };
          }

          // Validate that productSku is a non-empty string
          if (typeof productSku !== 'string' || productSku.trim().length === 0) {
            return {
              success: false,
              error: `Invalid product SKU: ${productSku}. Must be a non-empty string.`,
            };
          }

          console.log('[SubscriptionService] Requesting subscription with:', {
            sku: productSku,
            basePlanId: selectedOffer.basePlanId,
            offerId: selectedOffer.offerId,
            offerToken: selectedOffer.offerToken.substring(0, 20) + '...',
          });

          // For subscriptions in react-native-iap v14, use requestPurchase with request object
          // Format: { request: { google: { skus: [...], subscriptionOffers: [...] } }, type: 'subs' }
          if (requestPurchase) {
            try {
              // Build subscription offer object
              const subscriptionOffer = {
                sku: productSku,
                offerToken: selectedOffer.offerToken,
              };

              // Build request according to v14 API format
              // Reference: https://hyochan.github.io/react-native-iap/docs/examples/purchase-flow
              const purchaseRequest = {
                request: {
                  google: {
                    skus: [productSku],
                    subscriptionOffers: [subscriptionOffer],
                  },
                },
                type: 'subs',
              };

              console.log(
                '[SubscriptionService] Calling requestPurchase (v14 format) with:',
                JSON.stringify(purchaseRequest, null, 2),
              );

              await requestPurchase(purchaseRequest);
              return { success: true };
            } catch (purchaseError) {
              console.error(
                '[SubscriptionService] requestPurchase failed:',
                purchaseError.message,
                purchaseError.code,
              );
              
              // Try without subscriptionOffers as fallback
              try {
                console.log(
                  '[SubscriptionService] Trying requestPurchase without offers',
                );
                await requestPurchase({
                  request: {
                    google: { skus: [productSku] },
                  },
                  type: 'subs',
                });
                return { success: true };
              } catch (fallbackError) {
                console.error(
                  '[SubscriptionService] Fallback also failed:',
                  fallbackError.message,
                );
                throw purchaseError; // Throw original error
              }
            }
          } else {
            return {
              success: false,
              error: 'requestPurchase method not available. Please check react-native-iap installation.',
            };
          }
        } else {
          console.warn(
            '[SubscriptionService] No valid offer found for product:',
            productId,
            'Available offers:',
            offerDetails?.map(o => ({
              basePlanId: o.basePlanId,
              offerId: o.offerId,
              hasToken: !!o.offerToken,
            })),
          );
        }
      }

      // Fallback to regular subscription purchase (without offers)
      // Use the product id field (could be id, productId, or sku)
      const productSku =
        product.id || product.productId || product.sku || productId;

      console.log(
        '[SubscriptionService] Using fallback subscription method for:',
        productSku,
      );

      // For subscriptions in v14, use requestPurchase with request object
      if (requestPurchase) {
        await requestPurchase({
          request: {
            google: { skus: [productSku] },
            apple: { sku: productSku },
          },
          type: 'subs',
        });
        return { success: true };
      }

      return {
        success: false,
        error: 'Purchase method not available',
      };
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to purchase subscription',
      };
    }
  };

  // Get current user subscription status
  getSubscriptionStatus = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          status: SUBSCRIPTION_STATUS.NONE,
          error: 'User not authenticated',
        };
      }

      // Get subscription from database
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        return {
          success: false,
          status: SUBSCRIPTION_STATUS.NONE,
          error: subError.message,
        };
      }

      if (!subscription) {
        return {
          success: true,
          status: SUBSCRIPTION_STATUS.NONE,
          subscription: null,
        };
      }

      // Check if subscription is expired
      const expiryDate = new Date(subscription.expiry_date);
      const now = new Date();

      if (expiryDate < now) {
        // Update status to expired
        await supabase
          .from('user_subscriptions')
          .update({ status: SUBSCRIPTION_STATUS.EXPIRED })
          .eq('id', subscription.id);

        return {
          success: true,
          status: SUBSCRIPTION_STATUS.EXPIRED,
          subscription: {
            ...subscription,
            status: SUBSCRIPTION_STATUS.EXPIRED,
          },
        };
      }

      return {
        success: true,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        success: false,
        status: SUBSCRIPTION_STATUS.NONE,
        error: error.message,
      };
    }
  };

  // Check if user has active subscription
  hasActiveSubscription = async () => {
    const result = await this.getSubscriptionStatus();
    return result.success && result.status === SUBSCRIPTION_STATUS.ACTIVE;
  };

  // Restore purchases
  restorePurchases = async () => {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const iapModule = await loadRNIap();
      if (!iapModule || !iapModule.getAvailablePurchases) {
        return {
          success: false,
          error: 'IAP module not available',
        };
      }

      const purchases = await iapModule.getAvailablePurchases();
      console.log('Available purchases:', purchases);

      if (!purchases || purchases.length === 0) {
        return {
          success: true,
          restored: false,
          message: 'No purchases found to restore',
        };
      }

      // Process each purchase
      let restoredCount = 0;
      for (const purchase of purchases) {
        const result = await this.handlePurchaseSuccess(purchase);
        if (result.success) {
          restoredCount++;
        }
      }

      await logEvent('subscription_restored', {
        restored_count: restoredCount,
        platform: Platform.OS,
      });

      return {
        success: true,
        restored: restoredCount > 0,
        restoredCount,
        message:
          restoredCount > 0
            ? `Restored ${restoredCount} purchase(s)`
            : 'No purchases restored',
      };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      };
    }
  };

  // Clean up listeners
  cleanup = async () => {
    try {
      const iapModule = await loadRNIap();
      if (iapModule && iapModule.endConnection) {
        await iapModule.endConnection();
      }
    } catch (error) {
      console.error('Error ending IAP connection:', error);
    }

    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    this.isInitialized = false;
  };

  // Check and update expired subscriptions
  checkExpiredSubscriptions = async () => {
    try {
      const now = new Date().toISOString();

      // Find all active subscriptions that have expired
      const { data: expiredSubscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
        .lt('expiry_date', now);

      if (error) {
        console.error('Error checking expired subscriptions:', error);
        return { success: false, error: error.message };
      }

      if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
        return { success: true, expiredCount: 0 };
      }

      // Update expired subscriptions
      const subscriptionIds = expiredSubscriptions.map(sub => sub.id);
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: SUBSCRIPTION_STATUS.EXPIRED })
        .in('id', subscriptionIds);

      if (updateError) {
        console.error('Error updating expired subscriptions:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(
        `Updated ${expiredSubscriptions.length} expired subscriptions`,
      );
      return {
        success: true,
        expiredCount: expiredSubscriptions.length,
      };
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      return { success: false, error: error.message };
    }
  };
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Export constants
export { PRODUCT_IDS, SUBSCRIPTION_STATUS, ANDROID_SUBSCRIPTION_CONFIG };
