import React, {memo} from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';

import {colors, fontFamily, fontSize} from '../../helper/utils';
import {hp, wp} from '../../helper/constants';

const Button = memo(
  ({
    title,
    onPress,
    disabled = false,
    loading = false,
    style = {},
    textStyle = {},
    variant = 'primary',
  }) => {
    const buttonStyle = [
      styles.button,
      variant === 'primary' && styles.primaryButton,
      variant === 'secondary' && styles.secondaryButton,
      disabled && styles.disabledButton,
      style,
    ];

    const buttonTextStyle = [
      styles.buttonText,
      variant === 'primary' && styles.primaryButtonText,
      variant === 'secondary' && styles.secondaryButtonText,
      textStyle,
    ];

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.white : colors.primary}
            size="small"
          />
        ) : (
          <Text style={buttonTextStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    height: hp(6.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  primaryButtonText: {
    color: colors.white,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
});

Button.displayName = 'Button';

export default Button;











