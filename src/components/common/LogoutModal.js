import React, { useCallback, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Icon } from '../../components';

const LogoutModal = ({ visible, onClose, onConfirm }) => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleOverlayPress = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const handleCancel = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={handleOverlayPress}>
        <View
          style={styles.modalContentWrapper}
          onStartShouldSetResponder={() => true}
        >
          <SafeAreaView
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
            edges={['bottom']}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Icon name="logout" size={wp(12)} color={colors.primary} />
                </View>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {strings.settings.logout}
              </Text>

              <Text style={[styles.message, { color: colors.textSecondary }]}>
                Are you sure you want to logout? You will need to login again to
                access your account.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={handleCancel}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    {strings.common.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color="#FF3B30" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {strings.settings.logout}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '90%',
    maxWidth: wp(90),
  },
  modalContainer: {
    borderRadius: wp(4),
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: hp(2),
  },
  iconCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: hp(4),
    lineHeight: fontSize(22),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: wp(3),
  },
  button: {
    flex: 1,
    height: hp(6.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(4),
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  confirmButton: {
    backgroundColor: 'transparent',
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  confirmButtonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    color: '#FF3B30',
  },
});

export default LogoutModal;

