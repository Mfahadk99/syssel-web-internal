import axiosInstance from "./axios";

export const register = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const login = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/signin";
};

export const verifyEmail = async (data) => {
  const response = await axiosInstance.post("/auth/verify-otp", {
    email: data.email,
    otp: data.code,
  });
  return response.data;
};

export const googleLogin = async (data) => {
  const response = await axiosInstance.post("/google-login", data);
  return response.data;
};

export const facebookLogin = async (data) => {
  const response = await axiosInstance.post("/facebook-login", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await axiosInstance.post("/auth/change-password", data);
  return response.data;
};

export const resendVerificationCode = async (data) => {
  const response = await axiosInstance.post("/auth/resend-otp", data);
  return response.data;
};

export const requestResetOtp = async (data) => {
  const response = await axiosInstance.post("/auth/request-reset-otp", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};

export const verifyResetOtp = async (data) => {
  const response = await axiosInstance.post("/auth/verify-reset-otp", data);
  return response.data;
};



