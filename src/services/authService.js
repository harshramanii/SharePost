import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

const TOKEN_STORAGE_KEY = '@SharePost:auth_token';
const USER_STORAGE_KEY = '@SharePost:user_data';

export const authService = {
  // Save token to AsyncStorage
  saveToken: async (token, userData) => {
    try {
      // Only save token if it's not null/undefined
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      // Always save user data if provided
      if (userData) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  // Get token from AsyncStorage
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Remove token from AsyncStorage
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Sign up with email and password
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      // Create user profile in public.users table
      if (data.user) {
        // Generate username from email (before @)
        const username =
          email.split('@')[0] + '_' + Date.now().toString().slice(-6);

        // Check if user already exists in public.users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingUser) {
          // User doesn't exist, create profile
          const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email,
            username: username,
            full_name: '',
            email_verified: false,
            status: 'active',
          });

          if (profileError) {
            // If duplicate key error, user was created between check and insert
            // This can happen in race conditions, so we'll just log it
            if (profileError.code === '23505') {
              console.log(
                'User profile already exists, continuing with signup...',
              );
            } else {
              console.error('Error creating user profile:', profileError);
              // Don't throw error, allow signup to continue
            }
          }
        } else {
          // User already exists, update basic info if needed
          console.log('User profile already exists, skipping creation');
        }

        // Save token and user data to AsyncStorage
        if (data.session?.access_token) {
          await authService.saveToken(data.session.access_token, {
            ...data.user,
            username,
          });
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user profile exists in users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // If profile doesn't exist, user account was deleted
        if (profileError || !profile) {
          // Sign out immediately
          await supabase.auth.signOut();
          await authService.removeToken();
          return {
            data: null,
            error: {
              message: 'Account has been deleted. Please contact support.',
            },
          };
        }

        // Update last_login_at if column exists (optional, won't fail if column doesn't exist)
        try {
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
        } catch (updateError) {
          // Ignore if column doesn't exist
          console.log('Could not update last_login_at:', updateError);
        }
      }

      // Save token and user data to AsyncStorage
      if (data.session?.access_token) {
        await authService.saveToken(data.session.access_token, data.user);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Remove token from AsyncStorage
      await authService.removeToken();

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        // Get user profile from public.users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          // If profile doesn't exist, account was deleted - sign out
          await supabase.auth.signOut();
          await authService.removeToken();
          return {
            data: null,
            error: {
              message: 'Account has been deleted. Please contact support.',
            },
          };
        }

        // Save updated user data to AsyncStorage
        const userData = { ...user, ...profile };
        // Get current token or get from session
        const currentToken = await authService.getToken();
        if (!currentToken) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.access_token) {
            await authService.saveToken(
              sessionData.session.access_token,
              userData,
            );
          } else {
            // No token available, just save user data
            await AsyncStorage.setItem(
              USER_STORAGE_KEY,
              JSON.stringify(userData),
            );
          }
        } else {
          await authService.saveToken(currentToken, userData);
        }

        return { data: userData, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Save token if session exists
      if (data.session?.access_token) {
        await authService.saveToken(
          data.session.access_token,
          data.session.user,
        );
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Send OTP for email verification
  sendOTP: async (email, type = 'email') => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        console.error('OTP send error:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return { data: null, error };
    }
  },

  // Verify OTP using Supabase's built-in verification
  verifyOTP: async (email, otp, type = 'email') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: type === 'email' ? 'email' : 'sms',
      });

      if (error) throw error;

      // If verification successful, update user profile
      if (data?.user) {
        if (type === 'email') {
          await supabase
            .from('users')
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id);
        }

        // Save token and user data
        if (data.session?.access_token) {
          await authService.saveToken(data.session.access_token, data.user);
        }
      }

      return { data: { verified: true, user: data?.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Upload profile photo to Supabase Storage
  uploadProfilePhoto: async (userId, imageUri) => {
    try {
      if (!imageUri) {
        return { data: null, error: null };
      }

      // Check if it's already a Supabase/HTTP URL
      const isAlreadyUploaded =
        imageUri.startsWith('http') &&
        (imageUri.includes('supabase.co') || imageUri.includes('storage'));

      if (isAlreadyUploaded) {
        // If it's already uploaded, return it
        return { data: imageUri, error: null };
      }

      // Generate unique filename
      const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Determine content type based on file extension
      const contentType =
        fileExt === 'png'
          ? 'image/png'
          : fileExt === 'webp'
          ? 'image/webp'
          : fileExt === 'jpg' || fileExt === 'jpeg'
          ? 'image/jpeg'
          : 'image/jpeg';

      console.log('Processing image URI:', imageUri);
      console.log('Platform:', Platform.OS);
      console.log('File path:', filePath);
      console.log('Content type:', contentType);

      // For React Native, we need to convert the file to ArrayBuffer
      // Read the file using fetch and convert to ArrayBuffer
      console.log('Preparing file for upload...');
      console.log('Image URI:', imageUri);
      console.log('Platform:', Platform.OS);
      console.log('File path:', filePath);
      console.log('Content type:', contentType);
      console.log('File name:', fileName);

      let arrayBuffer;
      try {
        // Fetch the file from the URI
        console.log('Fetching image file...');
        const response = await fetch(imageUri);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`,
          );
        }

        // Convert response to ArrayBuffer
        arrayBuffer = await response.arrayBuffer();

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error(
            'Image file is empty (0 bytes). Please select a valid image.',
          );
        }

        console.log(
          'ArrayBuffer created, size:',
          arrayBuffer.byteLength,
          'bytes',
        );
      } catch (fetchError) {
        console.error('Error fetching image:', fetchError);
        throw new Error(`Failed to read image file: ${fetchError.message}`);
      }

      console.log('Uploading to Supabase Storage...');
      console.log('Bucket: profile-photos');
      console.log('Path:', filePath);
      console.log('Content Type:', contentType);
      console.log('File Size:', arrayBuffer.byteLength, 'bytes');

      // Upload to Supabase Storage using ArrayBuffer
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        console.error('Error code:', error.error || error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // Provide more helpful error message
        let errorMessage = 'Failed to upload profile photo';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        throw new Error(errorMessage);
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

      console.log('Profile photo uploaded successfully!');
      console.log('Public URL:', publicUrl);
      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('Failed to upload profile photo:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      // First, check if user exists in public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // Get auth user to get email
      const {
        data: { user: authUser },
        error: authUserError,
      } = await supabase.auth.getUser();

      if (authUserError || !authUser) {
        return {
          data: null,
          error: { message: 'User authentication failed' },
        };
      }

      // Upload profile photo if provided and is a local file
      let avatarUrl = profileData.avatar_url || profileData.avatar || null;
      // Check if it's a local file (file://, content://, or not starting with http/https)
      const isLocalFile =
        avatarUrl &&
        (avatarUrl.startsWith('file://') ||
          avatarUrl.startsWith('content://') ||
          avatarUrl.startsWith('ph://') ||
          (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('https')));

      if (isLocalFile) {
        console.log('Uploading local file to Supabase Storage:', avatarUrl);
        const uploadResult = await authService.uploadProfilePhoto(
          userId,
          avatarUrl,
        );
        if (uploadResult.error) {
          console.error('Upload error:', uploadResult.error);
          return { data: null, error: uploadResult.error };
        }
        if (uploadResult.data) {
          avatarUrl = uploadResult.data;
          console.log('Upload successful, URL:', avatarUrl);
        }
      }

      // Map field names to match database schema
      const updateData = {
        full_name: profileData.full_name || profileData.name || '',
        phone_number: profileData.phone_number || profileData.phone || null,
        bio: profileData.bio || null,
        avatar_url: avatarUrl,
        facebook_url: profileData.facebook_url || profileData.facebook || null,
        instagram_url:
          profileData.instagram_url || profileData.instagram || null,
        twitter_url: profileData.twitter_url || profileData.twitter || null,
        facebook_show_in_poster: profileData.facebook_show_in_poster || false,
        instagram_show_in_poster: profileData.instagram_show_in_poster || false,
        twitter_show_in_poster: profileData.twitter_show_in_poster || false,
        updated_at: new Date().toISOString(),
      };

      // Add username if provided
      if (profileData.username) {
        updateData.username = profileData.username;
      }

      let data;
      let error;

      if (!existingUser) {
        // User doesn't exist in public.users by ID, check if email exists
        const userEmail = authUser?.email || '';
        if (userEmail) {
          const { data: existingUserByEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', userEmail)
            .maybeSingle();

          if (existingUserByEmail) {
            // Email exists but with different ID - this shouldn't happen normally
            // But if it does, update that record instead
            if (existingUserByEmail.id === userId) {
              // IDs match, just update
              const updateResult = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .maybeSingle();

              data = updateResult.data;
              error = updateResult.error;
            } else {
              // Email exists with different ID - data integrity issue
              console.error(
                'Email exists with different user ID. This indicates a data integrity issue.',
              );
              return {
                data: null,
                error: {
                  message:
                    'Email already exists with a different account. Please contact support.',
                  code: '23505',
                },
              };
            }
          } else {
            // Email doesn't exist, safe to insert
            const insertData = {
              id: userId,
              email: userEmail,
              username: profileData.username || `user_${Date.now()}`,
              full_name: updateData.full_name,
              phone_number: updateData.phone_number,
              bio: updateData.bio,
              avatar_url: avatarUrl,
              facebook_url: updateData.facebook_url,
              instagram_url: updateData.instagram_url,
              twitter_url: updateData.twitter_url,
              status: 'active',
              email_verified: authUser?.email_confirmed_at ? true : false,
            };

            const insertResult = await supabase
              .from('users')
              .insert(insertData)
              .select()
              .single();

            data = insertResult.data;
            error = insertResult.error;

            // If insert fails due to duplicate email (race condition), try update instead
            if (error && error.code === '23505') {
              console.log(
                'Duplicate email detected during insert, attempting update instead...',
              );
              const updateResult = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .maybeSingle();

              data = updateResult.data;
              error = updateResult.error;
            }
          }
        } else {
          // No email available, can't create user
          return {
            data: null,
            error: { message: 'Email is required to create user profile' },
          };
        }
      } else {
        // User exists, update it
        const updateResult = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .maybeSingle();

        data = updateResult.data;
        error = updateResult.error;
      }

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
      }

      if (!data) {
        return {
          data: null,
          error: { message: 'User profile not found or could not be updated' },
        };
      }

      // Update AsyncStorage with new user data
      try {
        if (authUser && data) {
          const updatedUser = { ...authUser, ...data };
          // Get current token from storage or session
          const currentToken = await authService.getToken();
          if (!currentToken) {
            // Try to get token from current session
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              await authService.saveToken(
                sessionData.session.access_token,
                updatedUser,
              );
            } else {
              // No token available, just save user data
              await AsyncStorage.setItem(
                USER_STORAGE_KEY,
                JSON.stringify(updatedUser),
              );
            }
          } else {
            // Use existing token
            await authService.saveToken(currentToken, updatedUser);
          }
        }
      } catch (storageError) {
        // Non-critical error, just log it
        console.warn('Error updating AsyncStorage:', storageError);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in updateProfile:', error);
      return { data: null, error };
    }
  },

  // Reset password
  resetPassword: async email => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sharepost://reset-password',
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Delete user record from public.users table
      // Note: This will cascade delete related records due to ON DELETE CASCADE
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        console.error('Error deleting user record:', deleteError);
        // Continue even if delete fails - we'll still sign out
      }

      // Sign out the user from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        // Continue even if sign out fails
      }

      // Clear local storage
      await authService.removeToken();

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { data: null, error: error.message || error };
    }
  },
};
