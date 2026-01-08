# Database Schema for SharePost Application

This directory contains SQL files for creating the complete database schema for the SharePost application.

## File Structure

### 1. `01_users_authentication.sql`
Contains all tables related to user authentication and management:
- `users` - User accounts and profiles
- `otp_verifications` - OTP codes for email/phone verification
- `user_sessions` - Active user sessions
- `password_reset_tokens` - Password reset functionality
- `admin_users` - Admin accounts
- `admin_sessions` - Admin sessions
- `activity_logs` - User activity tracking

### 2. `02_categories_posts_feed.sql`
Contains all tables related to content and feed:
- `categories` - Post categories (newYear, goodMorning, etc.)
- `posts` - All posts/photos in the feed
- `user_posts` - User-created posts relationship
- `post_likes` - Post likes
- `post_favorites` - User favorites/bookmarks
- `post_downloads` - Download tracking
- `post_shares` - Share tracking
- `post_comments` - Comments on posts (optional)
- `feed_preferences` - User feed customization

### 3. `03_indexes_triggers.sql`
Contains database optimizations:
- Additional indexes for performance
- Triggers for maintaining data consistency (auto-update counts)
- Useful views for common queries

### 4. `04_sample_data.sql`
Contains sample data for development and testing:
- Sample categories
- Sample users
- Sample admin users
- Sample posts
- Sample interactions (likes, favorites, downloads)

## Installation Instructions

### MySQL/MariaDB

1. Create the database:
```sql
CREATE DATABASE sharepost_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sharepost_db;
```

2. Run the SQL files in order:
```bash
mysql -u your_username -p sharepost_db < 01_users_authentication.sql
mysql -u your_username -p sharepost_db < 02_categories_posts_feed.sql
mysql -u your_username -p sharepost_db < 03_indexes_triggers.sql
mysql -u your_username -p sharepost_db < 04_sample_data.sql
```

Or run all at once:
```bash
mysql -u your_username -p sharepost_db < 01_users_authentication.sql 02_categories_posts_feed.sql 03_indexes_triggers.sql 04_sample_data.sql
```

### PostgreSQL

For PostgreSQL, you'll need to modify:
- `AUTO_INCREMENT` → `SERIAL` or `BIGSERIAL`
- `DATETIME` → `TIMESTAMP`
- `BOOLEAN DEFAULT FALSE` → `BOOLEAN DEFAULT FALSE` (same)
- `ENGINE=InnoDB` → Remove (PostgreSQL doesn't use engines)
- `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` → `ENCODING 'UTF8'`

## Key Features

### User Authentication
- Email-based authentication
- OTP verification for email and phone
- Password reset functionality
- Session management
- Role-based access (user/admin)

### Content Management
- Category-based organization
- Multi-language category names
- Post metadata (title, description, tags)
- Image URLs and thumbnails
- Featured posts
- Soft deletes

### User Interactions
- Likes, favorites, downloads, shares
- Comments (with nested replies support)
- View tracking
- Feed preferences

### Admin Features
- Separate admin authentication
- Activity logging
- User management support

## Database Relationships

```
users (1) ──→ (N) user_posts ──→ (N) posts
users (1) ──→ (N) post_likes
users (1) ──→ (N) post_favorites
users (1) ──→ (N) post_downloads
users (1) ──→ (N) post_shares
users (1) ──→ (N) post_comments
categories (1) ──→ (N) posts
posts (1) ──→ (N) post_comments (self-referencing for replies)
```

## Important Notes

1. **Password Hashing**: The sample data includes placeholder password hashes. In production, use proper bcrypt or argon2 hashing.

2. **Image Storage**: The schema uses URL fields for images. Consider using a file storage service (AWS S3, Cloudinary, etc.) in production.

3. **Soft Deletes**: The `users` and `posts` tables use `deleted_at` for soft deletes. Always filter by `deleted_at IS NULL` in queries.

4. **Indexes**: Additional indexes are provided for common query patterns. Monitor query performance and add more as needed.

5. **Triggers**: Triggers automatically maintain count fields (like `total_posts` in categories, `like_count` in posts). This ensures data consistency.

6. **Views**: Use the provided views for common queries:
   - `vw_active_posts` - All active posts with category and user info
   - `vw_user_stats` - User statistics
   - `vw_category_stats` - Category statistics
   - `vw_popular_posts` - Posts sorted by popularity score

## Production Considerations

1. **Backup Strategy**: Set up regular database backups
2. **Connection Pooling**: Use connection pooling for better performance
3. **Read Replicas**: Consider read replicas for scaling
4. **Caching**: Implement Redis/Memcached for frequently accessed data
5. **Monitoring**: Set up database monitoring and alerting
6. **Security**: 
   - Use parameterized queries to prevent SQL injection
   - Implement proper access controls
   - Encrypt sensitive data
   - Regular security audits

## Common Queries

### Get Home Feed Posts
```sql
SELECT * FROM vw_active_posts 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;
```

### Get Posts by Category
```sql
SELECT * FROM vw_active_posts 
WHERE category_key = 'goodMorning' 
ORDER BY created_at DESC;
```

### Get User Profile with Stats
```sql
SELECT * FROM vw_user_stats 
WHERE user_id = 1;
```

### Get Popular Posts
```sql
SELECT * FROM vw_popular_posts 
LIMIT 10;
```

## Support

For questions or issues with the database schema, please refer to the main project documentation or contact the development team.







