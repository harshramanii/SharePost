    -- =====================================================
    -- Categories, Posts, and Home Feed Tables
    -- =====================================================
    -- This file contains all tables related to categories,
    -- posts, and the home page feed functionality

    -- =====================================================
    -- Table: categories
    -- =====================================================
    -- Stores post categories (e.g., newYear, goodMorning, suvichar)
    CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
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
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        total_posts INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_key (key),
        INDEX idx_is_active (is_active),
        INDEX idx_is_featured (is_featured),
        INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: posts
    -- =====================================================
    -- Stores all posts/photos that appear in the home feed
    CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        category_id INT NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        image_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500) DEFAULT NULL,
        tags JSON DEFAULT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        view_count INT DEFAULT 0,
        download_count INT DEFAULT 0,
        like_count INT DEFAULT 0,
        share_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        INDEX idx_is_active (is_active),
        INDEX idx_is_featured (is_featured),
        INDEX idx_created_at (created_at),
        INDEX idx_view_count (view_count),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: user_posts
    -- =====================================================
    -- Relationship table for user-created posts (if users can create posts)
    CREATE TABLE IF NOT EXISTS user_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_post (user_id, post_id),
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: post_likes
    -- =====================================================
    -- Stores user likes on posts
    CREATE TABLE IF NOT EXISTS post_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_post_like (user_id, post_id),
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: post_favorites
    -- =====================================================
    -- Stores user favorites/bookmarks
    CREATE TABLE IF NOT EXISTS post_favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_post_favorite (user_id, post_id),
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: post_downloads
    -- =====================================================
    -- Tracks post downloads by users
    CREATE TABLE IF NOT EXISTS post_downloads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        post_id INT NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        device_type VARCHAR(50) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: post_shares
    -- =====================================================
    -- Tracks post shares
    CREATE TABLE IF NOT EXISTS post_shares (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        post_id INT NOT NULL,
        share_platform VARCHAR(50) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        INDEX idx_share_platform (share_platform),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: post_comments
    -- =====================================================
    -- Stores comments on posts (optional feature)
    CREATE TABLE IF NOT EXISTS post_comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        parent_comment_id INT DEFAULT NULL,
        comment_text TEXT NOT NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        like_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_post_id (post_id),
        INDEX idx_parent_comment_id (parent_comment_id),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: feed_preferences
    -- =====================================================
    -- Stores user preferences for feed customization
    CREATE TABLE IF NOT EXISTS feed_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        preferred_categories JSON DEFAULT NULL,
        excluded_categories JSON DEFAULT NULL,
        sort_by ENUM('newest', 'popular', 'trending') DEFAULT 'newest',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







