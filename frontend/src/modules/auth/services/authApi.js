import { apiConnector } from "../../../core/axios/axios.config";

export const authApi = {
  signup: async (userData) => {
    try {
      const response = await apiConnector("POST", "/auth/signup", userData);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data, // return backend payload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Signup failed",
      };
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      const bodyData = { email, otp };
      const response = await apiConnector("POST", "/auth/verify-email", bodyData);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "verification failed",
      };
    }
  },

  login: async (email,password) => {
    try {
      const bodyData = {email,password}
      const response = await apiConnector("POST", "/auth/login", bodyData);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "login failed",
      };
    }
  },

  logout: async () => {
    try {
      const response = await apiConnector("POST", "/auth/logout");
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "login failed",
      };
    }
  },
};
