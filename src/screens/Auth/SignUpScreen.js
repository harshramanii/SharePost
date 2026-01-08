import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = useCallback(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!email || email.trim() === '') {
      newErrors.email = strings.auth.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = strings.auth.emailInvalid;
    }

    if (!password || password.trim() === '') {
      newErrors.password = strings.auth.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = strings.auth.passwordMinLength;
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
      newErrors.confirmPassword = strings.auth.passwordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = strings.auth.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, validateEmail, strings]);

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await authService.signUp(email, password);

      if (error) {
        showError(error.message || strings.auth.signUpError);
        return;
      }

      if (data?.user) {
        // Save session if available from signup
        if (data.session?.access_token) {
          await authService.saveToken(data.session.access_token, data.user);
        } else {
          // If no session from signup, try to get it
          const { data: sessionData } = await authService.getSession();
          if (!sessionData?.session) {
            // If still no session, try to sign in to get one
            try {
              const signInResult = await authService.signIn(email, password);
              if (signInResult.error) {
                console.warn(
                  'Could not get session after signup:',
                  signInResult.error,
                );
              }
            } catch (signInError) {
              console.warn('Error signing in after signup:', signInError);
            }
          }
        }

        // Navigate to Personal Details with user ID
        navigation.navigate('PersonalDetails', {
          email,
          userId: data.user.id,
        });
        showSuccess(strings.auth.signUpSuccess);
      }
    } catch (error) {
      showError(error.message || strings.auth.signUpError);
    } finally {
      setLoading(false);
    }
  }, [email, password, validateForm, navigation, strings]);

  const handleContinueAsGuest = useCallback(() => {
    navigation.replace('Main');
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

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
            {strings.auth.signUp}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create your account to get started
          </Text>

          <View style={styles.form}>
            <Input
              label={strings.auth.email}
              value={email}
              onChangeText={setEmail}
              placeholder={strings.auth.email}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label={strings.auth.password}
              value={password}
              onChangeText={setPassword}
              placeholder={strings.auth.password}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label={strings.auth.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={strings.auth.confirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title={strings.auth.createAccount}
              onPress={handleSignUp}
              loading={loading}
              style={styles.signUpButton}
            />

            <View style={styles.divider}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.textSecondary }]}
              >
                OR
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            <Button
              title={strings.auth.continueAsGuest}
              onPress={handleContinueAsGuest}
              style={[styles.guestButton, { borderColor: colors.border }]}
              textStyle={{ color: colors.text }}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                {strings.auth.alreadyHaveAccount}{' '}
              </Text>
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  {strings.auth.login}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: hp(4),
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  signUpButton: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(3),
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: wp(3),
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  guestButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginBottom: hp(3),
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  loginText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  loginLink: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
});

export default SignUpScreen;
