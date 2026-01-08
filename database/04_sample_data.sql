-- =====================================================
-- Sample Data for Testing
-- =====================================================
-- This file contains sample data to populate the database
-- for development and testing purposes

-- =====================================================
-- Sample Categories
-- =====================================================
INSERT INTO categories (key, name, name_en, name_hi, name_gu, name_mr, name_ta, name_te, name_kn, name_ml, name_bn, name_pa, description, icon_name, color_code, is_active, is_featured, sort_order) VALUES
('all', 'All', 'All', 'सभी', 'બધા', 'सर्व', 'அனைத்தும்', 'అన్నీ', 'ಎಲ್ಲಾ', 'എല്ലാം', 'সব', 'ਸਭ', 'All categories', 'all', '#6366F1', TRUE, TRUE, 1),
('newYear', 'New Year', 'New Year', 'नव वर्ष', 'નવું વર્ષ', 'नवीन वर्ष', 'புத்தாண்டு', 'నూతన సంవత్సరం', 'ಹೊಸ ವರ್ಷ', 'പുതുവത്സരം', 'নববর্ষ', 'ਨਵਾਂ ਸਾਲ', 'New Year greetings and wishes', 'newYear', '#EF4444', TRUE, TRUE, 2),
('goodMorning', 'Good Morning', 'Good Morning', 'सुप्रभात', 'સુપ્રભાત', 'सुप्रभात', 'காலை வணக்கம்', 'శుభోదయం', 'ಶುಭೋದಯ', 'സുപ്രഭാതം', 'সুপ্রভাত', 'ਸ਼ੁਭ ਸਵੇਰ', 'Good morning wishes and quotes', 'goodMorning', '#F59E0B', TRUE, TRUE, 3),
('goodNight', 'Good Night', 'Good Night', 'शुभ रात्रि', 'શુભ રાત્રી', 'शुभ रात्री', 'இரவு வணக்கம்', 'శుభ రాత్రి', 'ಶುಭ ರಾತ್ರಿ', 'ശുഭ രാത്രി', 'শুভ রাত্রি', 'ਸ਼ੁਭ ਰਾਤ', 'Good night wishes and quotes', 'goodNight', '#3B82F6', TRUE, TRUE, 4),
('suvichar', 'Inspirational', 'Inspirational', 'प्रेरणादायक', 'પ્રેરણાદાયક', 'प्रेरणादायक', 'உத்வேகம்', 'ప్రేరణాత్మక', 'ಪ್ರೇರಣಾದಾಯಕ', 'പ്രചോദനാത്മകം', 'অনুপ্রেরণামূলক', 'ਪ੍ਰੇਰਣਾਦਾਇਕ', 'Inspirational quotes and thoughts', 'suvichar', '#10B981', TRUE, TRUE, 5);

-- =====================================================
-- Sample Users (Password: password123 - hash should be generated in production)
-- =====================================================
INSERT INTO users (email, password_hash, phone, full_name, bio, avatar_url, facebook_url, instagram_url, twitter_url, is_email_verified, is_phone_verified, is_active, role, language_code, theme_preference) VALUES
('admin@sharepost.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567890', 'Admin User', 'Administrator account', NULL, NULL, NULL, NULL, TRUE, TRUE, TRUE, 'admin', 'en', 'light'),
('user1@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567891', 'John Doe', 'Creative designer and content creator', 'https://via.placeholder.com/150', 'https://facebook.com/johndoe', 'https://instagram.com/johndoe', 'https://twitter.com/johndoe', TRUE, TRUE, TRUE, 'user', 'en', 'light'),
('user2@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1234567892', 'Jane Smith', 'Photography enthusiast', NULL, NULL, 'https://instagram.com/janesmith', NULL, TRUE, FALSE, TRUE, 'user', 'hi', 'dark');

-- =====================================================
-- Sample Admin Users
-- =====================================================
INSERT INTO admin_users (email, username, password_hash, full_name, role, is_active) VALUES
('admin@sharepost.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'super_admin', TRUE),
('moderator@sharepost.com', 'moderator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Content Moderator', 'moderator', TRUE);

-- =====================================================
-- Sample Posts
-- =====================================================
INSERT INTO posts (user_id, category_id, title, description, image_url, thumbnail_url, is_featured, is_active, view_count, download_count, like_count, share_count) VALUES
(NULL, (SELECT id FROM categories WHERE key = 'goodMorning'), 'Good Morning', 'Start your day with positivity', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', TRUE, TRUE, 150, 45, 32, 12),
(NULL, (SELECT id FROM categories WHERE key = 'newYear'), 'New Year', 'Welcome the new year with joy', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', TRUE, TRUE, 200, 60, 50, 18),
(NULL, (SELECT id FROM categories WHERE key = 'suvichar'), 'Inspirational', 'Daily inspiration for success', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200', FALSE, TRUE, 120, 35, 28, 10),
(NULL, (SELECT id FROM categories WHERE key = 'goodNight'), 'Good Night', 'Peaceful night wishes', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200', FALSE, TRUE, 100, 25, 20, 8),
(NULL, (SELECT id FROM categories WHERE key = 'goodMorning'), 'Morning Thoughts', 'Positive morning thoughts', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', FALSE, TRUE, 80, 20, 15, 5),
(NULL, (SELECT id FROM categories WHERE key = 'suvichar'), 'Daily Inspiration', 'Motivational quote of the day', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', TRUE, TRUE, 180, 55, 42, 15);

-- =====================================================
-- Sample Post Likes
-- =====================================================
INSERT INTO post_likes (user_id, post_id) VALUES
((SELECT id FROM users WHERE email = 'user1@example.com'), 1),
((SELECT id FROM users WHERE email = 'user1@example.com'), 2),
((SELECT id FROM users WHERE email = 'user2@example.com'), 1),
((SELECT id FROM users WHERE email = 'user2@example.com'), 3);

-- =====================================================
-- Sample Post Favorites
-- =====================================================
INSERT INTO post_favorites (user_id, post_id) VALUES
((SELECT id FROM users WHERE email = 'user1@example.com'), 1),
((SELECT id FROM users WHERE email = 'user1@example.com'), 3),
((SELECT id FROM users WHERE email = 'user2@example.com'), 2);

-- =====================================================
-- Sample Post Downloads
-- =====================================================
INSERT INTO post_downloads (user_id, post_id, ip_address, device_type) VALUES
((SELECT id FROM users WHERE email = 'user1@example.com'), 1, '192.168.1.1', 'mobile'),
((SELECT id FROM users WHERE email = 'user1@example.com'), 2, '192.168.1.1', 'mobile'),
((SELECT id FROM users WHERE email = 'user2@example.com'), 1, '192.168.1.2', 'tablet');

-- =====================================================
-- Notes
-- =====================================================
-- 1. Password hashes shown are example hashes. In production, use proper bcrypt/argon2 hashing.
-- 2. Replace placeholder image URLs with actual image URLs.
-- 3. Adjust sample data according to your application needs.
-- 4. Remove or modify this file before production deployment.







