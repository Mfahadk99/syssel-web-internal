"use client";

import axios from "axios";
import useAuthStore from "../store/useAuthStore";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/auth/refresh-token`,
      { refreshToken }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Update tokens in the store
    useAuthStore.getState().setTokens(accessToken, newRefreshToken || refreshToken);

    return accessToken;
  } catch (error) {
    // Clear auth state on refresh failure
    useAuthStore.getState().logout();
    throw error;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const token = typeof window !== "undefined"
      ? useAuthStore.getState().accessToken
      : null;
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Implement token refresh logic
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token failed, redirect to login
        useAuthStore.getState().logout();
        
        // Make sure localStorage is cleared directly as well
        if (typeof window !== "undefined") {
          localStorage.removeItem('auth-storage');
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      "An error occurred";

    return Promise.reject(error);
  }
);

export default axiosInstance;