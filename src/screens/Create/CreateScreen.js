import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { hp, wp, isIos } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { CustomizablePostCard, Icon, Button, AdBanner } from '../../components';

const CreateScreen = () => {
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const [backgroundType, setBackgroundType] = useState('image'); // 'image' or 'text'
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundText, setBackgroundText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontSizeOption, setFontSizeOption] = useState('medium'); // 'small', 'medium', 'large'
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('background'); // 'background' or 'font'

  const colorOptions = useMemo(
    () => [
      '#FFFFFF',
      '#000000',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#FFA500',
      '#800080',
      '#FFC0CB',
      '#A52A2A',
      '#808080',
      '#000080',
      '#008000',
    ],
    [],
  );

  const showImagePickerOptions = useCallback(() => {
    if (isIos) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleImagePicker('camera');
          } else if (buttonIndex === 2) {
            handleImagePicker('gallery');
          }
        },
      );
    } else {
      setShowImagePickerModal(true);
    }
  }, []);

  const handleImagePicker = useCallback(async source => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      };

      let result;
      if (source === 'camera') {
        result = await launchCamera(options);
      } else {
        result = await launchImageLibrary(options);
      }

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('ImagePicker Error:', result.errorMessage);
        return;
      }

      if (result.assets && result.assets[0]) {
        setBackgroundImage(result.assets[0].uri);
        setShowImagePickerModal(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, []);

  const handleBackgroundTypeChange = useCallback(type => {
    setBackgroundType(type);
    if (type === 'image') {
      setBackgroundText('');
    } else {
      setBackgroundImage(null);
    }
  }, []);

  const handleColorSelect = useCallback(
    color => {
      if (colorPickerType === 'background') {
        setBackgroundColor(color);
      } else {
        setFontColor(color);
      }
      setShowColorPicker(false);
    },
    [colorPickerType],
  );

  const handleFontSizeSelect = useCallback(size => {
    setFontSizeOption(size);
    setShowFontSizePicker(false);
  }, []);

  const openColorPicker = useCallback(type => {
    setColorPickerType(type);
    setShowColorPicker(true);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {strings.create.title}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <CustomizablePostCard
            backgroundImage={backgroundImage}
            backgroundText={backgroundText}
            backgroundColor={backgroundColor}
            fontColor={fontColor}
            fontSize={fontSizeOption}
            onDownload={() => {}}
            onShare={() => {}}
            showEdit={false}
          />
        </View>

        <View
          style={[
            styles.controlsContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {strings.create.selectBackground}
          </Text>

          <View style={styles.backgroundTypeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    backgroundType === 'image'
                      ? colors.primary
                      : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleBackgroundTypeChange('image')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color:
                      backgroundType === 'image' ? colors.white : colors.text,
                  },
                ]}
              >
                {strings.create.imageBackground}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    backgroundType === 'text'
                      ? colors.primary
                      : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleBackgroundTypeChange('text')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color:
                      backgroundType === 'text' ? colors.white : colors.text,
                  },
                ]}
              >
                {strings.create.textBackground}
              </Text>
            </TouchableOpacity>
          </View>

          {backgroundType === 'image' ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={showImagePickerOptions}
              activeOpacity={0.7}
            >
              <Icon name="photo" size={wp(5)} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                {backgroundImage
                  ? strings.create.chooseImage
                  : strings.create.chooseImage}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings.create.enterText}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder={strings.create.enterText}
                  placeholderTextColor={colors.textSecondary}
                  value={backgroundText}
                  onChangeText={setBackgroundText}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.colorControlsContainer}>
                <View style={styles.colorControl}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {strings.create.backgroundColor}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: backgroundColor,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => openColorPicker('background')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.colorPreview} />
                  </TouchableOpacity>
                </View>

                <View style={styles.colorControl}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {strings.create.fontColor}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: fontColor,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => openColorPicker('font')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.colorPreview} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fontSizeContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings.create.fontSize}
                </Text>
                <View style={styles.fontSizeButtons}>
                  {['small', 'medium', 'large'].map(size => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.fontSizeButton,
                        {
                          backgroundColor:
                            fontSizeOption === size
                              ? colors.primary
                              : colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => handleFontSizeSelect(size)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.fontSizeButtonText,
                          {
                            color:
                              fontSizeOption === size
                                ? colors.white
                                : colors.text,
                          },
                        ]}
                      >
                        {strings.create[size]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.bannerContainer}>
          <AdBanner />
        </View>
      </ScrollView>

      {/* Image Picker Modal for Android */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {strings.create.selectBackground}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowImagePickerModal(false);
                handleImagePicker('camera');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.white }]}>
                {strings.create.takePhoto}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowImagePickerModal(false);
                handleImagePicker('gallery');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.white }]}>
                {strings.create.chooseFromGallery}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => setShowImagePickerModal(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {strings.common.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {colorPickerType === 'background'
                ? strings.create.backgroundColor
                : strings.create.fontColor}
            </Text>
            <View style={styles.colorGrid}>
              {colorOptions.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor:
                        (colorPickerType === 'background' &&
                          backgroundColor === color) ||
                        (colorPickerType === 'font' && fontColor === color)
                          ? colors.primary
                          : colors.border,
                      borderWidth:
                        (colorPickerType === 'background' &&
                          backgroundColor === color) ||
                        (colorPickerType === 'font' && fontColor === color)
                          ? 3
                          : 1,
                    },
                  ]}
                  onPress={() => handleColorSelect(color)}
                  activeOpacity={0.7}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => setShowColorPicker(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {strings.common.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(12),
  },
  header: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
  },
  cardContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  controlsContainer: {
    marginHorizontal: wp(5),
    padding: wp(5),
    borderRadius: wp(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    marginBottom: hp(2),
  },
  backgroundTypeContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2),
  },
  typeButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    gap: wp(2),
  },
  actionButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginBottom: hp(1),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    minHeight: hp(10),
    textAlignVertical: 'top',
  },
  colorControlsContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(2),
  },
  colorControl: {
    flex: 1,
  },
  colorButton: {
    width: '100%',
    height: hp(6),
    borderRadius: wp(2),
    borderWidth: 1,
    marginTop: hp(1),
  },
  colorPreview: {
    flex: 1,
  },
  fontSizeContainer: {
    marginBottom: hp(1),
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: hp(1),
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    padding: wp(5),
    paddingBottom: hp(3),
  },
  modalTitle: {
    fontSize: fontSize(18),
    fontFamily: fontFamily.bold,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  modalButtonText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  bannerContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
    marginBottom: hp(2),
    justifyContent: 'center',
  },
  colorOption: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
  },
});

export default CreateScreen;

