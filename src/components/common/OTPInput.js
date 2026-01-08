import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';

const OTPInput = ({ length = 6, onComplete, error }) => {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = useCallback(
    (text, index) => {
      if (text.length > 1) {
        // Handle paste
        const pastedText = text.slice(0, length);
        const newOtp = [...otp];
        pastedText.split('').forEach((char, i) => {
          if (index + i < length) {
            newOtp[index + i] = char;
          }
        });
        setOtp(newOtp);
        const otpValue = newOtp.join('');
        if (otpValue.length === length) {
          onComplete?.(otpValue);
          inputRefs.current[length - 1]?.blur();
        } else {
          const nextIndex = Math.min(index + pastedText.length, length - 1);
          inputRefs.current[nextIndex]?.focus();
        }
        return;
      }

      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      const otpValue = newOtp.join('');
      if (otpValue.length === length) {
        onComplete?.(otpValue);
        inputRefs.current[index]?.blur();
      } else if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp, length, onComplete],
  );

  const handleKeyPress = useCallback(
    (e, index) => {
      if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handleFocus = useCallback(index => {
    inputRefs.current[index]?.focus();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {otp.map((digit, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleFocus(index)}
            activeOpacity={1}
          >
            <TextInput
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: error
                    ? '#FF3B30'
                    : digit
                    ? colors.primary
                    : colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(2),
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(2),
  },
  input: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    borderWidth: 2,
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
    textAlign: 'center',
  },
});

export default OTPInput;







