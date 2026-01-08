# Admin Panel Implementation Prompt

Implement a comprehensive Admin Panel for the SharePost application with category-wise photo management, user management, and content administration features.

## Overview

Create a secure, modern, and user-friendly admin panel that allows administrators to manage categories, upload photos by category, manage users, and oversee all application content.

## Technical Requirements

### Code Standards (MUST FOLLOW)

- Use `hp()`, `wp()`, and `isIos` helpers for layout & typography instead of static numbers
- Use `isIos` helper instead of inline `Platform.OS` checks
- Use `useCallback` for all functions
- Use `useMemo` for memoization values
- Use `FontFamily.regular` in title and button text
- Use `SafeAreaView` from `react-native-safe-area-context` libraries
- Take navigation from `@react-navigation/native`
- Use common components like `Button`, `Input`, `KeyboardAvoidScroll`, etc.
- In `ScrollView` add these params: `bounces={false}` `showsVerticalScrollIndicator={false}`
- All static data should be inside `dataConstants.js` files
- Define common components in `components/index.js` for globalize
- Add all static text in `languages` files (multi-language support)
- Use SVG icons instead of emoji anywhere
- NO `.md` files and NO code explanations

## Admin Authentication

### Admin Login Screen

- **Location**: `src/screens/Admin/Auth/AdminLoginScreen.js`
- **Features**:
  - Email/Username input
  - Password input with show/hide toggle
  - "Remember Me" checkbox
  - Login button with loading state
  - Error handling and validation
  - Navigate to Admin Dashboard on success
  - Use existing `Input` and `Button` components
  - Add strings to `src/helper/strings.js` for all languages

### Admin Route Protection

- Create admin authentication check
- Redirect non-admin users away from admin screens
- Store admin session/token securely

## Admin Dashboard

### Dashboard Screen

- **Location**: `src/screens/Admin/Dashboard/AdminDashboardScreen.js`
- **Layout**:
  - Header with admin name/avatar and logout button
  - Statistics cards (Total Users, Total Posts, Total Categories, Active Users)
  - Quick action buttons (Add Category, Upload Photos, View Users)
  - Recent activity feed
  - Modern card-based design with shadows and rounded corners

### Navigation Structure

- Create `AdminTabNavigator.js` or `AdminStackNavigator.js`
- Tabs/Sections:
  1. Dashboard (Home)
  2. Categories
  3. Photos/Posts
  4. Users
  5. Settings

## Category Management

### Categories List Screen

- **Location**: `src/screens/Admin/Categories/CategoriesScreen.js`
- **Features**:
  - List all categories in a scrollable view
  - Each category card shows:
    - Category name/icon
    - Total photos count
    - Edit and Delete buttons
  - "Add New Category" button at top
  - Search/filter functionality
  - Pull-to-refresh

### Add/Edit Category Modal/Screen

- **Location**: `src/screens/Admin/Categories/AddEditCategoryScreen.js` or Modal
- **Fields**:
  - Category Name (required)
  - Category Icon (SVG icon selector or upload)
  - Category Description (optional)
  - Category Color/Theme (color picker)
- **Actions**:
  - Save button
  - Cancel button
  - Validation (name required, unique name check)

## Category-wise Photo Upload

### Photo Upload Screen

- **Location**: `src/screens/Admin/Photos/PhotoUploadScreen.js`
- **Features**:
  - Category selector dropdown/picker (required)
  - Multiple photo selection (camera or gallery)
  - Photo preview grid before upload
  - Individual photo removal before upload
  - Upload progress indicator
  - Batch upload functionality
  - Success/error feedback
- **Photo Metadata** (optional per photo):
  - Title/Caption
  - Tags
  - Featured flag (yes/no)

### Photos Management Screen

- **Location**: `src/screens/Admin/Photos/PhotosManagementScreen.js`
- **Features**:
  - Filter by category
  - Search photos
  - Grid/List view toggle
  - Each photo shows:
    - Thumbnail
    - Category badge
    - Upload date
    - Edit and Delete buttons
  - Bulk selection and delete
  - Sort options (newest, oldest, category)

### Edit Photo Modal/Screen

- **Location**: `src/screens/Admin/Photos/EditPhotoScreen.js` or Modal
- **Fields**:
  - Change category
  - Edit title/caption
  - Edit tags
  - Toggle featured status
  - Replace photo option

## User Management

### Users Table Screen

- **Location**: `src/screens/Admin/Users/UsersScreen.js`
- **Features**:
  - Table/List view with columns:
    - Avatar/Profile Picture
    - Full Name
    - Email
    - Phone Number
    - Registration Date
    - Status (Active/Inactive/Banned)
    - Total Posts
    - Actions (View, Edit, Delete, Ban/Unban)
  - Search functionality (by name, email, phone)
  - Filter by status
  - Sort by registration date, name, etc.
  - Pagination or infinite scroll
  - Pull-to-refresh

### User Detail Screen

- **Location**: `src/screens/Admin/Users/UserDetailScreen.js`
- **Features**:
  - User profile information display
  - User's posts list
  - Activity history
  - Actions:
    - Edit user details
    - Ban/Unban user
    - Delete user account
    - Reset password
  - Warning modals for destructive actions

### Edit User Modal/Screen

