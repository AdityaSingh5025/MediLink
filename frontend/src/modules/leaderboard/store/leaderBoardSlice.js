import { createSlice } from "@reduxjs/toolkit";

// Load persisted data from localStorage
const leaderboardDataString = localStorage.getItem("leaderboardData");
const userStatsString = localStorage.getItem("userStats");

let leaderboardData = [];
let userStats = null;

try {
  leaderboardData = leaderboardDataString ? JSON.parse(leaderboardDataString) : [];
  userStats = userStatsString ? JSON.parse(userStatsString) : null;
} catch {
  localStorage.removeItem("leaderboardData");
  localStorage.removeItem("userStats");
}

const initialState = {
  leaderboardLoading: false,
  leaderboardData,
  userStats,
  error: null,
};

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setLeaderboardLoading: (state, action) => {
      state.leaderboardLoading = action.payload;
    },
    setLeaderboardData: (state, action) => {
      state.leaderboardData = action.payload || [];
      state.leaderboardLoading = false;
      localStorage.setItem("leaderboardData", JSON.stringify(state.leaderboardData));
    },
    setUserStats: (state, action) => {
      state.userStats = action.payload || null;
      localStorage.setItem("userStats", JSON.stringify(state.userStats));
    },
    incrementDonationLocally: (state) => {
      if (state.userStats) {
        state.userStats.donatedCount += 1;
        state.userStats.reputationScore += 5;
        localStorage.setItem("userStats", JSON.stringify(state.userStats));
      }
    },
    setLeaderboardError: (state, action) => {
      state.error = action.payload;
      state.leaderboardLoading = false;
    },
    clearLeaderboard: (state) => {
      state.leaderboardData = [];
      state.userStats = null;
      state.error = null;
      state.leaderboardLoading = false;
      localStorage.removeItem("leaderboardData");
      localStorage.removeItem("userStats");
    },
  },
});

export const {
  setLeaderboardLoading,
  setLeaderboardData,
  setUserStats,
  incrementDonationLocally,
  setLeaderboardError,
  clearLeaderboard,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
