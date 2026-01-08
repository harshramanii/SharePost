    -- =====================================================
    -- Users and Authentication Tables
    -- =====================================================
    -- This file contains all tables related to user authentication,
    -- registration, and profile management

    -- =====================================================
    -- Table: users
    -- =====================================================
    -- Stores user account information and profile data
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        full_name VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        avatar_url VARCHAR(500) DEFAULT NULL,
        facebook_url VARCHAR(500) DEFAULT NULL,
        instagram_url VARCHAR(500) DEFAULT NULL,
        twitter_url VARCHAR(500) DEFAULT NULL,
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        is_banned BOOLEAN DEFAULT FALSE,
        role ENUM('user', 'admin') DEFAULT 'user',
        language_code VARCHAR(10) DEFAULT 'en',
        theme_preference ENUM('light', 'dark') DEFAULT 'light',
        last_login_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: otp_verifications
    -- =====================================================
    -- Stores OTP codes for email and phone verification
    CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        otp_code VARCHAR(6) NOT NULL,
        verification_type ENUM('email', 'phone', 'password_reset') NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_otp_code (otp_code),
        INDEX idx_verification_type (verification_type),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: user_sessions
    -- =====================================================
    -- Stores active user sessions and authentication tokens
    CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        refresh_token VARCHAR(255) DEFAULT NULL,
        device_type VARCHAR(50) DEFAULT NULL,
        device_id VARCHAR(255) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        expires_at DATETIME NOT NULL,
        last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_refresh_token (refresh_token),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: password_reset_tokens
    -- =====================================================
    -- Stores password reset tokens for forgot password functionality
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: admin_users
    -- =====================================================
    -- Stores admin user accounts (separate from regular users)
    CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) DEFAULT NULL,
        avatar_url VARCHAR(500) DEFAULT NULL,
        role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
        permissions JSON DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: admin_sessions
    -- =====================================================
    -- Stores active admin sessions
    CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        refresh_token VARCHAR(255) DEFAULT NULL,
        device_type VARCHAR(50) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        expires_at DATETIME NOT NULL,
        last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_admin_id (admin_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- =====================================================
    -- Table: activity_logs
    -- =====================================================
    -- Logs user activities for security and analytics
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        admin_id INT DEFAULT NULL,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_admin_id (admin_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







