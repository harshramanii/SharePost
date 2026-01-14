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

const LoginScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, validateEmail, strings]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);

      if (error) {
        showError(error.message || strings.auth.loginError);
        return;
      }

      if (data?.user) {
        navigation.replace('Main');
        showSuccess(strings.auth.loginSuccess);
      }
    } catch (error) {
      showError(error.message || strings.auth.loginError);
    } finally {
      setLoading(false);
    }
  }, [email, password, validateForm, navigation, strings]);

  const handleContinueAsGuest = useCallback(() => {
    navigation.replace('Main');
  }, [navigation]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUp');
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
          <View style={styles.logoContainer}>
            <Image
              source={icons.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.auth.login}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Welcome back! Please login to your account.
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.forgotPasswordText, { color: colors.primary }]}
              >
                {strings.auth.forgotPassword}
              </Text>
            </TouchableOpacity>

            <Button
              title={strings.auth.login}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
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

            <View style={styles.signUpContainer}>
              <Text
                style={[styles.signUpText, { color: colors.textSecondary }]}
              >
                {strings.auth.dontHaveAccount}{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                <Text style={[styles.signUpLink, { color: colors.primary }]}>
                  {strings.auth.signUp}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: hp(3),
    marginTop: -hp(1),
  },
  forgotPasswordText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  loginButton: {
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  signUpText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  signUpLink: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
  },
});

export default LoginScreen;
