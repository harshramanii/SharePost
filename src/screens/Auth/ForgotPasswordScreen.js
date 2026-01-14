import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, Input } from '../../components';
import { authService } from '../../services';
import { showSuccess, showError } from '../../helper/toast';
import { icons } from '../../helper/iconConstants';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = useCallback(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!email || email.trim() === '') {
      newErrors.email = strings?.auth?.emailRequired || 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = strings?.auth?.emailInvalid || 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, validateEmail, strings]);

  const handleResetPassword = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await authService.resetPassword(email);

      if (error) {
        showError(
          error.message ||
            strings?.auth?.resetPasswordError ||
            'Failed to send reset email',
        );
        return;
      }

      if (data) {
        setEmailSent(true);
        showSuccess(
          strings?.auth?.resetPasswordEmailSent ||
            'Password reset email sent successfully!',
        );
      }
    } catch (error) {
      showError(
        error.message ||
          strings?.auth?.resetPasswordError ||
          'Failed to send reset email',
      );
    } finally {
      setLoading(false);
    }
  }, [email, validateForm, strings]);

  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  if (emailSent) {
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
            <View style={styles.logoContainer}>
              <Image
                source={icons.logo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.successContainer}>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                {strings?.auth?.resetPasswordEmailSent || 'Email Sent!'}
              </Text>
              <Text
                style={[styles.successMessage, { color: colors.textSecondary }]}
              >
                {strings?.auth?.resetPasswordCheckEmail ||
                  'Please check your email for password reset instructions. The link will expire in 1 hour.'}
              </Text>
              <Text style={[styles.emailText, { color: colors.primary }]}>
                {email}
              </Text>
            </View>
            <Button
              title={strings?.auth?.backToLogin || 'Back to Login'}
              onPress={handleBackToLogin}
              style={styles.backButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <View style={styles.logoContainer}>
            <Image
              source={icons.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {strings?.auth?.forgotPassword || 'Forgot Password?'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {strings?.auth?.resetPasswordDescription ||
              "Enter your email address and we'll send you a link to reset your password."}
          </Text>

          <View style={styles.form}>
            <Input
              label={strings?.auth?.email || 'Email'}
              value={email}
              onChangeText={setEmail}
              placeholder={strings?.auth?.email || 'Email'}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Button
              title={strings?.auth?.sendResetLink || 'Send Reset Link'}
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backToLogin}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.backToLoginText,
                  { color: colors.textSecondary },
                ]}
              >
                {strings?.auth?.rememberPassword || 'Remember your password?'}{' '}
              </Text>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                {strings?.auth?.login || 'Login'}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  logo: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(24) * 0.04,
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
    marginBottom: hp(4),
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  backToLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  backToLoginText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  loginLink: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  successTitle: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  successMessage: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginBottom: hp(2),
    textAlign: 'center',
    lineHeight: fontSize(24),
  },
  emailText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    marginTop: hp(1),
    textAlign: 'center',
  },
  backButton: {
    marginTop: hp(2),
  },
});

export default ForgotPasswordScreen;
