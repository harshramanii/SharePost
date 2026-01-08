import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';

// Async thunk to fetch current user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await authService.getCurrentUser();
      if (error) {
        return rejectWithValue(error.message || 'Failed to fetch profile');
      }
      return data || null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  },
);

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data: currentUser } = await authService.getCurrentUser();
      if (!currentUser?.id) {
        return rejectWithValue('User not found');
      }

      const { error } = await authService.updateProfile(currentUser.id, profileData);
      if (error) {
        return rejectWithValue(error.message || 'Failed to update profile');
      }

      // Fetch updated profile
      const { data: updatedProfile, error: fetchError } =
        await authService.getCurrentUser();
      if (fetchError) {
        return rejectWithValue(fetchError.message || 'Failed to fetch updated profile');
      }

      return updatedProfile || null;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  },
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile: state => {
      state.profile = null;
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: builder => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile, setProfile } = userSlice.actions;
export default userSlice.reducer;





