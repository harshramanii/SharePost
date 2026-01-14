import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { AdBanner, Icon } from '../../components';
import { subscriptionService } from '../../services';

const PrivacyPolicyScreen = () => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const hasSubscription = await subscriptionService.hasActiveSubscription();
        setHasActiveSubscription(hasSubscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      }
    };
    checkSubscription();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={hasActiveSubscription ? styles.contentAreaFull : styles.contentArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Icon name="privacy" size={wp(7)} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.profile.privacy}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            At SharePost, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We collect information that you provide directly to us, including:
            your name, email address, phone number, profile photo, bio, and
            social media links. We also collect information automatically when
            you use our service, such as device information, usage data, and
            analytics data.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We use the information we collect to: provide, maintain, and
            improve our services; process your transactions and send you related
            information; send you technical notices and support messages;
            respond to your comments and questions; monitor and analyze trends,
            usage, and activities; and personalize and improve your experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Information Sharing and Disclosure
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following
            circumstances: with your consent; to comply with legal obligations;
            to protect our rights and safety; with service providers who assist
            us in operating our app; and in connection with a business transfer.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Data Security
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We implement appropriate technical and organizational security
            measures to protect your personal information. However, no method of
            transmission over the internet or electronic storage is 100% secure,
            and we cannot guarantee absolute security.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Your Rights
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            You have the right to: access and receive a copy of your personal
            data; rectify inaccurate or incomplete data; request deletion of
            your data; object to processing of your data; and withdraw consent
            at any time. To exercise these rights, please contact us through
            the Contact Support feature in the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Children's Privacy
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Our service is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you are a parent or guardian and believe your child has provided
            us with personal information, please contact us immediately.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Third-Party Services
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Our app may contain links to third-party websites or services. We
            are not responsible for the privacy practices of these third
            parties. We encourage you to read their privacy policies before
            providing any information to them.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Advertising
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We may use third-party advertising services to display ads in our
            app. These services may use cookies or similar technologies to
            collect information about your activities to provide you with
            targeted advertising. You can opt out of personalized advertising
            through your device settings.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Data Retention
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We retain your personal information for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law. When you
            delete your account, we will delete or anonymize your personal
            information, except where we are required to retain it for legal
            purposes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. International Data Transfers
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Your information may be transferred to and processed in countries
            other than your country of residence. These countries may have data
            protection laws that differ from those in your country. By using our
            service, you consent to the transfer of your information to these
            countries.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Changes to This Privacy Policy
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            12. Contact Us
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact
            us through the Contact Support feature in the app or email us at
            support@sharepost.com.
          </Text>

          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </ScrollView>
      </View>

      {!hasActiveSubscription && (
        <View style={styles.adArea}>
          <AdBanner style={styles.adBanner} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentArea: { flex: 7 },
  contentAreaFull: { flex: 1 },
  adArea: { flex: 3, justifyContent: 'center' },
  adBanner: { borderTopWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    paddingBottom: hp(4),
  },
  sectionTitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  bodyText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    lineHeight: hp(2.6),
    marginBottom: hp(1),
  },
  lastUpdated: {
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(3),
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
