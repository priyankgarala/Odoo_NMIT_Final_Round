import axiosInstance from "../utils/axiosInstance.js";

export const loginUser = async (email,password) => {
    const {data} = await axiosInstance.post("/api/auth/login", {email,password});
    return data;
};

export const registerUser = async (name,email,password) => {
  const {data} = await axiosInstance.post("/api/auth/register", {name,email,password});
  return data;
};

export const logoutUser = async() => {
    const {data} = await axiosInstance.get("/api/auth/logout");
    return data;
}

export const verifyOtp = async(email, otp) => {
    const {data} = await axiosInstance.post("/api/auth/verify-otp", {email, otp});
    return data;
}

export const resetPassword = async(email, otp, newPassword) => {
    const {data} = await axiosInstance.post("/api/auth/reset-password", {email, otp, newPassword});
    return data;
}

export const forgotPassword = async(email) => {
    const {data} = await axiosInstance.post("/api/auth/forgot-password", {email});
    return data;
}