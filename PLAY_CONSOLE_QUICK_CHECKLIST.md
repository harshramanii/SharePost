# Google Play Console - Quick Upload Checklist

## Pre-Upload Preparation

### Build & Sign
- [ ] Increment `versionCode` in `android/app/build.gradle`
- [ ] Update `versionName` in `android/app/build.gradle`
- [ ] Build release AAB: `cd android && ./gradlew bundleRelease`
- [ ] Test release build on device
- [ ] Verify signing configuration is correct
- [ ] Backup keystore file (`sharepost.jks`) securely

### Assets Required
- [ ] App icon: 512x512 px PNG
- [ ] Feature graphic: 1024x500 px
- [ ] Phone screenshots: 2-8 images (min 320px height)
- [ ] Tablet screenshots (optional)
- [ ] Promotional video URL (optional)

### Content
- [ ] App name: "SharePost"
- [ ] Short description: 80 characters max
- [ ] Full description: 4000 characters max
- [ ] Privacy Policy URL (hosted online)
- [ ] Support email address
- [ ] Website URL (if applicable)

---

## Play Console Setup

### 1. Create App
- [ ] App name: SharePost
- [ ] Default language: English
- [ ] App or game: App
- [ ] Free or paid: Free
- [ ] Declare ads: Yes (contains ads)

### 2. Store Listing
- [ ] Upload app icon
- [ ] Upload feature graphic
- [ ] Add phone screenshots (min 2)
- [ ] Add tablet screenshots (optional)
- [ ] Write app description
- [ ] Add promotional video (optional)
- [ ] Select app category: Social/Photo & Video
- [ ] Add contact details

### 3. Content Rating
- [ ] Complete questionnaire
- [ ] Answer about user-generated content: Yes
- [ ] Answer about sharing: Yes
- [ ] Answer about ads: Yes
- [ ] Answer about data collection: Yes
- [ ] Answer about in-app purchases: Yes
- [ ] Get rating certificate

### 4. Privacy Policy
- [ ] Host privacy policy online
- [ ] Add URL in Play Console
- [ ] Ensure it covers:
  - Data collection (email, profile, photos)
  - Data usage (authentication, functionality)
  - Third-party services (Supabase, Firebase, AdMob)
  - User rights (access, deletion)

### 5. App Signing
- [ ] Upload signing certificate
- [ ] Enable Play App Signing (recommended)
- [ ] Save key information securely

### 6. Pricing & Distribution
- [ ] Set as Free app
- [ ] Select countries for distribution
- [ ] Select device types (phones, tablets)
- [ ] Set Android version requirements

### 7. Monetization Setup
- [ ] Set up subscriptions in Play Console
- [ ] Create monthly subscription product
- [ ] Create yearly subscription product
- [ ] Configure subscription prices
- [ ] Set up subscription offers (if applicable)

### 8. Create Release
- [ ] Go to Production (or Testing track)
- [ ] Click "Create new release"
- [ ] Upload AAB file (`app-release.aab`)
- [ ] Add release notes
- [ ] Review release information
- [ ] Click "Review release"
- [ ] Click "Start rollout to Production"

---

## Post-Upload

### Review Process
- [ ] Wait for review (1-3 days for updates, 1-7 days for new apps)
- [ ] Check for any policy violations
- [ ] Address any issues if flagged
- [ ] App goes live after approval

### Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track analytics
- [ ] Monitor subscription metrics
- [ ] Check ad performance

---

## Quick Commands

### Build Release AAB
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Build Release APK (if needed)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Check App Version
```bash
# Check versionCode and versionName in:
android/app/build.gradle
```

---

## Important Files

- **Keystore**: `android/app/sharepost.jks`
- **Build Config**: `android/app/build.gradle`
- **Package Name**: `com.sharepost`
- **Privacy Policy**: Host online and add URL

---

## Critical Notes

⚠️ **Never lose your keystore file** - You cannot update your app without it!

⚠️ **Version codes must always increase** - Each release needs a higher version code.

⚠️ **Test before uploading** - Always test your release build first.

⚠️ **Privacy policy must be accessible** - Host it online, not just in-app.

⚠️ **Declare ads** - Make sure to declare that your app contains ads.

---

## Support Links

- Play Console: https://play.google.com/console
- Developer Policy: https://play.google.com/about/developer-content-policy/
- App Signing Help: https://support.google.com/googleplay/android-developer/answer/9842756

---

**Ready to upload? Follow this checklist step by step! ✅**
