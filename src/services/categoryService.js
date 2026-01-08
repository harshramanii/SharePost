import { supabase } from '../config/supabase';

// Helper function to create a key from name (slug)
const createKeyFromName = name => {
  return name.toLowerCase().replace(/\s+/g, '_');
};

export const categoryService = {
  // Get all active categories
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform categories to match expected format
      // Add "All" category at the beginning
      const allCategory = {
        id: 'all',
        key: 'all',
        name: 'All',
        name_en: 'All',
        name_hi: 'सभी',
        icon_name: 'all',
        icon: 'Grid',
        color_code: '#000000',
        color: '#000000',
        is_active: true,
        is_featured: true,
        sort_order: 0,
        photo_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const transformedCategories = [
        allCategory,
        ...(data || []).map(cat => ({
          id: cat.id,
          key: cat.id, // Use ID as key for filtering
          name: cat.name,
          name_en: cat.name,
          name_hi: cat.name,
          icon_name: createKeyFromName(cat.name),
          icon: cat.icon,
          color_code: cat.color,
          color: cat.color,
          description: cat.description,
          is_active: cat.is_active,
          is_featured: false,
          photo_count: cat.photo_count || 0,
          posts_count: cat.posts_count || 0,
          created_at: cat.created_at,
          updated_at: cat.updated_at,
        })),
      ];

      return { data: transformedCategories, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  },

  // Get category by key (ID)
  getCategoryByKey: async key => {
    try {
      // Handle "all" category
      if (key === 'all') {
        return {
          data: {
            id: 'all',
            key: 'all',
            name: 'All',
            icon: 'Grid',
            color: '#000000',
          },
          error: null,
        };
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', key)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          data: null,
          error: { message: 'Category not found' },
        };
      }

      const transformedCategory = {
        id: data.id,
        key: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        color_code: data.color,
        description: data.description,
        is_active: data.is_active,
        photo_count: data.photo_count || 0,
        posts_count: data.posts_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: transformedCategory, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get category by ID
  getCategoryById: async categoryId => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          data: null,
          error: { message: 'Category not found' },
        };
      }

      const transformedCategory = {
        id: data.id,
        key: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        color_code: data.color,
        description: data.description,
        is_active: data.is_active,
        photo_count: data.photo_count || 0,
        posts_count: data.posts_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: transformedCategory, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get featured categories
  getFeaturedCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('posts_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedCategories = (data || []).map(cat => ({
        id: cat.id,
        key: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        color_code: cat.color,
        description: cat.description,
        is_active: cat.is_active,
        is_featured: true,
        photo_count: cat.photo_count || 0,
        posts_count: cat.posts_count || 0,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      }));

      return { data: transformedCategories, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create category (admin only)
  createCategory: async categoryData => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update category (admin only)
  updateCategory: async (categoryId, categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete category (admin only - soft delete)
  deleteCategory: async categoryId => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
