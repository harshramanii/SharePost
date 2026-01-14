import React, { useCallback, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, Icon, AdBanner } from '../../components';
import { contactSupportService, subscriptionService } from '../../services';
import { showSuccess, showError } from '../../helper/toast';
import { useSelector } from 'react-redux';

const ContactSupportModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const { profile: userProfile } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Set user email when modal opens
  useEffect(() => {
    if (visible) {
      setFormData(prev => ({
        ...prev,
        email: userProfile?.email || '',
      }));
      setErrors({});
    }
  }, [visible, userProfile]);

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
    if (visible) {
      checkSubscription();
    }
  }, [visible]);

  const handleChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    },
    [errors],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await contactSupportService.submitContactSupport({
        title: formData.title.trim(),
        description: formData.description.trim(),
        email: formData.email.trim(),
        priority: formData.priority,
      });

      if (error) {
        showError(error.message || 'Failed to submit support request');
        return;
      }

      showSuccess('Support request submitted successfully');
      // Reset form
      setFormData({
        title: '',
        description: '',
        email: userProfile?.email || '',
        priority: 'medium',
      });
      setErrors({});
      onClose();
    } catch (error) {
      showError(error.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, userProfile, onClose]);

  const handleOverlayPress = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const handleCancel = useCallback(() => {
    if (!loading) {
      setFormData({
        title: '',
        description: '',
        email: userProfile?.email || '',
        priority: 'medium',
      });
      setErrors({});
      onClose();
    }
  }, [onClose, loading, userProfile]);

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
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
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Contact Support
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Icon name="close" size={wp(6)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={hasActiveSubscription ? styles.contentAreaFull : styles.contentArea}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Title *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.title ? '#FF3B30' : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.title}
                    onChangeText={value => handleChange('title', value)}
                    placeholder="Enter a brief title for your issue"
                    placeholderTextColor={colors.textSecondary}
                    editable={!loading}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Description *
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.description
                          ? '#FF3B30'
                          : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.description}
                    onChangeText={value => handleChange('description', value)}
                    placeholder="Describe your issue or question in detail..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    editable={!loading}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Email *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.email ? '#FF3B30' : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.email}
                    onChangeText={value => handleChange('email', value)}
                    placeholder="your.email@example.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Priority
                  </Text>
                  <View style={styles.priorityContainer}>
                    {priorityOptions.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.priorityOption,
                          {
                            backgroundColor:
                              formData.priority === option.value
                                ? colors.primary
                                : colors.surface,
                            borderColor:
                              formData.priority === option.value
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => handleChange('priority', option.value)}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.priorityOptionText,
                            {
                              color:
                                formData.priority === option.value
                                  ? colors.white
                                  : colors.text,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                  </View>
                </ScrollView>
              </View>

              {!hasActiveSubscription && (
                <View style={styles.adArea}>
                  <AdBanner style={styles.adBanner} />
                </View>
              )}
            </View>

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Button
                title={strings.common.cancel}
                onPress={handleCancel}
                style={[styles.footerButton, styles.cancelButton]}
                textStyle={{ color: colors.text }}
                disabled={loading}
              />
              <Button
                title="Submit"
                onPress={handleSubmit}
                style={styles.footerButton}
                loading={loading}
                disabled={loading}
              />
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
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    height: hp(90),
  },
  modalBody: {
    flex: 1,
  },
  contentArea: {
    flex: 7,
  },
  contentAreaFull: {
    flex: 1,
  },
  adArea: {
    flex: 3,
    justifyContent: 'center',
  },
  adBanner: {
    borderTopWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: fontFamily.bold,
  },
  closeButton: {
    padding: wp(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  formContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.bold,
    marginBottom: hp(1),
  },
  input: {
    width: '100%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  textArea: {
    width: '100%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    minHeight: hp(15),
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: wp(2),
  },
  priorityOption: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityOptionText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: fontSize(12),
    fontFamily: fontFamily.regular,
    marginTop: hp(0.5),
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    gap: wp(3),
  },
  footerButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
});

export default ContactSupportModal;

