-- =====================================================
-- Categories, Posts, and Home Feed Tables (PostgreSQL for Supabase)
-- =====================================================
-- This file contains all tables related to categories,
-- posts, and the home page feed functionality

-- =====================================================
-- Table: categories
-- =====================================================
-- Stores post categories (e.g., newYear, goodMorning, suvichar)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) DEFAULT NULL,
    name_hi VARCHAR(255) DEFAULT NULL,
    name_gu VARCHAR(255) DEFAULT NULL,
    name_mr VARCHAR(255) DEFAULT NULL,
    name_ta VARCHAR(255) DEFAULT NULL,
    name_te VARCHAR(255) DEFAULT NULL,
    name_kn VARCHAR(255) DEFAULT NULL,
    name_ml VARCHAR(255) DEFAULT NULL,
    name_bn VARCHAR(255) DEFAULT NULL,
    name_pa VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    icon_name VARCHAR(100) DEFAULT NULL,
    color_code VARCHAR(7) DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    total_posts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_key ON public.categories(key);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_featured ON public.categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: posts
-- =====================================================
-- Stores all posts/photos that appear in the home feed
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    tags JSONB DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON public.posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON public.posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON public.posts(view_count);
CREATE INDEX IF NOT EXISTS idx_posts_category_active ON public.posts(category_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured_active ON public.posts(is_featured, is_active, created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: user_posts
-- =====================================================
-- Relationship table for user-created posts
CREATE TABLE IF NOT EXISTS public.user_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_posts_user_id ON public.user_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_posts_post_id ON public.user_posts(post_id);

-- =====================================================
-- Table: post_likes
-- =====================================================
-- Stores user likes on posts
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);

-- =====================================================
-- Table: post_favorites
-- =====================================================
-- Stores user favorites/bookmarks
CREATE TABLE IF NOT EXISTS public.post_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON public.post_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_post_id ON public.post_favorites(post_id);

-- =====================================================
-- Table: post_downloads
-- =====================================================
-- Tracks post downloads by users
CREATE TABLE IF NOT EXISTS public.post_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) DEFAULT NULL,
    device_type VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_downloads_user_id ON public.post_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_post_downloads_post_id ON public.post_downloads(post_id);
CREATE INDEX IF NOT EXISTS idx_post_downloads_created_at ON public.post_downloads(created_at);

-- =====================================================
-- Table: post_shares
-- =====================================================
-- Tracks post shares
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    share_platform VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_shares_user_id ON public.post_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_platform ON public.post_shares(share_platform);

-- =====================================================
-- Table: post_comments
-- =====================================================
-- Stores comments on posts (optional feature)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_comment_id UUID DEFAULT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON public.post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: feed_preferences
-- =====================================================
-- Stores user preferences for feed customization
CREATE TABLE IF NOT EXISTS public.feed_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_categories JSONB DEFAULT NULL,
    excluded_categories JSONB DEFAULT NULL,
    sort_by VARCHAR(20) DEFAULT 'newest' CHECK (sort_by IN ('newest', 'popular', 'trending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feed_preferences_user_id ON public.feed_preferences(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_feed_preferences_updated_at BEFORE UPDATE ON public.feed_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Functions and Triggers for Count Updates
-- =====================================================

-- Function: Update category total_posts count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories
        SET total_posts = total_posts + 1
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            UPDATE public.categories
            SET total_posts = GREATEST(0, total_posts - 1)
            WHERE id = NEW.category_id;
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
            UPDATE public.categories
            SET total_posts = total_posts + 1
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.categories
        SET total_posts = GREATEST(0, total_posts - 1)
        WHERE id = OLD.category_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for posts
CREATE TRIGGER trg_post_category_count
    AFTER INSERT OR UPDATE OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function: Update post like_count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post_likes
CREATE TRIGGER trg_post_like_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Function: Update post download_count
CREATE OR REPLACE FUNCTION update_post_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET download_count = download_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post_downloads
CREATE TRIGGER trg_post_download_count
    AFTER INSERT ON public.post_downloads
    FOR EACH ROW EXECUTE FUNCTION update_post_download_count();

-- Function: Update post share_count
CREATE OR REPLACE FUNCTION update_post_share_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET share_count = share_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post_shares
CREATE TRIGGER trg_post_share_count
    AFTER INSERT ON public.post_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_share_count();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_preferences ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = TRUE);

-- Posts: Public read access for active posts
CREATE POLICY "Active posts are viewable by everyone" ON public.posts
    FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);

-- Posts: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Post likes: Authenticated users can like/unlike
CREATE POLICY "Users can like posts" ON public.post_likes
    FOR ALL USING (auth.role() = 'authenticated');

-- Post favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON public.post_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Post downloads: Anyone can download (tracked)
CREATE POLICY "Downloads are trackable" ON public.post_downloads
    FOR INSERT WITH CHECK (true);

-- Post shares: Anyone can share
CREATE POLICY "Shares are trackable" ON public.post_shares
    FOR INSERT WITH CHECK (true);

-- Post comments: Authenticated users can comment
CREATE POLICY "Users can comment on posts" ON public.post_comments
    FOR ALL USING (auth.role() = 'authenticated');

-- Feed preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own feed preferences" ON public.feed_preferences
    FOR ALL USING (auth.uid() = user_id);







