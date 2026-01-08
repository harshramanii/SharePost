import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import { hp, wp } from '../../helper/constants';
import { fontFamily, fontSize } from '../../helper/utils';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { FilterModal, Icon, PostSlider } from '../../components';
import { postService, categoryService } from '../../services';
import { fetchUserProfile } from '../../store/slices/userSlice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { strings } = useLanguage();
  const { profile: userProfile } = useSelector(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

  // Fetch user profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUserProfile());
    }, [dispatch]),
  );

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, debouncedSearchQuery]);

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await categoryService.getCategories();
      if (!error && data && Array.isArray(data)) {
        // Filter out any null/undefined categories
        const validCategories = data.filter(cat => cat != null);
        setCategories(validCategories);
      } else {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      const searchOptions = {
        limit: 50,
        searchQuery: debouncedSearchQuery.trim() || null,
      };

      if (selectedCategory === 'all') {
        result = await postService.getPosts(searchOptions);
      } else {
        // Use category ID for filtering
        result = await postService.getPosts({
          categoryId: selectedCategory,
          ...searchOptions,
        });
      }

      if (result.error) {
        console.error('Error loading posts:', result.error);
        setPosts([]);
      } else {
        setPosts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearchQuery]);

  const getTimeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return strings.home.goodMorning;
    } else if (hour >= 12 && hour < 17) {
      return strings.home.goodAfternoon;
    } else {
      return strings.home.goodEvening;
    }
  }, [strings]);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleCategorySelect = useCallback(category => {
    setSelectedCategory(category);
    setShowFilterModal(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const handleDownload = useCallback(post => {
    console.log('Download post:', post.id);
    // Implement download functionality
  }, []);

  const handleEdit = useCallback(post => {
    console.log('Edit post:', post.id);
    // Navigate to edit screen
  }, []);

  const handleShare = useCallback(post => {
    console.log('Share post:', post.id);
    // Implement share functionality
  }, []);

  const filteredPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    // Transform posts to match PostSlider format
    return posts.map(post => ({
      id: post.id,
      image: post.image_url,
      category: post.categories?.key || 'all',
      title: post.title || '',
      categoryData: post.categories,
    }));
  }, [posts]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <FilterModal
        visible={showFilterModal}
        onClose={handleCloseModal}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        categories={categories}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text
                style={[styles.greetingText, { color: colors.textSecondary }]}
              >
                {getTimeBasedGreeting}
              </Text>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                {userProfile && userProfile.full_name
                  ? `Welcome, ${userProfile.full_name}`
                  : strings.home.welcomeUser}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
              style={styles.profileIconContainer}
            >
              {userProfile &&
              userProfile.avatar_url &&
              userProfile.avatar_url.trim() !== '' ? (
                <Image
                  source={{ uri: userProfile.avatar_url }}
                  style={styles.profileIcon}
                />
              ) : (
                <View
                  style={[
                    styles.profileIcon,
                    styles.profileIconPlaceholder,
                    {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary + '40',
                    },
                  ]}
                >
                  <Icon name="profile" size={wp(6)} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon name="search" size={wp(5)} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={strings.home.searchPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                  style={styles.clearButton}
                >
                  <Icon
                    name="close"
                    size={wp(4)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                selectedCategory !== 'all' && {
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Icon
                name="filter"
                size={wp(5)}
                color={
                  selectedCategory !== 'all' ? colors.primary : colors.white
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredPosts.length > 0 ? (
          <>
            {debouncedSearchQuery && (
              <View style={styles.searchResultsContainer}>
                <Text
                  style={[
                    styles.searchResultsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Found {filteredPosts.length} result
                  {filteredPosts.length !== 1 ? 's' : ''} for "
                  {debouncedSearchQuery}"
                </Text>
              </View>
            )}
            <PostSlider
              posts={filteredPosts}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onShare={handleShare}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon
              name="search"
              size={wp(15)}
              color={colors.textSecondary}
              style={{ opacity: 0.3 }}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {debouncedSearchQuery
                ? `No posts found for "${debouncedSearchQuery}"`
                : 'No posts found'}
            </Text>
            {debouncedSearchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Text
                  style={[styles.clearSearchText, { color: colors.primary }]}
                >
                  Clear search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: hp(3),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: hp(1),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    marginBottom: hp(0.5),
    opacity: 0.8,
  },
  welcomeText: {
    fontSize: fontSize(24),
    fontFamily: fontFamily.bold,
  },
  profileIconContainer: {
    marginLeft: wp(3),
  },
  profileIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#f0f0f0',
  },
  profileIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
    gap: wp(3),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    borderWidth: 1,
    gap: wp(3),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
    paddingVertical: hp(1),
  },
  filterButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  loadingContainer: {
    paddingVertical: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.regular,
    marginTop: hp(2),
    textAlign: 'center',
  },
  searchResultsContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    marginBottom: hp(1),
  },
  searchResultsText: {
    fontSize: fontSize(14),
    fontFamily: fontFamily.regular,
  },
  clearSearchButton: {
    marginTop: hp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  clearSearchText: {
    fontSize: fontSize(16),
    fontFamily: fontFamily.bold,
  },
});

export default HomeScreen;