- **Location**: `src/screens/Admin/Users/EditUserScreen.js` or Modal
- **Editable Fields**:
  - Full Name
  - Email
  - Phone Number
  - Bio
  - Social Links (Facebook, Instagram, Twitter)
  - Status (Active/Inactive/Banned)
  - Role (User/Admin) - if applicable

## Additional Admin Features

### Admin Settings Screen

- **Location**: `src/screens/Admin/Settings/AdminSettingsScreen.js`
- **Options**:
  - Change Password
  - Profile Settings
  - App Configuration
  - Notification Settings
  - Logout

### Analytics/Reports (Optional)

- User growth charts
- Post upload statistics
- Category usage analytics
- Activity logs

## Design & UX Requirements

### Visual Design

- Modern, clean, professional admin interface
- Consistent with existing app theme (use `useTheme` hook)
- Card-based layouts with subtle shadows
- Rounded corners (`borderRadius: wp(3)`)
- Proper spacing using `hp()` and `wp()`
- Icons from existing `Icon` component
- Loading states for all async operations
- Empty states with helpful messages

### User Experience

- Smooth navigation transitions
- Confirmation dialogs for destructive actions
- Success/error toast messages or alerts
- Form validation with clear error messages
- Keyboard handling (use `KeyboardAvoidScroll` where needed)
- Pull-to-refresh where applicable
- Search and filter should be responsive
- Accessible labels and roles

## Data Management

### Static Data

- Add admin-related categories, status options, etc. to `src/helper/dataConstants.js`
- Create `adminConstants.js` if needed for admin-specific data

### State Management

- Use React hooks (`useState`, `useCallback`, `useMemo`, `useEffect`)
- Consider context for admin state if needed
- Handle loading and error states properly

## Navigation Integration

### Update Navigation.js

- Add admin screens to the stack navigator
- Protect admin routes (check admin authentication)
- Admin login should navigate to admin dashboard
- Regular users should not access admin screens

### Admin Navigation Flow

```
AdminLogin → AdminDashboard
AdminDashboard → Categories / Photos / Users / Settings
Categories → AddEditCategory
Photos → PhotoUpload / EditPhoto
Users → UserDetail / EditUser
```

## Multi-language Support

### Strings to Add

Add all admin-related strings to `src/helper/strings.js` for all 10 languages:

- Admin login strings
- Dashboard statistics labels
- Category management strings
- Photo upload strings
- User management strings
- Action buttons (Save, Cancel, Delete, Edit, etc.)
- Success/error messages
- Confirmation dialogs
- Empty state messages

## Components to Create/Use

### New Components (if needed)

- `CategoryCard.js` - Category display card
- `UserTableRow.js` - User table row component
- `PhotoGridItem.js` - Photo grid item
- `StatusBadge.js` - Status indicator badge
- `SearchBar.js` - Reusable search input
- `FilterModal.js` - Already exists, may need admin version
- `ConfirmDialog.js` - Confirmation modal

### Reuse Existing Components

- `Input` - For all form inputs
- `Button` - For all buttons
- `Icon` - For all icons
- `KeyboardAvoidScroll` - For forms

## File Structure

```
src/
  screens/
    Admin/
      Auth/
        AdminLoginScreen.js
      Dashboard/
        AdminDashboardScreen.js
      Categories/
        CategoriesScreen.js
        AddEditCategoryScreen.js (or Modal)
      Photos/
        PhotoUploadScreen.js
        PhotosManagementScreen.js
        EditPhotoScreen.js (or Modal)
      Users/
        UsersScreen.js
        UserDetailScreen.js
        EditUserScreen.js (or Modal)
      Settings/
        AdminSettingsScreen.js
  navigation/
    AdminNavigator.js (or update existing)
  helper/
    adminConstants.js (if needed)
```

## Implementation Notes

1. **Authentication**: Implement admin role check. Store admin status in AsyncStorage or context.
2. **Photo Upload**: Use `react-native-image-picker` or similar for camera/gallery access. Handle multiple file uploads.
3. **Data Persistence**: For now, use mock data or AsyncStorage. Structure code to easily integrate with backend API later.
4. **Validation**: Validate all inputs (email format, required fields, file types, etc.)
5. **Error Handling**: Show user-friendly error messages for all operations.
6. **Performance**: Use `FlatList` for long lists, implement pagination, optimize images.
7. **Security**: Never expose admin credentials in code. Use secure storage for tokens.

## Success Criteria

- ✅ Admin can log in securely
- ✅ Admin can view dashboard with statistics
- ✅ Admin can create, edit, and delete categories
- ✅ Admin can upload multiple photos and assign them to categories
- ✅ Admin can view, search, filter, and manage users in a table
- ✅ Admin can view user details and edit user information
- ✅ All screens follow design system and code standards
- ✅ All text is multi-language supported
- ✅ Smooth navigation and user experience
- ✅ Proper error handling and loading states
- ✅ Accessible and responsive design

## Priority Order

1. Admin Login & Authentication
2. Admin Dashboard
3. Category Management
4. Photo Upload (Category-wise)
5. User Management Table
6. User Detail & Edit
7. Additional Features (Settings, Analytics)

---

**Note**: This is a comprehensive admin panel. Start with core features (Login, Dashboard, Categories, Photo Upload, User Table) and then add advanced features. Ensure all code follows the repository rules and maintains consistency with the existing codebase.






