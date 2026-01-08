import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? '#FF3B30' : colors.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
            accessibilityLabel={
              showPassword ? 'Hide password' : 'Show password'
            }
            accessibilityRole="button"
          >
            <Icon
              name={showPassword ? 'eye' : 'eye-off'}
              size={wp(5)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(2),
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    minHeight: hp(6.5),
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1),
  },
  input: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    padding: 0,
    margin: 0,
    flex: 1,
    width: '100%',
    paddingVertical: hp(1.5),
  },
  inputMultiline: {
    minHeight: hp(10),
    paddingTop: hp(1),
  },
  eyeIcon: {
    padding: wp(1),
    marginLeft: wp(2),
  },
  errorText: {
    color: '#FF3B30',
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
});

export default Input;
