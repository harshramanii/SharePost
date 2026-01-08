import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import Icon from './Icon';

const FilterModal = ({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  categories = [],
}) => {
  const { colors } = useTheme();
  const { strings } = useLanguage();

  const renderCategoryItem = useCallback(
    ({ item: category }) => {
      // Add null check
      if (!category) {
        return null;
      }

      const categoryKey = category.key || category.id;
      const isSelected = selectedCategory === categoryKey;
      const categoryName =
        categoryKey === 'all'
          ? strings.home.categories?.all || 'All'
          : category.name || category.name_en || categoryKey || 'Unknown';

      return (
        <TouchableOpacity
          style={[
            styles.categoryItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isSelected && {
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            },
          ]}
          onPress={() => onSelectCategory(categoryKey)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryText,
              { color: colors.text },
              isSelected && {
                color: colors.primary,
                fontFamily: fontFamily.bold,
              },
            ]}
          >
            {categoryName}
          </Text>
          {isSelected && (
            <Icon name="check" size={wp(5)} color={colors.primary} />
          )}
        </TouchableOpacity>
      );
    },
    [selectedCategory, colors, strings, onSelectCategory],
  );

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings.home.selectCategory}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="close" size={wp(6)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories.filter(cat => cat != null)}
              renderItem={renderCategoryItem}
              keyExtractor={item => (item?.id || item?.key || Math.random()).toString()}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No categories available
                  </Text>
                </View>
              }
            />
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
    height: hp(70),
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
    height: hp(60),
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
  },
  categoryText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
  },
  emptyContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
});

export default FilterModal;
