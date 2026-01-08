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

const DeleteAccountModal = ({ visible, onClose, onConfirm }) => {
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
                    { backgroundColor: '#FF3B30' + '20' },
                  ]}
                >
                  <Icon name="delete" size={wp(12)} color="#FF3B30" />
                </View>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {strings.profile.deleteAccount}
              </Text>

              <Text style={[styles.message, { color: colors.textSecondary }]}>
                Are you sure you want to delete your account? This action cannot
                be undone. All your data, posts, and profile information will be
                permanently deleted.
              </Text>

              <View style={styles.warningContainer}>
                <Icon name="alert" size={wp(5)} color="#FF3B30" />
                <Text style={[styles.warningText, { color: '#FF3B30' }]}>
                  This action is permanent and cannot be reversed.
                </Text>
              </View>

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
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {strings.profile.deleteAccount}
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
    color: '#FF3B30',
  },
  message: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: hp(2),
    lineHeight: fontSize(22),
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30' + '10',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(4),
    gap: wp(2),
  },
  warningText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
    flex: 1,
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
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default DeleteAccountModal;

