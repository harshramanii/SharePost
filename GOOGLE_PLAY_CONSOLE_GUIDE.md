# Google Play Console - App Upload Guide

## Table of Contents
1. [App Information](#app-information)
2. [Store Listing](#store-listing)
3. [Content Rating](#content-rating)
4. [Privacy Policy](#privacy-policy)
5. [App Signing](#app-signing)
6. [Release Management](#release-management)
7. [Graphics & Assets](#graphics--assets)
8. [Pricing & Distribution](#pricing--distribution)
9. [Content Guidelines](#content-guidelines)
10. [Technical Requirements](#technical-requirements)

---

## App Information

### Basic Details
- **App Name**: SharePost
- **Package Name**: `com.sharepost` (as per your AndroidManifest.xml)
- **Default Language**: English (en)
- **Category**: Social / Photo & Video / Lifestyle
- **Content Rating**: Everyone (or appropriate rating based on content)

### App Description (Short - 80 characters max)
```
Create beautiful posts with photos, themes, and share with friends
```

### App Description (Full - 4000 characters max)
```
SharePost - Create Beautiful Posts & Share Your Moments

Transform your photos into stunning social media posts with SharePost! Whether you're celebrating festivals, sharing inspirational thoughts, or creating personalized content, SharePost makes it easy and fun.

✨ Key Features:
• Create Custom Posts: Add your photos and personalize them with beautiful backgrounds
• Multiple Themes: Choose from Republic Day, festivals, inspirational quotes, and more
• Personalize Your Profile: Add your name, bio, and social media links
• Download & Share: Save high-quality images and share directly to social media
• Multi-language Support: Available in 10+ languages including Hindi, English, Tamil, Telugu, and more
• Dark Mode: Beautiful dark theme for comfortable viewing
• Ad-free Experience: Subscribe to remove ads and unlock premium features

🎨 Create Stunning Content:
- Upload photos from your gallery or take new ones
- Choose from a variety of backgrounds and themes
- Customize text, colors, and fonts
- Add your personal touch with profile information

📱 Perfect For:
- Social media enthusiasts
- Content creators
- Festival celebrations
- Personal branding
- Sharing inspirational messages

🔒 Privacy & Security:
- Secure authentication with email verification
- Your data is protected and private
- No unnecessary permissions required

Download SharePost today and start creating beautiful posts that stand out!

Note: This app contains ads. You can subscribe to remove ads and unlock premium features.
```

---

## Store Listing

### Screenshots Requirements

#### Phone Screenshots (Required)
- **Minimum**: 2 screenshots
- **Recommended**: 4-8 screenshots
- **Format**: PNG or JPEG
- **Dimensions**: 
  - Minimum: 320px height
  - Maximum: 3840px height
  - Aspect ratio: 16:9 or 9:16
- **File size**: Max 8MB per image

**Suggested Screenshots:**
1. Home screen with posts feed
2. Create post screen with customization options
3. Profile screen with user details
4. Post preview/download screen
5. Subscription modal (if applicable)
6. Language selection screen
7. Theme selection (dark/light mode)

#### Tablet Screenshots (Optional but recommended)
- Same requirements as phone screenshots
- Show tablet-optimized layouts

#### TV Screenshots (If applicable)
- 1280 x 720 px minimum
- Show TV-optimized interface

### Feature Graphic
- **Required**: Yes
- **Dimensions**: 1024 x 500 px
- **Format**: PNG or JPEG
- **File size**: Max 1MB
- **Content**: App logo, tagline, key features

### Icon
- **Required**: Yes
- **Dimensions**: 512 x 512 px
- **Format**: PNG (32-bit with alpha)
- **File size**: Max 1MB
- **Content**: Your app icon (from `assets/icons/logo.png`)

### Promotional Video (Optional)
- **Format**: YouTube URL
- **Duration**: 30 seconds to 2 minutes
- **Content**: App demo, key features showcase

---

## Content Rating

### Rating Questionnaire
Answer these questions honestly:

1. **Does your app contain user-generated content?**
   - Yes (users can create and share posts)

2. **Does your app allow users to share content?**
   - Yes (download and share posts)

3. **Does your app contain ads?**
   - Yes (Google AdMob ads - can be removed with subscription)

4. **Does your app collect personal information?**
   - Yes (email, profile data, photos)

5. **Does your app allow in-app purchases?**
   - Yes (subscriptions)

**Expected Rating**: Everyone (or PEGI 3+)

---

## Privacy Policy

### Required Information
You must provide a Privacy Policy URL that covers:

1. **Data Collection**:
   - Email addresses (for authentication)
   - Profile information (name, bio, photos)
   - Device information (FCM tokens for notifications)
   - Usage data (analytics)

2. **Data Usage**:
   - Account creation and authentication
   - App functionality
   - Push notifications
   - Analytics and app improvement

3. **Data Storage**:
   - Supabase (database and storage)
   - Firebase (analytics and notifications)
   - Google AdMob (advertising)

4. **User Rights**:
   - Access to personal data
   - Data deletion
   - Account deletion
   - Opt-out of data collection

5. **Third-Party Services**:
   - Supabase (backend)
   - Firebase (analytics, notifications)
   - Google AdMob (advertising)
   - Google Play Billing (subscriptions)

**Privacy Policy URL**: `https://yourdomain.com/privacy-policy`

**Note**: You already have a Privacy Policy screen in your app. Make sure it's also hosted online as a web page.

---

## App Signing

### App Signing Key
- **Key Alias**: `sharepost` (or your chosen alias)
- **Key File**: `android/app/sharepost.jks` (you already have this)
- **Key Password**: (Keep this secure and backed up!)

### Signing Configuration
Your `android/app/build.gradle` should have:
```gradle
signingConfigs {
    release {
        storeFile file('sharepost.jks')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'sharepost'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

### Play App Signing (Recommended)
- **Enable**: Yes (Google manages your signing key)
- **Benefits**: 
  - Key security
  - Key recovery
  - Smaller APK size

**Steps**:
1. Go to Play Console → Setup → App signing
2. Upload your app signing key certificate
3. Google will manage future signing

---

## Release Management

### Release Types

#### 1. Internal Testing
- **Purpose**: Test with your team
- **Testers**: Up to 100 internal testers
- **Review**: No review required
- **Use**: Initial testing before production

#### 2. Closed Testing (Alpha/Beta)
- **Purpose**: Test with selected users
- **Testers**: Up to 20,000 testers
- **Review**: Light review (usually 1-2 hours)
- **Use**: Pre-release testing

#### 3. Open Testing (Beta)
- **Purpose**: Public beta testing
- **Testers**: Unlimited
- **Review**: Full review (usually 1-3 days)
- **Use**: Public beta before full release

#### 4. Production
- **Purpose**: Public release
- **Review**: Full review (usually 1-3 days)
- **Use**: Full public release

### Release Checklist
- [ ] App is tested and working
- [ ] All features are functional
- [ ] No critical bugs
- [ ] Privacy policy is accessible
- [ ] Content rating is complete
- [ ] Store listing is complete
- [ ] Screenshots are uploaded
- [ ] App is signed correctly
- [ ] Version code is incremented
- [ ] Version name is updated

---

## Graphics & Assets

### Required Assets Checklist

#### App Icon
- [ ] 512 x 512 px PNG
- [ ] 32-bit with alpha channel
- [ ] No rounded corners (Google adds them)
- [ ] High quality, clear at small sizes

#### Feature Graphic
- [ ] 1024 x 500 px
- [ ] Shows app name and key features
- [ ] Eye-catching and professional

#### Screenshots
- [ ] Minimum 2 phone screenshots
- [ ] Recommended 4-8 screenshots
- [ ] Show key features and UI
- [ ] High quality, clear text

#### Promotional Graphics (Optional)
- [ ] TV banner (1280 x 720 px)
- [ ] Tablet screenshots
- [ ] Promotional video (YouTube)

---

## Pricing & Distribution

### Pricing
- **Free**: App is free to download
- **In-App Purchases**: Yes (subscriptions)
- **Subscription Plans**:
  - Monthly subscription
  - Yearly subscription

### Distribution
- **Countries**: Select all countries or specific regions
- **Device Types**: 
  - Phones
  - Tablets (if supported)
- **Android Versions**: 
  - Minimum SDK: Check your `build.gradle`
  - Target SDK: Latest (API 33+)

### Content Guidelines Compliance
- [ ] No prohibited content
- [ ] No misleading claims
- [ ] Accurate app description
- [ ] Proper content rating
- [ ] Privacy policy accessible
- [ ] Terms of service (if applicable)

---

## Content Guidelines

### Prohibited Content
- ❌ Violence or graphic content
- ❌ Hate speech
- ❌ Illegal activities
- ❌ Misleading information
- ❌ Copyright infringement
- ❌ Spam or deceptive practices

### Your App Compliance
✅ **Compliant**: 
- Social media post creation
- Photo editing and sharing
- User-generated content (with moderation)
- In-app purchases (subscriptions)
- Ads (with option to remove)

---

## Technical Requirements

### Build Configuration

#### Version Information
```gradle
android {
    defaultConfig {
        applicationId "com.sharepost"
        minSdkVersion 21  // Android 5.0+
        targetSdkVersion 33  // Android 13
        versionCode 1  // Increment for each release
        versionName "1.0.0"  // User-facing version
    }
}
```

#### Permissions
Your app uses:
- `INTERNET` - Required for API calls
- `CAMERA` - For taking photos
- `READ_EXTERNAL_STORAGE` - For accessing photos
- `WRITE_EXTERNAL_STORAGE` - For saving downloads
- `POST_NOTIFICATIONS` - For push notifications (Android 13+)

**Note**: Declare only necessary permissions.

### APK/AAB Requirements

#### App Bundle (AAB) - Recommended
- **Format**: `.aab` (Android App Bundle)
- **Benefits**: 
  - Smaller download size
  - Optimized for each device
  - Required for new apps (since August 2021)

#### APK (Legacy)
- **Format**: `.apk`
- **Use**: Only for internal testing or if AAB not supported

### Build Commands

#### Generate Release AAB
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

#### Generate Release APK (if needed)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### ProGuard/R8
- **Status**: Enabled (for code obfuscation)
- **File**: `android/app/proguard-rules.pro`
- **Purpose**: 
  - Reduce APK size
  - Protect code
  - Optimize performance

---

## Upload Process

### Step-by-Step Guide

1. **Prepare Your App**
   - [ ] Test thoroughly
   - [ ] Increment version code
   - [ ] Build release AAB
   - [ ] Test release build

2. **Create App in Play Console**
   - [ ] Go to Play Console
   - [ ] Click "Create app"
   - [ ] Fill app name, default language, app/play access
   - [ ] Accept terms

3. **Complete Store Listing**
   - [ ] Upload app icon
   - [ ] Upload feature graphic
   - [ ] Add screenshots
   - [ ] Write app description
   - [ ] Add promotional video (optional)

4. **Set Up Content Rating**
   - [ ] Complete questionnaire
   - [ ] Get rating certificate

5. **Privacy Policy**
   - [ ] Host privacy policy online
   - [ ] Add URL in Play Console

6. **App Signing**
   - [ ] Upload signing certificate
   - [ ] Enable Play App Signing (recommended)

7. **Create Release**
   - [ ] Go to Production or Testing track
   - [ ] Create new release
   - [ ] Upload AAB file
   - [ ] Add release notes
   - [ ] Review and publish

8. **Review Process**
   - [ ] Wait for Google review (1-3 days)
   - [ ] Address any issues if flagged
   - [ ] App goes live after approval

---

## Release Notes Template

### Version 1.0.0 (Initial Release)
```
🎉 Welcome to SharePost!

✨ Features:
• Create beautiful posts with photos and themes
• Personalize your profile with bio and social links
• Download and share high-quality images
• Support for 10+ languages
• Dark mode support
• Subscription plans for ad-free experience

🔧 Improvements:
• Smooth user interface
• Fast performance
• Secure authentication

📱 Requirements:
• Android 5.0 (Lollipop) or higher

Thank you for using SharePost!
```

---

## Common Issues & Solutions

### Issue: App Rejected - Missing Privacy Policy
**Solution**: 
- Host privacy policy online
- Add URL in Play Console → App content → Privacy policy

### Issue: App Rejected - Content Rating
**Solution**:
- Complete content rating questionnaire accurately
- Provide required information about user-generated content

### Issue: App Rejected - Misleading Claims
**Solution**:
- Ensure app description matches actual features
- Remove any exaggerated claims
- Be honest about app capabilities

### Issue: Signing Key Issues
**Solution**:
- Use Play App Signing (recommended)
- Keep your signing key secure and backed up
- Never lose your keystore file

### Issue: APK Size Too Large
**Solution**:
- Use AAB format (smaller downloads)
- Enable ProGuard/R8
- Optimize images and assets
- Remove unused resources

---

## Post-Launch Checklist

- [ ] Monitor crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Track analytics (Firebase Analytics)
- [ ] Monitor subscription metrics
- [ ] Update app regularly with bug fixes
- [ ] Add new features based on feedback
- [ ] Keep dependencies updated
- [ ] Monitor ad performance (AdMob)

---

## Important Links

- **Play Console**: https://play.google.com/console
- **Developer Policy**: https://play.google.com/about/developer-content-policy/
- **App Signing**: https://support.google.com/googleplay/android-developer/answer/9842756
- **Content Rating**: https://support.google.com/googleplay/android-developer/answer/188189
- **Privacy Policy Guide**: https://support.google.com/googleplay/android-developer/answer/10144311

---

## Support & Resources

### Documentation
- React Native: https://reactnative.dev/docs/signed-apk-android
- Google Play: https://developer.android.com/distribute/googleplay

### Your App Details
- **Package Name**: `com.sharepost`
- **Keystore**: `android/app/sharepost.jks`
- **Backend**: Supabase
- **Analytics**: Firebase
- **Ads**: Google AdMob
- **Billing**: Google Play Billing

---

## Notes

1. **Keep Your Keystore Safe**: If you lose your signing key, you cannot update your app. Always back it up securely.

2. **Test Before Release**: Always test your release build before uploading to Play Console.

3. **Version Codes**: Each release must have a higher version code than the previous one.

4. **Review Time**: First-time app submissions can take 1-7 days for review. Updates usually take 1-3 days.

5. **Ads Declaration**: Make sure to declare that your app contains ads in Play Console → Policy → App content.

6. **Subscription Setup**: Ensure your subscription products are properly configured in Play Console → Monetize → Products → Subscriptions.

---

**Good luck with your app launch! 🚀**
