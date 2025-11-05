import { apiConnector } from "../../../core/axios/axios.config";

export const authApi = {
  signup: async (userData) => {
    try {
      const response = await apiConnector("POST", "/auth/signup", userData);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Signup failed",
      };
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      const response = await apiConnector("POST", "/auth/verify-email", {
        email,
        otp,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Verification failed",
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiConnector("POST", "/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await apiConnector("POST", "/auth/resend-otp", {
        email,
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to resend OTP",
      };
    }
  },

  logout: async () => {
    try {
      const response = await apiConnector("POST", "/auth/logout");
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  },
  forgotPassword: async (email) => {
    const response = await apiConnector("POST", "/user/forgot-password", {
      email,
    });

    return response.success
      ? { success: true, message: response.data.message }
      : { success: false, error: response.error };
  },

  resetPassword: async (token, newPassword, confirmNewPassword) => {
    const response = await apiConnector("POST", "/user/reset-password", {
      resetPasswordToken: token,
      newPassword,
      confirmNewPassword,
    });

    return response.success
      ? { success: true, message: response.data.message }
      : { success: false, error: response.error };
  },
};
