# Android Subscription Troubleshooting Guide

If subscription products are not showing on physical Android devices, follow these steps:

## 1. Verify Product Configuration in Play Console

### Check Product Status

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Monetize** → **Products** → **Subscriptions**
3. Verify both products exist:
   - `monthly_subscription_android`
   - `yearly_subscription_android`
4. **CRITICAL**: Ensure products are in **"Active"** status (not Draft)
5. Check that base plans are also **"Active"**

### Verify Product IDs Match Exactly

- Product IDs in code must match Play Console exactly (case-sensitive)
- Current product IDs:
  - Monthly: `monthly_subscription_android`
  - Yearly: `yearly_subscription_android`

## 2. App Signing Configuration

### For Internal Testing

The app **MUST** be signed with the **release keystore** that matches Play Console:

1. **Check your keystore**:

   - Location: `android/app/sharepost.jks`
   - Verify it matches the keystore uploaded to Play Console

2. **Build with release signing**:

   ```bash
   # Build release APK/AAB
   cd android
   ./gradlew assembleRelease
   # or
   ./gradlew bundleRelease
   ```

3. **Install on device**:
   - Use the release-signed APK/AAB from internal testing track
   - Do NOT use debug builds for testing subscriptions

## 3. License Testing Setup

### Add Test Accounts

1. Go to Play Console → **Setup** → **License testing**
2. Add your Google account email(s) to **License testers**
3. Wait 2-3 hours for changes to propagate

### Verify Account on Device

1. On your Android device, ensure you're signed in with a test account
2. The account must be in the license testers list
3. Clear Play Store cache: Settings → Apps → Google Play Store → Clear Cache

## 4. Internal Testing Track

### Verify App Status

1. Go to Play Console → **Testing** → **Internal testing**
2. Ensure your app version is:
   - Uploaded
   - In "Review" or "Available" status
   - Has at least one tester added

### Install from Internal Testing

1. Use the internal testing link to install the app
2. Or join the internal testing track from Play Store
3. Make sure you're installing the version from internal testing, not a direct APK

## 5. Product Activation Checklist

For each subscription product, verify:

- [ ] Product ID matches exactly: `monthly_subscription_android` / `yearly_subscription_android`
- [ ] Product status is **"Active"** (not Draft)
- [ ] Base plan exists with ID: `monthly` / `yearly`
- [ ] Base plan status is **"Active"**
- [ ] Offer exists with ID: `3days` / `7days`
- [ ] Offer status is **"Active"**
- [ ] Pricing is set correctly
- [ ] Product is published (not in draft)

## 6. Code Verification

### Check Product IDs in Code

File: `src/services/subscriptionService.js`

```javascript
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
```

### Verify Logs

Check device logs for:

- `[SubscriptionService] Loading products for android:`
- `[SubscriptionService] Android subscriptions loaded:`
- Any error messages about products not found

## 7. Common Issues and Solutions

### Issue: "No products found"

**Solutions:**

1. Products not activated → Activate in Play Console
2. Wrong keystore → Use release keystore
3. Account not in license testers → Add to license testers
4. Product IDs mismatch → Verify exact match

### Issue: "getSubscriptions failed"

**Solutions:**

1. Products not published → Publish products
2. Base plans not active → Activate base plans
3. App not from internal testing → Install from internal testing track

### Issue: Products show in console but not in app

**Solutions:**

1. Clear app data and reinstall
2. Wait 2-3 hours after product activation
3. Verify you're using the release-signed build
4. Check device is connected to internet

## 8. Testing Steps

1. **Build release APK/AAB**:

   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Upload to Internal Testing**:

   - Upload the AAB file to Play Console
   - Add to internal testing track

3. **Add License Testers**:

   - Add your Google account email
   - Wait 2-3 hours

4. **Install on Device**:

   - Join internal testing from Play Store link
   - Install the app from Play Store (not direct APK)

5. **Test Subscription**:
   - Open app
   - Navigate to subscription modal
   - Check logs for product loading
   - Verify products appear

## 9. Debug Commands

### Check IAP Status

The app now includes debug logging. Check device logs for:

```
[SubscriptionService] Loading products for android: [...]
[SubscriptionService] Android subscriptions loaded: X products
[SubscriptionService] Products: [...]
```

### Enable Verbose Logging

In your app, the subscription service logs detailed information:

- Product IDs being requested
- Methods being tried (getSubscriptions, getProducts)
- Error messages with details
- Connection status

## 10. Still Not Working?

If products still don't show after following all steps:

1. **Wait 24-48 hours** after product activation (Google's propagation time)
2. **Verify app signature** matches Play Console exactly
3. **Check Play Console** for any warnings or errors
4. **Test with a different Google account** added as license tester
5. **Verify app version** in Play Console matches installed version
6. **Check network connectivity** on device
7. **Clear Play Store cache** and restart device

## Important Notes

- ⚠️ **Debug builds will NOT work** - Must use release-signed builds
- ⚠️ **Products must be Active** - Draft products won't work
- ⚠️ **Account must be license tester** - Regular accounts won't see products
- ⚠️ **Wait 2-3 hours** - Changes take time to propagate
- ⚠️ **Install from Play Store** - Direct APK installs may not work for IAP

## Support

If issues persist:

1. Check [react-native-iap documentation](https://github.com/dooboolab/react-native-iap)
2. Review [Google Play Billing documentation](https://developer.android.com/google/play/billing)
3. Check Play Console for specific error messages
