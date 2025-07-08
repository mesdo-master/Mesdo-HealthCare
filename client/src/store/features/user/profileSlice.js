import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../lib/axio";

// Complete onboarding
export const fetchUserProfile = createAsyncThunk(
  "user/profile",
  async (username, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users/${username}`, { username });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for uploading profile picture
export const uploadProfilePic = createAsyncThunk(
  'user/uploadProfilePic',
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePic', image);

      const response = await axiosInstance.post('/users/upload-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("profileslice: ", response)
      return response.data.data.profilePicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return rejectWithValue(error.response?.data || 'Failed to upload image');
    }
  }
);


export const uploadRecuriterProfilePic = createAsyncThunk(
  'recuriter/organizationLogoUpload',
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('orgLogo', image);

      const response = await axiosInstance.post('recuriter/organizationLogoUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("profileslice: ", response)
      return response.data.recruiter.orgLogo;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return rejectWithValue(error.response?.data || 'Failed to upload image');
    }
  }
);

export const uploadRecuriterBanner = createAsyncThunk(
  'recuriter/orgBannerUpload',
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('orgBanner', image);

      const response = await axiosInstance.post('recuriter/orgBannerUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("profileslice: ", response)
      return response.data.recruiter.orgBanner;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return rejectWithValue(error.response?.data || 'Failed to upload image');
    }
  }
);

export const uploadCoverPic = createAsyncThunk(
  'user/uploadCoverPic',
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('coverPic', image);

      const response = await axiosInstance.post('/users/upload-cover-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("cover", response)
      return response.data.data.Banner;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return rejectWithValue(error.response?.data || 'Failed to upload image');
    }
  }
);


const initialState = {
  isLoading: false,
  userData: null,
  error: null,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    resetUserProfile: (state) => {
      state.isLoading = false;
      state.userData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { resetUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
