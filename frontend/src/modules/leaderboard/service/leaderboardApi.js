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
      const response = await apiConnector("GET", "/leaderboard/my-rank");
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
};
