import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { AdBanner, Icon } from '../../components';
import { subscriptionService } from '../../services';

const TermsScreen = () => {
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
          <Icon name="terms" size={wp(7)} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.profile.terms}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            By accessing and using SharePost, you accept and agree to be bound
            by the terms and provision of this agreement. If you do not agree to
            abide by the above, please do not use this service.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Use License
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Permission is granted to temporarily download one copy of SharePost
            for personal, non-commercial transitory viewing only. This is the
            grant of a license, not a transfer of title, and under this license
            you may not: modify or copy the materials; use the materials for any
            commercial purpose or for any public display; attempt to decompile or
            reverse engineer any software contained in SharePost; remove any
            copyright or other proprietary notations from the materials.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            You are responsible for maintaining the confidentiality of your
            account and password. You agree to accept responsibility for all
            activities that occur under your account or password. You must
            notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Subscription Services
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            SharePost offers subscription services that provide access to
            premium features. Subscriptions are billed on a monthly or yearly
            basis. By subscribing, you agree to pay the subscription fees
            associated with your chosen plan. Subscriptions will automatically
            renew unless cancelled at least 24 hours before the end of the
            current period.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Content and Intellectual Property
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            All content, features, and functionality of SharePost, including but
            not limited to text, graphics, logos, icons, images, and software,
            are the exclusive property of SharePost and are protected by
            international copyright, trademark, patent, trade secret, and other
            intellectual property laws.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. User-Generated Content
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            You retain ownership of any content you create using SharePost.
            However, by using our service, you grant us a worldwide,
            non-exclusive, royalty-free license to use, reproduce, modify, and
            distribute your content solely for the purpose of providing and
            improving our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Prohibited Uses
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            You may not use SharePost: in any way that violates any applicable
            national or international law or regulation; to transmit, or procure
            the sending of, any advertising or promotional material; to
            impersonate or attempt to impersonate the company, a company
            employee, another user, or any other person or entity.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Disclaimer
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            The materials on SharePost are provided on an 'as is' basis.
            SharePost makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Limitations
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            In no event shall SharePost or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use SharePost, even if SharePost or a SharePost
            authorized representative has been notified orally or in writing of
            the possibility of such damage.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Revisions and Errata
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            The materials appearing on SharePost could include technical,
            typographical, or photographic errors. SharePost does not warrant
            that any of the materials on its platform are accurate, complete, or
            current. SharePost may make changes to the materials contained on
            its platform at any time without notice.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Termination
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            We may terminate or suspend your account and bar access to the
            service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            12. Governing Law
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            These terms and conditions are governed by and construed in
            accordance with the laws and you irrevocably submit to the
            exclusive jurisdiction of the courts in that location.
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

export default TermsScreen;
