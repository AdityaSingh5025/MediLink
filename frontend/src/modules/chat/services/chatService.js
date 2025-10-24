import { apiConnector } from "../../../core/axios/axios.config";

export const chatApi = {
  // Fetch all chats for the logged-in user
  getUserChats: async () => {
    try {
      const response = await apiConnector("GET", "/chat/my-chats");
      const data = response.data?.data || response.data || [];
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Fetch messages for a specific chat (by listingId)
  getChatHistory: async (listingId) => {
    try {
      const response = await apiConnector("GET", `/chat/${listingId}`);
      const data = response.data?.data || response.data || [];
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
