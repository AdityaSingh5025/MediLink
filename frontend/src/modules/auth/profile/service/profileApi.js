import { apiConnector } from "../../../../core/axios/axios.config";

export const userProfileApi = {
  saveprofile: async (userData) => {
    const response = await apiConnector(
      "POST",
      "/profile/saveprofile",
      userData
    );

    if (response.success) {
      return {
        success: true,
        data: response.data.data, // Backend returns {success, message, data}
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  },

  updateUserInfo: async (userData) => {
    const response = await apiConnector(
      "PUT",
      "/user/update-user-info",
      userData
    );

    if (response.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  },

  updatePassword: async (passwordData) => {
    const response = await apiConnector(
      "PUT",
      "/user/update-password",
      passwordData
    );

    if (response.success) {
      return {
        success: true,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  },

  deleteAccount: async (passwordData) => {
    const response = await apiConnector(
      "DELETE",
      "/user/delete-account",
      passwordData
    );

    if (response.success) {
      return {
        success: true,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  },

  getUserDetails: async () => {
    const response = await apiConnector("GET", "/profile/getuserdetails");

    if (response.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  },
};
