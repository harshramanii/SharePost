import { supabase } from '../config/supabase';

export const postService = {
  // Get all active posts for home feed
  getPosts: async (options = {}) => {
    try {
      const {
        categoryId = null,
        searchQuery = null,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        order = 'desc',
      } = options;

      // Build query with category join
      let query = supabase
        .from('photos')
        .select(
          `
          *,
          categories:category_id (
            id,
            name,
            description,
            icon,
            color
          )
        `,
        )
        .eq('status', 'active');

      // Filter by category if provided
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      // Search functionality - search in title, caption, and alt_text
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = `%${searchQuery.trim()}%`;
        // Use or() with ilike for case-insensitive search across multiple fields
        query = query.or(
          `title.ilike.${searchTerm},caption.ilike.${searchTerm},alt_text.ilike.${searchTerm}`,
        );
      }

      query = query.order(sortBy, { ascending: order === 'asc' });
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Transform posts to match expected format
      const transformedPosts = (data || []).map(photo => ({
        id: photo.id,
        title: photo.title || photo.caption || '',
        image_url: photo.image_url,
        thumbnail_url: photo.thumbnail_url || photo.image_url,
        category_id: photo.category_id,
        categories: photo.categories
          ? {
              id: photo.categories.id,
              key: photo.categories.id,
              name: photo.categories.name,
              name_en: photo.categories.name,
              name_hi: photo.categories.name,
              icon_name: photo.categories.icon,
              icon: photo.categories.icon,
              color_code: photo.categories.color,
              color: photo.categories.color,
              description: photo.categories.description,
            }
          : null,
        user_id: photo.user_id,
        admin_id: photo.admin_id,
        caption: photo.caption,
        alt_text: photo.alt_text,
        tags: photo.tags || [],
        width: photo.width,
        height: photo.height,
        file_size: photo.file_size,
        mime_type: photo.mime_type,
        is_featured: photo.is_featured || false,
        is_active: photo.status === 'active',
        created_at: photo.created_at,
        updated_at: photo.updated_at,
      }));

      return { data: transformedPosts, error: null };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { data: null, error };
    }
  },

  // Get post by ID
  getPostById: async postId => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(
          `
          *,
          categories:category_id (
            id,
            name,
            description,
            icon,
            color
          )
        `,
        )
        .eq('id', postId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          data: null,
          error: { message: 'Post not found' },
        };
      }

      const transformedPost = {
        id: data.id,
        title: data.title || data.caption || '',
        image_url: data.image_url,
        thumbnail_url: data.thumbnail_url || data.image_url,
        category_id: data.category_id,
        categories: data.categories
          ? {
              id: data.categories.id,
              key: data.categories.id,
              name: data.categories.name,
              icon: data.categories.icon,
              color: data.categories.color,
            }
          : null,
        user_id: data.user_id,
        admin_id: data.admin_id,
        caption: data.caption,
        alt_text: data.alt_text,
        tags: data.tags || [],
        is_featured: data.is_featured || false,
        is_active: data.status === 'active',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: transformedPost, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get posts by category
  getPostsByCategory: async (categoryKey, options = {}) => {
    try {
      const { limit = 20, offset = 0 } = options;

      // Handle "all" category
      if (categoryKey === 'all') {
        return await postService.getPosts({ limit, offset });
      }

      // Get posts by category ID
      return await postService.getPosts({
        categoryId: categoryKey,
        limit,
        offset,
      });
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get featured posts
  getFeaturedPosts: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(
          `
          *,
          categories:category_id (
            id,
            name,
            description,
            icon,
            color
          )
        `,
        )
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformedPosts = (data || []).map(photo => ({
        id: photo.id,
        title: photo.title || photo.caption || '',
        image_url: photo.image_url,
        thumbnail_url: photo.thumbnail_url || photo.image_url,
        category_id: photo.category_id,
        categories: photo.categories
          ? {
              id: photo.categories.id,
              key: photo.categories.id,
              name: photo.categories.name,
              icon: photo.categories.icon,
              color: photo.categories.color,
            }
          : null,
        is_featured: true,
        is_active: photo.status === 'active',
        created_at: photo.created_at,
        updated_at: photo.updated_at,
      }));

      return { data: transformedPosts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create a new post (mock - stores in AsyncStorage)
  createPost: async postData => {
    try {
      // In production, this would save to backend
      const newPost = {
        id: Date.now(),
        ...postData,
        created_at: new Date().toISOString(),
      };
      return { data: newPost, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update post (mock)
  updatePost: async (postId, postData) => {
    try {
      const updatedPost = {
        id: postId,
        ...postData,
        updated_at: new Date().toISOString(),
      };
      return { data: updatedPost, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete post (mock)
  deletePost: async postId => {
    try {
      return { data: { id: postId, deleted: true }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Increment view count (mock)
  incrementViewCount: async postId => {
    try {
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Like a post (mock)
  likePost: async (userId, postId) => {
    try {
      return {
        data: { id: Date.now(), user_id: userId, post_id: postId },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Unlike a post (mock)
  unlikePost: async (userId, postId) => {
    try {
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Check if user liked a post (mock)
  isPostLiked: async (userId, postId) => {
    try {
      return { data: false, error: null };
    } catch (error) {
      return { data: false, error };
    }
  },

  // Add to favorites (mock)
  addToFavorites: async (userId, postId) => {
    try {
      return {
        data: { id: Date.now(), user_id: userId, post_id: postId },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Remove from favorites (mock)
  removeFromFavorites: async (userId, postId) => {
    try {
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Track download (mock)
  trackDownload: async (userId, postId, deviceInfo = {}) => {
    try {
      return {
        data: { id: Date.now(), user_id: userId, post_id: postId },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Track share (mock)
  trackShare: async (userId, postId, platform) => {
    try {
      return {
        data: {
          id: Date.now(),
          user_id: userId,
          post_id: postId,
          platform,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },
};
