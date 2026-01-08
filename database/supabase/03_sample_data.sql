-- =====================================================
-- Sample Data for Supabase (PostgreSQL)
-- =====================================================
-- This file contains sample data to populate the database
-- for development and testing purposes

-- =====================================================
-- Sample Categories
-- =====================================================
INSERT INTO public.categories (key, name, name_en, name_hi, name_gu, name_mr, name_ta, name_te, name_kn, name_ml, name_bn, name_pa, description, icon_name, color_code, is_active, is_featured, sort_order) VALUES
('all', 'All', 'All', 'सभी', 'બધા', 'सर्व', 'அனைத்தும்', 'అన్నీ', 'ಎಲ್ಲಾ', 'എല്ലാം', 'সব', 'ਸਭ', 'All categories', 'all', '#6366F1', TRUE, TRUE, 1),
('newYear', 'New Year', 'New Year', 'नव वर्ष', 'નવું વર્ષ', 'नवीन वर्ष', 'புத்தாண்டு', 'నూతన సంవత్సరం', 'ಹೊಸ ವರ್ಷ', 'പുതുവത്സരം', 'নববর্ষ', 'ਨਵਾਂ ਸਾਲ', 'New Year greetings and wishes', 'newYear', '#EF4444', TRUE, TRUE, 2),
('goodMorning', 'Good Morning', 'Good Morning', 'सुप्रभात', 'સુપ્રભાત', 'सुप्रभात', 'காலை வணக்கம்', 'శుభోదయం', 'ಶುಭೋದಯ', 'സുപ്രഭാതം', 'সুপ্রভাত', 'ਸ਼ੁਭ ਸਵੇਰ', 'Good morning wishes and quotes', 'goodMorning', '#F59E0B', TRUE, TRUE, 3),
('goodNight', 'Good Night', 'Good Night', 'शुभ रात्रि', 'શુભ રાત્રી', 'शुभ रात्री', 'இரவு வணக்கம்', 'శుభ రాత్రి', 'ಶುಭ ರಾತ್ರಿ', 'ശുഭ രാത്രി', 'শুভ রাত্রি', 'ਸ਼ੁਭ ਰਾਤ', 'Good night wishes and quotes', 'goodNight', '#3B82F6', TRUE, TRUE, 4),
('suvichar', 'Inspirational', 'Inspirational', 'प्रेरणादायक', 'પ્રેરણાદાયક', 'प्रेरणादायक', 'உத்வேகம்', 'ప్రేరణాత్మక', 'ಪ್ರೇರಣಾದಾಯಕ', 'പ്രചോദനാത്മകം', 'অনুপ্রেরণামূলক', 'ਪ੍ਰੇਰਣਾਦਾਇਕ', 'Inspirational quotes and thoughts', 'suvichar', '#10B981', TRUE, TRUE, 5)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Sample Posts
-- =====================================================
-- Note: These posts will be created without user_id (admin posts)
-- You'll need to get the category IDs first
DO $$
DECLARE
    cat_good_morning_id UUID;
    cat_new_year_id UUID;
    cat_suvichar_id UUID;
    cat_good_night_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_good_morning_id FROM public.categories WHERE key = 'goodMorning' LIMIT 1;
    SELECT id INTO cat_new_year_id FROM public.categories WHERE key = 'newYear' LIMIT 1;
    SELECT id INTO cat_suvichar_id FROM public.categories WHERE key = 'suvichar' LIMIT 1;
    SELECT id INTO cat_good_night_id FROM public.categories WHERE key = 'goodNight' LIMIT 1;

    -- Insert sample posts
    INSERT INTO public.posts (category_id, title, description, image_url, thumbnail_url, is_featured, is_active, view_count, download_count, like_count, share_count) VALUES
    (cat_good_morning_id, 'Good Morning', 'Start your day with positivity', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', TRUE, TRUE, 150, 45, 32, 12),
    (cat_new_year_id, 'New Year', 'Welcome the new year with joy', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', TRUE, TRUE, 200, 60, 50, 18),
    (cat_suvichar_id, 'Inspirational', 'Daily inspiration for success', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200', FALSE, TRUE, 120, 35, 28, 10),
    (cat_good_night_id, 'Good Night', 'Peaceful night wishes', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200', FALSE, TRUE, 100, 25, 20, 8),
    (cat_good_morning_id, 'Morning Thoughts', 'Positive morning thoughts', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', FALSE, TRUE, 80, 20, 15, 5),
    (cat_suvichar_id, 'Daily Inspiration', 'Motivational quote of the day', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', TRUE, TRUE, 180, 55, 42, 15)
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- Notes
-- =====================================================
-- 1. Users will be created through Supabase Auth when they sign up
-- 2. Replace placeholder image URLs with actual image URLs
-- 3. Adjust sample data according to your application needs
-- 4. Remove or modify this file before production deployment
-- 5. Run this after creating the tables in Supabase SQL Editor







