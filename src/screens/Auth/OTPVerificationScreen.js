import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, OTPInput } from '../../components';
import { authService } from '../../services';
import { showSuccess, showError } from '../../helper/toast';

const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOTPComplete = useCallback(otpValue => {
    setOtp(otpValue);
    setError('');
  }, []);

  const handleVerify = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError(strings.auth.otpRequired);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error } = await authService.verifyOTP(email, otp, 'email');

      if (error) {
        setError(error.message || strings.auth.otpInvalid);
        showError(error.message || strings.auth.otpError);
        return;
      }

      if (data?.verified) {
        // Navigate to Personal Details
        navigation.navigate('PersonalDetails', { email });
        showSuccess(strings.auth.otpSuccess);
      }
    } catch (error) {
      setError(error.message || strings.auth.otpInvalid);
      showError(error.message || strings.auth.otpError);
    } finally {
      setLoading(false);
    }
  }, [otp, navigation, email, strings]);

  const handleResend = useCallback(async () => {
    try {
      const { data, error } = await authService.sendOTP(email, 'email');

      if (error) {
        showError(
          error.message ||
            'Failed to resend OTP. Please check:\n1. Email template uses {{ .Token }}\n2. Email provider is enabled',
        );
        return;
      }

      showSuccess('OTP has been resent to your email');
    } catch (error) {
      showError(error.message || 'Failed to resend OTP');
    }
  }, [email]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.auth.otpVerification}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {strings.auth.otpSent}
          </Text>
          {email && (
            <Text style={[styles.email, { color: colors.primary }]}>
              {email}
            </Text>
          )}

          <View style={styles.otpContainer}>
            <OTPInput length={6} onComplete={handleOTPComplete} error={error} />
          </View>

          <Button
            title={strings.auth.verify}
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={[styles.resendLink, { color: colors.primary }]}>
                {strings.auth.resendOTP}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  email: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
    marginBottom: hp(4),
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: hp(4),
  },
  verifyButton: {
    marginBottom: hp(3),
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  resendText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  resendLink: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
});

export default OTPVerificationScreen;
