import axiosInstance from "../utils/axiosInstance.js";

// User Management API functions

export const signupUser = async (name, loginId, email, password) => {
    const {data} = await axiosInstance.post("/api/user-management/signup", {
        name, loginId, email, password
    });
    return data;
};

export const verifyOtp = async (email, otp) => {
    const {data} = await axiosInstance.post("/api/user-management/verify-otp", {
        email, otp
    });
    return data;
};

export const getAllRoles = async () => {
    const {data} = await axiosInstance.get("/api/user-management/roles");
    return data;
};

export const adminCreateUser = async (name, loginId, email, password, roleId, contactData = null) => {
    const {data} = await axiosInstance.post("/api/user-management/admin/create-user", {
        name, loginId, email, password, roleId, contactData
    });
    return data;
};

export const getAllUsers = async () => {
    const {data} = await axiosInstance.get("/api/user-management/admin/users");
    return data;
};
