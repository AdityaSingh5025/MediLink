import axios from "axios";
import { store } from "../store/store.js";
import {
  refreshTokenSuccess,
  logout,
} from "../../modules/auth/store/authSlice.js";

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = envBaseUrl
  ? (envBaseUrl.endsWith("/api") ? envBaseUrl : `${envBaseUrl}/api`)
  : "http://localhost:5001/api";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Auto-refresh token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.accessToken;

        // Update Redux store
        store.dispatch(refreshTokenSuccess({ accessToken: newAccessToken }));

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        store.dispatch(logout());
        window.location.href = "/auth"; // Redirect to login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Connector Function
export const apiConnector = async (
  method,
  url,
  bodyData = null,
  config = {}
) => {
  try {
    const requestConfig = {
      method,
      url,
      ...config,
    };
    if (bodyData && !["GET"].includes(method.toUpperCase())) {
      requestConfig.data = bodyData;
    }

    const response = await axiosInstance(requestConfig);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    };
  }
};
