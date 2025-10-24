import { createSlice } from "@reduxjs/toolkit";

// Load persisted data from localStorage
const accessToken = localStorage.getItem("accessToken");
const userInfoString = localStorage.getItem("userInfo");
const profileDataString = localStorage.getItem("profileData");

let userInfo = null;
let profileData = null;

try {
  userInfo = userInfoString ? JSON.parse(userInfoString) : null;
} catch (error) {
  console.error("Failed to parse userInfo:", error);
  localStorage.removeItem("userInfo");
}

try {
  profileData = profileDataString ? JSON.parse(profileDataString) : null;
} catch (error) {
  console.error("Failed to parse profileData:", error);
  localStorage.removeItem("profileData");
}


const initialState = {
  authLoading: false,
  userInfo: userInfo || null,
  profileData: profileData || null,
  accessToken: accessToken || null,
  isAuthenticated: !!(accessToken && userInfo),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.authLoading = false;

    
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
    },

    // Update token after refresh
    refreshTokenSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
    },

    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
     setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
    },

    logout: (state) => {
      state.userInfo = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authLoading = false;
      state.profileLoading = false;

      // Clear storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("profileData");
    },

    updateUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },
    //  New profile actions
    setProfileData: (state, action) => {
      state.profileData = action.payload;
      localStorage.setItem("profileData", JSON.stringify(action.payload));
    },
     updateProfileData: (state, action) => {
      state.profileData = { ...state.profileData, ...action.payload };
      localStorage.setItem("profileData", JSON.stringify(state.profileData));
    },
      clearProfileData: (state) => {
      state.profileData = null;
      localStorage.removeItem("profileData");
    },
  },
});

export const {
  loginSuccess,
  refreshTokenSuccess,
  setAuthLoading,
  logout,
  updateUserInfo,
  setProfileData,
  updateProfileData,
  clearProfileData,
  setProfileLoading
} = authSlice.actions;

export default authSlice.reducer;