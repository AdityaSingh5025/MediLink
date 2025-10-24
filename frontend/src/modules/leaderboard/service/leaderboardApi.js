import { apiConnector } from "../../../core/axios/axios.config";

export const leaderboardApi = {
  // Fetch top 10 users by reputation
  getLeaderboard: async () => {
    try {
      const response = await apiConnector("GET", "/leaderboard");
      const data = response.data?.data || [];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch leaderboard",
      };
    }
  },

  // Fetch current user's rank and stats
  getUserStats: async () => {
    try {
      const response = await apiConnector("GET", "/leaderboard/user-rank");
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch user rank",
      };
    }
  },

  // Increment user's donation count and reputation
  incrementDonated: async () => {
    try {
      const response = await apiConnector("PATCH", "/leaderboard/increment-donated");
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to increment donation",
      };
    }
  },
};
