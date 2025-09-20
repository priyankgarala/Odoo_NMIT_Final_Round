import axiosInstance from "../utils/axiosInstance";

// Fetch logged-in user profile
export const getUserProfile = async () => {
  const res = await axiosInstance.get("/api/user/me");
  return res.data;
};

// Update user profile
export const updateUserProfile = async (data) => {
  const res = await axiosInstance.put("/api/user/update", data);
  return res.data;
};
