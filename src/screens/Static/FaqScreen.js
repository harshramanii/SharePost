import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { AdBanner, Icon } from '../../components';
import { faqQuestions } from '../../helper/dataConstants';
import { subscriptionService } from '../../services';

const FaqScreen = () => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [expandedId, setExpandedId] = useState(null);
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

  const toggleQuestion = useCallback(id => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  const renderFaqItem = useCallback(
    item => {
      const isExpanded = expandedId === item.id;
      return (
        <View
          key={item.id}
          style={[
            styles.faqItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.questionContainer}
            onPress={() => toggleQuestion(item.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.questionText,
                { color: colors.text },
                isExpanded && { fontFamily: fontFamily.bold },
              ]}
            >
              {item.question}
            </Text>
            <Icon
              name={isExpanded ? 'chevronUp' : 'chevronDown'}
              size={wp(5)}
              color={colors.primary}
            />
          </TouchableOpacity>
          {isExpanded && (
            <View style={styles.answerContainer}>
              <Text
                style={[styles.answerText, { color: colors.textSecondary }]}
              >
                {item.answer}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [expandedId, colors, toggleQuestion],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={hasActiveSubscription ? styles.contentAreaFull : styles.contentArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Icon name="faq" size={wp(7)} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.profile.faq}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {faqQuestions.map(item => renderFaqItem(item))}
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
  },
  faqItem: {
    borderRadius: wp(3),
    borderWidth: 1,
    marginBottom: hp(1.5),
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  questionText: {
    flex: 1,
    fontSize: fontSize(15),
    fontFamily: fontFamily.regular,
    marginRight: wp(3),
  },
  answerContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    paddingTop: hp(0.5),
  },
  answerText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    lineHeight: hp(2.4),
  },
});

export default FaqScreen;
