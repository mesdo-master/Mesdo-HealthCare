import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axio";

// Check authentication
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/me");
      console.log("checkAuth: ", response);
      return response.data;
    } catch (error) {
      console.error("checkAuth error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Signup new user
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (signUpCred, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/signup", signUpCred);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginCred, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", loginCred);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/logout");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Complete normal onboarding
export const completeOnboarding = createAsyncThunk(
  "auth/completeOnboarding",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "/onboarding/complete-onboarding",
        formData,
        { withCredentials: true }
      );

      // After successful onboarding, refresh auth to get updated user data
      dispatch(checkAuth());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Complete recruiter onboarding
export const completeRecruiterOnboarding = createAsyncThunk(
  "auth/completeRecruiterOnboarding",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(
        "onboarding/complete-recruiter-onboarding",
        formData,
        { withCredentials: true }
      );

      // After successful onboarding, refresh auth to get updated user data
      dispatch(checkAuth());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const organizationLogoUpload = createAsyncThunk(
  "auth/organizationLogoUpload",
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("orgLogo", image);
      const response = await axiosInstance.post(
        "recuriter/organizationLogoUpload",
        formData,
        { withCredentials: true }
      );
      console.log("Org logo: response -> ", response);
      return response.data.recruiter.orgLogo;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get saved mode from localStorage or default to 'individual'
const savedMode = localStorage.getItem("mode") || "individual";

const initialState = {
  filteredJobs: null,
  isAuthenticated: false,
  authChecked: false,
  currentUser: null,
  businessProfile: null,
  error: null,
  loading: false,
  mode: savedMode,
  formData: {
    name: "",
    email: "",
    phoneNo: "",
    gender: "",
    dob: "",
    state: "",
    city: "",
    tagline: "",
    aboutYou: "",
    qualifications: [],
    workExperience: [],
    Skills: [],
    Achievements: [],
    interest: [],
    onboardingCompleted: false,
    recruiterOnboardingCompleted: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    modeToggle: (state) => {
      state.mode = state.mode === "individual" ? "recruiter" : "individual";
      localStorage.setItem("mode", state.mode);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("mode", state.mode);
    },
    updateFormDataFunc: (state, action) => {
      state.formData = action.payload;
    },
    setFilteredJobs: (state, action) => {
      state.filteredJobs = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.authChecked = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
        state.businessProfile = action.payload.orgInfo || null;
        state.formData.onboardingCompleted =
          action.payload.user.onboardingCompleted || false;
        state.formData.recruiterOnboardingCompleted =
          action.payload.user.recruiterOnboardingCompleted || false;
        state.error = null;
        state.loading = false;
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.payload;
        state.loading = false;
        state.authChecked = true;
      })

      // ✅ Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        // If email verification is required, don't set as authenticated yet
        if (action.payload.requiresVerification) {
          state.isAuthenticated = false;
          state.currentUser = null;
        } else {
          state.isAuthenticated = true;
          state.currentUser = action.payload;
        }
        state.error = null;
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.payload;
        state.loading = false;
      })

      // ✅ Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.authChecked = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.error = null;
        state.loading = false;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.payload;
        state.loading = false;
        state.authChecked = true;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = null;
        state.loading = false;
        state.authChecked = true;
        state.formData = {
          name: "",
          email: "",
          phoneNo: "",
          gender: "",
          dob: "",
          state: "",
          city: "",
          tagline: "",
          aboutYou: "",
          qualifications: [],
          workExperience: [],
          Skills: [],
          Achievements: [],
          interest: [],
          onboardingCompleted: false,
          recruiterOnboardingCompleted: false,
        };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // ✅ Normal Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Update currentUser with the returned data from server
        if (action.payload && action.payload.user) {
          state.currentUser = action.payload.user;
        }

        // Update onboarding status
        if (state.currentUser) {
          state.currentUser.onboardingCompleted = true;
        }
        state.formData.onboardingCompleted = true;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // ✅ Recruiter Onboarding
      .addCase(completeRecruiterOnboarding.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeRecruiterOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Update currentUser with the returned data from server
        if (action.payload && action.payload.user) {
          state.currentUser = action.payload.user;
        }

        // Update recruiter onboarding status
        if (state.currentUser) {
          state.currentUser.recruiterOnboardingCompleted = true;
        }
        state.formData.recruiterOnboardingCompleted = true;
      })
      .addCase(completeRecruiterOnboarding.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

// Export actions
export const {
  modeToggle,
  setMode,
  updateFormDataFunc,
  setCurrentUser,
  setFilteredJobs,
} = authSlice.actions;

export default authSlice.reducer;
