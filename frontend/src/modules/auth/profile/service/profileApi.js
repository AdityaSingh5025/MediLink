import { apiConnector } from "../../../../core/axios/axios.config";

export const userProfileApi = {
  saveprofile: async (userData) => {
    try {
      const response = await apiConnector(
        "POST",
        "/profile/saveprofile",
        userData
      );
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data, // return backend payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "failed to create/update profile",
      };
    }
  },

  updateUserInfo: async (userData) => {
    try {
      const response = await apiConnector(
        "PUT",
        "/user/update-user-info",
        userData
      );
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data, // return backend payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "failed to update user info",
      };
    }
  },

  updatePassword: async (userData) => {
    try {
      const response = await apiConnector(
        "PUT",
        "/user/update-password",
        userData
      );
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data, // return backend payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "failed to update password",
      };
    }
  },

  deleteAccount: async (password) => {
    try {

      const response = await apiConnector(
        "DELETE",
        "/user/delete-account",
        password
      );
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data, // return backend payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "failed to delete account",
      };
    }
  },
  getUserDetails: async () => {
    try {
      const response = await apiConnector("GET", "/profile/getuserdetails");
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch user details",
      };
    }
  },
};
