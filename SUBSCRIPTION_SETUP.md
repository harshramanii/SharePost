# Subscription Setup Guide

This guide will help you set up in-app subscriptions for both Android (Google Play) and iOS (App Store).

## Prerequisites

1. **Android**: Google Play Console account with app published or in testing
2. **iOS**: Apple Developer account with App Store Connect access
3. **Package**: `react-native-iap` is required (install with `npm install react-native-iap`)

## Installation

```bash
npm install react-native-iap
# or
yarn add react-native-iap

# For iOS
cd ios && pod install && cd ..
```

## Android Setup (Google Play Console)

### 1. Create Subscription Products

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Monetize** → **Products** → **Subscriptions**
4. Click **Create subscription**

### 2. Monthly Subscription

- **Product ID**: `monthly_subscription_android`
- **Base Plan ID**: `monthly`
- **Offer ID**: `3days`
- **Name**: Monthly Premium Subscription
- **Description**: Access to premium features for one month
- **Billing period**: 1 month
- **Price**: 149 RS (or your local currency equivalent)
- **Free trial**: Optional
- **Grace period**: Optional

**Note**: Create a base plan with ID `monthly` and add an offer with ID `3days` (this could be a free trial or promotional offer).

### 3. Yearly Subscription

- **Product ID**: `yearly_subscription_android`
- **Base Plan ID**: `yearly`
- **Offer ID**: `7days`
- **Name**: Yearly Premium Subscription
- **Description**: Access to premium features for one year at a discounted rate
- **Billing period**: 12 months
- **Price**: 899 RS (or your local currency equivalent)
- **Free trial**: Optional
- **Grace period**: Optional

**Note**: Create a base plan with ID `yearly` and add an offer with ID `7days` (this could be a free trial or promotional offer).

### 4. Create Base Plans and Offers

For each subscription product, you need to create base plans and offers:

#### Monthly Subscription Setup:

1. After creating the subscription product `monthly_subscription_android`, click on it
2. Click **"Add base plan"**
3. **Base Plan ID**: `monthly`
4. Set the billing period to 1 month
5. Set the price to 149 RS
6. Save the base plan
7. Click **"Add offer"** under the base plan
8. **Offer ID**: `3days`
9. Configure the offer (e.g., free trial for 3 days, promotional pricing, etc.)
10. Save the offer

#### Yearly Subscription Setup:

1. After creating the subscription product `yearly_subscription_android`, click on it
2. Click **"Add base plan"**
3. **Base Plan ID**: `yearly`
4. Set the billing period to 12 months
5. Set the price to 899 RS
6. Save the base plan
7. Click **"Add offer"** under the base plan
8. **Offer ID**: `7days`
9. Configure the offer (e.g., free trial for 7 days, promotional pricing, etc.)
10. Save the offer

### 5. Activate Products

- Make sure both subscriptions and their base plans are **Active** in Play Console
- Products must be activated before they can be purchased

## iOS Setup (App Store Connect)

### 1. Create Subscription Groups

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Navigate to **Features** → **In-App Purchases**
4. Create a new **Subscription Group** (e.g., "Premium Subscriptions")

### 2. Monthly Subscription

1. Click **+** to create a new subscription
2. **Product ID**: `monthly_subscription`
3. **Reference Name**: Monthly Premium Subscription
4. **Subscription Duration**: 1 Month
5. **Price**: Set to 149 RS (or equivalent in your currency)
6. **Localizations**: Add descriptions in your supported languages

### 3. Yearly Subscription

1. In the same subscription group, create another subscription
2. **Product ID**: `yearly_subscription`
3. **Reference Name**: Yearly Premium Subscription
4. **Subscription Duration**: 1 Year
5. **Price**: Set to 899 RS (or equivalent in your currency)
6. **Localizations**: Add descriptions in your supported languages

### 4. Submit for Review

- Both subscriptions must be submitted for App Review
- They will be available after approval

## Database Setup

Run the SQL migration file to create the `user_subscriptions` table:

```sql
-- File: database/supabase/08_user_subscriptions.sql
```

Execute this in your Supabase SQL editor or run it as part of your migration process.

## Testing

### Android Testing

1. Add test accounts in Play Console → **Settings** → **License testing**
2. Use a test account to purchase subscriptions
3. Test subscriptions are free and auto-renew every 5 minutes

### iOS Testing

1. Create sandbox test accounts in App Store Connect
2. Sign out of your Apple ID on the device
3. When prompted during purchase, use sandbox account
4. Test subscriptions auto-renew every 5 minutes

## Product ID Configuration

The product IDs are defined in `src/services/subscriptionService.js`:

```javascript
const PRODUCT_IDS = {
  monthly: 'monthly_subscription',
  yearly: 'yearly_subscription',
};
```

Make sure these match exactly with the Product IDs in Play Console and App Store Connect.

## Features Implemented

✅ Purchase subscriptions (Monthly/Yearly)
✅ Restore purchases
✅ Subscription status checking
✅ Automatic expiration handling
✅ Database storage of subscription data
✅ Firebase Analytics tracking
✅ Error handling and user feedback

## Troubleshooting

### Products not loading

- Ensure products are **Active** in Play Console/App Store Connect
- Check Product IDs match exactly (case-sensitive)
- For iOS, ensure app is signed with correct provisioning profile
- For Android, ensure app is signed with release keystore in production

### Purchase not completing

- Check internet connection
- Verify billing account is set up correctly
- For iOS, ensure device is signed out of production Apple ID
- Check app logs for specific error messages

### Subscription not saving to database

- Verify Supabase RLS policies allow user to insert/update
- Check user is authenticated
- Verify database table exists and has correct schema

## Next Steps

1. Install `react-native-iap`: `npm install react-native-iap`
2. Run database migration: Execute `08_user_subscriptions.sql`
3. Create products in Play Console and App Store Connect
4. Test purchases with test accounts
5. Deploy to production

## Support

For issues with:

- **react-native-iap**: Check [documentation](https://github.com/dooboolab/react-native-iap)
- **Google Play Billing**: [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- **App Store Connect**: [Apple Developer Support](https://developer.apple.com/support/)
