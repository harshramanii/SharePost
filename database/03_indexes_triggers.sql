-- =====================================================
-- Additional Indexes, Triggers, and Views
-- =====================================================
-- This file contains additional database optimizations,
-- triggers for maintaining data consistency, and useful views

-- =====================================================
-- Additional Indexes for Performance
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_posts_category_active ON posts(category_id, is_active, created_at DESC);
CREATE INDEX idx_posts_featured_active ON posts(is_featured, is_active, created_at DESC);
CREATE INDEX idx_posts_user_active ON posts(user_id, is_active, created_at DESC);
CREATE INDEX idx_users_active_role ON users(is_active, role, created_at DESC);

-- =====================================================
-- Triggers for Data Consistency
-- =====================================================

-- Trigger: Update category total_posts count when post is created
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_insert_category_count
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    UPDATE categories
    SET total_posts = total_posts + 1
    WHERE id = NEW.category_id;
END//
DELIMITER ;

-- Trigger: Update category total_posts count when post is deleted
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_delete_category_count
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
    IF NEW.deleted_at IS NOT NULL AND (OLD.deleted_at IS NULL OR OLD.deleted_at = '0000-00-00 00:00:00') THEN
        UPDATE categories
        SET total_posts = GREATEST(0, total_posts - 1)
        WHERE id = NEW.category_id;
    END IF;
END//
DELIMITER ;

-- Trigger: Update post like_count when like is added
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_like_insert
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
END//
DELIMITER ;

-- Trigger: Update post like_count when like is removed
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_like_delete
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.post_id;
END//
DELIMITER ;

-- Trigger: Update post download_count when download is recorded
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_download_insert
AFTER INSERT ON post_downloads
FOR EACH ROW
BEGIN
    UPDATE posts
    SET download_count = download_count + 1
    WHERE id = NEW.post_id;
END//
DELIMITER ;

-- Trigger: Update post share_count when share is recorded
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_post_share_insert
AFTER INSERT ON post_shares
FOR EACH ROW
BEGIN
    UPDATE posts
    SET share_count = share_count + 1
    WHERE id = NEW.post_id;
END//
DELIMITER ;

-- =====================================================
-- Useful Views
-- =====================================================

-- View: Active posts with category and user info
CREATE OR REPLACE VIEW vw_active_posts AS
SELECT 
    p.id,
    p.user_id,
    u.full_name AS user_name,
    u.avatar_url AS user_avatar,
    p.category_id,
    c.key AS category_key,
    c.name AS category_name,
    p.title,
    p.description,
    p.image_url,
    p.thumbnail_url,
    p.tags,
    p.is_featured,
    p.view_count,
    p.download_count,
    p.like_count,
    p.share_count,
    p.created_at,
    p.updated_at
FROM posts p
INNER JOIN categories c ON p.category_id = c.id
LEFT JOIN users u ON p.user_id = u.id
WHERE p.is_active = TRUE 
    AND p.deleted_at IS NULL
    AND c.is_active = TRUE;

-- View: User statistics
CREATE OR REPLACE VIEW vw_user_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    u.full_name,
    COUNT(DISTINCT up.post_id) AS total_posts,
    COUNT(DISTINCT pl.post_id) AS total_likes_given,
    COUNT(DISTINCT pf.post_id) AS total_favorites,
    COUNT(DISTINCT pd.post_id) AS total_downloads,
    u.created_at AS registration_date,
    u.last_login_at
FROM users u
LEFT JOIN user_posts up ON u.id = up.user_id
LEFT JOIN post_likes pl ON u.id = pl.user_id
LEFT JOIN post_favorites pf ON u.id = pf.user_id
LEFT JOIN post_downloads pd ON u.id = pd.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.full_name, u.created_at, u.last_login_at;

-- View: Category statistics
CREATE OR REPLACE VIEW vw_category_stats AS
SELECT 
    c.id,
    c.key,
    c.name,
    c.total_posts,
    COUNT(DISTINCT p.id) AS actual_post_count,
    COUNT(DISTINCT pl.user_id) AS total_likes,
    COUNT(DISTINCT pd.id) AS total_downloads,
    COUNT(DISTINCT ps.id) AS total_shares,
    c.is_active,
    c.is_featured,
    c.created_at
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id AND p.is_active = TRUE AND p.deleted_at IS NULL
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN post_downloads pd ON p.id = pd.post_id
LEFT JOIN post_shares ps ON p.id = ps.post_id
GROUP BY c.id, c.key, c.name, c.total_posts, c.is_active, c.is_featured, c.created_at;

-- View: Popular posts (for trending/featured feed)
CREATE OR REPLACE VIEW vw_popular_posts AS
SELECT 
    p.id,
    p.user_id,
    p.category_id,
    c.key AS category_key,
    c.name AS category_name,
    p.title,
    p.image_url,
    p.thumbnail_url,
    p.view_count,
    p.download_count,
    p.like_count,
    p.share_count,
    (p.view_count * 0.1 + p.download_count * 0.3 + p.like_count * 0.4 + p.share_count * 0.2) AS popularity_score,
    p.created_at
FROM posts p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE 
    AND p.deleted_at IS NULL
    AND c.is_active = TRUE
ORDER BY popularity_score DESC, p.created_at DESC;







